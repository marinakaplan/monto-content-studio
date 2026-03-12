import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamMemberId = searchParams.get("team_member_id");
  const supabase = createServerClient();

  let query = supabase.from("voice_profiles").select("*");

  if (teamMemberId) {
    query = query.eq("team_member_id", teamMemberId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("voice_profiles")
    .insert({
      team_member_id: body.team_member_id,
      voice_samples: body.voice_samples || [],
      tone_keywords: body.tone_keywords || [],
      writing_rules: body.writing_rules || [],
      calibration_prompt: body.calibration_prompt || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
