-- ══════════════════════════════════════
-- MATCH TRANSLATIONS (20260305000002)
-- Build-time multilingual WC26 analysis storage.
-- ══════════════════════════════════════

CREATE TABLE IF NOT EXISTS match_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_slug TEXT NOT NULL,
  language_code TEXT NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT NOT NULL CHECK (char_length(meta_description) <= 155),
  analysis_headline TEXT NOT NULL,
  analysis_body TEXT NOT NULL,
  key_factors JSONB,
  generated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (match_slug, language_code)
);

CREATE INDEX IF NOT EXISTS idx_match_translations_slug
  ON match_translations (match_slug);

CREATE INDEX IF NOT EXISTS idx_match_translations_language
  ON match_translations (language_code);

ALTER TABLE match_translations ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_translations'
      AND policyname = 'Public read match translations'
  ) THEN
    CREATE POLICY "Public read match translations"
      ON match_translations
      FOR SELECT
      USING (true);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'match_translations'
      AND policyname = 'Service write match translations'
  ) THEN
    CREATE POLICY "Service write match translations"
      ON match_translations
      FOR ALL
      USING (auth.role() = 'service_role');
  END IF;
END
$$;
