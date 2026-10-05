-- ============================================================
-- Chapter 99 coverage (/coverage-checker), part 1: tracking
--
-- Internal tool for tracking which Chapter 99 headings the duty calculator
-- (engine-v2) models and which are still missing. Everything here is
-- prefixed with hts_coverage_ and is independent of every other table.
--
-- Apply to the dev-hts-hero project only, by pasting into the SQL editor.
-- Row level security is enabled with no policies, so only the service role
-- (used by the tool's server routes after an admin email check) can read or
-- write these tables.
-- ============================================================

-- ------------------------------------------------------------
-- Items: one row per Chapter 99 heading ("9903.88.15"). HTS and engine
-- columns are rewritten on every refresh; the tracking columns (status,
-- category, program, priority, notes) are only changed from the UI.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_coverage_items (
  htsno                text PRIMARY KEY,
  subchapter           text NOT NULL,                -- "9903"
  -- From the HTS (latest refresh)
  description          text NOT NULL DEFAULT '',
  general              text NOT NULL DEFAULT '',
  special              text NOT NULL DEFAULT '',
  other                text NOT NULL DEFAULT '',
  footnotes            jsonb NOT NULL DEFAULT '[]',  -- string[]
  note_citations       jsonb NOT NULL DEFAULT '[]',  -- NoteCitation[] cited by the description
  starts_on            date,                          -- "on or after <date>" in the description
  in_hts               boolean NOT NULL DEFAULT true, -- false once a refresh no longer finds it
  first_seen_revision  text,
  last_seen_revision   text,
  -- From the engine (latest refresh)
  engine_modeled       boolean NOT NULL DEFAULT false, -- a tariff record has this code (any date)
  engine_active        boolean NOT NULL DEFAULT false, -- …and one is in effect on the refresh date
  engine_referenced    boolean NOT NULL DEFAULT false, -- named anywhere in the engine data
  engine_programs      text[] NOT NULL DEFAULT '{}',
  category_suggested   text,
  -- Tracking (edited in the UI)
  status               text NOT NULL DEFAULT 'open'
                       CHECK (status IN ('open', 'needs_review', 'expired', 'ftz_suspended', 'out_of_scope')),
  status_note          text,
  category             text,
  program              text,                          -- overrides the program from the note mapping
  priority             text CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  notes                text,
  refreshed_at         timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hts_coverage_items_subchapter ON hts_coverage_items (subchapter);

-- ------------------------------------------------------------
-- Note programs: which program a U.S. note belongs to ("III:20" → "301-china").
-- Suggested from the engine on each refresh; rows here override the suggestion.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_coverage_note_programs (
  note_key    text PRIMARY KEY,                       -- "<subchapter roman>:<note number>"
  program     text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Snapshots: counts saved on each refresh, for the progress chart
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_coverage_snapshots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision    text,
  counts      jsonb NOT NULL,                         -- CoverageCounts
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hts_coverage_snapshots_created ON hts_coverage_snapshots (created_at);

ALTER TABLE hts_coverage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_coverage_note_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_coverage_snapshots ENABLE ROW LEVEL SECURITY;
