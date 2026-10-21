-- ============================================================
-- Tariff sources (/tariff-sources admin view; feeds /tariff-updates later)
--
-- Raw items collected from the government sources that announce tariff
-- changes: White House presidential actions, the Federal Register (public
-- inspection and published), CBP CSMS messages, USTR press releases and
-- USITC HTS releases. Collected every 15 minutes by /api/cron/tariff-sources,
-- or back to a date with `npm run tariff-sources:collect -- --since <date>`.
--
-- Apply by pasting into the SQL editor. Row level security is enabled with
-- no policies, so only the service role (the cron, the script, and the
-- admin routes after an admin email check) can read or write these tables.
-- ============================================================

-- One row per item a source published. Rows are never rewritten by a later
-- collection (the first copy stored wins).
CREATE TABLE IF NOT EXISTS tariff_source_items (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source           text NOT NULL
                   CHECK (source IN ('white_house', 'federal_register', 'federal_register_pi', 'csms', 'ustr', 'usitc')),
  external_id      text NOT NULL,          -- FR document number, CSMS number, release name, URL path…
  title            text NOT NULL,
  url              text NOT NULL,
  published_at     timestamptz NOT NULL,   -- date-only sources: 10:00 UTC that day
  summary          text,
  doc_type         text,                   -- "Proclamation", "Rule", "CSMS message", "HTS revision"…
  agencies         text[] NOT NULL DEFAULT '{}',
  document_number  text,                   -- links an FR public-inspection item to its published copy
  matched_terms    text[] NOT NULL DEFAULT '{}', -- tariff words in the title/summary (libs/tariff-sources/terms.ts)
  raw              jsonb NOT NULL DEFAULT '{}',
  collected_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source, external_id)
);

CREATE INDEX IF NOT EXISTS idx_tariff_source_items_published
  ON tariff_source_items (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tariff_source_items_document_number
  ON tariff_source_items (document_number) WHERE document_number IS NOT NULL;

ALTER TABLE tariff_source_items ENABLE ROW LEVEL SECURITY;

-- One row per collector run, so a source that stops answering is visible
CREATE TABLE IF NOT EXISTS tariff_source_runs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source       text NOT NULL,
  trigger      text NOT NULL CHECK (trigger IN ('cron', 'manual', 'backfill')),
  since        timestamptz NOT NULL,
  started_at   timestamptz NOT NULL DEFAULT now(),
  finished_at  timestamptz,
  found        integer,
  added        integer,
  error        text
);

CREATE INDEX IF NOT EXISTS idx_tariff_source_runs_source_started
  ON tariff_source_runs (source, started_at DESC);

ALTER TABLE tariff_source_runs ENABLE ROW LEVEL SECURITY;
