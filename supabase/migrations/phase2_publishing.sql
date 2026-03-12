-- Phase 2: Publishing Hub, Scheduling, Repurposing, Analytics

-- PUBLISHING FORMATS
CREATE TABLE IF NOT EXISTS public.publishing_formats (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  platform text NOT NULL,
  formatted_content text NOT NULL,
  format_type text NOT NULL DEFAULT 'text',
  publish_status text NOT NULL DEFAULT 'draft',
  copied_at timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SCHEDULED ITEMS
CREATE TABLE IF NOT EXISTS public.scheduled_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid REFERENCES public.briefs(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.assets(id),
  platform text NOT NULL,
  scheduled_date date NOT NULL,
  scheduled_time time,
  lane_order integer DEFAULT 0,
  recurrence_rule text,
  recurrence_parent_id uuid REFERENCES public.scheduled_items(id),
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- REPURPOSED ASSETS
CREATE TABLE IF NOT EXISTS public.repurposed_assets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  source_asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  target_asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  target_platform text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- CAMPAIGN SCORECARDS
CREATE TABLE IF NOT EXISTS public.campaign_scorecards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid REFERENCES public.briefs(id) ON DELETE CASCADE,
  platform text,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement integer DEFAULT 0,
  shares integer DEFAULT 0,
  conversions integer DEFAULT 0,
  notes text,
  ai_insights text,
  scored_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- AB VARIANT TRACKING
CREATE TABLE IF NOT EXISTS public.ab_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id uuid REFERENCES public.briefs(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.assets(id) ON DELETE CASCADE,
  variant_label text NOT NULL,
  was_published boolean DEFAULT false,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement integer DEFAULT 0,
  shares integer DEFAULT 0,
  ai_learnings text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- COMPETITOR ANALYSES
CREATE TABLE IF NOT EXISTS public.competitor_analyses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  competitor_post text NOT NULL,
  monto_response text,
  platform text,
  analysis_notes text,
  brief_id uuid REFERENCES public.briefs(id),
  created_at timestamptz DEFAULT now()
);

-- Add language columns to existing tables
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS source_language text;
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS translated_from_asset_id uuid REFERENCES public.assets(id);
ALTER TABLE public.briefs ADD COLUMN IF NOT EXISTS language text DEFAULT 'en';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_publishing_formats_asset ON public.publishing_formats(asset_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_items_date ON public.scheduled_items(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_scheduled_items_brief ON public.scheduled_items(brief_id);
CREATE INDEX IF NOT EXISTS idx_scorecards_brief ON public.campaign_scorecards(brief_id);
CREATE INDEX IF NOT EXISTS idx_ab_variants_brief ON public.ab_variants(brief_id);

-- RLS
ALTER TABLE public.publishing_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repurposed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;

-- Idempotent policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'publishing_formats' AND policyname = 'Allow all on publishing_formats') THEN
    CREATE POLICY "Allow all on publishing_formats" ON public.publishing_formats FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'scheduled_items' AND policyname = 'Allow all on scheduled_items') THEN
    CREATE POLICY "Allow all on scheduled_items" ON public.scheduled_items FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'repurposed_assets' AND policyname = 'Allow all on repurposed_assets') THEN
    CREATE POLICY "Allow all on repurposed_assets" ON public.repurposed_assets FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_scorecards' AND policyname = 'Allow all on campaign_scorecards') THEN
    CREATE POLICY "Allow all on campaign_scorecards" ON public.campaign_scorecards FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ab_variants' AND policyname = 'Allow all on ab_variants') THEN
    CREATE POLICY "Allow all on ab_variants" ON public.ab_variants FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'competitor_analyses' AND policyname = 'Allow all on competitor_analyses') THEN
    CREATE POLICY "Allow all on competitor_analyses" ON public.competitor_analyses FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
