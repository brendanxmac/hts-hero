-- Alert emails per plan (PRICING.md, decided 2026-10-31): Starter 1, Growth 3, Pro 6, Scale 20.
-- The first address stays in tracker_alert_settings.email; these are the others. The plan's limit
-- is enforced when alerts are sent (libs/tariff-updates/alerts.ts).
ALTER TABLE tracker_alert_settings
  ADD COLUMN IF NOT EXISTS extra_emails text[] NOT NULL DEFAULT '{}';
