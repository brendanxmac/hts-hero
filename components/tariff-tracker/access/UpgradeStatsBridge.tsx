"use client";

import { useEffect } from "react";
import { todayIso } from "../../duty-calculator/lib/format";
import { useInsights } from "../insights/InsightsContext";
import { useTracker } from "../TrackerContext";
import { setUpgradeStats } from "./upgradeStats";

// Hands the plans dialog the user's own numbers (upgradeStats.ts): imports, how many are tracked,
// and the tariff changes that hit them in the last 12 months
export const UpgradeStatsBridge = (): null => {
  const { items, trackedKeys } = useTracker();
  const insights = useInsights();
  useEffect(() => {
    const today = todayIso();
    const yearAgo = `${Number(today.slice(0, 4)) - 1}${today.slice(4)}`;
    const recent = insights.changes.filter((c) => c.date >= yearAgo && c.date <= today);
    const rise = recent.filter((c) => c.deltaPct > 0).sort((a, b) => b.deltaPct - a.deltaPct)[0];
    setUpgradeStats({
      imports: items.length,
      tracked: Math.min(trackedKeys.size, items.length),
      changes12m: recent.length,
      productsHit12m: new Set(recent.map((c) => c.product.key)).size,
      biggestRise: rise
        ? { code: rise.product.entry.element.htsno, country: rise.product.entry.country.name, pct: Math.round(rise.deltaPct * 10) / 10 }
        : null,
    });
  }, [items.length, trackedKeys.size, insights.changes]);
  useEffect(() => () => setUpgradeStats(null), []);
  return null;
};
