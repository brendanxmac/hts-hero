-- ============================================================
-- Chapter 99 coverage (/coverage-checker), part 2: batches and Claude suggestions
--
-- A batch is a chunk of headings to add to the engine together, with
-- instructions for Claude Code (`npm run pull-batch`, then /apply-batch).
-- Apply to the dev-hts-hero project after part 1. Only touches hts_coverage_ objects.
-- ============================================================

CREATE TABLE IF NOT EXISTS hts_coverage_batches (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text UNIQUE NOT NULL,                 -- slug, used for the folder and branch
  title         text NOT NULL,
  status        text NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft', 'ready', 'pulled', 'applied', 'archived')),
  instructions  text,                                 -- for the whole batch
  dates_mode    text NOT NULL DEFAULT 'earliest_verified'
                CHECK (dates_mode IN ('earliest_verified', 'backfill')),
  pr_url        text,
  pulled_at     timestamptz,
  applied_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hts_coverage_batch_items (
  batch_id      uuid NOT NULL REFERENCES hts_coverage_batches(id) ON DELETE CASCADE,
  htsno         text NOT NULL REFERENCES hts_coverage_items(htsno) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  decision      text NOT NULL DEFAULT 'pending'
                CHECK (decision IN ('pending', 'include', 'skip')),
  instructions  text,                                 -- for this heading
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (batch_id, htsno)
);

CREATE INDEX IF NOT EXISTS idx_hts_coverage_batch_items_htsno ON hts_coverage_batch_items (htsno);

-- Claude's read of a heading ("Suggest with Claude"): category, program and what modeling it takes
ALTER TABLE hts_coverage_items
  ADD COLUMN IF NOT EXISTS claude_suggestion jsonb;   -- ClaudeSuggestion

ALTER TABLE hts_coverage_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_coverage_batch_items ENABLE ROW LEVEL SECURITY;
