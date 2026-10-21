-- ============================================================
-- Social ideas: sources (/content-studio)
--
-- Every idea keeps the links that verify its figures: the official
-- documents and datasets (USITC HTS, Federal Register, CBP, Census) and the
-- HTS Hero calculator breakdown. Apply after social_ideas.sql, by pasting
-- into the SQL editor.
-- ============================================================

ALTER TABLE social_ideas ADD COLUMN IF NOT EXISTS sources jsonb NOT NULL DEFAULT '[]';
