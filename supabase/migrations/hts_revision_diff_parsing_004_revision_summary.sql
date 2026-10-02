-- ============================================================
-- HTS revision diff parsing, part 4: revision summary per comparison
--
-- Claude's high-level overview of a comparison's approved changes
-- ("Generate revision summary" on the comparison page). Apply to the
-- dev-hts-hero project after part 3. Only touches hts_revision_diff_ objects.
-- ============================================================

ALTER TABLE hts_revision_diff_comparisons
  ADD COLUMN IF NOT EXISTS revision_summary jsonb;
