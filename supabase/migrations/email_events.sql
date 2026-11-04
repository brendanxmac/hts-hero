-- ============================================================
-- Email events (Resend webhook → /api/webhook/resend)
--
-- Every delivery, open, click, bounce and spam complaint Resend reports, plus the first of each
-- stamped on its outbox message, so /email-outbox can show how a batch did. Opens and clicks only
-- arrive for sending domains with tracking turned on in Resend.
--
-- Apply by pasting into the SQL editor. Row level security is on with no policies: only the
-- service role (the webhook and the admin routes) reads or writes it.
-- ============================================================

CREATE TABLE IF NOT EXISTS email_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id  text UNIQUE,                 -- Resend's webhook delivery (svix-id): retries count once
  provider_id  text NOT NULL,               -- Resend's email id (email_messages.provider_id)
  type         text NOT NULL,               -- email.delivered, email.opened, email.clicked, email.bounced, email.complained
  recipient    text,
  detail       jsonb NOT NULL DEFAULT '{}', -- the clicked link, or the bounce's type and message
  occurred_at  timestamptz NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_events_provider ON email_events (provider_id, type);

ALTER TABLE email_events ENABLE ROW LEVEL SECURITY;

-- The first of each on the message itself
ALTER TABLE email_messages ADD COLUMN IF NOT EXISTS delivered_at  timestamptz;
ALTER TABLE email_messages ADD COLUMN IF NOT EXISTS opened_at     timestamptz;
ALTER TABLE email_messages ADD COLUMN IF NOT EXISTS clicked_at    timestamptz;
ALTER TABLE email_messages ADD COLUMN IF NOT EXISTS bounced_at    timestamptz;
ALTER TABLE email_messages ADD COLUMN IF NOT EXISTS complained_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_messages_provider ON email_messages (provider_id);
