"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { savingsUnlocked } from "../../../libs/tariff-tracker/plan";
import { useUsImportsFor } from "../../duty-calculator/lib/usImports";
import type { UsImports } from "../../duty-calculator/lib/usImportsData";
import { useTrackerAccess } from "../access/accessContext";
import { useOpportunities } from "../opportunities/OpportunitiesContext";
import { opportunityKey, ReviewState, reviewOf, ReviewStats, reviewStats } from "../opportunities/review";
import { historyRange } from "../product/analysis/history";
import { TrackedProduct } from "../report";
import { useTracker } from "../TrackerContext";
import { CatalogChange, catalogChanges, ProductHistory, productHistory } from "./catalogHistory";
import { originRates } from "../product/analysis/analysis";
import { bestSavings, OriginCost, originCosts, productSavings, Saving } from "./savings";

// What the Tracker works out across the catalog: every product's rate history and every way to
// save on it. Shared by the Overview, Rate history, Savings and the teasers on locked features,
// and worked out once in the background, a few milliseconds at a time, so the app never stalls.
// Each product's results are kept until its inputs change.
//
// Rate history and every origin's duty are worked out for the whole catalog (free with an account).
// Savings are too, but only the products whose savings are unlocked (checked with the trial's
// allowance, or covered by a paid plan) show them; `beyond` sums up the rest, to tease what
// checking them would find: real numbers from the user's own catalog (PRICING.md). Origin savings
// need the catalog's US imports by country (Census) first, so they only count countries that
// already make each product for the US (savings.ts: Supply). Savings the user has secured or ruled
// out are left out of every list and total, and each import gets its review state (review.ts).

export interface Insights {
  products: TrackedProduct[];
  range: { from: IsoDate; to: IsoDate };
  histories: Map<string, ProductHistory>;
  historyReady: boolean;
  savings: Map<string, Saving[]>;
  savingsReady: boolean;
  // Every other origin's duty on each product (with the savings), for Sourcing
  origins: Map<string, OriginCost[]>;
  // A code's US imports by country (Census): null when it has none, undefined while loading
  importsFor: (htsno: string) => UsImports | null | undefined;
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
  // Products whose savings are unlocked
  unlocked: Set<string>;
  // Each product's savings review, and how far the catalog has got (the share of imports reviewed)
  review: Map<string, ReviewState>;
  reviewStats: ReviewStats;
  // The best potential saving found on each locked product, in dollars per shipment (0 if none)
  lockedBest: Map<string, number>;
  // The products whose savings aren't unlocked: what checking them would find
  beyond: {
    products: number;
    productsWithSavings: number;
    anyUsd: number;
    ready: boolean;
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
  const { products, trackedKeys } = useTracker();
  const { access } = useTrackerAccess();
  const { opportunities } = useOpportunities();
  const unlocked = useMemo(() => (typeof window !== "undefined" && localStorage.getItem("zz-unlock") ? new Set(products.map((p) => p.key)) : savingsUnlocked(access, trackedKeys)), [access, trackedKeys, products]); // ZZ-TEMP
  // Every product; savings on the unlocked ones first, then the rest for the teasers
  const scope = products;
  const open = useMemo(() => products.filter((p) => unlocked.has(p.key)), [products, unlocked]);
  const rest = useMemo(() => products.filter((p) => !unlocked.has(p.key)), [products, unlocked]);
  const range = useMemo(() => historyRange(), []);
  const codes = useMemo(() => products.map((p) => p.entry.element.htsno), [products]);
  const imports = useUsImportsFor(codes);

  const historyCache = useRef(new WeakMap<TrackedProduct, ProductHistory>());
  const savingsCache = useRef(new WeakMap<TrackedProduct, Saving[]>());
  const originsCache = useRef(new WeakMap<TrackedProduct, OriginCost[]>());
  // Bumped as results come in
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    // Savings and every origin's duty, from one set of origin rates
    // Waits for the code's Census figures (this runs again when they arrive)
    const save = (p: TrackedProduct) => {
      const code = p.entry.element.htsno;
      if (savingsCache.current.has(p) || !imports.byCode.has(code)) return;
      const rates = originRates(p);
      savingsCache.current.set(p, productSavings(p, imports.byCode.get(code) ?? null, rates));
      originsCache.current.set(p, originCosts(rates));
    };
    // Histories first (quick), then savings (about 200 calculations a product)
    const jobs = [
      ...scope.map((p) => () => historyCache.current.has(p) || historyCache.current.set(p, productHistory(p, range))),
      ...open.map((p) => () => save(p)),
      // Then savings on the locked products, for the teasers
      ...rest.map((p) => () => save(p)),
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
  }, [scope, open, rest, range, imports]);

  const value = useMemo((): Insights => {
    const histories = new Map<string, ProductHistory>();
    const savings = new Map<string, Saving[]>();
    const origins = new Map<string, OriginCost[]>();
    const review = new Map<string, ReviewState>();
    // Savings that are done with: secured (applied) or ruled out
    const closed = new Set(
      opportunities.filter((o) => o.status === "secured" || o.status === "not_eligible").map((o) => opportunityKey(o.productKey, o.kind, o.optionRef))
    );
    const oppsByProduct = new Map<string, typeof opportunities>();
    opportunities.forEach((o) => oppsByProduct.set(o.productKey, [...(oppsByProduct.get(o.productKey) ?? []), o]));
    scope.forEach((p) => {
      const o = originsCache.current.get(p);
      if (o) origins.set(p.key, o);
      const h = historyCache.current.get(p);
      if (h) histories.set(p.key, h);
      const s = savingsCache.current.get(p);
      if (s && unlocked.has(p.key)) savings.set(p.key, s.filter((x) => !closed.has(opportunityKey(p.key, x.kind, x.ref))));
      if (!unlocked.has(p.key)) review.set(p.key, "unchecked");
      else if (s) review.set(p.key, reviewOf(true, s, oppsByProduct.get(p.key) ?? []));
    });
    const best = Array.from(savings.values()).map(bestSavings);
    const lockedBest = new Map<string, number>();
    rest.forEach((p) => {
      const s = savingsCache.current.get(p);
      if (s) lockedBest.set(p.key, bestSavings(s).any?.usd ?? 0);
    });
    const beyondBest = Array.from(lockedBest.values());
    return {
      products: scope,
      range,
      histories,
      historyReady: histories.size === scope.length,
      savings,
      savingsReady: savings.size === open.length,
      origins,
      importsFor: (htsno) => imports.byCode.get(htsno),
      progress: scope.length ? (histories.size + savings.size + lockedBest.size) / (scope.length * 2) : 1,
      changes: catalogChanges(scope, histories),
      totals: {
        keepSupplierUsd: best.reduce((sum, b) => sum + (b.keepSupplier?.usd ?? 0), 0),
        anyUsd: best.reduce((sum, b) => sum + (b.any?.usd ?? 0), 0),
        productsWithSavings: best.filter((b) => b.any).length,
        exemptionsToCheck: best.filter((b) => b.exemption).length,
        cheaperOrigins: Array.from(savings.values()).filter((list) => list.some((s) => s.kind === "origin")).length,
      },
      unlocked,
      review,
      reviewStats: reviewStats(Array.from(review.values())),
      lockedBest,
      beyond: {
        products: rest.length,
        productsWithSavings: beyondBest.filter((usd) => usd > 0).length,
        anyUsd: beyondBest.reduce((sum, usd) => sum + usd, 0),
        ready: beyondBest.length === rest.length,
      },
    };
    // version: the caches have new results
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, open, rest, unlocked, range, version, imports, opportunities]);

  return <InsightsContext.Provider value={value}>{children}</InsightsContext.Provider>;
};
