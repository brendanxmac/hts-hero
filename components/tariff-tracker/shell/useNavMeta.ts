"use client";

import { todayIso } from "../../duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { changesLastYear } from "../overview/lib/metrics";
import { SectionSlug } from "../sections";
import { useTracker } from "../TrackerContext";

// What's waiting in each section, for the sidebar: a count or an amount, in the color of what
// it is (red for changes, green for money, amber for something to do)
export interface NavMeta {
  text: string;
  tone: "error" | "success" | "warning" | "primary" | "neutral";
}

export const useNavMeta = (): Partial<Record<SectionSlug, NavMeta>> => {
  const { items } = useTracker();
  const insights = useInsights();
  const { signedIn, paid, savingsLeft, auditsLeft } = useTrackerAccess();
  const alerts = useAlertSettings();
  const meta: Partial<Record<SectionSlug, NavMeta>> = {};
  if (items.length) meta.catalog = { text: items.length.toLocaleString("en-US"), tone: "neutral" };
  else meta.catalog = { text: "Start here", tone: "primary" };
  if (signedIn && !alerts.loading) meta.alerts = alerts.configured ? { text: "On", tone: "success" } : { text: "Off", tone: "warning" };
  if (insights.historyReady && items.length) {
    const { count } = changesLastYear(insights.changes, todayIso());
    if (count) meta.history = { text: `${count} changes`, tone: "error" };
  }
  // On the trial, what's still free; once the checks are spent (or on a plan), what they found
  const found = insights.totals.anyUsd + insights.beyond.anyUsd;
  if (signedIn && !paid && savingsLeft > 0) meta.savings = { text: `${savingsLeft} free`, tone: "primary" };
  else if (insights.savingsReady && found > 0) meta.savings = { text: `up to ${wholeDollars(found)}`, tone: "success" };
  if (signedIn && !paid) meta.entries = auditsLeft > 0 ? { text: `${auditsLeft} free`, tone: "primary" } : { text: "Used", tone: "neutral" };
  return meta;
};
