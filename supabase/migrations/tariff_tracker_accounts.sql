-- ============================================================
-- Tariff Tracker accounts
-- The saved catalog of each signed-in user, and the one 14-day trial each account can start.
-- See PRICING.md ("Free plan and the 14-day trial").
-- ============================================================

-- One catalog per user: the products (HTS code + country pairs, in the order they were added)
-- and each product's remembered adjustments. The browser keeps a copy; this is the saved one.
CREATE TABLE IF NOT EXISTS tracker_catalogs (
  user_id      uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  items        jsonb NOT NULL DEFAULT '[]'::jsonb,
  adjustments  jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracker_catalogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own catalog" ON tracker_catalogs;
CREATE POLICY "Users read their own catalog" ON tracker_catalogs
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create their own catalog" ON tracker_catalogs;
CREATE POLICY "Users create their own catalog" ON tracker_catalogs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update their own catalog" ON tracker_catalogs;
CREATE POLICY "Users update their own catalog" ON tracker_catalogs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- The trial: one row per account, written only by /api/tracker/start-trial (service role), so
-- an account can't start a second trial or move its end date. Users may read their own.
CREATE TABLE IF NOT EXISTS tracker_trials (
  user_id     uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  started_at  timestamptz NOT NULL DEFAULT now(),
  ends_at     timestamptz NOT NULL,
  -- The premium feature it was started from ("savings", "history", …), for analytics
  source      text
);

ALTER TABLE tracker_trials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own trial" ON tracker_trials;
CREATE POLICY "Users read their own trial" ON tracker_trials
  FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tracker_trials_ends ON tracker_trials (ends_at);

-- Where each user's tariff alerts go: their email, a Slack and a Microsoft Teams incoming
-- webhook. Turning alerts on is step 2 of the Overview's path (DESIGN_SYSTEM.md §15).
CREATE TABLE IF NOT EXISTS tracker_alert_settings (
  user_id        uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email_enabled  boolean NOT NULL DEFAULT true,
  email          text,
  slack_webhook  text CHECK (slack_webhook IS NULL OR slack_webhook LIKE 'https://hooks.slack.com/%'),
  teams_webhook  text CHECK (teams_webhook IS NULL OR teams_webhook LIKE 'https://%'),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracker_alert_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own alert settings" ON tracker_alert_settings;
CREATE POLICY "Users read their own alert settings" ON tracker_alert_settings
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create their own alert settings" ON tracker_alert_settings;
CREATE POLICY "Users create their own alert settings" ON tracker_alert_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update their own alert settings" ON tracker_alert_settings;
CREATE POLICY "Users update their own alert settings" ON tracker_alert_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
