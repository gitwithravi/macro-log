import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Try to get auth token from Authorization header first
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    let supabase;
    let user = null;

    if (token) {
      // Create a Supabase client with the access token set globally
      const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
      supabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );

      // Verify the token
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        user = data.user;
      }
    } else {
      // Fall back to cookies
      supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      if (!error && data.user) {
        user = data.user;
      }
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 means no rows returned
      throw error;
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || null,
        })
        .select()
        .single();

      if (createError) throw createError;

      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("GET profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      daily_goal_calories,
      daily_goal_protein,
      daily_goal_carbs,
      daily_goal_fat,
    } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (daily_goal_calories !== undefined)
      updateData.daily_goal_calories = daily_goal_calories;
    if (daily_goal_protein !== undefined)
      updateData.daily_goal_protein = daily_goal_protein;
    if (daily_goal_carbs !== undefined)
      updateData.daily_goal_carbs = daily_goal_carbs;
    if (daily_goal_fat !== undefined)
      updateData.daily_goal_fat = daily_goal_fat;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error("PUT profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
