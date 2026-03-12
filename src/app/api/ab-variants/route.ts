import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brief_id = searchParams.get("brief_id");

  if (!brief_id) {
    return NextResponse.json(
      { error: "brief_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("ab_variants")
    .select("*, assets(headline, body)")
    .eq("brief_id", brief_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { brief_id, asset_id, variant_label } = body;

  if (!brief_id || !asset_id || !variant_label) {
    return NextResponse.json(
      { error: "brief_id, asset_id, and variant_label are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("ab_variants")
    .insert({
      brief_id,
      asset_id,
      variant_label,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
