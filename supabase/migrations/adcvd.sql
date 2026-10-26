-- ============================================================
-- AD/CVD cases (/adcvd admin page; flags on imports)
--
-- One row per Commerce antidumping (A-) or countervailing (C-) case, built
-- from the Federal Register notices in tariff_source_items: the case's
-- country (from its number), status, milestones, and the HTS codes its
-- scope lists. Every notice about a case is an event. Months of notices
-- are processed from /adcvd (or `npm run adcvd:month`), new ones by
-- /api/cron/tariff-updates. Every Claude call (this and the tariff updates
-- pipeline) is logged in ai_usage.
--
-- Apply after tariff_updates.sql, by pasting into the SQL editor. Cases and
-- events are public (they back the import flags); months, settings and
-- usage are service role only.
-- ============================================================

CREATE TABLE IF NOT EXISTS adcvd_cases (
  case_number        text PRIMARY KEY,               -- A-533-938
  kind               text NOT NULL CHECK (kind IN ('AD', 'CVD')),
  commerce_country   text NOT NULL,                  -- 533
  country            text,                           -- ISO alpha-2; null until known
  product            text,
  status             text NOT NULL DEFAULT 'unknown'
                     CHECK (status IN ('investigation', 'order', 'suspended', 'revoked', 'terminated', 'unknown')),
  initiated_on       date,
  order_on           date,
  last_continued_on  date,
  ended_on           date,
  itc_numbers        text[] NOT NULL DEFAULT '{}',   -- 731-TA-1720
  siblings           text[] NOT NULL DEFAULT '{}',   -- cases named in the same order or sunset notice
  third_countries    text[] NOT NULL DEFAULT '{}',   -- ISO alpha-2, from circumvention rulings
  hts_main           text[] NOT NULL DEFAULT '{}',   -- digits: the codes the scope says it's classified under
  hts_also           text[] NOT NULL DEFAULT '{}',   -- "may also enter under"
  hts_excluded       text[] NOT NULL DEFAULT '{}',   -- named only for excluded products
  hts_outdated       text[] NOT NULL DEFAULT '{}',   -- scope codes no longer in the current HTS (renumbered since)
  scope_text         text,
  scope_doc          text,                           -- FR document number the scope came from
  scope_published_on date,
  scope_method       text CHECK (scope_method IN ('regex', 'sonnet', 'sibling', 'opus', 'none')),
  scope_checked_at   timestamptz,
  rates              jsonb,                          -- {low, high, all_others, basis, as_of, doc}
  problems           text[] NOT NULL DEFAULT '{}',   -- what the automatic checks found
  first_seen_on      date,
  last_activity_on   date,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_adcvd_cases_country ON adcvd_cases (country);
CREATE INDEX IF NOT EXISTS idx_adcvd_cases_hts_main ON adcvd_cases USING gin (hts_main);
CREATE INDEX IF NOT EXISTS idx_adcvd_cases_hts_also ON adcvd_cases USING gin (hts_also);

ALTER TABLE adcvd_cases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AD/CVD cases are public" ON adcvd_cases;
CREATE POLICY "AD/CVD cases are public" ON adcvd_cases FOR SELECT USING (true);

-- One row per notice and case. ITC notices whose investigation numbers no
-- case carries yet (a new petition) are kept with case_number null, with the
-- countries and codes the notice names, until a case links them.
CREATE TABLE IF NOT EXISTS adcvd_events (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_number      text REFERENCES adcvd_cases (case_number) ON DELETE CASCADE,
  item_id          uuid REFERENCES tariff_source_items (id) ON DELETE SET NULL,
  document_number  text NOT NULL,
  published_on     date NOT NULL,
  agency           text NOT NULL CHECK (agency IN ('commerce', 'itc')),
  event            text NOT NULL,                  -- libs/adcvd/types.ts EVENTS
  title            text NOT NULL,
  url              text NOT NULL,
  summary          text,                           -- one plain-English sentence
  rates            jsonb,
  significant      boolean NOT NULL DEFAULT false,
  itc_numbers      text[] NOT NULL DEFAULT '{}',
  countries        text[] NOT NULL DEFAULT '{}',   -- unlinked ITC notices: the countries named
  hts_codes        text[] NOT NULL DEFAULT '{}',   -- unlinked ITC notices: the codes named
  product          text,
  update_id        uuid REFERENCES tariff_updates (id) ON DELETE SET NULL, -- significant events: their /tariff-updates entry
  summarized_at    timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_adcvd_events_doc_case ON adcvd_events (document_number, coalesce(case_number, ''));
CREATE INDEX IF NOT EXISTS idx_adcvd_events_case ON adcvd_events (case_number, published_on DESC);
CREATE INDEX IF NOT EXISTS idx_adcvd_events_unlinked ON adcvd_events (published_on DESC) WHERE case_number IS NULL;

ALTER TABLE adcvd_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AD/CVD events are public" ON adcvd_events;
CREATE POLICY "AD/CVD events are public" ON adcvd_events FOR SELECT USING (true);

-- When /adcvd read each Commerce and ITC notice (whether or not it was about a case)
ALTER TABLE tariff_source_items ADD COLUMN IF NOT EXISTS adcvd_at timestamptz;

-- One row per month of Federal Register notices processed
CREATE TABLE IF NOT EXISTS adcvd_months (
  month         text PRIMARY KEY,                  -- 2026-09
  status        text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'done', 'paused', 'error')),
  notices       integer NOT NULL DEFAULT 0,
  linked        integer NOT NULL DEFAULT 0,
  new_cases     integer NOT NULL DEFAULT 0,
  scopes_found  integer NOT NULL DEFAULT 0,
  cost_usd      numeric NOT NULL DEFAULT 0,
  step          text,                              -- where a running month is
  started_at    timestamptz,
  finished_at   timestamptz,
  error         text
);

ALTER TABLE adcvd_months ENABLE ROW LEVEL SECURITY;

-- Settings for the /adcvd page (one row). The budget is per month of notices:
-- once Claude has cost this much for one month, its AI steps pause.
CREATE TABLE IF NOT EXISTS adcvd_settings (
  id                  boolean PRIMARY KEY DEFAULT true CHECK (id),
  monthly_budget_usd  numeric NOT NULL DEFAULT 10,
  updated_at          timestamptz NOT NULL DEFAULT now()
);
INSERT INTO adcvd_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;

ALTER TABLE adcvd_settings ENABLE ROW LEVEL SECURITY;

-- Every Claude call the pipelines make, with what it cost
CREATE TABLE IF NOT EXISTS ai_usage (
  id                           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at                           timestamptz NOT NULL DEFAULT now(),
  month                        text NOT NULL,      -- the calendar month of the call: 2026-10
  for_month                    text,               -- adcvd: the month of notices being processed (its budget)
  pipeline                     text NOT NULL,      -- adcvd, tariff_updates
  step                         text NOT NULL,      -- scope, summary, link, sort, read, group, scope_read…
  model                        text NOT NULL,
  input_tokens                 integer NOT NULL DEFAULT 0,
  output_tokens                integer NOT NULL DEFAULT 0,
  cache_read_input_tokens      integer NOT NULL DEFAULT 0,
  cache_creation_input_tokens  integer NOT NULL DEFAULT 0,
  cost_usd                     numeric NOT NULL DEFAULT 0,
  ref                          text                -- the case, document or month it was for
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_month ON ai_usage (month, pipeline);
CREATE INDEX IF NOT EXISTS idx_ai_usage_for_month ON ai_usage (for_month) WHERE for_month IS NOT NULL;

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Added 2026-10-18 (safe to run again)
-- ============================================================

-- Scope codes the HTS has renumbered since, mapped to the current codes that replaced them
-- (tariffs/hts-concordance/successors.json): {"9403200018": ["9403200011", "9403200016"]}
ALTER TABLE adcvd_cases ADD COLUMN IF NOT EXISTS hts_successors jsonb NOT NULL DEFAULT '{}';

-- The cron's last run, for /adcvd and the "cron stopped" email
ALTER TABLE adcvd_settings
  ADD COLUMN IF NOT EXISTS last_cron_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_cron jsonb,
  ADD COLUMN IF NOT EXISTS stale_alerted_at timestamptz;

-- CBP's AD/CVD messages (cash deposit and liquidation instructions) as events too
ALTER TABLE adcvd_events DROP CONSTRAINT IF EXISTS adcvd_events_agency_check;
ALTER TABLE adcvd_events ADD CONSTRAINT adcvd_events_agency_check CHECK (agency IN ('commerce', 'itc', 'cbp'));

-- Each producer or exporter's latest rate on a case, and producers excluded from an order
CREATE TABLE IF NOT EXISTS adcvd_company_rates (
  case_number  text NOT NULL REFERENCES adcvd_cases (case_number) ON DELETE CASCADE,
  company      text NOT NULL,
  rate         numeric,                -- percent; null when the notice names the company without one
  basis        text,                   -- dumping_margin, subsidy_rate, cash_deposit
  excluded     boolean NOT NULL DEFAULT false, -- excluded from the order (its goods aren't covered)
  as_of        date NOT NULL,
  doc          text NOT NULL,          -- FR document number
  PRIMARY KEY (case_number, company)
);

ALTER TABLE adcvd_company_rates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "AD/CVD company rates are public" ON adcvd_company_rates;
CREATE POLICY "AD/CVD company rates are public" ON adcvd_company_rates FOR SELECT USING (true);

-- ============================================================
-- Added 2026-10-23 (safe to run again)
-- ============================================================

-- Scope codes from more than one source. fr_* are the codes the Federal Register scope gives (what
-- hts_* held until now); ita_* are ITA's public case page (trade.gov/adcvd?adcvdcase=…): its HTS
-- list and its current scope text, sorted like a Federal Register scope. The check step merges
-- them into hts_* (what imports match on) and records where each code came from in hts_sources:
-- {"2903441010": ["ita-scope"], "2903491010": ["fr:2022-04505"]}
ALTER TABLE adcvd_cases
  ADD COLUMN IF NOT EXISTS fr_main        text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fr_also        text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS fr_excluded    text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ita_found      boolean,          -- null until fetched; false: no case page
  ADD COLUMN IF NOT EXISTS ita_hts        text[] NOT NULL DEFAULT '{}', -- digits, as the page lists them
  ADD COLUMN IF NOT EXISTS ita_scope      text,
  ADD COLUMN IF NOT EXISTS ita_main       text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ita_also       text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ita_excluded   text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ita_method     text CHECK (ita_method IN ('regex', 'sonnet')),
  ADD COLUMN IF NOT EXISTS ita_fetched_at timestamptz,
  ADD COLUMN IF NOT EXISTS hts_sources    jsonb NOT NULL DEFAULT '{}';

-- Until now hts_* held the Federal Register codes: keep them as the fr_* source (once)
UPDATE adcvd_cases
SET fr_main = hts_main, fr_also = hts_also, fr_excluded = hts_excluded
WHERE fr_main = '{}' AND fr_also = '{}' AND fr_excluded = '{}'
  AND (hts_main <> '{}' OR hts_also <> '{}' OR hts_excluded <> '{}');

CREATE INDEX IF NOT EXISTS idx_adcvd_cases_ita_fetched ON adcvd_cases (ita_fetched_at NULLS FIRST);

-- 2026-10-26: when the Federal Register last blocked us, its API and its website ({"api": ts,
-- "site": ts}), so the next run skips that part until then (libs/adcvd/fr.ts)
ALTER TABLE adcvd_settings ADD COLUMN IF NOT EXISTS fr_blocked jsonb NOT NULL DEFAULT '{}';
