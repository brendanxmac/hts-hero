-- ============================================================
-- HTS revision diff parsing (/revision-checker)
--
-- Internal tool for ingesting HTS revisions (change record, Chapter 99 PDF,
-- Chapter 99 JSON), converting them, diffing against a previous revision and
-- reviewing the changes. Everything here is prefixed with hts_revision_diff_
-- and is independent of every existing table, function and bucket.
--
-- Apply to the dev-hts-hero project only, by pasting into the SQL editor.
-- Row level security is enabled with no policies, so only the service role
-- (used by the tool's server routes after an admin email check) can read or
-- write these tables.
-- ============================================================

-- ------------------------------------------------------------
-- Revisions: one row per HTS revision, named like "2026HTSRev5"
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_revision_diff_revisions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text UNIQUE NOT NULL,        -- USITC name, e.g. "2026HTSRev5"
  title             text,                         -- e.g. "Revision 5 (2026)"
  active_attempt_id uuid,                         -- attempt used for comparisons
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- Attempts: each upload of a revision's files. Re-uploading creates a new
-- attempt; earlier attempts are kept.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_revision_diff_attempts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id         uuid NOT NULL REFERENCES hts_revision_diff_revisions(id) ON DELETE CASCADE,
  attempt_number      integer NOT NULL,
  status              text NOT NULL DEFAULT 'uploaded'
                      CHECK (status IN ('uploaded', 'converting', 'converted', 'parsing', 'parsed', 'failed')),
  error               text,
  -- Output of parsing (stored in the bucket; counts and warnings kept here)
  notes_path          text,                       -- parsed Chapter 99 notes JSON
  hts_rows_path       text,                       -- parsed Chapter 99 JSON rows
  parse_stats         jsonb,
  parse_warnings      jsonb,
  parser_version      text,
  parsed_at           timestamptz,
  -- Change record items extracted by Claude (from the change record markdown)
  change_record_items jsonb,
  change_record_model text,
  change_record_extracted_at timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (revision_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_hts_revision_diff_attempts_revision
  ON hts_revision_diff_attempts (revision_id);

-- ------------------------------------------------------------
-- Documents: the three files of an attempt and their conversion state
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_revision_diff_documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id         uuid NOT NULL REFERENCES hts_revision_diff_attempts(id) ON DELETE CASCADE,
  kind               text NOT NULL
                     CHECK (kind IN ('change_record', 'ch99_pdf', 'ch99_json')),
  original_filename  text NOT NULL,
  storage_path       text NOT NULL,               -- original file in the bucket
  size_bytes         bigint,
  conversion_status  text NOT NULL DEFAULT 'pending'
                     CHECK (conversion_status IN ('not_needed', 'pending', 'processing', 'complete', 'failed')),
  datalab_request_id text,
  datalab_check_url  text,
  markdown_path      text,                        -- converted markdown in the bucket
  page_count         integer,
  error              text,
  submitted_at       timestamptz,
  completed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, kind)
);

-- ------------------------------------------------------------
-- Comparisons: a diff between two parsed attempts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_revision_diff_comparisons (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_attempt_id   uuid NOT NULL REFERENCES hts_revision_diff_attempts(id) ON DELETE CASCADE,
  to_attempt_id     uuid NOT NULL REFERENCES hts_revision_diff_attempts(id) ON DELETE CASCADE,
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'extracting_change_record', 'diffing', 'ready', 'failed')),
  error             text,
  stats             jsonb,
  diff_version      text,
  exported_at       timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hts_revision_diff_comparisons_to
  ON hts_revision_diff_comparisons (to_attempt_id);

-- ------------------------------------------------------------
-- Changes: one reviewable unit of a comparison (a change record item, or
-- differences the change record didn't mention), with its AI summary and
-- the reviewer's decision
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hts_revision_diff_changes (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comparison_id          uuid NOT NULL REFERENCES hts_revision_diff_comparisons(id) ON DELETE CASCADE,
  sort_order             integer NOT NULL,
  change_key             text NOT NULL,
  source                 text NOT NULL
                         CHECK (source IN ('change_record', 'not_in_change_record', 'change_record_no_diff')),
  title                  text NOT NULL,
  payload                jsonb NOT NULL,          -- change record refs, note/code diffs, context
  summary                jsonb,
  summary_model          text,
  summary_prompt_version text,
  summarized_at          timestamptz,
  summary_error          text,
  category               text CHECK (category IN ('data', 'logic', 'mixed', 'none')),
  decision               text NOT NULL DEFAULT 'pending'
                         CHECK (decision IN ('pending', 'approve', 'skip', 'defer')),
  reviewer_notes         text,
  reviewed_at            timestamptz,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  UNIQUE (comparison_id, change_key)
);

CREATE INDEX IF NOT EXISTS idx_hts_revision_diff_changes_comparison
  ON hts_revision_diff_changes (comparison_id);

-- ------------------------------------------------------------
-- Row level security: on, with no policies (service role only)
-- ------------------------------------------------------------
ALTER TABLE hts_revision_diff_revisions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_revision_diff_attempts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_revision_diff_documents   ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_revision_diff_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hts_revision_diff_changes     ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- Auto-update updated_at
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION hts_revision_diff_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hts_revision_diff_revisions_updated_at
  BEFORE UPDATE ON hts_revision_diff_revisions
  FOR EACH ROW EXECUTE FUNCTION hts_revision_diff_set_updated_at();

CREATE TRIGGER hts_revision_diff_attempts_updated_at
  BEFORE UPDATE ON hts_revision_diff_attempts
  FOR EACH ROW EXECUTE FUNCTION hts_revision_diff_set_updated_at();

CREATE TRIGGER hts_revision_diff_documents_updated_at
  BEFORE UPDATE ON hts_revision_diff_documents
  FOR EACH ROW EXECUTE FUNCTION hts_revision_diff_set_updated_at();

CREATE TRIGGER hts_revision_diff_comparisons_updated_at
  BEFORE UPDATE ON hts_revision_diff_comparisons
  FOR EACH ROW EXECUTE FUNCTION hts_revision_diff_set_updated_at();

CREATE TRIGGER hts_revision_diff_changes_updated_at
  BEFORE UPDATE ON hts_revision_diff_changes
  FOR EACH ROW EXECUTE FUNCTION hts_revision_diff_set_updated_at();

-- ------------------------------------------------------------
-- Storage: private bucket for original files, markdown and parsed output.
-- No storage policies are added, so only the service role can access it.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('hts-revision-diff-parsing', 'hts-revision-diff-parsing', false)
ON CONFLICT (id) DO NOTHING;
