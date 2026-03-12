import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const platform = searchParams.get("platform");
  const pillar = searchParams.get("pillar");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const offset = (page - 1) * limit;
  const supabase = createServerClient();

  let query = supabase
    .from("assets")
    .select("*, briefs!inner(campaign_name)", { count: "exact" })
    .eq("status", "approved");

  if (q) {
    query = query.or(`headline.ilike.%${q}%,body.ilike.%${q}%`);
  }

  if (platform) {
    query = query.eq("platform", platform);
  }

  if (pillar) {
    query = query.eq("pillar", pillar);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten the joined campaign_name
  const results = (data || []).map((asset) => {
    const { briefs, ...rest } = asset as Record<string, unknown> & {
      briefs: { campaign_name: string };
    };
    return {
      ...rest,
      campaign_name: briefs?.campaign_name || null,
    };
  });

  return NextResponse.json({
    data: results,
    total: count || 0,
    page,
    limit,
  });
}
