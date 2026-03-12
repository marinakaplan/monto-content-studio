import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

/**
 * POST /api/ai-recommendations
 * Uses Claude to analyze upcoming events and suggest campaign ideas.
 * Returns structured campaign recommendations with rationale.
 */
export async function POST() {
  const apiKey = (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  try {
    const supabase = createServerClient();
    const today = new Date().toISOString().split("T")[0];

    // Fetch upcoming events (next 60 days)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);

    const { data: events } = await supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .lte("date", futureDate.toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(15);

    // Fetch existing briefs to avoid duplicate suggestions
    const { data: briefs } = await supabase
      .from("briefs")
      .select("campaign_name, event_id")
      .order("created_at", { ascending: false })
      .limit(20);

    const existingCampaigns = (briefs || []).map((b: { campaign_name: string }) => b.campaign_name).join(", ");
    const coveredEventIds = new Set((briefs || []).filter((b: { event_id: string | null }) => b.event_id).map((b: { event_id: string | null }) => b.event_id));

    const eventsText = (events || [])
      .map((e: { id: string; name: string; date: string; category: string; description: string | null; relevance_tags: string[] }) =>
        `- ${e.name} (${e.date}, ${e.category})${e.description ? `: ${e.description}` : ""}${coveredEventIds.has(e.id) ? " [ALREADY HAS CAMPAIGN]" : ""}`
      )
      .join("\n");

    const systemPrompt = `You are the marketing strategist for Monto, a B2B fintech company that automates supplier portal management for mid-market companies.

Monto's key value props:
- Eliminates manual logins to dozens of supplier portals
- Automates invoice submission, payment tracking, and reconciliation
- Reduces DSO (Days Sales Outstanding) by 40-60%
- Serves Tech/Business Services (500-5K employees) and Manufacturing (2K-10K)
- Key personas: AP Managers/Directors and VP/CFO level executives

Content pillars: Thought Leadership, Milestone & News, Culture & Community, Customer Success, Product Updates.
Platforms: LinkedIn, Instagram, Email, Blog.`;

    const userPrompt = `Based on these upcoming events and the current date (${today}), suggest 3-5 high-impact campaign ideas that Monto should create content for.

UPCOMING EVENTS:
${eventsText || "No upcoming events found."}

EXISTING CAMPAIGNS (avoid duplicating):
${existingCampaigns || "None yet."}

For each recommendation, provide:
1. campaign_name: A punchy 3-6 word campaign name
2. event_name: The event it ties to (or "general" if not event-specific)
3. pillar: One of: thought, milestone, culture, customer, product
4. urgency: "high" (< 7 days), "medium" (7-21 days), or "low" (21+ days)
5. key_message: A 1-2 sentence key message for the campaign
6. platforms: Array of recommended platforms ["linkedin", "instagram", "email", "blog"]
7. rationale: 1 sentence on why this campaign matters now
8. icp: "tech" or "manufacturing" or "both"

Respond with ONLY a JSON array of recommendation objects. No markdown, no explanation.`;

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
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI recommendations error:", response.status, err);
      return NextResponse.json({ error: `AI generation failed: ${response.status}` }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text?.trim();

    if (!text) {
      return NextResponse.json({ error: "No recommendations generated" }, { status: 500 });
    }

    // Parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse recommendations" }, { status: 500 });
    }

    const recommendations = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("AI recommendations error:", err);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
