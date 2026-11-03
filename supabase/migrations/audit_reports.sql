-- ============================================================
-- Audit reports: what users send from the entry audit (components/tariff-tracker/entries/check)
-- for the admin to look at, on /audit-reports and in the /admin Needs You queue:
--   looks_wrong   "This looks wrong" on an audit's review, with their note and the whole audit
--   missing_case  an AD/CVD case number we don't have
--   case_link     a case they added by hand that our matching didn't link to their import
-- Brendan is emailed each one as it comes in.
--
-- Written by the server only (/api/tracker/audit-reports): row level security is on, with no
-- policies, so only the service role reads or writes it.
--
-- Apply by pasting into the Supabase SQL editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_reports (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  user_email   text,
  kind         text NOT NULL CHECK (kind IN ('looks_wrong', 'missing_case', 'case_link')),
  -- The saved entry it's about, when there is one
  entry_id     uuid REFERENCES tracker_entries (id) ON DELETE SET NULL,
  hts_code     text,
  country      text,
  case_number  text,
  note         text,
  -- Everything the audit showed: the entry, what applied, paid and owed, the AD/CVD cases
  details      jsonb NOT NULL DEFAULT '{}'::jsonb,
  status       text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz
);

CREATE INDEX IF NOT EXISTS audit_reports_open ON audit_reports (status, created_at DESC);

ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;
