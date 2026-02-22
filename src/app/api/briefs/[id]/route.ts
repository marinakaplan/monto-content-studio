import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data: brief, error } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Fetch assets with notes
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("brief_id", id)
    .order("created_at", { ascending: true });

  const assetIds = (assets || []).map((a) => a.id);
  let notes: Array<{ id: string; asset_id: string; content: string; author: string; created_at: string }> = [];
  if (assetIds.length > 0) {
    const { data: notesData } = await supabase
      .from("notes")
      .select("*")
      .in("asset_id", assetIds)
      .order("created_at", { ascending: true });
    notes = notesData || [];
  }

  const assetsWithNotes = (assets || []).map((a) => ({
    ...a,
    notes: notes.filter((n) => n.asset_id === a.id),
  }));

  // Fetch generation logs
  const { data: logs } = await supabase
    .from("generation_logs")
    .select("*")
    .eq("brief_id", id)
    .order("created_at", { ascending: false });

  // Fetch linked event if event_id exists
  let event = null;
  if (brief.event_id) {
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", brief.event_id)
      .single();
    event = eventData;
  }

  return NextResponse.json({ ...brief, assets: assetsWithNotes, generation_logs: logs || [], event });
}
