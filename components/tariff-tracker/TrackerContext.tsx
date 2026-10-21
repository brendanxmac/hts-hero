"use client";

import { createContext, ReactNode, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { HtsElement } from "../../interfaces/hts";
import { useUser } from "../../contexts/UserContext";
import { useTrackerAccess } from "./access/accessContext";
import { byDuty } from "../../libs/tariff-tracker/plan";
import { useCatalogSync } from "./catalogSync";
import { useHts } from "../../contexts/HtsContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { todayIso } from "../duty-calculator/lib/format";
import { Adjustments, productKey } from "./adjustments";
import { CatalogItem, CatalogItemMeta, itemKey, NewProduct } from "./catalog";
import * as store from "./catalogStore";
import { FilterContext, FilterState } from "./filters";
import { CatalogEntry, findCountry } from "./parse";
import { TrackedProduct, trackProduct } from "./report";

// Everything the Tariff Tracker's sections share: the HTS data, the product catalog, each
// product's adjustments, the catalog's filters and the date rates are worked out for. Provided
// around every tab, so it carries over as the user moves between them.

// Where added products came from, for analytics
export type AddSource = "paste" | "csv" | "generated" | "example" | "calculator" | "tracker_calculator" | "monitor_page" | "recent_lookups" | "overview_paste" | "savings";

export interface Tracker {
  loading: boolean;
  // "Rates as of"
  entryDate: string;
  setEntryDate: (date: string, source?: string) => void;
  // The current HTS line for 8 or 10 digits, if there is one
  findElement: (digits: string) => HtsElement | undefined;
  // The catalog: its products, matched to the current HTS
  items: CatalogItem[];
  entries: CatalogEntry<HtsElement>[];
  // Products whose code isn't in the current HTS (dropped by a revision); kept, not shown
  missing: CatalogItem[];
  // Adds products (with any adjustments they bring), skipping ones already in the catalog
  addProducts: (products: NewProduct[], source: AddSource) => { added: number; duplicates: number };
  removeProducts: (keys: string[]) => void;
  clearCatalog: () => void;
  // Each product's rates as of entryDate, with its adjustments
  products: TrackedProduct[];
  // The products with alerts (the trial's alert allowance, or the plan's size; on a plan, savings
  // too): the ones the user picked, then the highest-duty others in any spare slots
  trackedKeys: Set<string>;
  // The ones the user picked themselves
  pickedKeys: Set<string>;
  // Picks a product for the plan's coverage, or takes it out; false when the plan is full
  setCovered: (key: string, covered: boolean) => boolean;
  // Products in the catalog beyond that limit
  untrackedCount: number;
  // How many more imports alerts could be turned on for (spare room on the plan, and imports not
  // turned off by the user), and turning them on, highest duty first
  moreToTrack: number;
  trackMore: () => number;
  // Tracked products only, in catalog order
  trackedProducts: TrackedProduct[];
  // The catalog item for a product key, and what's kept about it (shipments a year, a move of origin)
  itemFor: (key: string) => CatalogItem | undefined;
  setProductMeta: (key: string, patch: CatalogItemMeta) => void;
  // Remembered per product key (HTS code + country)
  setAdjustments: (key: string, patch: Adjustments) => void;
  resetAdjustments: (key: string) => void;
  // Kept while moving between tabs, not saved
  filters: FilterState;
  setFilter: (id: string, values: string[]) => void;
  // All of them at once (the imports table's filters)
  replaceFilters: (next: FilterState) => void;
  clearFilters: () => void;
  filterContext: FilterContext;
}

const TrackerContext = createContext<Tracker | null>(null);

export const useTracker = () => {
  const tracker = useContext(TrackerContext);
  if (!tracker) throw new Error("useTracker must be used inside TrackerProvider");
  return tracker;
};

export const TrackerProvider = ({ children }: { children: ReactNode }) => {
  const { htsElements, fetchElements } = useHts();
  const { sections, getSections } = useHtsSections();
  const [loading, setLoading] = useState(htsElements.length === 0);
  const [entryDate, setEntryDateState] = useState(todayIso);
  // The saved catalog, shared with the calculator's "Add to catalog" (and other tabs), and saved
  // to the account when signed in
  const { items, adjustments } = store.useCatalog();
  const { user, isLoading: userLoading } = useUser();
  useCatalogSync(userLoading ? undefined : (user?.id ?? null));
  const { access } = useTrackerAccess();

  useEffect(() => {
    // Chapter names, for the chapter filter; not needed to show rates
    if (sections.length === 0) getSections().catch((e) => console.error("Error loading HTS sections:", e));
    if (htsElements.length > 0) {
      setLoading(false);
      return;
    }
    fetchElements("latest")
      .catch((e) => console.error("Error loading HTS data:", e))
      .finally(() => setLoading(false));
    // Load once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typing a value counts once it settles
  const adjustTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const setAdjustments = (key: string, patch: Adjustments) => {
    store.setProductAdjustments(key, patch);
    Object.keys(patch).forEach((field) => {
      const timerKey = `${key}:${field}`;
      clearTimeout(adjustTimers.current[timerKey]);
      adjustTimers.current[timerKey] = setTimeout(
        () => trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCT_ADJUSTED, { field }),
        1000
      );
    });
  };
  const resetAdjustments = (key: string) => {
    store.resetProductAdjustments(key);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ADJUSTMENTS_RESET);
  };

  const addProducts = (incoming: NewProduct[], source: AddSource) => {
    // The example list is marked, so it never counts as the user's imports (realItems)
    const { added, duplicates, withAdjustments } = store.addToCatalog(source === "example" ? incoming.map((p) => ({ ...p, example: true as const })) : incoming);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, { added, duplicates, source, with_adjustments: withAdjustments });
    return { added, duplicates };
  };

  const removeProducts = (keys: string[]) => {
    store.removeFromCatalog(keys);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_REMOVED, { removed: keys.length });
  };
  const clearCatalog = () => {
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_REMOVED, { removed: items.length, cleared: true });
    store.clearCatalog();
  };

  const [filters, setFilters] = useState<FilterState>({});
  const setFilter = (id: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [id]: values }));
    trackEvent(MixpanelEvent.TARIFF_TRACKER_FILTERED, { filter: id, values: values.length });
  };
  const clearFilters = () => setFilters({});
  const replaceFilters = (next: FilterState) => setFilters(Object.fromEntries(Object.entries(next).filter(([, v]) => v?.length)));
  const filterContext = useMemo(() => ({ sections }), [sections]);

  // Debounced, so picking a date with the keyboard counts once
  const dateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const setEntryDate = (date: string, source?: string) => {
    setEntryDateState(date);
    clearTimeout(dateTimer.current);
    if (source) trackEvent(MixpanelEvent.TARIFF_TRACKER_DATE_SET, { entry_date: date, source });
    else {
      dateTimer.current = setTimeout(
        () => trackEvent(MixpanelEvent.TARIFF_TRACKER_DATE_SET, { entry_date: date }),
        1000
      );
    }
  };

  const byDigits = useMemo(() => {
    const map = new Map<string, HtsElement>();
    htsElements.forEach((el) => {
      const digits = htsCodeDigitsOnly(el.htsno);
      if (digits.length === 8 || digits.length === 10) map.set(digits, el);
    });
    return map;
  }, [htsElements]);

  // Big catalogs stay responsive while values are typed; the rates catch up
  const deferredAdjustments = useDeferredValue(adjustments);

  // Items matched to the current HTS. Countries come from the same list the parser uses.
  const matched = useMemo(() => {
    const entries: CatalogEntry<HtsElement>[] = [];
    const missing: CatalogItem[] = [];
    if (!byDigits.size) return { entries, missing };
    items.forEach((item, index) => {
      const element = byDigits.get(item.code);
      const country = findCountry(item.country);
      if (!element || !country) missing.push(item);
      else entries.push({ line: index + 1, text: `${element.htsno},${country.code}`, element, country });
    });
    return { entries, missing };
  }, [items, byDigits]);

  // Each product's rates, worked out again only when its own inputs change: adjusting one
  // product in a catalog of thousands recalculates just that one. Adjustments for products that
  // didn't change keep their identity, so comparing references is enough.
  const productCache = useRef(new Map<string, { inputs: unknown[]; product: TrackedProduct }>());
  const products = useMemo(() => {
    const cache = productCache.current;
    const next = new Map<string, { inputs: unknown[]; product: TrackedProduct }>();
    const out = matched.entries.map((entry) => {
      const key = productKey(entry.element.htsno, entry.country);
      const inputs = [entry.element, entry.country, htsElements, entryDate, deferredAdjustments[key]];
      const hit = cache.get(key);
      const product =
        hit && hit.inputs.every((v, i) => v === inputs[i])
          ? hit.product
          : trackProduct(entry, htsElements, entryDate, deferredAdjustments[key]);
      next.set(key, { inputs, product });
      return product;
    });
    productCache.current = next;
    return out;
  }, [matched, htsElements, entryDate, deferredAdjustments]);

  // The imports tracked (alerts and impact checks, PRICING.md): until the user chooses, the
  // highest-duty ones up to the plan's limit; once they've chosen (tracked or untracked any), exactly
  // their picks, up to the limit, so untracking one frees a slot (libs/tariff-tracker/snapshot.ts
  // coveredKeys is the same rule, for alerts)
  const pickedKeys = useMemo(() => new Set(items.filter((i) => i.covered === true).map(itemKey)), [items]);
  const chosen = useMemo(() => items.some((i) => i.covered !== undefined), [items]);
  const trackedKeys = useMemo(() => {
    const limit = access.pairLimit;
    // More picks than the plan covers (a trial that ended): the highest-duty ones
    if (chosen) return new Set(byDuty(items.filter((i) => i.covered === true).map(itemKey), products).slice(0, limit));
    return new Set([...products].sort((a, b) => b.result.totalDuty - a.result.totalDuty).slice(0, limit).map((p) => p.key));
  }, [items, products, access.pairLimit, chosen]);
  // False when it would go past the plan's limit (the caller shows the plans)
  const setCovered = (key: string, covered: boolean) => {
    const on = trackedKeys.has(key);
    if (covered === on) return true;
    if (covered && trackedKeys.size >= access.pairLimit) return false;
    // The first choice keeps what was picked automatically, with this one changed
    if (!chosen) store.setProductsCovered({ ...Object.fromEntries(Array.from(trackedKeys, (k) => [k, true])), [key]: covered });
    else store.setProductCovered(key, covered);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_COVERAGE_CHANGED, { covered, picked: trackedKeys.size + (covered ? 1 : -1), limit: access.pairLimit });
    return true;
  };
  const trackedProducts = useMemo(() => products.filter((p) => trackedKeys.has(p.key)), [products, trackedKeys]);

  // Spare room on the plan, filled with the highest-duty imports the user hasn't turned off. Done on
  // request (trackMore), for imports added while there's room, and when the plan grows (an upgrade);
  // never after the user turns one off, so that still frees a slot
  const turnedOff = useMemo(() => new Set(items.filter((i) => i.covered === false).map(itemKey)), [items]);
  const candidates = useMemo(
    () => [...products].filter((p) => !trackedKeys.has(p.key) && !turnedOff.has(p.key)).sort((a, b) => b.result.totalDuty - a.result.totalDuty),
    [products, trackedKeys, turnedOff]
  );
  const room = Math.max(0, access.pairLimit - trackedKeys.size);
  const moreToTrack = Math.min(room, candidates.length);
  const fill = (keys: string[]) => {
    if (!keys.length) return 0;
    const on = Object.fromEntries(keys.map((k) => [k, true]));
    // The first choice keeps what was picked automatically
    store.setProductsCovered(chosen ? on : { ...Object.fromEntries(Array.from(trackedKeys, (k) => [k, true])), ...on });
    trackEvent(MixpanelEvent.TARIFF_TRACKER_COVERAGE_CHANGED, { covered: true, added: keys.length, picked: trackedKeys.size + keys.length, limit: access.pairLimit });
    return keys.length;
  };
  const trackMore = () => fill(candidates.slice(0, room).map((p) => p.key));

  // Imports added while there's room get alerts (once the user has chosen; before that they're
  // picked automatically anyway). Not the catalog arriving on load.
  const seenKeys = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (loading) return;
    const keys = new Set(items.map(itemKey));
    const before = seenKeys.current;
    seenKeys.current = keys;
    if (!before || !chosen) return;
    const added = items.map(itemKey).filter((k) => !before.has(k) && !turnedOff.has(k) && !trackedKeys.has(k));
    fill(added.slice(0, Math.max(0, access.pairLimit - trackedKeys.size)));
  }, [items, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // A bigger plan (an upgrade) fills its new room straight away
  const lastLimit = useRef(access.pairLimit);
  useEffect(() => {
    const before = lastLimit.current;
    lastLimit.current = access.pairLimit;
    if (before > 0 && access.pairLimit > before && chosen && !loading) trackMore();
  }, [access.pairLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TrackerContext.Provider
      value={{
        loading,
        entryDate,
        setEntryDate,
        findElement: (digits) => byDigits.get(digits),
        items,
        entries: matched.entries,
        missing: matched.missing,
        addProducts,
        removeProducts,
        clearCatalog,
        products,
        trackedKeys,
        pickedKeys,
        setCovered,
        untrackedCount: Math.max(0, items.length - trackedKeys.size),
        moreToTrack,
        trackMore,
        trackedProducts,
        itemFor: (key) => items.find((i) => itemKey(i) === key),
        setProductMeta: store.setProductMeta,
        setAdjustments,
        resetAdjustments,
        filters,
        setFilter,
        replaceFilters,
        clearFilters,
        filterContext,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};
