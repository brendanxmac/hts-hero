-- ============================================================
-- HTS revision diff parsing, part 3: reviewer context per revision
--
-- Optional background the reviewer writes about a revision (what's behind it,
-- what isn't obvious from the HTS text). Shown on the comparison page and
-- exported with the package for /apply-revision. Apply to the dev-hts-hero
-- project after part 2. Only touches hts_revision_diff_ objects.
-- ============================================================

ALTER TABLE hts_revision_diff_revisions
  ADD COLUMN IF NOT EXISTS context_notes text,
  ADD COLUMN IF NOT EXISTS context_notes_updated_at timestamptz;
