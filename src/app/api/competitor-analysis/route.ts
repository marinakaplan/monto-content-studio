import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("competitor_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const body = await request.json();
  const { competitor_post, platform } = body;

  if (!competitor_post) {
    return NextResponse.json(
      { error: "competitor_post is required" },
      { status: 400 }
    );
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
          "You are Monto's competitive strategist. Analyze this competitor post and create a Monto-angle response. Identify: what they're saying, what angle they're taking, how Monto can respond with a stronger message. Generate a compelling Monto post that addresses the same topic from Monto's unique angle.",
        messages: [
          {
            role: "user",
            content: `Analyze this competitor post${platform ? ` from ${platform}` : ""}:\n\n${competitor_post}`,
          },
        ],
        tools: [
          {
            name: "provide_analysis",
            description:
              "Provide competitive analysis and a Monto response post.",
            input_schema: {
              type: "object",
              properties: {
                analysis_notes: { type: "string" },
                monto_response: { type: "string" },
              },
              required: ["analysis_notes", "monto_response"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "provide_analysis" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Competitor analysis error:", response.status, err);
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
        { error: "No analysis generated" },
        { status: 500 }
      );
    }

    const { analysis_notes, monto_response } = toolBlock.input;

    // Save to competitor_analyses table
    const supabase = createServerClient();

    const { data: saved, error: saveError } = await supabase
      .from("competitor_analyses")
      .insert({
        competitor_post,
        platform: platform || null,
        analysis_notes,
        monto_response,
      })
      .select()
      .single();

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json(saved);
  } catch (err) {
    console.error("Competitor analysis error:", err);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
