-- ============================================================
-- Tariff update impacts: which of each account's imports a tariff update may affect
--
-- Worked out daily with the account's numbers (/api/cron/tracker-snapshots), and for one update on
-- demand (alerts). One row per update, account and import:
--   confirmed  the duty engine shows the update's Chapter 99 heading applying to the import, with
--              the duty on one shipment before and after it took effect
--   likely     the update names the import's code (or a heading above it) and its country
--   possible   it names the import's country but no products (shown in the Tracker, never emailed)
-- See libs/tariff-updates/match.ts and impacts.ts.
--
-- Apply by pasting into the SQL editor. Row level security: an account reads its own rows; the
-- service role writes.
-- ============================================================

CREATE TABLE IF NOT EXISTS tariff_update_impacts (
  update_id     uuid NOT NULL REFERENCES tariff_updates (id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_key   text NOT NULL,              -- "code-country", as the catalog keys imports
  level         text NOT NULL CHECK (level IN ('confirmed', 'likely', 'possible')),
  before_pct    numeric,                    -- confirmed: the rate before and after it took effect
  after_pct     numeric,
  delta_usd     numeric,                    -- confirmed: the change in duty on one shipment
  computed_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (update_id, user_id, product_key)
);

CREATE INDEX IF NOT EXISTS idx_tariff_update_impacts_user ON tariff_update_impacts (user_id);

ALTER TABLE tariff_update_impacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own impacts" ON tariff_update_impacts;
CREATE POLICY "Users read their own impacts" ON tariff_update_impacts
  FOR SELECT USING (auth.uid() = user_id);
