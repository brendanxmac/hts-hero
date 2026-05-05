-- ============================================================
-- Webinars table
-- ============================================================
CREATE TABLE IF NOT EXISTS webinars (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  title         text NOT NULL,
  description   text NOT NULL,
  graphic_url   text,                -- URL to the webinar cover/graphic image
  scheduled_at  timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  presenter_name text NOT NULL,
  presenter_title text,              -- e.g. "Founder of HTS Hero"
  presenter_avatar_url text,
  join_link     text,                -- Zoom / Google Meet / etc.
  promo_video_url text,              -- YouTube embed URL (optional)
  status        text NOT NULL DEFAULT 'upcoming'
                CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  max_registrants integer,           -- NULL = unlimited
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_webinars_status ON webinars (status);
CREATE INDEX idx_webinars_scheduled_at ON webinars (scheduled_at);

-- ============================================================
-- Webinar registrations table
-- ============================================================
CREATE TABLE IF NOT EXISTS webinar_registrations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id    uuid NOT NULL REFERENCES webinars(id) ON DELETE CASCADE,
  email         text NOT NULL,
  user_id       uuid,                -- NULL when registrant is not logged in
  registered_at timestamptz NOT NULL DEFAULT now(),
  ip_address    text,
  user_agent    text,
  referrer      text,
  page_url      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,

  UNIQUE (webinar_id, email)         -- prevent duplicate registrations
);

CREATE INDEX idx_webinar_registrations_webinar ON webinar_registrations (webinar_id);
CREATE INDEX idx_webinar_registrations_email ON webinar_registrations (email);

-- ============================================================
-- Auto-update updated_at on webinars
-- ============================================================
CREATE OR REPLACE FUNCTION update_webinars_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_webinars_updated_at
  BEFORE UPDATE ON webinars
  FOR EACH ROW
  EXECUTE FUNCTION update_webinars_updated_at();

-- ============================================================
-- Row-Level Security
-- ============================================================
ALTER TABLE webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Everyone can read published webinars
CREATE POLICY "Public read webinars"
  ON webinars FOR SELECT
  USING (true);

-- Only service role can insert/update/delete webinars (via admin client)
CREATE POLICY "Service role manage webinars"
  ON webinars FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Service role can manage all registrations
CREATE POLICY "Service role manage registrations"
  ON webinar_registrations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Users can read their own registrations
CREATE POLICY "Users read own registrations"
  ON webinar_registrations FOR SELECT
  USING (auth.uid() = user_id);
