/*
# Create sentiment_analysis table (single-tenant, no auth)

1. New Tables
- `sentiment_analysis`
  - `id` (uuid, primary key)
  - `input_text` (text, not null) — the text the user submitted for analysis
  - `sentiment` (text, not null) — result label: positive, negative, or neutral
  - `score` (numeric, not null) — overall sentiment score from -1.0 to 1.0
  - `positive_count` (integer, default 0) — number of positive words found
  - `negative_count` (integer, default 0) — number of negative words found
  - `neutral_count` (integer, default 0) — number of neutral words found
  - `top_words` (jsonb, default '[]') — array of {word, sentiment, score} for highlighted words
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `sentiment_analysis`.
- Allow anon + authenticated full CRUD because this is a single-tenant, no-auth app and the data is intentionally public/shared.
- Four separate policies for SELECT, INSERT, UPDATE, DELETE.

3. Notes
- No user_id column since the app has no sign-in screen.
- The table stores analysis history so users can review past sentiment results.
*/

CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input_text text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  score numeric NOT NULL DEFAULT 0,
  positive_count integer NOT NULL DEFAULT 0,
  negative_count integer NOT NULL DEFAULT 0,
  neutral_count integer NOT NULL DEFAULT 0,
  top_words jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_sentiment" ON sentiment_analysis;
CREATE POLICY "anon_select_sentiment" ON sentiment_analysis
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sentiment" ON sentiment_analysis;
CREATE POLICY "anon_insert_sentiment" ON sentiment_analysis
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sentiment" ON sentiment_analysis;
CREATE POLICY "anon_update_sentiment" ON sentiment_analysis
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sentiment" ON sentiment_analysis;
CREATE POLICY "anon_delete_sentiment" ON sentiment_analysis
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_sentiment_analysis_created_at
  ON sentiment_analysis (created_at DESC);
