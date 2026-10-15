-- ============================================================
-- Alert preferences and the impact alert cut-off
--
-- tracker_alert_settings.alert_kinds: which kinds of tariff update alert the account (null = the
-- defaults in components/tariff-tracker/alerts/alertPrefs.ts). Alerts are on with no row at all;
-- turning every channel off turns them off.
--
-- tariff_updates.impact_first_approved_at: when the update's impact check was first approved.
-- Imports added after it aren't alerted about that update (they see it in the Tracker instead).
--
-- Apply by pasting into the SQL editor.
-- ============================================================

ALTER TABLE tracker_alert_settings
  ADD COLUMN IF NOT EXISTS alert_kinds text[];

ALTER TABLE tariff_updates
  ADD COLUMN IF NOT EXISTS impact_first_approved_at timestamptz;

UPDATE tariff_updates SET impact_first_approved_at = impact_approved_at
  WHERE impact_first_approved_at IS NULL AND impact_approved_at IS NOT NULL;
