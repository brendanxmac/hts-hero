-- ============================================================
-- Social ideas (/social-studio)
--
-- Each day the idea miners (libs/social-studio/miners.ts) scan the tariff
-- engine and Census data for posts worth making, and Claude picks a varied
-- set and writes their headlines and captions. One row per idea: the
-- template and its props (every figure computed, never written by Claude),
-- and whether it was used. Run by /api/cron/social-ideas, from the studio's
-- "Find ideas now", or `npm run social:ideas`.
--
-- Apply by pasting into the SQL editor. Service role only.
-- ============================================================

CREATE TABLE IF NOT EXISTS social_ideas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_on      date NOT NULL,
  position    int NOT NULL,              -- Claude's order for the day
  kind        text NOT NULL,             -- sourcing, spread, quiz, trade-shift, big-number, rate-history, country, fact
  template    text NOT NULL,             -- social/registry.ts
  title       text NOT NULL,
  why         text NOT NULL DEFAULT '',
  score       real NOT NULL DEFAULT 0,
  dedupe_key  text NOT NULL,             -- the same story on another day has the same key
  props       jsonb NOT NULL,
  captions    jsonb NOT NULL,            -- { linkedin, x }
  status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'used', 'skipped')),
  model       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_ideas_run_on ON social_ideas (run_on DESC, position);
CREATE INDEX IF NOT EXISTS idx_social_ideas_dedupe ON social_ideas (dedupe_key, run_on);

ALTER TABLE social_ideas ENABLE ROW LEVEL SECURITY;
