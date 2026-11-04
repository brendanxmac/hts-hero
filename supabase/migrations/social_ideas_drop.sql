-- ============================================================
-- Social ideas: drop (/content-studio)
--
-- Content Studio ideas are now found only when you click "Find ideas" and are
-- never stored, so the social_ideas table (social_ideas.sql,
-- social_ideas_sources.sql) is no longer read or written. Its rows, and the
-- indexes on it, go with it.
--
-- Apply by pasting into the SQL editor, after the code that stops using the
-- table is deployed.
-- ============================================================

DROP TABLE IF EXISTS social_ideas;
