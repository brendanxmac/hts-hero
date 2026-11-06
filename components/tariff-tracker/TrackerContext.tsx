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

// Everything Duty Guard's sections share: the HTS data, the product catalog, each
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
  // The list shown: its products, matched to the current HTS
  items: CatalogItem[];
  // Every list's imports, each code and country once (what the plan counts; whether there are any yet)
  allItems: CatalogItem[];
  entries: CatalogEntry<HtsElement>[];
  // Products whose code isn't in the current HTS (dropped by a revision); kept, not shown
  missing: CatalogItem[];
  // Adds products (with any adjustments they bring), skipping ones already in the catalog
  // Into the list shown, or `target` (a list by id, or a new one by name), which is then shown
  addProducts: (products: NewProduct[], source: AddSource, target?: store.ListTarget) => { added: number; duplicates: number; listName: string };
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

export const TrackerContext = createContext<Tracker | null>(null);

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
  // The list shown (Duty Guard shows one list at a time), and every list's imports, each once: the
  // plan covers imports across all of them
  const { items, adjustments } = store.useCatalog();
  const all = store.useAllImports();
  // One list: every import is in the one shown, so its rates do for both
  const single = store.useImportLists().lists.length <= 1;
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
        () => trackEvent(MixpanelEvent.DUTY_GUARD_PRODUCT_ADJUSTED, { field }),
        1000
      );
    });
  };
  const resetAdjustments = (key: string) => {
    store.resetProductAdjustments(key);
    trackEvent(MixpanelEvent.DUTY_GUARD_ADJUSTMENTS_RESET);
  };

  const addProducts = (incoming: NewProduct[], source: AddSource, target?: store.ListTarget) => {
    // The example list is marked, so it never counts as the user's imports (realItems)
    const { added, duplicates, withAdjustments, listName } = store.addToCatalog(source === "example" ? incoming.map((p) => ({ ...p, example: true as const })) : incoming, target);
    trackEvent(MixpanelEvent.DUTY_GUARD_PRODUCTS_ADDED, { added, duplicates, source, with_adjustments: withAdjustments, new_list: Boolean(target?.newListName) });
    return { added, duplicates, listName };
  };

  const removeProducts = (keys: string[]) => {
    store.removeFromCatalog(keys);
    trackEvent(MixpanelEvent.DUTY_GUARD_PRODUCTS_REMOVED, { removed: keys.length });
  };
  const clearCatalog = () => {
    trackEvent(MixpanelEvent.DUTY_GUARD_PRODUCTS_REMOVED, { removed: items.length, cleared: true });
    store.clearCatalog();
  };

  const [filters, setFilters] = useState<FilterState>({});
  const setFilter = (id: string, values: string[]) => {
    setFilters((prev) => ({ ...prev, [id]: values }));
    trackEvent(MixpanelEvent.DUTY_GUARD_FILTERED, { filter: id, values: values.length });
  };
  const clearFilters = () => setFilters({});
  const replaceFilters = (next: FilterState) => setFilters(Object.fromEntries(Object.entries(next).filter(([, v]) => v?.length)));
  const filterContext = useMemo(() => ({ sections }), [sections]);

  // Debounced, so picking a date with the keyboard counts once
  const dateTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const setEntryDate = (date: string, source?: string) => {
    setEntryDateState(date);
    clearTimeout(dateTimer.current);
    if (source) trackEvent(MixpanelEvent.DUTY_GUARD_DATE_SET, { entry_date: date, source });
    else {
      dateTimer.current = setTimeout(
        () => trackEvent(MixpanelEvent.DUTY_GUARD_DATE_SET, { entry_date: date }),
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
  const deferredAllAdjustments = useDeferredValue(all.adjustments);

  // Items matched to the current HTS. Countries come from the same list the parser uses.
  const matchItems = (list: CatalogItem[]) => {
    const entries: CatalogEntry<HtsElement>[] = [];
    const missing: CatalogItem[] = [];
    if (!byDigits.size) return { entries, missing };
    list.forEach((item, index) => {
      const element = byDigits.get(item.code);
      const country = findCountry(item.country);
      if (!element || !country) missing.push(item);
      else entries.push({ line: index + 1, text: `${element.htsno},${country.code}`, element, country });
    });
    return { entries, missing };
  };
  const matched = useMemo(() => matchItems(items), [items, byDigits]); // eslint-disable-line react-hooks/exhaustive-deps
  const matchedAll = useMemo(() => (single ? matched : matchItems(all.items)), [single, all.items, matched, byDigits]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each product's rates, worked out again only when its own inputs change: adjusting one
  // product in a catalog of thousands recalculates just that one. Adjustments for products that
  // didn't change keep their identity, so comparing references is enough.
  const productCache = useRef(new Map<string, { inputs: unknown[]; product: TrackedProduct }>());
  const allProductCache = useRef(new Map<string, { inputs: unknown[]; product: TrackedProduct }>());
  const ratesFor = (cacheRef: typeof productCache, entries: CatalogEntry<HtsElement>[], adj: Record<string, Adjustments>) => {
    const cache = cacheRef.current;
    const next = new Map<string, { inputs: unknown[]; product: TrackedProduct }>();
    const out = entries.map((entry) => {
      const key = productKey(entry.element.htsno, entry.country);
      const inputs = [entry.element, entry.country, htsElements, entryDate, adj[key]];
      const hit = cache.get(key);
      const product = hit && hit.inputs.every((v, i) => v === inputs[i]) ? hit.product : trackProduct(entry, htsElements, entryDate, adj[key]);
      next.set(key, { inputs, product });
      return product;
    });
    cacheRef.current = next;
    return out;
  };
  const products = useMemo(() => ratesFor(productCache, matched.entries, deferredAdjustments), [matched, htsElements, entryDate, deferredAdjustments]); // eslint-disable-line react-hooks/exhaustive-deps
  // Every list's imports (one list: the same ones), for the plan's coverage
  const allProducts = useMemo(
    () => (single ? products : ratesFor(allProductCache, matchedAll.entries, deferredAllAdjustments)),
    [single, matchedAll, products, htsElements, entryDate, deferredAllAdjustments] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // The imports tracked (alerts and impact checks, PRICING.md): until the user chooses, the
  // highest-duty ones up to the plan's limit; once they've chosen (tracked or untracked any), exactly
  // their picks, up to the limit, so untracking one frees a slot (libs/tariff-tracker/snapshot.ts
  // coveredKeys is the same rule, for alerts)
  // Across every list: an import counts once however many lists it's in (PRICING.md)
  const allItems = single ? items : all.items;
  const pickedKeys = useMemo(() => new Set(allItems.filter((i) => i.covered === true).map(itemKey)), [allItems]);
  const chosen = useMemo(() => allItems.some((i) => i.covered !== undefined), [allItems]);
  const trackedKeys = useMemo(() => {
    const limit = access.pairLimit;
    // More picks than the plan covers (a trial that ended): the highest-duty ones
    if (chosen) return new Set(byDuty(allItems.filter((i) => i.covered === true).map(itemKey), allProducts).slice(0, limit));
    return new Set([...allProducts].sort((a, b) => b.result.totalDuty - a.result.totalDuty).slice(0, limit).map((p) => p.key));
  }, [allItems, allProducts, access.pairLimit, chosen]);
  // False when it would go past the plan's limit (the caller shows the plans)
  const setCovered = (key: string, covered: boolean) => {
    const on = trackedKeys.has(key);
    if (covered === on) return true;
    if (covered && trackedKeys.size >= access.pairLimit) return false;
    // The first choice keeps what was picked automatically, with this one changed
    if (!chosen) store.setProductsCovered({ ...Object.fromEntries(Array.from(trackedKeys, (k) => [k, true])), [key]: covered });
    else store.setProductCovered(key, covered);
    trackEvent(MixpanelEvent.DUTY_GUARD_COVERAGE_CHANGED, { covered, picked: trackedKeys.size + (covered ? 1 : -1), limit: access.pairLimit });
    return true;
  };
  const trackedProducts = useMemo(() => products.filter((p) => trackedKeys.has(p.key)), [products, trackedKeys]);

  // Spare room on the plan, filled with the highest-duty imports the user hasn't turned off. Done on
  // request (trackMore), for imports added while there's room, and when the plan grows (an upgrade);
  // never after the user turns one off, so that still frees a slot
  const turnedOff = useMemo(() => new Set(allItems.filter((i) => i.covered === false).map(itemKey)), [allItems]);
  const candidates = useMemo(
    () => [...allProducts].filter((p) => !trackedKeys.has(p.key) && !turnedOff.has(p.key)).sort((a, b) => b.result.totalDuty - a.result.totalDuty),
    [allProducts, trackedKeys, turnedOff]
  );
  const room = Math.max(0, access.pairLimit - trackedKeys.size);
  const moreToTrack = Math.min(room, candidates.length);
  // track: false when Duty Guard fills it on its own (imports added, an upgrade), not on request
  const fill = (keys: string[], track = true) => {
    if (!keys.length) return 0;
    const on = Object.fromEntries(keys.map((k) => [k, true]));
    // The first choice keeps what was picked automatically
    store.setProductsCovered(chosen ? on : { ...Object.fromEntries(Array.from(trackedKeys, (k) => [k, true])), ...on });
    if (track) trackEvent(MixpanelEvent.DUTY_GUARD_COVERAGE_CHANGED, { covered: true, added: keys.length, picked: trackedKeys.size + keys.length, limit: access.pairLimit });
    return keys.length;
  };
  // Also a click handler, so it takes no arguments
  const trackMore = () => fill(candidates.slice(0, room).map((p) => p.key));

  // Imports added while there's room get alerts (once the user has chosen; before that they're
  // picked automatically anyway). Not the catalog arriving on load.
  const seenKeys = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (loading) return;
    const keys = new Set(allItems.map(itemKey));
    const before = seenKeys.current;
    seenKeys.current = keys;
    if (!before || !chosen) return;
    const added = allItems.map(itemKey).filter((k) => !before.has(k) && !turnedOff.has(k) && !trackedKeys.has(k));
    fill(added.slice(0, Math.max(0, access.pairLimit - trackedKeys.size)), false);
  }, [allItems, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // A bigger plan (an upgrade) fills its new room straight away
  const lastLimit = useRef(access.pairLimit);
  useEffect(() => {
    const before = lastLimit.current;
    lastLimit.current = access.pairLimit;
    if (before > 0 && access.pairLimit > before && chosen && !loading) fill(candidates.slice(0, room).map((p) => p.key), false);
  }, [access.pairLimit]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <TrackerContext.Provider
      value={{
        loading,
        entryDate,
        setEntryDate,
        findElement: (digits) => byDigits.get(digits),
        items,
        allItems,
        entries: matched.entries,
        missing: matched.missing,
        addProducts,
        removeProducts,
        clearCatalog,
        products,
        trackedKeys,
        pickedKeys,
        setCovered,
        untrackedCount: items.filter((i) => !trackedKeys.has(itemKey(i))).length,
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
