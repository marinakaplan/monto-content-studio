import { createClient } from "@supabase/supabase-js";

export type Brief = {
  id: string;
  campaign_name: string;
  icp: "tech" | "manufacturing";
  seniority: "manager" | "executive";
  key_message: string;
  pillar: "thought" | "milestone" | "culture" | "customer" | "product" | null;
  platforms: string[];
  deadline: string | null;
  context: string | null;
  status: "draft" | "generating" | "review" | "complete";
  brief_type: "ai" | "manual";
  designer_instructions: string | null;
  overlay_title: string | null;
  event_id: string | null;
  style_refs: string[] | null;
  created_at: string;
  updated_at: string;
};

export type Asset = {
  id: string;
  brief_id: string;
  pillar: string;
  platform: string;
  template: "target" | "vortex" | "maze" | "engine" | "hero";
  headline: string;
  body: string;
  hashtags: string[];
  illustration_desc: string | null;
  illustration_url: string | null;
  status: "pending" | "approved" | "rejected";
  figma_frame_id: string | null;
  created_at: string;
};

export type Note = {
  id: string;
  asset_id: string;
  content: string;
  author: string;
  created_at: string;
};

export type Event = {
  id: string;
  name: string;
  date: string;
  category: "conference" | "holiday" | "industry" | "webinar" | "product-launch";
  description: string | null;
  source: "manual" | "auto";
  relevance_tags: string[];
  url: string | null;
  created_at: string;
};

export type GenerationLog = {
  id: string;
  brief_id: string;
  prompt_sent: string;
  response_received: string;
  model: string;
  tokens_used: {
    input_tokens?: number;
    output_tokens?: number;
  };
  duration_ms: number | null;
  created_at: string;
};

// Lazy client creation to avoid build-time errors when env vars aren't set.
export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function createServerClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith("eyJ")
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key
  );
}
