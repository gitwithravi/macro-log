import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for request validation
const MacroCalculationRequestSchema = z.object({
  gender: z.enum(["male", "female"]),
  height: z.number().min(100).max(250), // cm
  weight: z.number().min(30).max(300), // kg
  targetWeight: z.number().min(30).max(300), // kg
  targetDate: z.string(), // ISO date string
  age: z.number().min(10).max(120).optional(), // optional age for better calculation
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]).optional(),
});

// Zod schema for response validation
const MacroCalculationResponseSchema = z.object({
  dailyCalories: z.number().int().min(1000).max(5000),
  dailyProtein: z.number().int().min(50).max(500),
  dailyCarbs: z.number().int().min(50).max(800),
  dailyFat: z.number().int().min(20).max(300),
  explanation: z.string(),
  weeklyWeightChangeGoal: z.number().optional(),
  estimatedTimeframe: z.string().optional(),
});

/**
 * Calculate Macros API - Uses OpenAI to calculate personalized macro goals
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request data
    const validatedData = MacroCalculationRequestSchema.parse(body);

    const { gender, height, weight, targetWeight, targetDate, age, activityLevel } = validatedData;

    // Calculate days until target date
    const target = new Date(targetDate);
    const today = new Date();
    const daysUntilTarget = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilTarget < 7) {
      return NextResponse.json(
        { error: "Target date must be at least 7 days in the future" },
        { status: 400 }
      );
    }

    const weightDifference = targetWeight - weight;
    const isWeightLoss = weightDifference < 0;

    // Build context for OpenAI
    const userContext = {
      gender,
      height: `${height} cm`,
      currentWeight: `${weight} kg`,
      targetWeight: `${targetWeight} kg`,
      weightChange: `${Math.abs(weightDifference).toFixed(1)} kg ${isWeightLoss ? 'loss' : 'gain'}`,
      timeframe: `${daysUntilTarget} days (${(daysUntilTarget / 7).toFixed(1)} weeks)`,
      weeklyGoal: `${(Math.abs(weightDifference) / (daysUntilTarget / 7)).toFixed(2)} kg per week`,
      ...(age && { age }),
      ...(activityLevel && { activityLevel }),
    };

    // Call OpenAI with nutrition expert prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a certified nutrition and fitness expert. Calculate personalized daily macro goals based on user metrics.

CRITICAL RULES:
1. Use scientifically-backed nutrition principles
2. Ensure safe and sustainable goals (0.5-1kg weight loss per week max, 0.25-0.5kg gain per week max)
3. Consider BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure)
4. Provide balanced macronutrient distribution
5. NEVER recommend extreme deficits or unsafe practices
6. If goal is unrealistic for timeframe, adjust to safe levels and explain

RESPONSE FORMAT (JSON only):
{
  "dailyCalories": <number 1000-5000>,
  "dailyProtein": <number in grams>,
  "dailyCarbs": <number in grams>,
  "dailyFat": <number in grams>,
  "explanation": "<2-3 sentence explanation of the plan>",
  "weeklyWeightChangeGoal": <kg per week>,
  "estimatedTimeframe": "<realistic timeframe if different from target>"
}

CALCULATION GUIDELINES:
- BMR (Mifflin-St Jeor):
  • Male: 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
  • Female: 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
- TDEE: BMR × activity multiplier (1.2-1.9)
- Weight loss: 500-1000 cal deficit per day = 0.5-1kg per week
- Weight gain: 300-500 cal surplus per day = 0.25-0.5kg per week
- Protein: 1.6-2.2g per kg body weight (higher for weight loss)
- Fat: 20-35% of total calories
- Carbs: Remaining calories

Ensure macros add up: (protein × 4) + (carbs × 4) + (fat × 9) ≈ calories`,
        },
        {
          role: "user",
          content: `Calculate daily macro goals for:

User Profile:
${Object.entries(userContext).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Please provide a safe, sustainable, and effective macro plan.`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const responseText = completion.choices[0].message.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error in calculate-macros:", responseText);
      throw new Error("Invalid response format from AI");
    }

    // Validate with Zod
    const validatedResponse = MacroCalculationResponseSchema.parse(parsedResponse);

    // Additional sanity check: verify calorie calculation
    const expectedCalories =
      (validatedResponse.dailyProtein * 4) +
      (validatedResponse.dailyCarbs * 4) +
      (validatedResponse.dailyFat * 9);

    const calorieDiff = Math.abs(validatedResponse.dailyCalories - expectedCalories);

    if (calorieDiff > 100) {
      console.warn(
        `Calorie mismatch in macro calculation: ${validatedResponse.dailyCalories} vs expected ${expectedCalories}`
      );
      // Adjust calories to match macros
      validatedResponse.dailyCalories = Math.round(expectedCalories);
    }

    return NextResponse.json({
      success: true,
      macros: {
        calories: validatedResponse.dailyCalories,
        protein: validatedResponse.dailyProtein,
        carbs: validatedResponse.dailyCarbs,
        fat: validatedResponse.dailyFat,
      },
      explanation: validatedResponse.explanation,
      weeklyWeightChangeGoal: validatedResponse.weeklyWeightChangeGoal,
      estimatedTimeframe: validatedResponse.estimatedTimeframe,
    });

  } catch (error: any) {
    console.error("Calculate-macros API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Invalid input data",
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to calculate macros" },
      { status: 500 }
    );
  }
}
