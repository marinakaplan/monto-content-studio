import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const body = await request.json();
  const { brief_id } = body;

  if (!brief_id) {
    return NextResponse.json(
      { error: "brief_id is required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Read all variants for the brief with asset data
  const { data: variants, error: varError } = await supabase
    .from("ab_variants")
    .select("*, assets(headline, body)")
    .eq("brief_id", brief_id);

  if (varError) {
    return NextResponse.json({ error: varError.message }, { status: 500 });
  }

  if (!variants || variants.length === 0) {
    return NextResponse.json(
      { error: "No variants found for this brief" },
      { status: 404 }
    );
  }

  const variantDescription = variants
    .map(
      (v: Record<string, unknown>) =>
        `Variant "${v.variant_label}" (published: ${v.was_published ? "yes" : "no"}):\n  Headline: ${(v.assets as Record<string, unknown>)?.headline || "N/A"}\n  Body: ${(v.assets as Record<string, unknown>)?.body || "N/A"}\n  Metrics: ${v.metrics ? JSON.stringify(v.metrics) : "none yet"}`
    )
    .join("\n\n");

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
        max_tokens: 1024,
        system:
          "Analyze these A/B content variants and their performance data. Identify which variant performed best and why. Provide specific learnings that can improve future content generation.",
        messages: [
          {
            role: "user",
            content: `Analyze these A/B variants for brief ${brief_id}:\n\n${variantDescription}`,
          },
        ],
        tools: [
          {
            name: "provide_learnings",
            description: "Provide A/B variant analysis and learnings.",
            input_schema: {
              type: "object",
              properties: {
                learnings: { type: "string" },
              },
              required: ["learnings"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "provide_learnings" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AB learnings API error:", response.status, err);
      return NextResponse.json(
        { error: `AI generation failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const toolBlock = data.content?.find(
      (block: Record<string, unknown>) => block.type === "tool_use"
    );

    if (!toolBlock?.input?.learnings) {
      return NextResponse.json(
        { error: "No learnings generated" },
        { status: 500 }
      );
    }

    // Save ai_learnings to each variant
    const variantIds = variants.map((v: Record<string, unknown>) => v.id as string);

    for (const vid of variantIds) {
      await supabase
        .from("ab_variants")
        .update({ ai_learnings: toolBlock.input.learnings })
        .eq("id", vid);
    }

    // Return the updated variants
    const { data: updated } = await supabase
      .from("ab_variants")
      .select("*, assets(headline, body)")
      .eq("brief_id", brief_id);

    return NextResponse.json(updated);
  } catch (err) {
    console.error("AB learnings API error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
