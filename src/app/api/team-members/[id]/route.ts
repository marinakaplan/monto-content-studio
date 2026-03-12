import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: member, error } = await supabase
    .from("team_members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Fetch voice profile
  const { data: voiceProfile } = await supabase
    .from("voice_profiles")
    .select("*")
    .eq("team_member_id", id)
    .maybeSingle();

  // Fetch leadership tracks
  const { data: leadershipTracks } = await supabase
    .from("leadership_tracks")
    .select("*")
    .eq("team_member_id", id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    ...member,
    voice_profile: voiceProfile || null,
    leadership_tracks: leadershipTracks || [],
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("team_members")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { error } = await supabase
    .from("team_members")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
