-- ============================================================
-- Tariff audit requests
-- From the "Have us do it" form on /tariff-audit, through /api/audit-request (service role).
-- No public access: row-level security is on with no policies, so only the service role reads
-- or writes.
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text NOT NULL,
  company       text NOT NULL,
  import_value  text NOT NULL,         -- a range, e.g. "$1M to $10M"
  topics        text[] NOT NULL DEFAULT '{}',
  notes         text,
  page_url      text,
  user_agent    text,
  status        text NOT NULL DEFAULT 'new'
                CHECK (status IN ('new', 'contacted', 'in_progress', 'done', 'declined')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_requests_created ON audit_requests (created_at DESC);

ALTER TABLE audit_requests ENABLE ROW LEVEL SECURITY;
