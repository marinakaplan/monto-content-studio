import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { postHandoffComment } from "@/lib/figma";

export async function POST(request: Request) {
  const { asset_ids } = await request.json();
  const supabase = createServerClient();

  const { data: assets, error } = await supabase
    .from("assets")
    .select("*")
    .in("id", asset_ids)
    .eq("status", "approved");

  if (error || !assets || assets.length === 0) {
    return NextResponse.json({ error: "No approved assets found" }, { status: 400 });
  }

  const briefId = assets[0].brief_id;

  // Fetch brief
  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", briefId)
    .single();

  if (briefError || !brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  // Build the handoff URL
  const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NEXT_PUBLIC_SITE_URL || "https://monto-content-studio.vercel.app";
  const handoffUrl = `${baseUrl}/handoff/${briefId}`;

  try {
    // Post a comment to Figma with the handoff link
    const { commentId } = await postHandoffComment(assets, brief, handoffUrl);

    // Mark assets as pushed
    for (const asset of assets) {
      await supabase
        .from("assets")
        .update({ figma_frame_id: commentId })
        .eq("id", asset.id);
    }

    return NextResponse.json({
      pushed: assets.length,
      briefId,
      handoffUrl,
      commentId,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Figma push failed" },
      { status: 500 }
    );
  }
}
