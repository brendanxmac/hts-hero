"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TRIAL_PAIRS } from "@/components/pricing-calculator/lib/pricing";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { useTrackerAccess } from "../access/accessContext";
import { historyRange } from "../product/analysis/history";
import { TrackedProduct } from "../report";
import { useTracker } from "../TrackerContext";
import { CatalogChange, catalogChanges, ProductHistory, productHistory } from "./catalogHistory";
import { bestSavings, productSavings, Saving } from "./savings";

// What the Tracker works out across the catalog: every product's rate history and every way to
// save on it. Shared by the Overview, Rate history, Savings and the teasers on locked features,
// and worked out once in the background, a few milliseconds at a time, so the app never stalls.
// Each product's results are kept until its inputs change.
//
// With the trial or a plan it covers the tracked products. Without, it covers what the trial
// would track, so the teasers are real numbers from the user's own catalog.

export interface Insights {
  products: TrackedProduct[];
  range: { from: IsoDate; to: IsoDate };
  histories: Map<string, ProductHistory>;
  historyReady: boolean;
  savings: Map<string, Saving[]>;
  savingsReady: boolean;
  // 0 to 1, both kinds together
  progress: number;
  // Every rate change on these products, newest first
  changes: CatalogChange[];
  totals: {
    // The best trade program on each product, added up
    keepSupplierUsd: number;
    // The best trade program or origin on each product, added up
    anyUsd: number;
    // Products with a trade program or origin saving
    productsWithSavings: number;
    // Products with an exemption worth checking (not counted in dollars)
    exemptionsToCheck: number;
    // Products with a cheaper origin
    cheaperOrigins: number;
  };
}

const InsightsContext = createContext<Insights | null>(null);

export const useInsights = () => {
  const insights = useContext(InsightsContext);
  if (!insights) throw new Error("useInsights must be used inside InsightsProvider");
  return insights;
};

// Work per slice before handing the main thread back
const SLICE_MS = 12;

export const InsightsProvider = ({ children }: { children: ReactNode }) => {
  const { products, trackedProducts } = useTracker();
  const { premium } = useTrackerAccess();
  const scope = useMemo(() => (premium ? trackedProducts : products.slice(0, TRIAL_PAIRS)), [premium, trackedProducts, products]);
  const range = useMemo(() => historyRange(), []);

  const historyCache = useRef(new WeakMap<TrackedProduct, ProductHistory>());
  const savingsCache = useRef(new WeakMap<TrackedProduct, Saving[]>());
  // Bumped as results come in
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    // Histories first (quick), then savings (about 200 calculations a product)
    const jobs = [
      ...scope.map((p) => () => historyCache.current.has(p) || historyCache.current.set(p, productHistory(p, range))),
      ...scope.map((p) => () => savingsCache.current.has(p) || savingsCache.current.set(p, productSavings(p))),
    ];
    let next = 0;
    const step = () => {
      if (cancelled) return;
      const until = performance.now() + SLICE_MS;
      while (next < jobs.length && performance.now() < until) jobs[next++]();
      setVersion((v) => v + 1);
      if (next < jobs.length) timer = setTimeout(step, 0);
    };
    timer = setTimeout(step, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [scope, range]);

  const value = useMemo((): Insights => {
    const histories = new Map<string, ProductHistory>();
    const savings = new Map<string, Saving[]>();
    scope.forEach((p) => {
      const h = historyCache.current.get(p);
      if (h) histories.set(p.key, h);
      const s = savingsCache.current.get(p);
      if (s) savings.set(p.key, s);
    });
    const best = Array.from(savings.values()).map(bestSavings);
    return {
      products: scope,
      range,
      histories,
      historyReady: histories.size === scope.length,
      savings,
      savingsReady: savings.size === scope.length,
      progress: scope.length ? (histories.size + savings.size) / (scope.length * 2) : 1,
      changes: catalogChanges(scope, histories),
      totals: {
        keepSupplierUsd: best.reduce((sum, b) => sum + (b.keepSupplier?.usd ?? 0), 0),
        anyUsd: best.reduce((sum, b) => sum + (b.any?.usd ?? 0), 0),
        productsWithSavings: best.filter((b) => b.any).length,
        exemptionsToCheck: best.filter((b) => b.exemption).length,
        cheaperOrigins: Array.from(savings.values()).filter((list) => list.some((s) => s.kind === "origin")).length,
      },
    };
    // version: the caches have new results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, range, version]);

  return <InsightsContext.Provider value={value}>{children}</InsightsContext.Provider>;
};
