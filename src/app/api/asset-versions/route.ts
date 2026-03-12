import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("asset_id");
  const supabase = createServerClient();

  if (!assetId) {
    return NextResponse.json({ error: "asset_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("asset_versions")
    .select("*")
    .eq("asset_id", assetId)
    .order("version_number", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
