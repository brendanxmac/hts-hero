"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";

// Where a signed-in user's tariff alerts go (tracker_alert_settings), shared by the Alerts
// section, where they're edited, and the Overview's next step, which asks for them

export interface AlertSettings {
  emailEnabled: boolean;
  email: string;
  slackWebhook: string;
  teamsWebhook: string;
}

interface AlertSettingsValue {
  loading: boolean;
  // Saved at least once, with somewhere to send alerts
  configured: boolean;
  settings: AlertSettings;
  save: (next: AlertSettings) => Promise<string | null>;
}

const AlertSettingsContext = createContext<AlertSettingsValue | null>(null);

export const useAlertSettings = () => {
  const value = useContext(AlertSettingsContext);
  if (!value) throw new Error("useAlertSettings must be used inside AlertSettingsProvider");
  return value;
};

const EMPTY: AlertSettings = { emailEnabled: true, email: "", slackWebhook: "", teamsWebhook: "" };

export const SLACK_PREFIX = "https://hooks.slack.com/";

// A message to show, or null when the settings can be saved
export const validateAlertSettings = (s: AlertSettings) => {
  if (s.emailEnabled && !/^\S+@\S+\.\S+$/.test(s.email)) return "Enter an email address for alerts.";
  if (s.slackWebhook && !s.slackWebhook.startsWith(SLACK_PREFIX)) return `A Slack webhook starts with ${SLACK_PREFIX}`;
  if (s.teamsWebhook && !s.teamsWebhook.startsWith("https://")) return "A Teams webhook starts with https://";
  if (!s.emailEnabled && !s.slackWebhook && !s.teamsWebhook) return "Choose at least one place for alerts to go.";
  return null;
};

export const AlertSettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<AlertSettings | null>(null);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setSaved(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    createSupabaseClient()
      .from("tracker_alert_settings")
      .select("email_enabled, email, slack_webhook, teams_webhook")
      .eq("user_id", userId)
      .maybeSingle<{ email_enabled: boolean; email: string | null; slack_webhook: string | null; teams_webhook: string | null }>()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error("Error loading alert settings:", error);
        setSaved(
          data
            ? { emailEnabled: data.email_enabled, email: data.email ?? "", slackWebhook: data.slack_webhook ?? "", teamsWebhook: data.teams_webhook ?? "" }
            : null
        );
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const save = useCallback(
    async (next: AlertSettings) => {
      if (!userId) return "Create a free account to turn on alerts.";
      const problem = validateAlertSettings(next);
      if (problem) return problem;
      const { error } = await createSupabaseClient()
        .from("tracker_alert_settings")
        .upsert({
          user_id: userId,
          email_enabled: next.emailEnabled,
          email: next.email.trim() || null,
          slack_webhook: next.slackWebhook.trim() || null,
          teams_webhook: next.teamsWebhook.trim() || null,
          updated_at: new Date().toISOString(),
        });
      if (error) {
        console.error("Error saving alert settings:", error);
        return "Couldn't save your alert settings. Please try again.";
      }
      setSaved(next);
      trackEvent(MixpanelEvent.TARIFF_TRACKER_ALERTS_SAVED, {
        email: next.emailEnabled,
        slack: Boolean(next.slackWebhook),
        teams: Boolean(next.teamsWebhook),
      });
      return null;
    },
    [userId]
  );

  const settings = saved ?? { ...EMPTY, email: user?.email ?? "" };
  return (
    <AlertSettingsContext.Provider
      value={{ loading, configured: Boolean(saved) && !validateAlertSettings(saved!), settings, save }}
    >
      {children}
    </AlertSettingsContext.Provider>
  );
};
