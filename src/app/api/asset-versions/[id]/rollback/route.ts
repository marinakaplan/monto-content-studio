import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  // Fetch the version to rollback to
  const { data: version, error: versionError } = await supabase
    .from("asset_versions")
    .select("*")
    .eq("id", id)
    .single();

  if (versionError) {
    return NextResponse.json({ error: versionError.message }, { status: 404 });
  }

  // Get the current highest version number for this asset
  const { data: latestVersions } = await supabase
    .from("asset_versions")
    .select("version_number")
    .eq("asset_id", version.asset_id)
    .order("version_number", { ascending: false })
    .limit(1);

  const nextVersionNumber = ((latestVersions?.[0]?.version_number) || 0) + 1;

  // Create a new version row marking it as a rollback
  const { data: newVersion, error: insertError } = await supabase
    .from("asset_versions")
    .insert({
      asset_id: version.asset_id,
      version_number: nextVersionNumber,
      headline: version.headline,
      body: version.body,
      hashtags: version.hashtags,
      illustration_desc: version.illustration_desc,
      change_type: "rolled_back",
      rolled_back_from: version.version_number,
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Update the asset row with this version's content
  const { error: assetError } = await supabase
    .from("assets")
    .update({
      headline: version.headline,
      body: version.body,
      hashtags: version.hashtags,
      illustration_desc: version.illustration_desc,
    })
    .eq("id", version.asset_id);

  if (assetError) {
    return NextResponse.json({ error: assetError.message }, { status: 500 });
  }

  return NextResponse.json(newVersion);
}
