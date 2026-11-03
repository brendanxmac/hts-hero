-- ============================================================
-- Demo requests: the homepage's "Get a Demo" form (DemoRequestDialog), sent before the visitor
-- books a call on Calendly. Brendan gets each one by email; this keeps them all.
--
-- Written by the server only (/api/demo-request): row level security is on, with no policies, so
-- only the service role reads or writes it.
--
-- Apply by pasting into the Supabase SQL editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS demo_requests (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text NOT NULL,
  email            text NOT NULL,
  company          text NOT NULL,
  company_type     text,          -- COMPANY_TYPES ids (libs/signup-onboarding.ts)
  role             text,          -- ROLES ids
  website          text,
  products         text,          -- DEMO_PRODUCT_RANGES ids (libs/demo-request.ts)
  page_url         text,
  first_touch      jsonb,         -- where the visitor first came from (libs/signup-onboarding.ts)
  user_agent       text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demo_requests_created_at ON demo_requests (created_at);

ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;
