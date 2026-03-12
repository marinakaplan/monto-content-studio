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

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "marketing" | "creator";
  avatar_url: string | null;
  linkedin_url: string | null;
  social_profiles: Record<string, string>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type VoiceProfile = {
  id: string;
  team_member_id: string;
  voice_samples: string[];
  tone_keywords: string[];
  writing_rules: string | null;
  calibration_prompt: string | null;
  calibrated_at: string | null;
  created_at: string;
  updated_at: string;
};

export type LeadershipTrack = {
  id: string;
  team_member_id: string;
  theme: string;
  description: string | null;
  pillars: string[];
  is_active: boolean;
  created_at: string;
};

export type AdvocacyQueueItem = {
  id: string;
  asset_id: string | null;
  source_brief_id: string | null;
  original_headline: string;
  original_body: string;
  suggested_platforms: string[];
  status: "available" | "claimed" | "rewritten" | "published";
  claimed_by: string | null;
  rewritten_headline: string | null;
  rewritten_body: string | null;
  rewritten_hashtags: string[] | null;
  approval_status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approval_note: string | null;
  created_at: string;
  updated_at: string;
};

export type BrandVoiceScore = {
  id: string;
  asset_id: string | null;
  advocacy_queue_id: string | null;
  overall_score: number;
  tone_score: number | null;
  clarity_score: number | null;
  guidelines_score: number | null;
  feedback: string | null;
  violations: string[] | null;
  scored_at: string;
};

export type CampaignTemplate = {
  id: string;
  name: string;
  description: string | null;
  source_brief_id: string | null;
  brief_snapshot: Record<string, unknown>;
  asset_snapshots: Record<string, unknown>[];
  tags: string[];
  usage_count: number;
  created_by: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  asset_id: string;
  parent_id: string | null;
  author_id: string | null;
  author_name: string;
  body: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
};

export type AssetVersion = {
  id: string;
  asset_id: string;
  version_number: number;
  headline: string;
  body: string;
  hashtags: string[];
  illustration_desc: string | null;
  illustration_url: string | null;
  change_type: "created" | "edited" | "regenerated" | "rewritten" | "rolled_back";
  change_summary: string | null;
  changed_by: string | null;
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
