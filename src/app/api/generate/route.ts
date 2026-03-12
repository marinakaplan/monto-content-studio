import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { generateCopy } from "@/lib/claude";
import { generateImage } from "@/lib/imagen";

export async function POST(request: Request) {
  const { brief_id } = await request.json();
  const supabase = createServerClient();

  // Step 1: Read brief
  const { data: brief, error: briefError } = await supabase
    .from("briefs")
    .select("*")
    .eq("id", brief_id)
    .single();

  if (briefError || !brief) {
    return NextResponse.json({ error: "Brief not found" }, { status: 404 });
  }

  // Update status to generating
  await supabase.from("briefs").update({ status: "generating" }).eq("id", brief_id);

  try {
    // Step 2-3: Call Claude API
    const result = await generateCopy(brief);

    // Save generation log
    await supabase.from("generation_logs").insert({
      brief_id,
      prompt_sent: result._meta.prompt,
      response_received: result._meta.rawResponse,
      model: result._meta.model,
      tokens_used: result._meta.tokens,
      duration_ms: result._meta.durationMs,
    });

    // Step 4-5: For each variant, generate image and save asset
    const assets = [];
    for (const variant of result.variants) {
      let illustrationUrl: string | null = null;
      try {
        illustrationUrl = await generateImage(
          variant.illustration_desc,
          brief.platforms[0] || "linkedin",
          brief.style_refs || undefined
        );
      } catch (e) {
        console.error("Image generation failed for variant:", e);
      }

      const { data: asset, error: assetError } = await supabase
        .from("assets")
        .insert({
          brief_id,
          pillar: variant.pillar,
          platform: brief.platforms[0] || "linkedin",
          template: variant.template as "target" | "vortex" | "maze" | "engine" | "hero",
          headline: variant.headline,
          body: variant.body,
          hashtags: variant.hashtags,
          illustration_desc: variant.illustration_desc,
          illustration_url: illustrationUrl,
          status: "pending",
          figma_frame_id: null,
        })
        .select()
        .single();

      if (assetError) {
        console.error("Failed to save asset:", assetError);
      } else {
        assets.push(asset);
        // Create initial version history entry
        await supabase.from("asset_versions").insert({
          asset_id: asset.id,
          version_number: 1,
          headline: asset.headline,
          body: asset.body,
          hashtags: asset.hashtags,
          illustration_desc: asset.illustration_desc,
          illustration_url: asset.illustration_url,
          change_type: "created",
          change_summary: "Initial generation",
        });
      }
    }

    // Step 6: Update brief status to review
    await supabase.from("briefs").update({ status: "review" }).eq("id", brief_id);

    return NextResponse.json({ assets });
  } catch (err) {
    console.error("Generation pipeline failed:", err);
    await supabase.from("briefs").update({ status: "draft" }).eq("id", brief_id);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
