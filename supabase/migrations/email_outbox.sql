-- ============================================================
-- Email outbox (/email-outbox)
--
-- Every email, Slack and Teams message that isn't transactional (confirmations, sign-in links,
-- unsubscribe confirmations) waits here until the admin has looked at it and approved it.
-- Producers (tariff news, digests, impact alerts, lifecycle emails) write a batch and its
-- messages; the admin reviews each rendered message, then approves or skips the batch; the
-- sender (/api/cron/email-outbox) sends approved messages and records the result.
-- Transactional messages are written straight in as sent (no batch), so every message has a
-- record.
--
-- Apply by pasting into the SQL editor. Row level security is on with no policies: only the
-- service role (producers, the sender, and the admin routes after the admin check) reads or
-- writes these tables.
-- ============================================================

CREATE TABLE IF NOT EXISTS email_batches (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind         text NOT NULL,                -- tariff_news, tariff_digest, tariff_impact, lifecycle, test
  title        text NOT NULL,                -- what it's about, in the outbox list
  ref          jsonb NOT NULL DEFAULT '{}',  -- what produced it, e.g. {"update_id": …, "stage": …}
  dedupe_key   text UNIQUE,                  -- a producer never makes the same batch twice
  note         text,                         -- the admin's line at the top of each message
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'approved', 'sending', 'sent', 'skipped')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  approved_at  timestamptz,
  approved_by  text,
  finished_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_email_batches_status ON email_batches (status, created_at DESC);

ALTER TABLE email_batches ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS email_messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id       uuid REFERENCES email_batches (id) ON DELETE CASCADE,  -- null: transactional
  channel        text NOT NULL CHECK (channel IN ('email', 'slack', 'teams')),
  recipient      text NOT NULL,              -- an email address or a webhook URL
  user_id        uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  subscriber_id  uuid,
  template       text NOT NULL,              -- emails/registry.ts
  props          jsonb NOT NULL,             -- rendered at review and at send time
  subject        text,
  status         text NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'removed', 'sending', 'sent', 'failed')),
  error          text,
  provider_id    text,                       -- Resend's email id
  created_at     timestamptz NOT NULL DEFAULT now(),
  sent_at        timestamptz,
  UNIQUE (batch_id, channel, recipient)
);

CREATE INDEX IF NOT EXISTS idx_email_messages_batch ON email_messages (batch_id, status);
CREATE INDEX IF NOT EXISTS idx_email_messages_recipient ON email_messages (recipient, created_at DESC);

ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;

-- 2026-10-27: the admin's subject for every email in the batch (null: each template's own)
ALTER TABLE email_batches ADD COLUMN IF NOT EXISTS subject text;
