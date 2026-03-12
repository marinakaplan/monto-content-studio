-- Monto Content Studio - Database Setup
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.briefs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name text NOT NULL,
  icp text NOT NULL DEFAULT 'tech',
  seniority text NOT NULL DEFAULT 'manager',
  key_message text NOT NULL DEFAULT '',
  pillar text,
  platforms text[] DEFAULT '{}',
  deadline date,
  context text,
  status text NOT NULL DEFAULT 'draft',
  brief_type text NOT NULL DEFAULT 'ai',
  designer_instructions text,
  overlay_title text,
  event_id text,
  style_refs text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid REFERENCES public.briefs(id),
  pillar text NOT NULL,
  platform text NOT NULL,
  template text NOT NULL DEFAULT 'target',
  headline text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  hashtags text[] DEFAULT '{}',
  illustration_desc text,
  illustration_url text,
  status text NOT NULL DEFAULT 'pending',
  figma_frame_id text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id),
  content text NOT NULL,
  author text NOT NULL DEFAULT 'Reviewer',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  date date NOT NULL,
  category text NOT NULL DEFAULT 'conference',
  description text,
  source text NOT NULL DEFAULT 'manual',
  relevance_tags text[] DEFAULT '{}',
  url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.generation_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid REFERENCES public.briefs(id),
  prompt_sent text,
  response_received text,
  model text,
  tokens_used jsonb DEFAULT '{}',
  duration_ms integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'briefs' AND policyname = 'Allow all on briefs') THEN
    CREATE POLICY "Allow all on briefs" ON public.briefs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assets' AND policyname = 'Allow all on assets') THEN
    CREATE POLICY "Allow all on assets" ON public.assets FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Allow all on notes') THEN
    CREATE POLICY "Allow all on notes" ON public.notes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname = 'Allow all on events') THEN
    CREATE POLICY "Allow all on events" ON public.events FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'generation_logs' AND policyname = 'Allow all on generation_logs') THEN
    CREATE POLICY "Allow all on generation_logs" ON public.generation_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
