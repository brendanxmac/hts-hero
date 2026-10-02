-- ============================================================
-- Tariff calculator changelog
-- Shown on /duty-calculator (latest 3) and /duty-calculator/changelog (all).
-- Anyone can read published entries. Writes go through /api/tariff-changelog
-- (service role, admin only) or `npm run changelog:draft` (service role).
-- ============================================================
CREATE TABLE IF NOT EXISTS tariff_changelog (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date  date NOT NULL DEFAULT CURRENT_DATE,  -- the date shown on the entry
  type        text NOT NULL
              CHECK (type IN ('revision', 'fix', 'improvement')),
  title       text NOT NULL,
  summary     text NOT NULL,
  revision    text,                                -- HTS revision for type 'revision', e.g. "2026HTSRev6"
  status      text NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'published')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tariff_changelog_published
  ON tariff_changelog (status, entry_date DESC, created_at DESC);

ALTER TABLE tariff_changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published changelog entries are public"
  ON tariff_changelog FOR SELECT
  USING (status = 'published');

-- ============================================================
-- Seed: recent changes, as drafts to review and publish
-- ============================================================
INSERT INTO tariff_changelog (entry_date, type, title, summary, revision) VALUES
  ('2026-10-01', 'improvement',
   'New duty engine with line-by-line reasons',
   'Every estimate now explains why each duty applies or doesn''t, cites its legal source, and uses the rules in effect on your entry date.',
   NULL),
  ('2026-10-02', 'revision',
   'HTS Revision 6 (2026)',
   'Verified tariff data now covers entries through April 28, 2026. Adds 9903.82.18 and 9903.82.19: a 25% Section 232 rate for Commerce-authorized steel and aluminum from Canada and Mexico entered under USMCA.',
   '2026HTSRev6'),
  ('2026-10-02', 'fix',
   'Section 232 metals no longer stack on autos, trucks or semiconductors',
   'Steel, aluminum and copper duties are now dropped when an auto, auto part, medium- or heavy-duty vehicle, or semiconductor Section 232 duty applies (U.S. notes 33, 38 and 39). Wood and semiconductor non-stacking rules from the same notes are applied too.',
   NULL),
  ('2026-10-02', 'fix',
   'Steel and aluminum housewares now get Section 232 duties',
   '55 HTS codes listed in U.S. note 16, mostly steel and aluminum cookware and kitchenware (7321–7326, 7615), were missing Section 232 duties. They''re now included.',
   NULL),
  ('2026-10-02', 'fix',
   'Only one Section 232 metals rate applies per product',
   'Some products could get two alternative metals headings at once, such as both the UK and U.S.-melted rates. Exactly one now applies, as U.S. note 16 requires.',
   NULL),
  ('2026-10-02', 'improvement',
   'USMCA can be claimed on duty-free HTS codes',
   'Goods of Canada and Mexico on codes that are free under the general rate can now be claimed under USMCA, so USMCA-based exemptions apply to them.',
   NULL);
