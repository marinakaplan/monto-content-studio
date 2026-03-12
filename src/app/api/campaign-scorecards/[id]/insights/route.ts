import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const supabase = createServerClient();

  // Read the scorecard
  const { data: scorecard, error: scError } = await supabase
    .from("campaign_scorecards")
    .select("*")
    .eq("id", id)
    .single();

  if (scError || !scorecard) {
    return NextResponse.json({ error: "Scorecard not found" }, { status: 404 });
  }

  // Read all scorecards for the same brief
  const { data: allScorecards, error: allError } = await supabase
    .from("campaign_scorecards")
    .select("*")
    .eq("brief_id", scorecard.brief_id);

  if (allError) {
    return NextResponse.json({ error: allError.message }, { status: 500 });
  }

  const metricsDescription = (allScorecards || [])
    .map(
      (sc: Record<string, unknown>) =>
        `Platform: ${sc.platform || "unknown"} | Impressions: ${sc.impressions ?? "N/A"} | Clicks: ${sc.clicks ?? "N/A"} | Engagement: ${sc.engagement ?? "N/A"} | Shares: ${sc.shares ?? "N/A"} | Conversions: ${sc.conversions ?? "N/A"} | Notes: ${sc.notes || "none"}`
    )
    .join("\n");

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
          "You are a B2B marketing analyst. Analyze these campaign performance metrics and provide 3-5 actionable insights. Compare across platforms and content pillars. Be specific with numbers.",
        messages: [
          {
            role: "user",
            content: `Analyze these campaign scorecards for brief ${scorecard.brief_id}:\n\n${metricsDescription}`,
          },
        ],
        tools: [
          {
            name: "provide_insights",
            description: "Provide campaign performance insights.",
            input_schema: {
              type: "object",
              properties: {
                insights: { type: "string" },
              },
              required: ["insights"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "provide_insights" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Insights API error:", response.status, err);
      return NextResponse.json(
        { error: `AI generation failed: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const toolBlock = data.content?.find(
      (block: Record<string, unknown>) => block.type === "tool_use"
    );

    if (!toolBlock?.input?.insights) {
      return NextResponse.json(
        { error: "No insights generated" },
        { status: 500 }
      );
    }

    // Save ai_insights to scorecard
    const { data: updated, error: updateError } = await supabase
      .from("campaign_scorecards")
      .update({ ai_insights: toolBlock.input.insights })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Insights API error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
