import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  if (body.status) {
    const { error } = await supabase
      .from("assets")
      .update({ status: body.status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Handle content updates with version history
  if (body.headline || body.body) {
    const { data: current } = await supabase
      .from("assets")
      .select("*")
      .eq("id", id)
      .single();

    if (current) {
      const updates: Record<string, unknown> = {};
      if (body.headline) updates.headline = body.headline;
      if (body.body) updates.body = body.body;
      if (body.hashtags) updates.hashtags = body.hashtags;

      await supabase.from("assets").update(updates).eq("id", id);

      // Get latest version number
      const { data: latestVersion } = await supabase
        .from("asset_versions")
        .select("version_number")
        .eq("asset_id", id)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersion = (latestVersion?.version_number || 0) + 1;

      await supabase.from("asset_versions").insert({
        asset_id: id,
        version_number: nextVersion,
        headline: body.headline || current.headline,
        body: body.body || current.body,
        hashtags: body.hashtags || current.hashtags,
        illustration_desc: current.illustration_desc,
        illustration_url: current.illustration_url,
        change_type: body.change_type || "edited",
        change_summary: body.change_summary || "Manual edit",
        changed_by: body.changed_by || null,
      });
    }
  }

  if (body.note) {
    const { error } = await supabase
      .from("notes")
      .insert({
        asset_id: id,
        content: body.note,
        author: "marketing",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
