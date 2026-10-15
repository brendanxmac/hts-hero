-- ============================================================
-- Email subscribers: tariff news subscriptions and every reader's email choices
--
-- One row per email address, with or without an account. Visitors subscribe to tariff news on
-- /tariff-updates and confirm by email (double opt-in); accounts get a row at sign-up (weekly
-- digest on). The row's token is the key in every email's "manage" and "unsubscribe" links, so
-- nobody needs to sign in to change what they get. Lifecycle (onboarding) emails read
-- `lifecycle` from the same row.
--
-- Apply by pasting into the SQL editor. Row level security is on with no policies: only the
-- service role (the subscribe/manage routes, producers, the sign-up webhook) reads or writes it.
-- ============================================================

CREATE TABLE IF NOT EXISTS email_subscribers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email             text NOT NULL,
  user_id           uuid UNIQUE REFERENCES auth.users (id) ON DELETE SET NULL,
  token             text NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  -- Tariff news: when, and which
  news_frequency    text NOT NULL DEFAULT 'weekly' CHECK (news_frequency IN ('instant', 'weekly', 'off')),
  news_scope        text NOT NULL DEFAULT 'actions' CHECK (news_scope IN ('actions', 'all_steps')),
  news_authorities  text[] NOT NULL DEFAULT '{}',   -- empty: every law
  news_countries    text[] NOT NULL DEFAULT '{}',   -- empty: every country
  -- Onboarding and product emails for accounts
  lifecycle         boolean NOT NULL DEFAULT true,
  confirmed_at      timestamptz,                    -- null until the confirmation link is used
  unsubscribed_at   timestamptz,                    -- one-click unsubscribe: everything stops
  source            text,                           -- where they signed up: tariff-updates, update-page, account
  confirm_sent_at   timestamptz,                    -- throttles confirmation emails
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscribers_email ON email_subscribers (lower(email));
CREATE INDEX IF NOT EXISTS idx_email_subscribers_news
  ON email_subscribers (news_frequency) WHERE confirmed_at IS NOT NULL AND unsubscribed_at IS NULL;

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
