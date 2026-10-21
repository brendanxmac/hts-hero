"use client";

import { useEffect, useMemo } from "react";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useCatalogAdcvd } from "@/components/adcvd/useCatalogAdcvd";
import { byDuty } from "@/libs/tariff-tracker/plan";
import { todayIso } from "../../duty-calculator/lib/format";
import { useInsights } from "../insights/InsightsContext";
import { useTracker } from "../TrackerContext";
import { setUpgradeStats } from "./upgradeStats";

// Hands the plans dialog the user's own numbers (upgradeStats.ts): imports, how many are tracked,
// the tariff changes that hit them in the last 12 months, and what the free plan would take away
export const UpgradeStatsBridge = (): null => {
  const { items, products, trackedKeys } = useTracker();
  const insights = useInsights();
  const adcvdItems = useMemo(() => products.map((p) => ({ key: p.key, code: p.entry.element.htsno, country: p.entry.country.code })), [products]);
  const adcvd = useCatalogAdcvd(adcvdItems);
  // The free plan keeps alerts on the highest-duty tracked imports, if any (TRIAL_ALLOWANCE.alertImports)
  const losing = useMemo(() => byDuty(Array.from(trackedKeys), products).slice(TRIAL_ALLOWANCE.alertImports), [trackedKeys, products]);
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
      losingAlerts: losing.length,
      adcvdFlagged: adcvd.size,
      adcvdLosing: losing.filter((k) => adcvd.has(k)).length,
      adcvdUntracked: Array.from(adcvd.keys()).filter((k) => !trackedKeys.has(k)).length,
    });
  }, [items.length, trackedKeys, insights.changes, losing, adcvd]);
  useEffect(() => () => setUpgradeStats(null), []);
  return null;
};
