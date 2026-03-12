import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("team_members")
    .insert({
      name: body.name,
      email: body.email,
      role: body.role,
      linkedin_url: body.linkedin_url || null,
      social_profiles: body.social_profiles || {},
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
