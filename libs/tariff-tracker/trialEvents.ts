import { SupabaseClient } from "@supabase/supabase-js";
import { trialLengthDays } from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent } from "@/libs/mixpanel";
import { trackEventServerAsync } from "@/libs/mixpanel-server";
import { readTrackerAccess } from "./access";

// Trial Started and Trial Ended in Mixpanel, sent by the daily lifecycle cron. The trial starts in
// the database (the tracker_onboarding trigger on the first real imports, from any page) and ends
// by the clock, so neither has a browser moment to send it from. Each event carries the time it
// happened, and an $insert_id, so the days the cron looks back over count each one once.

const DAY = 24 * 60 * 60 * 1000;
// Mixpanel's /track takes events up to 5 days old
const LOOKBACK_DAYS = 4;
// The longest trial (the legacy 14 days) plus the look-back
const ENDED_SINCE_DAYS = 14 + LOOKBACK_DAYS;

type Row = { user_id: string; trial_started_at: string };

export const sendTrialEvents = async (db: SupabaseClient, now = new Date()) => {
  const since = new Date(now.getTime() - ENDED_SINCE_DAYS * DAY).toISOString();
  const { data, error } = await db
    .from("tracker_onboarding")
    .select("user_id, trial_started_at")
    .gte("trial_started_at", since)
    .lte("trial_started_at", now.toISOString());
  if (error) throw new Error(`Loading trials: ${error.message}`);

  const recent = now.getTime() - LOOKBACK_DAYS * DAY;
  let started = 0;
  let ended = 0;
  for (const row of (data ?? []) as Row[]) {
    const startMs = Date.parse(row.trial_started_at);
    const days = trialLengthDays(startMs);
    const endMs = startMs + days * DAY;
    if (startMs >= recent) {
      await trackEventServerAsync(MixpanelEvent.DUTY_GUARD_TRIAL_STARTED, row.user_id, {
        $insert_id: `trial-started-${row.user_id}`,
        time: new Date(startMs),
        trial_days: days,
        trial_ends_at: new Date(endMs).toISOString(),
      });
      started++;
    }
    if (endMs >= recent && endMs <= now.getTime()) {
      // Converted: on a paid Duty Guard plan when the trial ran out (or since)
      const access = await readTrackerAccess(db, row.user_id).catch((): null => null);
      await trackEventServerAsync(MixpanelEvent.DUTY_GUARD_TRIAL_ENDED, row.user_id, {
        $insert_id: `trial-ended-${row.user_id}`,
        time: new Date(endMs),
        trial_days: days,
        converted: access?.kind === "paid",
        paid_plan: access?.paidPlan ?? null,
      });
      ended++;
    }
  }
  return { started, ended };
};
