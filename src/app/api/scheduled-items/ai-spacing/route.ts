import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const body = await request.json();
  const { platform, date_from, date_to } = body;

  if (!date_from || !date_to) {
    return NextResponse.json(
      { error: "date_from and date_to are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  let query = supabase
    .from("scheduled_items")
    .select("*")
    .gte("scheduled_date", date_from)
    .lte("scheduled_date", date_to)
    .order("scheduled_date", { ascending: true });

  if (platform) {
    query = query.eq("platform", platform);
  }

  const { data: items, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const scheduleDescription = (items || [])
    .map(
      (item: Record<string, unknown>) =>
        `- ${item.platform} on ${item.scheduled_date}${item.scheduled_time ? " at " + item.scheduled_time : ""} (status: ${item.status})`
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
          "You are a social media strategist. Analyze this posting schedule and suggest optimal spacing. Rules: LinkedIn max 3x/week, Instagram max 5x/week, Email max 1x/week, Blog max 2x/week. Avoid posting on weekends for B2B. Space content evenly.",
        messages: [
          {
            role: "user",
            content: `Analyze the following posting schedule from ${date_from} to ${date_to} and suggest optimal spacing:\n\n${scheduleDescription || "No items scheduled in this range."}`,
          },
        ],
        tools: [
          {
            name: "provide_spacing_suggestions",
            description:
              "Provide structured suggestions for optimal posting spacing.",
            input_schema: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      platform: { type: "string" },
                      recommended_frequency: { type: "string" },
                      reasoning: { type: "string" },
                      conflicts: {
                        type: "array",
                        items: { type: "string" },
                      },
                    },
                    required: [
                      "platform",
                      "recommended_frequency",
                      "reasoning",
                      "conflicts",
                    ],
                  },
                },
              },
              required: ["suggestions"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "provide_spacing_suggestions" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI spacing error:", response.status, err);
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
        { error: "No suggestions generated" },
        { status: 500 }
      );
    }

    return NextResponse.json(toolBlock.input);
  } catch (err) {
    console.error("AI spacing error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
