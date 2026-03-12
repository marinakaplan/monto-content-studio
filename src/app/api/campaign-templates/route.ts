import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const tag = searchParams.get("tag");
  const supabase = createServerClient();

  let query = supabase.from("campaign_templates").select("*");

  if (q) {
    query = query.or(`name.ilike.%${q}%,tags.cs.{${q}}`);
  }

  if (tag) {
    query = query.contains("tags", [tag]);
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

  // Fetch the source brief
  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", body.brief_id)
    .single();

  if (briefError) {
    return NextResponse.json({ error: `Brief not found: ${briefError.message}` }, { status: 404 });
  }

  // Fetch the brief's assets
  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("brief_id", body.brief_id)
    .order("created_at", { ascending: true });

  // Create the template with snapshots
  const { data: template, error: templateError } = await supabase
    .from("campaign_templates")
    .insert({
      name: body.name,
      description: body.description || null,
      tags: body.tags || [],
      source_brief_id: body.brief_id,
      brief_snapshot: {
        campaign_name: brief.campaign_name,
        icp: brief.icp,
        seniority: brief.seniority,
        key_message: brief.key_message,
        pillar: brief.pillar,
        platforms: brief.platforms,
        context: brief.context,
        brief_type: brief.brief_type,
        designer_instructions: brief.designer_instructions,
        overlay_title: brief.overlay_title,
      },
      assets_snapshot: (assets || []).map((a) => ({
        pillar: a.pillar,
        platform: a.platform,
        template: a.template,
        headline: a.headline,
        body: a.body,
        hashtags: a.hashtags,
        illustration_desc: a.illustration_desc,
      })),
      usage_count: 0,
    })
    .select()
    .single();

  if (templateError) {
    return NextResponse.json({ error: templateError.message }, { status: 500 });
  }

  return NextResponse.json(template);
}
