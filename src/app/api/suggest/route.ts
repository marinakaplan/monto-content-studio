import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/suggest
 * AI-powered field suggestion for brief form fields.
 * Accepts: { field: "campaign" | "message", context: { icp, seniority, pillar, context, campaign?, message? } }
 * Returns: { value: string }
 */
export async function POST(req: NextRequest) {
  // CLAUDE_API_KEY avoids conflict with Claude Code CLI which overrides ANTHROPIC_API_KEY
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const body = await req.json();
  const { field, context } = body as {
    field: "campaign" | "message" | "overlayTitle";
    context: {
      icp: string;
      seniority: string;
      pillar: string;
      context: string;
      campaign: string;
      message: string;
    };
  };

  if (!field || !context) {
    return NextResponse.json({ error: "Missing field or context" }, { status: 400 });
  }

  // Build a focused prompt based on the field
  const icpMap: Record<string, string> = {
    tech: "Tech & Business Services (500-5K employees, portal volume pain point)",
    manufacturing: "Manufacturing (2K-10K employees, process complexity + compliance)",
  };
  const seniorityMap: Record<string, string> = {
    manager: "Manager / Director level (focus: visibility, manual work reduction)",
    executive: "VP / CFO level (focus: cash flow, predictability, DSO)",
  };
  const pillarMap: Record<string, string> = {
    thought: "Thought Leadership (trends, DSO, AI agents, zero-touch)",
    milestone: "Milestone & News (partnerships, growth, conferences)",
    culture: "Culture & Community (team, no selling)",
    customer: "Customer Success (case studies with real numbers)",
    product: "Product Updates (features, SOC 2, smart connections)",
  };

  const briefContext = [
    `ICP: ${icpMap[context.icp] || context.icp}`,
    `Seniority: ${seniorityMap[context.seniority] || context.seniority}`,
    context.pillar ? `Content Pillar: ${pillarMap[context.pillar] || context.pillar}` : "Content Pillar: not yet selected",
    context.context ? `Additional context: ${context.context}` : null,
  ].filter(Boolean).join("\n");

  let systemPrompt: string;
  let userPrompt: string;

  if (field === "campaign") {
    systemPrompt = `You are a B2B fintech marketing naming expert for Monto, a payment portal automation company. Generate creative, concise campaign names.`;
    userPrompt = `Generate ONE short, punchy campaign name (3-6 words) for a B2B marketing campaign with these parameters:

${briefContext}
${context.message ? `Key message direction: ${context.message}` : ""}

Rules:
- Keep it concise and memorable (3-6 words max)
- Use active, energetic language
- Avoid generic names like "Q1 Campaign" or "Spring Push"
- Make it specific to the topic/pillar
- No quotes around the name

Reply with ONLY the campaign name, nothing else.`;
  } else if (field === "overlayTitle") {
    systemPrompt = `You are a B2B fintech marketing copywriter for Monto, a payment portal automation company. Generate punchy overlay titles that appear directly on social media post images.`;
    userPrompt = `Generate ONE short, punchy title (3-8 words) to overlay on a social media post image for this campaign:

${briefContext}
${context.campaign ? `Campaign name: ${context.campaign}` : ""}
${context.message ? `Key message: ${context.message}` : ""}

Rules:
- 3-8 words max — it must fit on an image
- Bold, attention-grabbing, slightly provocative
- Speak to the pain point or promise
- No quotes around the title
- Think headline-style: "The Hidden Costs of Portal Chaos" or "Stop Chasing Payments"

Reply with ONLY the title, nothing else.`;
  } else {
    systemPrompt = `You are a B2B fintech content strategist for Monto, a payment portal automation company. Generate compelling key messages for marketing campaigns.`;
    userPrompt = `Generate ONE clear, compelling key message for a B2B marketing campaign with these parameters:

${briefContext}
${context.campaign ? `Campaign name: ${context.campaign}` : ""}

Rules:
- 1-2 sentences max
- Focus on the customer's pain point and how automation solves it
- Use active voice, be specific
- Avoid buzzwords like "revolutionize", "cutting-edge", "game-changing"
- Don't use "we're excited to announce"
- Speak directly to the target audience's concerns

Reply with ONLY the key message, nothing else.`;
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
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Suggest API error:", response.status, err);
      return NextResponse.json({ error: `AI generation failed: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const value = data.content?.[0]?.text?.trim();

    if (!value) {
      return NextResponse.json({ error: "No content generated" }, { status: 500 });
    }

    return NextResponse.json({ value });
  } catch (err) {
    console.error("Suggest API error:", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
