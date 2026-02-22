import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") !== "false";

    let query = supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (upcoming) {
      query = query.gte("date", new Date().toISOString().split("T")[0]);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error("Events GET error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from("events")
      .insert({
        name: body.name,
        date: body.date,
        category: body.category,
        description: body.description || null,
        source: "manual",
        relevance_tags: body.relevance_tags || [],
        url: body.url || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Events POST error:", err);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
