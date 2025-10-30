import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Zod schema for validating the parsed response
const FoodItemSchema = z.object({
  name: z.string(),
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

const ParsedMealSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
  items: z.array(FoodItemSchema),
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    // Call OpenAI API with structured prompt
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a nutrition expert. Parse meal logs into structured nutrition data.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code blocks, no explanations.

The JSON must have this exact structure:
{
  "calories": <total number>,
  "protein": <total grams>,
  "carbs": <total grams>,
  "fat": <total grams>,
  "items": [
    {
      "name": "food name",
      "calories": <number>,
      "protein": <grams>,
      "carbs": <grams>,
      "fat": <grams>
    }
  ]
}

Use standard Indian food nutrition values when applicable. Be as accurate as possible based on typical serving sizes.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;

    if (!responseText) {
      throw new Error("No response from OpenAI");
    }

    // Parse and validate the response
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", responseText);
      throw new Error("Invalid JSON response from AI");
    }

    // Validate with Zod
    const validatedData = ParsedMealSchema.parse(parsedData);

    return NextResponse.json(validatedData);
  } catch (error: any) {
    console.error("Parse API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid response format from AI", details: error.errors },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to parse meal" },
      { status: 500 }
    );
  }
}
