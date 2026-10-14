"use client";

import { useSyncExternalStore } from "react";
import {
  Adjustments,
  ADJUSTMENTS_KEY,
  cleanAdjustments,
  readAdjustments,
  writeAdjustments,
} from "./adjustments";
import {
  CATALOG_ITEMS_KEY,
  CatalogItem,
  CatalogItemMeta,
  itemKey,
  itemsFromText,
  LEGACY_TEXT_KEYS,
  mergeItems,
  NewProduct,
  readCatalog,
  writeCatalog,
} from "./catalog";

// The saved catalog, its products and their adjustments, for every page that uses it: the
// Tariff Tracker, and the calculator's "Add to catalog" on /duty-calculator. One copy in memory,
// kept in browser storage; components re-render when it changes, including from another tab.
// Signed in, the account's copy is the saved one (catalogSync.ts) and this is its cache.

export interface CatalogSnapshot {
  items: CatalogItem[];
  adjustments: Record<string, Adjustments>;
}

const EMPTY: CatalogSnapshot = { items: [], adjustments: {} };

let snapshot: CatalogSnapshot | null = null;
const listeners = new Set<() => void>();

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    // Unavailable (private mode): the catalog lives in memory for the visit
    return null;
  }
};

const load = (): CatalogSnapshot => {
  const s = storage();
  if (!s) return EMPTY;
  const stored = readCatalog(s.getItem(CATALOG_ITEMS_KEY));
  // A catalog from before it was a list of products: converted, and saved as one on the next change
  const legacy = stored ? null : LEGACY_TEXT_KEYS.map((key) => s.getItem(key)).find(Boolean);
  return {
    items: stored ?? (legacy ? itemsFromText(legacy) : []),
    adjustments: readAdjustments(s.getItem(ADJUSTMENTS_KEY)),
  };
};

const getSnapshot = () => (snapshot ??= load());

const notify = () => listeners.forEach((l) => l());

const save = (next: CatalogSnapshot) => {
  const previous = getSnapshot();
  snapshot = next;
  const s = storage();
  try {
    if (next.items !== previous.items) s?.setItem(CATALOG_ITEMS_KEY, writeCatalog(next.items));
    if (next.adjustments !== previous.adjustments) s?.setItem(ADJUSTMENTS_KEY, writeAdjustments(next.adjustments));
  } catch {
    // Full or unavailable: kept in memory
  }
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab changed it
  const onStorage = (e: StorageEvent) => {
    if (e.key === CATALOG_ITEMS_KEY || e.key === ADJUSTMENTS_KEY) {
      snapshot = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

// The catalog right now, outside React
export const getCatalog = () => getSnapshot();

// Every change from this tab (not other tabs, which save their own), outside React: for saving
// the catalog to the account
export const subscribeCatalog = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The whole catalog at once: the account's saved copy, loaded on sign-in
export const replaceCatalog = (next: CatalogSnapshot) => save(next);

// The catalog, in a component. Empty on the server and while hydrating, then the saved one.
export const useCatalog = () => useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

// ── Changes ──

// Adds products, skipping ones already in the catalog. Adjustments come with new products only:
// ones already there keep what they have.
export const addToCatalog = (incoming: NewProduct[]) => {
  const current = getSnapshot();
  const { items, added, duplicates } = mergeItems(current.items, incoming);
  const existing = new Set(current.items.map(itemKey));
  const brought = incoming.filter((p) => p.adjustments && !existing.has(itemKey(p)));
  let adjustments = current.adjustments;
  if (brought.length) {
    adjustments = { ...adjustments };
    brought.forEach((p) => {
      const merged = cleanAdjustments({ ...adjustments[itemKey(p)], ...p.adjustments });
      if (Object.keys(merged).length) adjustments[itemKey(p)] = merged;
    });
  }
  if (added || adjustments !== current.adjustments) save({ items, adjustments });
  return { added, duplicates, withAdjustments: brought.length };
};

// Their adjustments stay remembered, for if they're added back
export const removeFromCatalog = (keys: string[]) => {
  const current = getSnapshot();
  save({ ...current, items: current.items.filter((item) => !keys.includes(itemKey(item))) });
};

export const clearCatalog = () => save({ ...getSnapshot(), items: [] });

// Picks a product for the plan's coverage, or takes it out (see TrackerContext)
export const setProductCovered = (key: string, covered: boolean) => {
  const current = getSnapshot();
  save({ ...current, items: current.items.map((item) => (itemKey(item) === key ? { ...item, covered } : item)) });
};

// Shipments a year, or the origin it's moving to; undefined clears one
export const setProductMeta = (key: string, patch: CatalogItemMeta) => {
  const current = getSnapshot();
  save({
    ...current,
    items: current.items.map((item) => {
      if (itemKey(item) !== key) return item;
      const next = { ...item, ...patch };
      (Object.keys(patch) as (keyof CatalogItemMeta)[]).forEach((k) => next[k] === undefined && delete next[k]);
      return next;
    }),
  });
};

export const setProductAdjustments = (key: string, patch: Adjustments) => {
  const current = getSnapshot();
  const merged = cleanAdjustments({ ...current.adjustments[key], ...patch });
  const adjustments = { ...current.adjustments };
  if (Object.keys(merged).length) adjustments[key] = merged;
  else delete adjustments[key];
  save({ ...current, adjustments });
};

export const resetProductAdjustments = (key: string) => {
  const current = getSnapshot();
  if (!current.adjustments[key]) return;
  const adjustments = { ...current.adjustments };
  delete adjustments[key];
  save({ ...current, adjustments });
};
