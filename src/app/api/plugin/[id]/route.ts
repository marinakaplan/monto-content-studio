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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: briefId } = await params;
  const supabase = createServerClient();

  // Fetch brief
  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", briefId)
    .single();

  if (briefError || !brief) {
    return NextResponse.json(
      { error: "Brief not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Fetch approved assets for this brief
  const { data: assets, error: assetsError } = await supabase
    .from("assets")
    .select("*")
    .eq("brief_id", briefId)
    .eq("status", "approved");

  if (assetsError) {
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500, headers: CORS_HEADERS }
    );
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

  // Return serializable constants (without icons)
  const constants = {
    pillars: PILLARS.map(({ id, label, desc, color }) => ({ id, label, desc, color })),
    platforms: PLATFORMS.map(({ id, label, imageSize }) => ({ id, label, imageSize })),
    templates: TEMPLATES.map(({ id, label, color }) => ({ id, label, color })),
  };

  return NextResponse.json(
    { brief, assets: assets || [], event, constants },
    { headers: CORS_HEADERS }
  );
}
