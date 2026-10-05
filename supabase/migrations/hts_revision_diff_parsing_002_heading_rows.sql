-- ============================================================
-- HTS revision diff parsing, part 2: Chapter 99 heading pages
--
-- Adds a fourth document type (trimmed tariff-table pages from a revision's
-- Chapter 99 PDF) and a table for the heading rows read from them, each with
-- a Claude check and the reviewer's sign-off. Apply to the dev-hts-hero
-- project after hts_revision_diff_parsing.sql. Only touches
-- hts_revision_diff_ objects.
-- ============================================================

ALTER TABLE hts_revision_diff_documents
  DROP CONSTRAINT IF EXISTS hts_revision_diff_documents_kind_check;
ALTER TABLE hts_revision_diff_documents
  ADD CONSTRAINT hts_revision_diff_documents_kind_check
  CHECK (kind IN ('change_record', 'ch99_pdf', 'ch99_json', 'ch99_headings_pdf'));

CREATE TABLE IF NOT EXISTS hts_revision_diff_heading_rows (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id       uuid NOT NULL REFERENCES hts_revision_diff_attempts(id) ON DELETE CASCADE,
  sort_order       integer NOT NULL,
  htsno            text NOT NULL DEFAULT '',   -- '' for description-only rows
  stat_suffix      text NOT NULL DEFAULT '',
  indent           integer NOT NULL DEFAULT 0,
  description      text NOT NULL DEFAULT '',
  general          text NOT NULL DEFAULT '',
  special          text NOT NULL DEFAULT '',
  other            text NOT NULL DEFAULT '',   -- column 2
  units            text NOT NULL DEFAULT '',
  footnotes        text[] NOT NULL DEFAULT '{}',
  page             integer,
  source           text NOT NULL CHECK (source IN ('pdf', 'manual')),
  -- Claude's check against the PDF pages
  claude_status    text CHECK (claude_status IN ('pending', 'ok', 'corrected', 'added', 'flagged')),
  claude_notes     text,
  parser_original  jsonb,                      -- the parser's values, when Claude corrected them
  -- Reviewer sign-off: only reviewed rows are used
  reviewed         boolean NOT NULL DEFAULT false,
  reviewed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hts_revision_diff_heading_rows_attempt
  ON hts_revision_diff_heading_rows (attempt_id, sort_order);

ALTER TABLE hts_revision_diff_heading_rows ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER hts_revision_diff_heading_rows_updated_at
  BEFORE UPDATE ON hts_revision_diff_heading_rows
  FOR EACH ROW EXECUTE FUNCTION hts_revision_diff_set_updated_at();
