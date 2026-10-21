-- ============================================================
-- Impact alerts: who was told an update affects which of their imports
--
-- The admin checks an update's impact in /tariff-sources (what it covers, against the official
-- sources) and approves it. The system then works out every affected account and sends each one
-- email (and Slack / Teams) about their own imports (libs/tariff-updates/alerts.ts). A row here
-- per account and import alerted: approving the same update again later (once a change is
-- confirmed in the calculator, or after a scope correction) only sends what's new or changed,
-- and tells accounts about imports it no longer affects.
--
-- Apply by pasting into the SQL editor. Row level security: an account reads its own rows; the
-- service role writes.
-- ============================================================

ALTER TABLE tariff_updates
  ADD COLUMN IF NOT EXISTS impact_approved_at  timestamptz,   -- the latest impact check approval
  ADD COLUMN IF NOT EXISTS impact_approved_by  text,
  ADD COLUMN IF NOT EXISTS impact_alerted      integer;       -- accounts alerted by that approval

CREATE TABLE IF NOT EXISTS tariff_impact_alerts (
  update_id    uuid NOT NULL REFERENCES tariff_updates (id) ON DELETE CASCADE,
  user_id      uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_key  text NOT NULL,
  level        text NOT NULL CHECK (level IN ('confirmed', 'likely', 'removed')),
  before_pct   numeric,
  after_pct    numeric,
  delta_usd    numeric,
  covered      boolean NOT NULL,        -- inside the plan's alert slots (else teased, not detailed)
  batch_id     uuid REFERENCES email_batches (id) ON DELETE SET NULL,
  sent_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (update_id, user_id, product_key)
);

CREATE INDEX IF NOT EXISTS idx_tariff_impact_alerts_user ON tariff_impact_alerts (user_id, sent_at DESC);

ALTER TABLE tariff_impact_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own impact alerts" ON tariff_impact_alerts;
CREATE POLICY "Users read their own impact alerts" ON tariff_impact_alerts
  FOR SELECT USING (auth.uid() = user_id);
