-- ============================================================
-- Lifecycle (onboarding) emails: which one each account has been queued
--
-- The daily onboarding job (/api/cron/lifecycle) picks, per account, the email its stage calls
-- for and queues it in the outbox (one batch a day, reviewed before sending). A row here means
-- that email was queued for that account, so it's never queued twice, even when the batch is
-- skipped or the recipient taken out in review. One-off emails (Meet the Tariff Tracker) are
-- recorded the same way.
--
-- Apply by pasting into the SQL editor. Row level security is on with no policies: service role
-- only.
-- ============================================================

CREATE TABLE IF NOT EXISTS lifecycle_emails (
  user_id    uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  email_key  text NOT NULL,          -- libs/email/lifecycle.ts, e.g. no_imports_1, meet_tracker
  batch_id   uuid REFERENCES email_batches (id) ON DELETE SET NULL,
  queued_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, email_key)
);

CREATE INDEX IF NOT EXISTS idx_lifecycle_emails_queued ON lifecycle_emails (user_id, queued_at DESC);

ALTER TABLE lifecycle_emails ENABLE ROW LEVEL SECURITY;
