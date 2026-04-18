-- AI-generated content columns
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['books','journals','videos','podcasts'] LOOP
    EXECUTE format('
      ALTER TABLE public.%I
        ADD COLUMN IF NOT EXISTS ai_summary text,
        ADD COLUMN IF NOT EXISTS ai_key_takeaways text[],
        ADD COLUMN IF NOT EXISTS ai_outline text,
        ADD COLUMN IF NOT EXISTS ai_seo_tags text[],
        ADD COLUMN IF NOT EXISTS ai_yoga_tags text[],
        ADD COLUMN IF NOT EXISTS ai_podcast_script text,
        ADD COLUMN IF NOT EXISTS ai_beginner_version text,
        ADD COLUMN IF NOT EXISTS ai_translation_hi text,
        ADD COLUMN IF NOT EXISTS ai_translation_en text,
        ADD COLUMN IF NOT EXISTS ai_generated_at timestamptz;
    ', t);
  END LOOP;
END $$;

ALTER TABLE public.translations
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_key_takeaways text[],
  ADD COLUMN IF NOT EXISTS ai_seo_tags text[],
  ADD COLUMN IF NOT EXISTS ai_yoga_tags text[],
  ADD COLUMN IF NOT EXISTS ai_podcast_script text,
  ADD COLUMN IF NOT EXISTS ai_beginner_version text,
  ADD COLUMN IF NOT EXISTS ai_generated_at timestamptz;