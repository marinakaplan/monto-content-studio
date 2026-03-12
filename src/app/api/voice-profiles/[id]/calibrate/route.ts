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

  // Fetch the voice profile
  const { data: profile, error: profileError } = await supabase
    .from("voice_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 404 });
  }

  if (!profile.voice_samples || profile.voice_samples.length === 0) {
    return NextResponse.json(
      { error: "No voice samples found. Add samples before calibrating." },
      { status: 400 }
    );
  }

  const samplesText = profile.voice_samples
    .map((s: string, i: number) => `--- Sample ${i + 1} ---\n${s}`)
    .join("\n\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Analyze the following writing samples and extract the author's unique voice and style.

${samplesText}

Return a JSON object with exactly these fields:
1. "tone_keywords": an array of 5-8 adjectives that describe this person's writing tone (e.g., "conversational", "authoritative", "witty")
2. "writing_rules": an array of 5-10 specific, actionable rules that capture their style (e.g., "Uses short punchy sentences", "Opens with a question", "Avoids jargon")
3. "calibration_prompt": a system prompt fragment (2-4 sentences) that would instruct an AI to write in this person's voice. Start with "Write in a style that is..." and include specific patterns observed.

Return ONLY valid JSON, no markdown formatting or explanation.`,
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
    // Extract JSON from the response, handling potential markdown wrapping
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json(
      { error: "Failed to parse Claude response", raw: textContent },
      { status: 502 }
    );
  }

  // Save calibration results back to the voice profile
  const { data: updated, error: updateError } = await supabase
    .from("voice_profiles")
    .update({
      tone_keywords: parsed.tone_keywords || [],
      writing_rules: parsed.writing_rules || [],
      calibration_prompt: parsed.calibration_prompt || null,
      calibrated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
