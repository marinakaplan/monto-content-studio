import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const SEED_EVENTS = [
  // Conferences
  {
    name: "Money20/20 Europe",
    date: "2026-06-02",
    category: "conference",
    description: "Europe's largest fintech conference. Opportunity for Monto to showcase AP automation and portal management.",
    source: "manual",
    relevance_tags: ["fintech", "payments", "networking"],
    url: null,
  },
  {
    name: "AFP Annual Conference",
    date: "2026-10-18",
    category: "conference",
    description: "Association for Financial Professionals. Key audience: treasury managers and CFOs — core Monto ICP.",
    source: "manual",
    relevance_tags: ["treasury", "AP", "finance leaders"],
    url: null,
  },
  {
    name: "SaaStr Annual 2026",
    date: "2026-09-08",
    category: "conference",
    description: "Largest SaaS community event. Great for B2B positioning and partnership conversations.",
    source: "manual",
    relevance_tags: ["SaaS", "B2B", "growth"],
    url: null,
  },
  {
    name: "Gartner CFO & Finance Conference",
    date: "2026-05-18",
    category: "conference",
    description: "Premier event for finance executives. Monto can position as the answer to supplier portal fatigue.",
    source: "manual",
    relevance_tags: ["CFO", "finance", "automation"],
    url: null,
  },
  // Industry events
  {
    name: "National AP Automation Week",
    date: "2026-04-13",
    category: "industry",
    description: "Industry awareness week for accounts payable automation. Perfect timing for thought leadership content.",
    source: "manual",
    relevance_tags: ["AP automation", "thought leadership"],
    url: null,
  },
  {
    name: "World Invoice Day",
    date: "2026-05-12",
    category: "industry",
    description: "Annual celebration of invoicing efficiency. Great hook for content about eliminating manual invoice processing.",
    source: "manual",
    relevance_tags: ["invoicing", "efficiency", "content hook"],
    url: null,
  },
  {
    name: "Global Supply Chain Day",
    date: "2026-04-27",
    category: "industry",
    description: "Spotlight on supply chain efficiency. Tie-in: how supplier portal automation reduces supply chain friction.",
    source: "manual",
    relevance_tags: ["supply chain", "manufacturing", "efficiency"],
    url: null,
  },
  // Product launches
  {
    name: "Monto Smart Connections v3 Launch",
    date: "2026-04-01",
    category: "product-launch",
    description: "Major release: AI-powered supplier matching and auto-reconciliation. Key selling point for Q2.",
    source: "manual",
    relevance_tags: ["product launch", "AI", "smart connections"],
    url: null,
  },
  {
    name: "Monto SOC 2 Type II Certification",
    date: "2026-03-25",
    category: "product-launch",
    description: "Security milestone announcement. Important for enterprise sales and trust content.",
    source: "manual",
    relevance_tags: ["security", "compliance", "enterprise"],
    url: null,
  },
  // Webinars
  {
    name: "Webinar: Zero-Touch AP — From Chaos to Control",
    date: "2026-03-20",
    category: "webinar",
    description: "Live demo webinar showing how Monto eliminates manual supplier portal work. Target: AP managers.",
    source: "manual",
    relevance_tags: ["webinar", "demo", "AP managers"],
    url: null,
  },
  {
    name: "Webinar: DSO Reduction Masterclass",
    date: "2026-04-17",
    category: "webinar",
    description: "Deep dive into how portal automation reduces Days Sales Outstanding. Target: CFOs and controllers.",
    source: "manual",
    relevance_tags: ["webinar", "DSO", "CFO"],
    url: null,
  },
  {
    name: "Webinar: Manufacturing AP Automation 101",
    date: "2026-05-08",
    category: "webinar",
    description: "Industry-specific session for manufacturing finance teams. Covers multi-portal complexity.",
    source: "manual",
    relevance_tags: ["webinar", "manufacturing", "onboarding"],
    url: null,
  },
  // Holidays & cultural
  {
    name: "Earth Day 2026",
    date: "2026-04-22",
    category: "holiday",
    description: "Sustainability angle: how going paperless with Monto reduces environmental impact of AP processes.",
    source: "manual",
    relevance_tags: ["sustainability", "culture", "paperless"],
    url: null,
  },
  {
    name: "World Automation Day",
    date: "2026-04-09",
    category: "industry",
    description: "Celebrate automation wins. Perfect for customer success stories and ROI metrics content.",
    source: "manual",
    relevance_tags: ["automation", "customer success", "ROI"],
    url: null,
  },
  {
    name: "Q2 Customer Appreciation Week",
    date: "2026-06-15",
    category: "holiday",
    description: "Internal initiative to celebrate customer milestones. Create social proof and case study content.",
    source: "manual",
    relevance_tags: ["customer love", "case studies", "community"],
    url: null,
  },
];

export async function POST() {
  try {
    const supabase = createServerClient();

    // Check existing events to avoid duplicates
    const { data: existing } = await supabase
      .from("events")
      .select("name");

    const existingNames = new Set((existing || []).map((e: { name: string }) => e.name));
    const newEvents = SEED_EVENTS.filter((e) => !existingNames.has(e.name));

    if (newEvents.length === 0) {
      return NextResponse.json({ message: "All events already exist", seeded: 0 });
    }

    const { data, error } = await supabase
      .from("events")
      .insert(newEvents)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: `Seeded ${data?.length || 0} events`, seeded: data?.length || 0, events: data });
  } catch (err) {
    console.error("Seed error:", err);
    return NextResponse.json({ error: "Failed to seed events" }, { status: 500 });
  }
}
