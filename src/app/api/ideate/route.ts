import { NextResponse } from "next/server";

/**
 * POST /api/ideate
 * Generates 5 creative campaign concepts based on goal, audience, and content hook.
 */
export async function POST(request: Request) {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { goal, icp, seniority, hook_type, hook_context, event_name } = body;

    if (!goal || !icp || !seniority || !hook_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = `You are Monto's campaign strategist. Generate 5 creative, distinct campaign concepts based on the given goal, audience, and content hook. Each campaign should be unique in angle and approach.

Monto is a B2B fintech company that automates supplier portal management for AR teams.

## What Monto Does
Monto automates how suppliers get paid through their customers' AP portals — turning manual portal chaos into zero-touch payments.

## Core Messaging
- "Click. Connect. Get paid."
- "It's smart. It's seamless. It's magic."
- "Touch-free invoice-to-payment"

## Voice
- Professional yet approachable
- Light, playful touch where appropriate
- Respectful of portals (never dismiss them)
- Get to the point. Keep it engaging. Inspire action without being promotional.
- NEVER say "we're excited to announce" or use: leverage, synergy, best-in-class, cutting-edge, revolutionary

## Content Pillars
- thought: Thought Leadership — B2B payment trends, DSO, AI agents, zero-touch
- milestone: Milestone & News — Partnerships, growth, conferences, processing milestones
- culture: Culture & Community — Team, brand personality, no selling
- customer: Customer Success — Case studies with real numbers (Cloudinary 87.3% zero-touch, AppsFlyer 77% faster, TechTarget 60.2% faster collections, Invoca 85% automated)
- product: Product Updates — Features, SOC 2, smart connections

## Target Audience
- Tech & Business Services: 500-5K employees, pain = portal volume, too many logins
- Manufacturing: 2K-10K employees, pain = process complexity + portal compliance
- Manager/Director: visibility, manual work reduction, operational efficiency
- VP/CFO: cash flow, predictability, DSO, scalability`;

    const audienceDesc = icp === "both"
      ? "Both Tech & Business Services and Manufacturing companies"
      : icp === "tech"
        ? "Tech & Business Services (500-5K employees)"
        : "Manufacturing (2K-10K employees)";

    const seniorityDesc = seniority === "both"
      ? "Both Manager/Director and VP/CFO levels"
      : seniority === "manager"
        ? "Manager/Director level (Controllers, Leads, Directors)"
        : "VP/CFO level (VPs, CFOs, C-level)";

    const hookDesc = event_name
      ? `${hook_type}: ${hook_context || ""} (tied to event: ${event_name})`
      : `${hook_type}: ${hook_context || ""}`;

    const userPrompt = `Generate 5 creative, distinct campaign concepts for Monto.

GOAL: ${goal}
AUDIENCE: ${audienceDesc}
SENIORITY: ${seniorityDesc}
CONTENT HOOK: ${hookDesc}

Each campaign must be unique in angle and approach. Make them creative, specific, and actionable. Use Monto's brand voice — direct, warm, insightful.

Use the generate_campaigns tool to return your response.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        tools: [
          {
            name: "generate_campaigns",
            description: "Output 5 structured campaign concepts",
            input_schema: {
              type: "object",
              properties: {
                campaigns: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Punchy campaign name, 3-6 words",
                      },
                      key_message: {
                        type: "string",
                        description: "1-2 sentence key message",
                      },
                      pillar: {
                        type: "string",
                        enum: ["thought", "milestone", "culture", "customer", "product"],
                        description: "Content pillar",
                      },
                      platforms: {
                        type: "array",
                        items: {
                          type: "string",
                          enum: ["linkedin", "instagram", "email", "blog"],
                        },
                        description: "Recommended platforms",
                      },
                      timing: {
                        type: "string",
                        description: "When to publish and why",
                      },
                      hook: {
                        type: "string",
                        description: "The content angle explained",
                      },
                      sample_headline: {
                        type: "string",
                        description: "Example headline for the campaign",
                      },
                    },
                    required: ["name", "key_message", "pillar", "platforms", "timing", "hook", "sample_headline"],
                  },
                  minItems: 5,
                  maxItems: 5,
                },
              },
              required: ["campaigns"],
            },
          },
        ],
        tool_choice: { type: "tool", name: "generate_campaigns" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Ideate API error:", response.status, err);
      return NextResponse.json({ error: `AI generation failed: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();

    // Extract tool_use result
    const toolUseBlock = data.content?.find(
      (block: { type: string }) => block.type === "tool_use"
    );

    if (!toolUseBlock?.input?.campaigns) {
      console.error("Ideate: no tool_use block found", JSON.stringify(data.content));
      return NextResponse.json({ error: "Failed to generate campaigns" }, { status: 500 });
    }

    return NextResponse.json({ campaigns: toolUseBlock.input.campaigns });
  } catch (err) {
    console.error("Ideate API error:", err);
    return NextResponse.json({ error: "Failed to generate campaign ideas" }, { status: 500 });
  }
}
