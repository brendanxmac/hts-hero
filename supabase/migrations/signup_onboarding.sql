-- ============================================================
-- Sign-up onboarding: the three questions a new account answers after signing up from the homepage
-- (/onboarding), and where the visitor first came from
--
-- One row per account. Each answer is saved as it's picked, so a row with started_at and no
-- completed_at shows where someone stopped. first_touch is what the browser saw on its first
-- visit to the site (referrer, landing page, UTM tags; libs/signup-onboarding.ts).
--
-- Written by the server only (/api/signup-onboarding): row level security is on, and the owner may
-- only read their row.
--
-- Apply by pasting into the Supabase SQL editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS signup_onboarding (
  user_id          uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  company_type     text,                     -- COMPANY_TYPES ids (libs/signup-onboarding.ts)
  company_website  text,
  website_skipped  boolean NOT NULL DEFAULT false,
  role             text,                     -- ROLES ids
  entry_point      text,                     -- the homepage section whose button they came from (HOME_SECTIONS), or null
  first_touch      jsonb,                    -- {referrer, referring_domain, landing_path, utm_source, utm_medium, utm_campaign, utm_term, utm_content, at}
  started_at       timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- If the table was made before entry_point was added
ALTER TABLE signup_onboarding ADD COLUMN IF NOT EXISTS entry_point text;

CREATE INDEX IF NOT EXISTS signup_onboarding_completed_at ON signup_onboarding (completed_at);
CREATE INDEX IF NOT EXISTS signup_onboarding_company_type ON signup_onboarding (company_type);

ALTER TABLE signup_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "signup_onboarding_select_own" ON signup_onboarding;
CREATE POLICY "signup_onboarding_select_own" ON signup_onboarding FOR SELECT USING (auth.uid() = user_id);
