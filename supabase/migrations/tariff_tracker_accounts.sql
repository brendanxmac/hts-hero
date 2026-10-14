-- ============================================================
-- Tariff Tracker accounts
-- The saved catalog of each signed-in user, the checks it has spent from the usage-based trial,
-- its logged entries and where its alerts go. See PRICING.md ("Usage-based trial").
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

-- The 14-day trial is gone (2026-10-13): every account is on the usage-based trial instead
DROP TABLE IF EXISTS tracker_trials;

-- The usage-based trial's spent checks: one row per import whose savings were checked
-- (kind 'savings', ref = product key) and per entry audited (kind 'audit', ref = entry id).
-- Written only by /api/tracker/checks (service role), which enforces the allowance, so an
-- account can't hand itself more. Users may read their own.
CREATE TABLE IF NOT EXISTS tracker_checks (
  user_id     uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  kind        text NOT NULL CHECK (kind IN ('savings', 'audit')),
  ref         text NOT NULL CHECK (char_length(ref) BETWEEN 1 AND 80),
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind, ref)
);

ALTER TABLE tracker_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own checks" ON tracker_checks;
CREATE POLICY "Users read their own checks" ON tracker_checks
  FOR SELECT USING (auth.uid() = user_id);

-- Entries logged in the Entry audit: one product line of a past entry, with what was paid. The
-- duty owed is worked out in the browser from the tariff data in force on the entry date.
CREATE TABLE IF NOT EXISTS tracker_entries (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- HTS code (digits) and country of origin (ISO code)
  hts_code       text NOT NULL,
  country        text NOT NULL,
  entry_date     date NOT NULL,
  entry_number   text,
  customs_value  numeric NOT NULL CHECK (customs_value > 0),
  quantity       numeric CHECK (quantity IS NULL OR quantity > 0),
  duty_paid      numeric NOT NULL CHECK (duty_paid >= 0),
  -- The trade preference (SPI) claimed on the entry, if any
  claimed_preference text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracker_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read their own entries" ON tracker_entries;
CREATE POLICY "Users read their own entries" ON tracker_entries
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users create their own entries" ON tracker_entries;
CREATE POLICY "Users create their own entries" ON tracker_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete their own entries" ON tracker_entries;
CREATE POLICY "Users delete their own entries" ON tracker_entries
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tracker_entries_user ON tracker_entries (user_id, entry_date DESC);

-- Savings options a user is pursuing on a catalog product (a trade program to claim, an
-- exemption to confirm, a country of origin to move to), with where each stands. Found →
-- Researching → In progress → Secured (applied to the catalog) → or Not eligible. The figures are
-- kept from when it was found, for tallies of savings found and secured.
CREATE TABLE IF NOT EXISTS tracker_opportunities (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- The catalog product (HTS code digits + country code)
  product_key    text NOT NULL,
  kind           text NOT NULL CHECK (kind IN ('program', 'exemption', 'origin')),
  -- What it is: an SPI symbol, a question id, or a country code (with its agreement: "VN" / "MX:S")
  option_ref     text NOT NULL,
  title          text NOT NULL,
  status         text NOT NULL DEFAULT 'found'
                   CHECK (status IN ('found', 'researching', 'in_progress', 'secured', 'not_eligible')),
  -- Rates in percent and less duty per shipment in USD, when it was found (or last re-priced)
  rate_before    numeric NOT NULL,
  rate_after     numeric NOT NULL,
  usd_per_shipment numeric NOT NULL,
  note           text,
  secured_at     timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_key, kind, option_ref)
);

-- Every change to an opportunity, for the record: the status it moved to, a note, and what was
-- applied to the catalog when it was secured (the product's setup before and after)
CREATE TABLE IF NOT EXISTS tracker_opportunity_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id  uuid NOT NULL REFERENCES tracker_opportunities (id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  from_status     text,
  to_status       text NOT NULL,
  note            text,
  applied         jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tracker_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracker_opportunity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage their own opportunities" ON tracker_opportunities;
CREATE POLICY "Users manage their own opportunities" ON tracker_opportunities
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users read their own opportunity events" ON tracker_opportunity_events;
CREATE POLICY "Users read their own opportunity events" ON tracker_opportunity_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users log their own opportunity events" ON tracker_opportunity_events;
CREATE POLICY "Users log their own opportunity events" ON tracker_opportunity_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tracker_opportunities_user ON tracker_opportunities (user_id, product_key);
CREATE INDEX IF NOT EXISTS idx_tracker_opportunity_events ON tracker_opportunity_events (opportunity_id, created_at);

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
