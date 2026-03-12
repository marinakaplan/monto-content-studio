import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const claimedBy = searchParams.get("claimed_by");
  const supabase = createServerClient();

  let query = supabase.from("advocacy_queue").select("*");

  if (status) {
    query = query.eq("status", status);
  }
  if (claimedBy) {
    query = query.eq("claimed_by", claimedBy);
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

  // Read headline/body from the source asset
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("headline, body, hashtags, platform")
    .eq("id", body.asset_id)
    .single();

  if (assetError) {
    return NextResponse.json({ error: `Asset not found: ${assetError.message}` }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("advocacy_queue")
    .insert({
      asset_id: body.asset_id,
      source_brief_id: body.source_brief_id,
      original_headline: asset.headline,
      original_body: asset.body,
      original_hashtags: asset.hashtags || [],
      platform: asset.platform,
      status: "available",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
