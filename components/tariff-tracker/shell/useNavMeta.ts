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
  const { signedIn } = useTrackerAccess();
  const alerts = useAlertSettings();
  const meta: Partial<Record<SectionSlug, NavMeta>> = {};
  if (items.length) meta.catalog = { text: items.length.toLocaleString("en-US"), tone: "neutral" };
  else meta.catalog = { text: "Start here", tone: "primary" };
  if (signedIn && !alerts.loading) meta.alerts = alerts.configured ? { text: "On", tone: "success" } : { text: "Off", tone: "warning" };
  if (insights.historyReady && items.length) {
    const { count } = changesLastYear(insights.changes, todayIso());
    if (count) meta.history = { text: `${count} changes`, tone: "error" };
  }
  if (insights.savingsReady && insights.totals.anyUsd > 0) meta.savings = { text: `up to ${wholeDollars(insights.totals.anyUsd)}`, tone: "success" };
  meta.entries = { text: "Soon", tone: "neutral" };
  return meta;
};
