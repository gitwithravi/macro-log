import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET - Fetch entries (optionally filtered by date)
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
      console.warn("No user session in GET /api/entries");
      return NextResponse.json({ entries: [] });
    }

    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Filter by specific date
    if (date) {
      query = query.eq("date", date);
    }

    // Filter by date range
    if (startDate && endDate) {
      query = query.gte("date", startDate).lte("date", endDate);
    }

    const { data: entries, error } = await query;

    if (error) throw error;

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("GET entries error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch entries" },
      { status: 500 }
    );
  }
}

// POST - Create new entry
export async function POST(request: NextRequest) {
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
      console.warn("No user session in POST /api/entries");
      return NextResponse.json({ error: "Unauthorized - no session" }, { status: 401 });
    }

    const { date, raw_text, parsed_data } = await request.json();

    if (!raw_text || !parsed_data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: entry, error } = await supabase
      .from("entries")
      .insert({
        user_id: user.id,
        date: date || new Date().toISOString().split("T")[0],
        raw_text,
        parsed_data,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("POST entry error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create entry" },
      { status: 500 }
    );
  }
}

// PUT - Update entry
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, raw_text, parsed_data } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (raw_text) updateData.raw_text = raw_text;
    if (parsed_data) updateData.parsed_data = parsed_data;

    const { data: entry, error } = await supabase
      .from("entries")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry });
  } catch (error: any) {
    console.error("PUT entry error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update entry" },
      { status: 500 }
    );
  }
}

// DELETE - Delete entry
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ message: "Entry deleted successfully" });
  } catch (error: any) {
    console.error("DELETE entry error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete entry" },
      { status: 500 }
    );
  }
}
