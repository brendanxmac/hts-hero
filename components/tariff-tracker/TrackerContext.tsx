"use client";

import { createContext, ReactNode, useContext, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { HtsElement } from "../../interfaces/hts";
import { useHts } from "../../contexts/HtsContext";
import { useHtsSections } from "../../contexts/HtsSectionsContext";
import { htsCodeDigitsOnly } from "../../libs/hts-code";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { todayIso } from "../duty-calculator/lib/format";
import { Adjustments, productKey } from "./adjustments";
import { CatalogItem, NewProduct } from "./catalog";
import * as store from "./catalogStore";
import { FilterContext, FilterState } from "./filters";
import { CatalogEntry, findCountry } from "./parse";
import { TrackedProduct, trackProduct } from "./report";

// Everything the Tariff Tracker's sections share: the HTS data, the product catalog, each
// product's adjustments, the catalog's filters and the date rates are worked out for. Provided
// around every tab, so it carries over as the user moves between them.

// Where added products came from, for analytics
export type AddSource = "paste" | "csv" | "generated" | "example" | "calculator" | "tracker_calculator";

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
  // Remembered per product key (HTS code + country)
  setAdjustments: (key: string, patch: Adjustments) => void;
  resetAdjustments: (key: string) => void;
  // Kept while moving between tabs, not saved
  filters: FilterState;
  setFilter: (id: string, values: string[]) => void;
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
  // The saved catalog, shared with the calculator's "Add to catalog" (and other tabs)
  const { items, adjustments } = store.useCatalog();

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
    const { added, duplicates, withAdjustments } = store.addToCatalog(incoming);
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
  const filterContext = useMemo(() => ({ sections }), [sections]);

  // Debounced, so picking a date with the keyboard counts once
  const dateTimer = useRef<ReturnType<typeof setTimeout>>();
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
        setAdjustments,
        resetAdjustments,
        filters,
        setFilter,
        clearFilters,
        filterContext,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
};
