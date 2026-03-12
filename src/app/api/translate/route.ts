import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const body = await request.json();
  const { asset_id, target_language } = body;

  if (!asset_id || !target_language) {
    return NextResponse.json(
      { error: "asset_id and target_language are required" },
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
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
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
          "Translate this marketing content to the requested language. Maintain Monto's brand voice: professional but approachable, light and playful. Keep the same structure and intent. Do NOT do a literal translation — adapt idioms and expressions naturally.",
        messages: [
          {
            role: "user",
            content: `Translate to ${target_language}:\n\nHeadline: ${source.headline}\nBody: ${source.body}\nHashtags: ${(source.hashtags || []).join(", ")}`,
          },
        ],
        tools: [
          {
            name: "provide_translation",
            description: "Provide the translated marketing content.",
            input_schema: {
              type: "object",
              properties: {
                headline: { type: "string" },
                body: { type: "string" },
                hashtags: {
                  type: "array",
                  items: { type: "string" },
                },
              },
              required: ["headline", "body", "hashtags"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "provide_translation" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Translate API error:", response.status, err);
      return NextResponse.json(
        { error: `AI generation failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const toolBlock = data.content?.find(
      (block: Record<string, unknown>) => block.type === "tool_use"
    );

    if (!toolBlock?.input) {
      return NextResponse.json(
        { error: "No translation generated" },
        { status: 500 }
      );
    }

    const translated = toolBlock.input;

    // Save as new asset
    const { data: newAsset, error: insertError } = await supabase
      .from("assets")
      .insert({
        brief_id: source.brief_id,
        pillar: source.pillar,
        platform: source.platform,
        template: source.template,
        headline: translated.headline,
        body: translated.body,
        hashtags: translated.hashtags,
        illustration_desc: source.illustration_desc,
        illustration_url: source.illustration_url,
        status: "pending",
        language: target_language,
        source_language: "en",
        translated_from_asset_id: asset_id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(newAsset);
  } catch (err) {
    console.error("Translate API error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
