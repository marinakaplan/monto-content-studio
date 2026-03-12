import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const body = await request.json();
  const { asset_id, target_platforms } = body;

  if (!asset_id || !target_platforms || !Array.isArray(target_platforms) || target_platforms.length === 0) {
    return NextResponse.json(
      { error: "asset_id and target_platforms (non-empty array) are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Read the source asset
  const { data: source, error: sourceError } = await supabase
    .from("assets")
    .select("*")
    .eq("id", asset_id)
    .single();

  if (sourceError || !source) {
    return NextResponse.json({ error: "Source asset not found" }, { status: 404 });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2048,
        system:
          "You are a B2B content strategist for Monto, a payment portal automation company. Monto's brand voice is professional but approachable, light and playful. Repurpose the given content for different platforms while maintaining the core message and brand voice. Adapt length, tone, and format for each platform's best practices.",
        messages: [
          {
            role: "user",
            content: `Repurpose this content for the following platforms: ${target_platforms.join(", ")}.\n\nOriginal platform: ${source.platform}\nHeadline: ${source.headline}\nBody: ${source.body}\nHashtags: ${(source.hashtags || []).join(", ")}`,
          },
        ],
        tools: [
          {
            name: "provide_variants",
            description:
              "Provide platform-specific repurposed content variants.",
            input_schema: {
              type: "object",
              properties: {
                variants: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      headline: { type: "string" },
                      body: { type: "string" },
                      hashtags: {
                        type: "array",
                        items: { type: "string" },
                      },
                      template: { type: "string" },
                    },
                    required: [
                      "platform",
                      "headline",
                      "body",
                      "hashtags",
                      "template",
                    ],
                  },
                },
              },
              required: ["variants"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "provide_variants" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Repurpose API error:", response.status, err);
      return NextResponse.json(
        { error: `AI generation failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const toolBlock = data.content?.find(
      (block: Record<string, unknown>) => block.type === "tool_use"
    );

    if (!toolBlock?.input?.variants) {
      return NextResponse.json(
        { error: "No variants generated" },
        { status: 500 }
      );
    }

    const variants = toolBlock.input.variants;

    // Save new assets to DB
    const newAssets = variants.map(
      (v: {
        platform: string;
        headline: string;
        body: string;
        hashtags: string[];
        template: string;
      }) => ({
        brief_id: source.brief_id,
        pillar: source.pillar,
        platform: v.platform,
        template: v.template,
        headline: v.headline,
        body: v.body,
        hashtags: v.hashtags,
        status: "pending",
        language: source.language || "en",
      })
    );

    const { data: createdAssets, error: insertError } = await supabase
      .from("assets")
      .insert(newAssets)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Link via repurposed_assets table
    const links = (createdAssets || []).map(
      (created: { id: string; platform: string }) => ({
        source_asset_id: asset_id,
        target_asset_id: created.id,
        target_platform: created.platform,
      })
    );

    if (links.length > 0) {
      await supabase.from("repurposed_assets").insert(links);
    }

    return NextResponse.json(createdAssets);
  } catch (err) {
    console.error("Repurpose API error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
