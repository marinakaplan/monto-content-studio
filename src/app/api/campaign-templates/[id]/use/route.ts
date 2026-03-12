import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  // Fetch the template
  const { data: template, error: templateError } = await supabase
    .from("campaign_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (templateError) {
    return NextResponse.json({ error: templateError.message }, { status: 404 });
  }

  const briefSnapshot = template.brief_snapshot;

  // Create a new brief from the template snapshot
  const { data: newBrief, error: briefError } = await supabase
    .from("briefs")
    .insert({
      campaign_name: `${briefSnapshot.campaign_name} (from template)`,
      icp: briefSnapshot.icp,
      seniority: briefSnapshot.seniority,
      key_message: briefSnapshot.key_message,
      pillar: briefSnapshot.pillar,
      platforms: briefSnapshot.platforms,
      context: briefSnapshot.context,
      brief_type: briefSnapshot.brief_type || "manual",
      designer_instructions: briefSnapshot.designer_instructions,
      overlay_title: briefSnapshot.overlay_title,
      status: "review",
    })
    .select()
    .single();

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  // Create assets from snapshot if available
  const assetsSnapshot = template.assets_snapshot || [];
  if (assetsSnapshot.length > 0) {
    const assetInserts = assetsSnapshot.map(
      (a: {
        pillar: string;
        platform: string;
        template: string;
        headline: string;
        body: string;
        hashtags: string[];
        illustration_desc: string | null;
      }) => ({
        brief_id: newBrief.id,
        pillar: a.pillar,
        platform: a.platform,
        template: a.template,
        headline: a.headline,
        body: a.body,
        hashtags: a.hashtags || [],
        illustration_desc: a.illustration_desc,
        status: "pending",
      })
    );

    await supabase.from("assets").insert(assetInserts);
  }

  // Increment usage_count
  await supabase
    .from("campaign_templates")
    .update({ usage_count: (template.usage_count || 0) + 1 })
    .eq("id", id);

  return NextResponse.json({ brief_id: newBrief.id });
}
