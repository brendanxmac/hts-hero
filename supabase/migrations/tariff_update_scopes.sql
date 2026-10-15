-- ============================================================
-- Tariff update scopes: exactly what each tariff action covers
--
-- An update's hts_codes and countries come from reading each source's text, which misses annex
-- tables that are images and stops at 200 codes. The scope reader (libs/tariff-updates/scope.ts)
-- has Claude read the update's PDFs themselves (Federal Register, public inspection, White House
-- annexes) and writes the full lists here, with exclusions. The admin can correct them in review;
-- a corrected scope is never overwritten by the reader. Matching (match.ts, impacts.ts) uses the
-- scope when there is one, else hts_codes and countries.
--
-- Apply by pasting into the SQL editor. These are columns on tariff_updates, public with it
-- (published rows only).
-- ============================================================

ALTER TABLE tariff_updates
  ADD COLUMN IF NOT EXISTS scope_codes               text[],   -- covered: HTS codes, headings or "Chapter NN"
  ADD COLUMN IF NOT EXISTS scope_excluded_codes      text[],   -- carved out of the codes above
  ADD COLUMN IF NOT EXISTS scope_countries           text[],   -- ISO alpha-2, or ['ALL']
  ADD COLUMN IF NOT EXISTS scope_excluded_countries  text[],
  ADD COLUMN IF NOT EXISTS scope_headings            text[],   -- Chapter 99 headings it creates or changes
  ADD COLUMN IF NOT EXISTS scope_source              text CHECK (scope_source IN ('reader', 'admin')),
  ADD COLUMN IF NOT EXISTS scope_read_at             timestamptz,
  ADD COLUMN IF NOT EXISTS scope_notes               text,     -- what the reader wasn't sure of
  ADD COLUMN IF NOT EXISTS scope_documents           text[];   -- the PDFs it read
