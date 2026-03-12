import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();
  const apiKey = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // Fetch the advocacy queue item
  const { data: queueItem, error: queueError } = await supabase
    .from("advocacy_queue")
    .select("*")
    .eq("id", id)
    .single();

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 404 });
  }

  if (!queueItem.claimed_by) {
    return NextResponse.json(
      { error: "Item must be claimed before rewriting" },
      { status: 400 }
    );
  }

  // Fetch the claimer's voice profile with calibration prompt
  const { data: voiceProfile } = await supabase
    .from("voice_profiles")
    .select("calibration_prompt, tone_keywords")
    .eq("team_member_id", queueItem.claimed_by)
    .maybeSingle();

  const calibrationPrompt = voiceProfile?.calibration_prompt || "";
  const toneKeywords = voiceProfile?.tone_keywords || [];

  const systemPrompt = calibrationPrompt
    ? `${calibrationPrompt}\n\nAdditional tone guidance: ${toneKeywords.join(", ")}`
    : "Rewrite the following content in a professional but personal voice suitable for employee advocacy on social media.";

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
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Rewrite the following ${queueItem.platform || "social media"} post so it sounds like it's coming from me personally (employee advocacy), not from the company brand account. Keep the core message but make it authentic and personal.

Original headline: ${queueItem.original_headline}

Original body: ${queueItem.original_body}

Original hashtags: ${(queueItem.original_hashtags || []).join(" ")}

Return ONLY valid JSON with these fields:
- "headline": rewritten headline
- "body": rewritten body text
- "hashtags": array of relevant hashtags (strings starting with #)`,
        },
      ],
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
  const textContent = claudeData.content?.[0]?.text || "";

  let parsed;
  try {
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Claude response", raw: textContent },
      { status: 502 }
    );
  }

  // Save rewritten content to the queue item
  const { data: updated, error: updateError } = await supabase
    .from("advocacy_queue")
    .update({
      rewritten_headline: parsed.headline,
      rewritten_body: parsed.body,
      rewritten_hashtags: parsed.hashtags || [],
      status: "rewritten",
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
