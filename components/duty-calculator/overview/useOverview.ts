"use client";

import { useMemo } from "react";
import { Country } from "@/constants/countries";
import { useHts } from "@/contexts/HtsContext";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { matchCatalog } from "@/libs/tariff-updates/match";
import { originRates, rateKey, rateOf } from "@/components/tariff-tracker/product/analysis/analysis";
import { productFromFinder } from "@/components/tariff-tracker/report";
import { TrackerUpdate, useTariffUpdates } from "@/components/tariff-tracker/overview/useTariffUpdates";
import { todayIso } from "../lib/format";
import { Glance, glance } from "../lib/summary";
import { useUsImports } from "../lib/usImports";
import { TariffFinder } from "../lib/useTariffFinder";

// Everything the Overview tab (and "Get Insights" in the calculator) says about one import, at a
// high level: the answer and why (glance), the rate over time and any change already scheduled,
// cheaper countries among its 20 biggest US suppliers (Census, so they're real options), and
// recent tariff news that may touch it. Worked out only while it's needed.

export interface CheaperOrigin {
  country: Country;
  pct: number;
  // The trade agreement behind that rate, when one lowers it
  agreement?: string;
  // US imports from there last year, and their share of all US imports of this product
  value: number;
  share: number;
}

export interface WatchItem {
  slug: string;
  title: string;
  date: string;
  level: "likely" | "possible";
  kind: TrackerUpdate["kind"];
}

export interface Overview extends Glance {
  // The rate on each date it changed, oldest first, to today
  steps: { date: string; value: number }[];
  // The next change already in the data, after today
  scheduled: { date: string; pct: number } | null;
  changes: number;
  cheaper: CheaperOrigin[] | null;
  usImportsTotal: number | null;
  news: WatchItem[] | null;
}

// Only the 20 largest US suppliers of the product count as cheaper options: a tiny supplier with
// a low rate is rarely a real option (little capacity to make it, harder to work with)
export const TOP_SUPPLIERS = 20;

export const useOverview = (f: TariffFinder, enabled: boolean): Overview | null => {
  const { htsElements } = useHts();
  const { result, selectedElement, country } = f;
  const imports = useUsImports(enabled ? selectedElement?.htsno : undefined);
  const updates = useTariffUpdates("recent");
  const today = useMemo(() => todayIso(), []);

  // Only what the rates depend on, so it isn't redone while nothing changed
  const key = JSON.stringify([selectedElement?.htsno, country?.code, f.customsValue, f.quantity, f.entryDate, f.transportMode, f.claimedPreference, f.answers]);
  const product = useMemo(
    () => (enabled ? productFromFinder(f, htsElements) : null),
    // The inputs, through their key
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [enabled, key, htsElements]
  );

  const cheaper = useMemo((): CheaperOrigin[] | null => {
    if (!product || !imports) return null;
    const own = product.entry.country.code;
    const largest = Array.from(imports.byCountry.entries())
      .filter(([code, v]) => code !== own && code !== "US" && v.value > 0)
      .sort((a, b) => b[1].value - a[1].value)
      .slice(0, TOP_SUPPLIERS);
    if (!largest.length) return [];
    const rates = originRates(product, largest.map(([code]) => code));
    const origin = rates.find((r) => r.isOrigin);
    const yours = origin ? rateKey(rateOf(origin, "agreements")) : Infinity;
    return rates
      .filter((r) => !r.isOrigin && rateKey(rateOf(r, "agreements")) < yours)
      .map((r) => {
        const value = imports.byCountry.get(r.country.code)?.value ?? 0;
        return { country: r.country, pct: rateOf(r, "agreements"), agreement: r.agreement?.name, value, share: imports.totalValue ? value / imports.totalValue : 0 };
      })
      .sort((a, b) => a.pct - b.pct || b.value - a.value)
      .slice(0, 3);
  }, [product, imports]);

  const news = useMemo((): WatchItem[] | null => {
    if (!updates || !selectedElement || !country) return updates ? [] : null;
    const item = { code: htsCodeDigitsOnly(selectedElement.htsno), country: country.code };
    const matched = matchCatalog(updates, [item]);
    return updates
      .flatMap((u): WatchItem[] => {
        const m = matched.get(u.slug);
        const level = m?.likely.length ? "likely" : m?.possible.length ? "possible" : null;
        return level ? [{ slug: u.slug, title: u.title, date: u.effective_on ?? u.last_activity_at.slice(0, 10), level, kind: u.kind }] : [];
      })
      .sort((a, b) => Number(b.level === "likely") - Number(a.level === "likely") || b.date.localeCompare(a.date))
      .slice(0, 3);
  }, [updates, selectedElement, country]);

  return useMemo(() => {
    if (!enabled || !result) return null;
    const value = f.customsValue > 0 ? f.customsValue : 1;
    const rate = (s: (typeof f.history)[number]) => (s.result.totalDuty / value) * 100;
    const past = f.history.filter((s) => s.from <= today);
    const future = f.history.find((s) => s.from > today && Math.abs(s.result.totalDuty - result.totalDuty) >= 0.005);
    const steps = past.map((s) => ({ date: s.from, value: rate(s) })).filter((s, i, all) => i === 0 || Math.abs(s.value - all[i - 1].value) >= 0.005);
    return {
      ...glance(f, result),
      steps,
      scheduled: future ? { date: future.from, pct: rate(future) } : null,
      changes: Math.max(0, steps.length - 1),
      cheaper,
      usImportsTotal: imports?.totalValue ?? null,
      news,
    };
    // f's parts that matter are in result, history and key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, result, f.history, key, cheaper, imports, news, today]);
};
