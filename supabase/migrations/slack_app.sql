-- ============================================================
-- Slack connections from the HTS Hero Slack app
--
-- "Add to Slack" (app/api/slack/install → app/api/slack/callback) saves the channel's incoming
-- webhook in tracker_alert_settings.slack_webhook, as a pasted one always was, plus the channel
-- and workspace it posts to, so the Alerts tab can say where alerts go. Both are null for a pasted
-- webhook.
--
-- Apply by pasting into the SQL editor.
-- ============================================================

ALTER TABLE tracker_alert_settings
  ADD COLUMN IF NOT EXISTS slack_channel text,
  ADD COLUMN IF NOT EXISTS slack_team text;
