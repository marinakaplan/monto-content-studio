-- Phase 1: Creator Mode, Templates, Comments, Version History
-- Run this in Supabase SQL Editor

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'creator',
  avatar_url text,
  linkedin_url text,
  social_profiles jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- VOICE PROFILES
CREATE TABLE IF NOT EXISTS public.voice_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  voice_samples text[] DEFAULT '{}',
  tone_keywords text[] DEFAULT '{}',
  writing_rules text,
  calibration_prompt text,
  calibrated_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(team_member_id)
);

-- LEADERSHIP TRACKS
CREATE TABLE IF NOT EXISTS public.leadership_tracks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  theme text NOT NULL,
  description text,
  pillars text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ADVOCACY QUEUE
CREATE TABLE IF NOT EXISTS public.advocacy_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id),
  source_brief_id uuid REFERENCES public.briefs(id),
  original_headline text NOT NULL,
  original_body text NOT NULL,
  suggested_platforms text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'available',
  claimed_by uuid REFERENCES public.team_members(id),
  rewritten_headline text,
  rewritten_body text,
  rewritten_hashtags text[],
  approval_status text DEFAULT 'pending',
  approved_by uuid REFERENCES public.team_members(id),
  approval_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- BRAND VOICE SCORES
CREATE TABLE IF NOT EXISTS public.brand_voice_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id),
  advocacy_queue_id uuid REFERENCES public.advocacy_queue(id),
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  tone_score integer CHECK (tone_score BETWEEN 0 AND 100),
  clarity_score integer CHECK (clarity_score BETWEEN 0 AND 100),
  guidelines_score integer CHECK (guidelines_score BETWEEN 0 AND 100),
  feedback text,
  violations text[],
  scored_at timestamptz DEFAULT now()
);

-- TEMPLATES (saved campaign templates)
CREATE TABLE IF NOT EXISTS public.campaign_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  source_brief_id uuid REFERENCES public.briefs(id),
  brief_snapshot jsonb NOT NULL,
  asset_snapshots jsonb DEFAULT '[]',
  tags text[] DEFAULT '{}',
  usage_count integer DEFAULT 0,
  created_by uuid REFERENCES public.team_members(id),
  created_at timestamptz DEFAULT now()
);

-- COMMENTS (threaded discussions on assets)
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id uuid REFERENCES public.team_members(id),
  author_name text NOT NULL DEFAULT 'Anonymous',
  body text NOT NULL,
  resolved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ASSET VERSIONS (edit history)
CREATE TABLE IF NOT EXISTS public.asset_versions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  headline text NOT NULL,
  body text NOT NULL,
  hashtags text[] DEFAULT '{}',
  illustration_desc text,
  illustration_url text,
  change_type text NOT NULL,
  change_summary text,
  changed_by uuid REFERENCES public.team_members(id),
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_assets_search ON public.assets USING gin(to_tsvector('english', headline || ' ' || body));
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_platform ON public.assets(platform);
CREATE INDEX IF NOT EXISTS idx_comments_asset ON public.comments(asset_id);
CREATE INDEX IF NOT EXISTS idx_versions_asset ON public.asset_versions(asset_id, version_number);

-- RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leadership_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advocacy_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_voice_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_versions ENABLE ROW LEVEL SECURITY;

-- Policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'Allow all on team_members') THEN
    CREATE POLICY "Allow all on team_members" ON public.team_members FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'voice_profiles' AND policyname = 'Allow all on voice_profiles') THEN
    CREATE POLICY "Allow all on voice_profiles" ON public.voice_profiles FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'leadership_tracks' AND policyname = 'Allow all on leadership_tracks') THEN
    CREATE POLICY "Allow all on leadership_tracks" ON public.leadership_tracks FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'advocacy_queue' AND policyname = 'Allow all on advocacy_queue') THEN
    CREATE POLICY "Allow all on advocacy_queue" ON public.advocacy_queue FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brand_voice_scores' AND policyname = 'Allow all on brand_voice_scores') THEN
    CREATE POLICY "Allow all on brand_voice_scores" ON public.brand_voice_scores FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_templates' AND policyname = 'Allow all on campaign_templates') THEN
    CREATE POLICY "Allow all on campaign_templates" ON public.campaign_templates FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'comments' AND policyname = 'Allow all on comments') THEN
    CREATE POLICY "Allow all on comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'asset_versions' AND policyname = 'Allow all on asset_versions') THEN
    CREATE POLICY "Allow all on asset_versions" ON public.asset_versions FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
