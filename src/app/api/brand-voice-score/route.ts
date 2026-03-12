import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const BRAND_GUIDELINES_PROMPT = `You are a Monto brand voice scoring assistant. Score the provided text against these brand guidelines:

TONE & STYLE:
- Active voice, not passive
- Short sentences: 15-20 words max
- Use everyday words, avoid jargon
- Professional but approachable, with a light/playful touch
- Not overly promotional

FORBIDDEN PHRASES (instant violations):
- "We're excited to announce" or "thrilled to share"
- "In today's fast-paced world..."
- "leverage", "synergy", "best-in-class", "cutting-edge", "revolutionary"

EMOJI RULES:
- Maximum 1-2 emojis per post
- No emoji walls or excessive use

Score the text on these dimensions (0-100 each):
- overall_score: holistic brand voice alignment
- tone_score: matches professional-but-approachable tone
- clarity_score: short sentences, everyday words, readability
- guidelines_score: adherence to specific rules above (forbidden phrases, emoji limits, active voice)

Also provide:
- feedback: 1-2 sentence summary of how well it matches
- violations: array of specific rule violations found (empty if none)`;

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createServerClient();
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  if (!body.text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      system: BRAND_GUIDELINES_PROMPT,
      messages: [
        {
          role: "user",
          content: `Score this text against Monto brand guidelines:\n\n${body.text}`,
        },
      ],
      tools: [
        {
          name: "score_brand_voice",
          description: "Return structured brand voice score",
          input_schema: {
            type: "object",
            properties: {
              overall_score: {
                type: "number",
                description: "Overall brand voice alignment score 0-100",
              },
              tone_score: {
                type: "number",
                description: "Tone alignment score 0-100",
              },
              clarity_score: {
                type: "number",
                description: "Clarity and readability score 0-100",
              },
              guidelines_score: {
                type: "number",
                description: "Specific guidelines adherence score 0-100",
              },
              feedback: {
                type: "string",
                description: "1-2 sentence summary feedback",
              },
              violations: {
                type: "array",
                items: { type: "string" },
                description: "List of specific rule violations found",
              },
            },
            required: [
              "overall_score",
              "tone_score",
              "clarity_score",
              "guidelines_score",
              "feedback",
              "violations",
            ],
          },
        },
      ],
      tool_choice: { type: "tool", name: "score_brand_voice" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return NextResponse.json(
      { error: `Claude API error: ${errText}` },
      { status: 502 }
    );
  }

  const claudeData = await response.json();

  // Extract tool use result
  const toolUse = claudeData.content?.find(
    (block: { type: string }) => block.type === "tool_use"
  );

  if (!toolUse?.input) {
    return NextResponse.json(
      { error: "No structured score returned from Claude" },
      { status: 502 }
    );
  }

  const score = toolUse.input;

  // Save to brand_voice_scores table
  const insertPayload: Record<string, unknown> = {
    overall_score: score.overall_score,
    tone_score: score.tone_score,
    clarity_score: score.clarity_score,
    guidelines_score: score.guidelines_score,
    feedback: score.feedback,
    violations: score.violations,
    scored_text: body.text,
  };

  if (body.asset_id) insertPayload.asset_id = body.asset_id;
  if (body.advocacy_queue_id) insertPayload.advocacy_queue_id = body.advocacy_queue_id;

  const { data: saved, error: saveError } = await supabase
    .from("brand_voice_scores")
    .insert(insertPayload)
    .select()
    .single();

  if (saveError) {
    // Return score even if save fails
    return NextResponse.json({ ...score, save_error: saveError.message });
  }

  return NextResponse.json(saved);
}
