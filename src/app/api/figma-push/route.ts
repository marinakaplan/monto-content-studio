import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { pushToFigma } from "@/lib/figma";

export async function POST(request: Request) {
  const { asset_ids } = await request.json();
  const supabase = createServerClient();

  const { data: assets, error } = await supabase
    .from("assets")
    .select("*")
    .in("id", asset_ids)
    .eq("status", "approved");

  if (error || !assets || assets.length === 0) {
    return NextResponse.json({ error: "No approved assets found" }, { status: 400 });
  }

  // Fetch the brief for these assets (all assets share the same brief_id)
  const briefId = assets[0].brief_id;
  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", briefId)
    .single();

  if (briefError || !brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  // Fetch linked event if exists
  let event = null;
  if (brief.event_id) {
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
      .eq("id", brief.event_id)
      .single();
    event = eventData;
  }

  try {
    const results = await pushToFigma(assets, brief, event);

    for (let i = 0; i < assets.length; i++) {
      await supabase
        .from("assets")
        .update({ figma_frame_id: results[i]?.id || null })
        .eq("id", assets[i].id);
    }

    return NextResponse.json({ pushed: results.length, frames: results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Figma push failed" },
      { status: 500 }
    );
  }
}
