-- ============================================================
-- Tracker snapshots: each account's numbers, worked out on the server
--
-- Once a day (/api/cron/tracker-snapshots, before the onboarding batch) the duty engine runs over
-- every catalog, the same way the Tracker does in the browser: duty per shipment, the rate changes
-- that hit the imports in the last 12 months, potential savings (unlocked and locked) and the
-- free checks used. Onboarding emails quote these numbers. Phase D's matching will read the same
-- products.
--
-- Apply by pasting into the SQL editor. Row level security is on with no policies: service role
-- only.
-- ============================================================

CREATE TABLE IF NOT EXISTS tracker_snapshots (
  user_id                 uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  computed_at             timestamptz NOT NULL,
  catalog_updated_at      timestamptz,              -- the catalog these numbers are from
  first_products_at       timestamptz,              -- the first run that found imports (onboarding)
  plan                    text NOT NULL,            -- trial or paid
  products                integer NOT NULL,
  countries               integer NOT NULL,
  values_default          integer NOT NULL,         -- imports still on the $10,000 default value
  duty_per_shipment       numeric NOT NULL,         -- US$, one shipment of each import
  average_rate            numeric NOT NULL,         -- %, duty over value across the catalog
  changes_12m             integer NOT NULL,
  products_hit_12m        integer NOT NULL,
  biggest_change          jsonb,                    -- {code, country, description, fromPct, toPct, date}
  top_import              jsonb,                    -- the highest-rate import {key, code, country, description, ratePct, dutyUsd}
  savings_usd             numeric NOT NULL,         -- potential, per shipment, on unlocked imports
  savings_products        integer NOT NULL,
  locked_savings_usd      numeric NOT NULL,         -- potential on imports not checked yet
  locked_savings_products integer NOT NULL,
  top_saving              jsonb,                    -- the biggest {key, code, country, description, usd, title, kind, locked}
  savings_checks_used     integer NOT NULL,
  savings_checks_left     integer,                  -- null: no limit (paid)
  audit_checks_used       integer NOT NULL,
  audit_checks_left       integer                   -- null: no limit (paid)
);

ALTER TABLE tracker_snapshots ENABLE ROW LEVEL SECURITY;
