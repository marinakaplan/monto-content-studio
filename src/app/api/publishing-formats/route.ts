import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asset_id = searchParams.get("asset_id");

  if (!asset_id) {
    return NextResponse.json({ error: "asset_id is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("publishing_formats")
    .select("*")
    .eq("asset_id", asset_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { asset_id } = body;

  if (!asset_id) {
    return NextResponse.json({ error: "asset_id is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Read the asset from DB
  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", asset_id)
    .single();

  if (assetError || !asset) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const { headline, body: assetBody, hashtags } = asset;
  const hashtagString = (hashtags || []).join(" ");

  // Generate platform-specific formatted content
  const formats = [
    {
      asset_id,
      platform: "linkedin",
      format_type: "text",
      formatted_content: `${headline}\n\n${assetBody}\n\n${hashtagString}`,
      publish_status: "draft",
    },
    {
      asset_id,
      platform: "instagram",
      format_type: "text",
      formatted_content: `${headline}\n\n${(assetBody || "").slice(0, 2200)}\n\n${hashtagString}`,
      publish_status: "draft",
    },
    {
      asset_id,
      platform: "email",
      format_type: "html",
      formatted_content: `<h2>${headline}</h2>${(assetBody || "")
        .split("\n")
        .filter((p: string) => p.trim())
        .map((p: string) => `<p>${p}</p>`)
        .join("")}`,
      publish_status: "draft",
    },
    {
      asset_id,
      platform: "blog",
      format_type: "markdown",
      formatted_content: `# ${headline}\n\n${assetBody}\n\n---\n\nTags: ${hashtagString}`,
      publish_status: "draft",
    },
  ];

  const { data, error } = await supabase
    .from("publishing_formats")
    .insert(formats)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
