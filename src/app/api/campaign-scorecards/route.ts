import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brief_id = searchParams.get("brief_id");

  const supabase = createServerClient();

  let query = supabase
    .from("campaign_scorecards")
    .select("*")
    .order("created_at", { ascending: false });

  if (brief_id) {
    query = query.eq("brief_id", brief_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    brief_id,
    platform,
    impressions,
    clicks,
    engagement,
    shares,
    conversions,
    notes,
  } = body;

  if (!brief_id) {
    return NextResponse.json(
      { error: "brief_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("campaign_scorecards")
    .insert({
      brief_id,
      platform: platform || null,
      impressions: impressions || null,
      clicks: clicks || null,
      engagement: engagement || null,
      shares: shares || null,
      conversions: conversions || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
