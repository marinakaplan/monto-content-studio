import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json([]);
  }

  const supabase = createServerClient();

  const { data: briefs, error } = await supabase
    .from("briefs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch asset counts per brief
  const briefIds = (briefs || []).map((b: { id: string }) => b.id);
  let assetCounts: Record<string, number> = {};

  if (briefIds.length > 0) {
    const { data: assets } = await supabase
      .from("assets")
      .select("brief_id")
      .in("brief_id", briefIds);

    assetCounts = (assets || []).reduce((acc: Record<string, number>, a: { brief_id: string }) => {
      acc[a.brief_id] = (acc[a.brief_id] || 0) + 1;
      return acc;
    }, {});
  }

  const enriched = (briefs || []).map((b: { id: string }) => ({
    ...b,
    asset_count: assetCounts[b.id] || 0,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createServerClient();

  const isManual = body.brief_type === "manual";

  const insertPayload: Record<string, unknown> = {
    campaign_name: body.campaign_name,
    icp: body.icp,
    seniority: body.seniority,
    key_message: body.key_message,
    pillar: body.pillar,
    platforms: body.platforms,
    deadline: body.deadline,
    context: body.context,
    brief_type: body.brief_type || "ai",
    designer_instructions: body.designer_instructions || null,
    overlay_title: body.overlay_title || null,
    event_id: body.event_id || null,
    status: isManual ? "review" : "draft",
  };

  // Only include style_refs if provided (column may not exist yet)
  if (body.style_refs && body.style_refs.length > 0) {
    insertPayload.style_refs = body.style_refs;
  }

  let { data, error } = await supabase
    .from("briefs")
    .insert(insertPayload)
    .select()
    .single();

  // If style_refs column doesn't exist, retry without it
  if (error?.message?.includes("style_refs")) {
    delete insertPayload.style_refs;
    ({ data, error } = await supabase
      .from("briefs")
      .insert(insertPayload)
      .select()
      .single());
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
