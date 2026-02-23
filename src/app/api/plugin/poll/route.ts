import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { PILLARS, PLATFORMS, TEMPLATES } from "@/lib/constants";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Poll endpoint: returns any assets with figma_frame_id = 'pushed' (not yet created in Figma).
 * The plugin calls this every few seconds to auto-detect new pushes.
 */
export async function GET() {
  const supabase = createServerClient();

  // Find assets that have been pushed but not yet created in Figma
  const { data: assets, error } = await supabase
    .from("assets")
    .select("*, briefs(*)")
    .eq("figma_frame_id", "pushed")
    .eq("status", "approved");

  if (error || !assets || assets.length === 0) {
    return NextResponse.json(
      { pending: false, assets: [] },
      { headers: CORS_HEADERS }
    );
  }

  // Group by brief_id
  const briefIds = [...new Set(assets.map((a) => a.brief_id))];
  const results = [];

  for (const briefId of briefIds) {
    const briefAssets = assets.filter((a) => a.brief_id === briefId);
    const brief = briefAssets[0].briefs;

    // Fetch event if exists
    let event = null;
    if (brief?.event_id) {
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", brief.event_id)
        .single();
      event = eventData;
    }

    // Strip the joined brief from assets
    const cleanAssets = briefAssets.map(({ briefs, ...rest }) => rest);

    results.push({
      briefId,
      brief,
      assets: cleanAssets,
      event,
    });
  }

  const constants = {
    pillars: PILLARS.map(({ id, label, desc, color }) => ({ id, label, desc, color })),
    platforms: PLATFORMS.map(({ id, label, imageSize }) => ({ id, label, imageSize })),
    templates: TEMPLATES.map(({ id, label, color }) => ({ id, label, color })),
  };

  return NextResponse.json(
    { pending: true, batches: results, constants },
    { headers: CORS_HEADERS }
  );
}
