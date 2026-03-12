import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamMemberId = searchParams.get("team_member_id");
  const supabase = createServerClient();

  let query = supabase.from("leadership_tracks").select("*");

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
    .from("leadership_tracks")
    .insert({
      team_member_id: body.team_member_id,
      topic: body.topic,
      description: body.description || null,
      talking_points: body.talking_points || [],
      target_platforms: body.target_platforms || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
