-- ============================================================
-- Tariff updates (step 2 of /tariff-updates)
--
-- Source items (tariff_sources.sql) are sorted by Claude, and the tariff
-- actions among them are grouped into updates: one per real-world action,
-- with every source item that moved it along (signed, filed, published,
-- CBP guidance, in the HTS). Run by /api/cron/tariff-updates, or
-- `npm run tariff-updates:process`. Reviewed in /tariff-sources.
--
-- Apply after tariff_sources.sql, by pasting into the SQL editor. Published
-- updates are public (they'll back /tariff-updates); everything else is
-- service role only.
-- ============================================================

CREATE TABLE IF NOT EXISTS tariff_updates (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              text NOT NULL UNIQUE,
  title             text NOT NULL,
  summary           text NOT NULL,
  kind              text NOT NULL,           -- new_tariff, rate_change, scope_change, exclusion, pause, end, deadline, guidance, investigation, deal, hts_revision, other
  authority         text NOT NULL,           -- section_232, section_301, section_122, section_338, section_201, ieepa, trade_agreement, quota, hts, other
  countries         text[] NOT NULL DEFAULT '{}', -- ISO alpha-2, or 'ALL'
  hts_codes         text[] NOT NULL DEFAULT '{}', -- chapters, headings or full codes named in the sources
  products          text,                    -- what's covered, in a few words
  effective_on      date,
  stage             text NOT NULL,           -- announced, signed, filed, published, cbp_guidance, in_hts
  first_seen_at     timestamptz NOT NULL,    -- the earliest source item
  last_activity_at  timestamptz NOT NULL,    -- the latest source item
  lead_item_id      uuid,                    -- the item the title and summary come from
  status            text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden')),
  needs_review      boolean NOT NULL DEFAULT false,
  review_notes      text,
  edited            boolean NOT NULL DEFAULT false, -- title/summary edited by hand: never overwritten
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tariff_updates_activity ON tariff_updates (last_activity_at DESC);

ALTER TABLE tariff_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published tariff updates are public" ON tariff_updates;
CREATE POLICY "Published tariff updates are public"
  ON tariff_updates FOR SELECT
  USING (status = 'published');

-- What Claude made of each source item
ALTER TABLE tariff_source_items
  ADD COLUMN IF NOT EXISTS category          text,       -- tariff_action, ad_cvd, trade_related, not_relevant, hts_revision
  ADD COLUMN IF NOT EXISTS category_reason   text,
  ADD COLUMN IF NOT EXISTS categorized_at    timestamptz,
  ADD COLUMN IF NOT EXISTS extraction        jsonb,      -- headline, summary, authority, countries, codes… (libs/tariff-updates/types.ts)
  ADD COLUMN IF NOT EXISTS extracted_at      timestamptz,
  ADD COLUMN IF NOT EXISTS stage             text,
  ADD COLUMN IF NOT EXISTS update_id         uuid REFERENCES tariff_updates (id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS match_confidence  numeric,
  ADD COLUMN IF NOT EXISTS grouped_at        timestamptz,
  ADD COLUMN IF NOT EXISTS grouped_by        text,       -- claude, document_number, admin
  ADD COLUMN IF NOT EXISTS process_error     text;

CREATE INDEX IF NOT EXISTS idx_tariff_source_items_update ON tariff_source_items (update_id);
CREATE INDEX IF NOT EXISTS idx_tariff_source_items_pending
  ON tariff_source_items (published_at) WHERE categorized_at IS NULL OR (category = 'tariff_action' AND grouped_at IS NULL);
