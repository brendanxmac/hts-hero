-- ============================================================
-- Tracker onboarding: where an account came from, its first Tracker visit, why it skipped adding
-- imports, and when its 14-day trial started
--
-- The trial starts with the account's first real imports (PRICING.md, decided 2026-10-20), not at
-- sign-up. The browser saves the catalog straight to tracker_catalogs (catalogSync.ts), so a
-- trigger there sets trial_started_at the first time the catalog holds an import that isn't from
-- the example list (items marked "example": true). It's set once and never moves.
--
-- Written by the server only (/api/tracker/onboarding, the auth callback, the trigger): row level
-- security is on, and the owner may only read their row.
--
-- Apply by pasting into the SQL editor, on the deploy day (the backfill gives accounts that already
-- have imports the fresh 14 days of REVERSE_TRIAL.freshStartOn).
-- ============================================================

CREATE TABLE IF NOT EXISTS tracker_onboarding (
  user_id           uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  signup_source     text,                     -- generic, calculator, tracker, classify (the auth callback)
  first_visit_at    timestamptz,              -- the first time the Tracker opened, signed in
  skipped_at        timestamptz,              -- the latest "Skip for now" on the import takeover
  skip_reason       text,                     -- SKIP_REASONS ids (libs/tariff-tracker/onboarding.ts) or remind_me; null if none given
  skip_note         text,
  trial_started_at  timestamptz,              -- the first real imports (the trigger below)
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tracker_onboarding_trial_started_at ON tracker_onboarding (trial_started_at);
CREATE INDEX IF NOT EXISTS tracker_onboarding_first_visit_at ON tracker_onboarding (first_visit_at);

ALTER TABLE tracker_onboarding ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tracker_onboarding_select_own" ON tracker_onboarding;
CREATE POLICY "tracker_onboarding_select_own" ON tracker_onboarding FOR SELECT USING (auth.uid() = user_id);

-- Whether a stored catalog ({version: 1, items: [...]}) holds one of the user's own imports
CREATE OR REPLACE FUNCTION tracker_catalog_has_real_items(items jsonb)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(CASE WHEN jsonb_typeof(items -> 'items') = 'array' THEN items -> 'items' ELSE '[]'::jsonb END) AS item
    WHERE COALESCE(item ->> 'example', 'false') <> 'true'
  );
$$;

-- Starts the trial on the first save with real imports
CREATE OR REPLACE FUNCTION tracker_start_trial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF tracker_catalog_has_real_items(NEW.items) THEN
    INSERT INTO tracker_onboarding (user_id, trial_started_at)
    VALUES (NEW.user_id, now())
    ON CONFLICT (user_id) DO UPDATE
      SET trial_started_at = now(), updated_at = now()
      WHERE tracker_onboarding.trial_started_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tracker_catalogs_start_trial ON tracker_catalogs;
CREATE TRIGGER tracker_catalogs_start_trial
  AFTER INSERT OR UPDATE OF items ON tracker_catalogs
  FOR EACH ROW EXECUTE FUNCTION tracker_start_trial();

-- ── Backfill ──
-- Accounts that already have imports: their trial started with the fresh start (keep in step with
-- REVERSE_TRIAL.freshStartOn), or at sign-up if later. Accounts without start on their first import.
INSERT INTO tracker_onboarding (user_id, trial_started_at, first_visit_at)
SELECT c.user_id, GREATEST(u.created_at, timestamptz '2026-10-21 00:00:00+00'), c.updated_at
FROM tracker_catalogs c
JOIN auth.users u ON u.id = c.user_id
WHERE tracker_catalog_has_real_items(c.items)
ON CONFLICT (user_id) DO UPDATE
  SET trial_started_at = COALESCE(tracker_onboarding.trial_started_at, EXCLUDED.trial_started_at),
      first_visit_at = COALESCE(tracker_onboarding.first_visit_at, EXCLUDED.first_visit_at);
