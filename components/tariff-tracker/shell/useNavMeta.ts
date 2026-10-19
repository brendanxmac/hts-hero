"use client";

import { useTrackerAccess } from "../access/accessContext";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { useEffect, useState } from "react";
import { newsSeenAt, onNewsSeen, useTariffUpdates } from "../overview/useTariffUpdates";
import { useImportMatches } from "../news/useImportMatches";
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
  // Tariff actions first seen since the news tab was last opened (the last week, before it ever was)
  const updates = useTariffUpdates("recent");
  const [seenAt, setSeenAt] = useState<string | null>(null);
  useEffect(() => {
    setSeenAt(newsSeenAt());
    return onNewsSeen(() => setSeenAt(newsSeenAt()));
  }, []);
  // Recent tariff actions (the last 45 days) that affect, or may affect, the user's imports
  const matches = useImportMatches(updates);
  const meta: Partial<Record<SectionSlug, NavMeta>> = {};
  // Tariff Changes: actions new since the user last looked, else recent ones that hit their imports
  const hitting = (updates ?? []).filter((u) => u.kind !== "hts_revision" && (matches.get(u.slug)?.confirmed ?? 0) + (matches.get(u.slug)?.likely ?? 0) > 0).length;
  const since = seenAt ?? new Date(Date.now() - 7 * 86_400_000).toISOString();
  const fresh = (updates ?? []).filter((u) => u.first_seen_at > since).length;
  if (fresh) meta.changes = { text: `${fresh} new`, tone: "primary" };
  else if (hitting) meta.changes = { text: `${hitting} recent`, tone: "neutral" };
  if (items.length) meta.catalog = { text: items.length.toLocaleString("en-US"), tone: "neutral" };
  else meta.catalog = { text: "Start here", tone: "primary" };
  // On the trial, what's still free; once the checks are spent (or on a plan), what they found
  const found = insights.totals.anyUsd + insights.beyond.anyUsd;
  if (signedIn && !paid && savingsLeft > 0) meta.savings = { text: `${savingsLeft} free`, tone: "primary" };
  else if (insights.savingsReady && found > 0) meta.savings = { text: `up to ${wholeDollars(found)}`, tone: "success" };
  if (signedIn && !paid) meta.entries = auditsLeft > 0 ? { text: `${auditsLeft} free`, tone: "primary" } : { text: "Used", tone: "neutral" };
  return meta;
};
