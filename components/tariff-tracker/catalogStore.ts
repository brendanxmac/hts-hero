"use client";

import { useSyncExternalStore } from "react";
import { Adjustments, ADJUSTMENTS_KEY, cleanAdjustments, readAdjustments } from "./adjustments";
import {
  CATALOG_ITEMS_KEY,
  CatalogItem,
  CatalogItemMeta,
  DEFAULT_LIST_ID,
  DEFAULT_LIST_NAME,
  ImportList,
  itemKey,
  itemsFromText,
  LEGACY_TEXT_KEYS,
  mergeItems,
  newListId,
  NewProduct,
  readLists,
  StoredLists,
  unionAdjustments,
  unionItems,
  writeLists,
} from "./catalog";

// The saved catalog, its lists of imports and their adjustments, for every page that uses it: the
// Duty Guard, and the "Add to Duty Guard" buttons elsewhere (the calculator, HTS pages). One copy
// in memory, kept in browser storage; components re-render when it changes, including from another
// tab. Signed in, the account's copy is the saved one (catalogSync.ts) and this is its cache.
// Duty Guard shows one list at a time (the active one, picked on this device): useCatalog is that
// list, with the plan's picks; useAllImports is every list's imports, each once (what the plan counts).

export interface CatalogSnapshot {
  items: CatalogItem[];
  adjustments: Record<string, Adjustments>;
}

export interface CatalogState extends StoredLists {
  // The list shown, on this device (it may name one that isn't here yet: the account's lists load
  // after a link to one; the first list is shown until then)
  activeId: string;
}

// Where products go: a list by id, or a new list by name (the active list when neither)
export interface ListTarget {
  listId?: string;
  newListName?: string;
}

const emptyList = (): ImportList => ({ id: DEFAULT_LIST_ID, name: DEFAULT_LIST_NAME, items: [], adjustments: {} });
const EMPTY_STATE: CatalogState = { lists: [emptyList()], covered: {}, activeId: DEFAULT_LIST_ID };
const EMPTY: CatalogSnapshot = { items: [], adjustments: {} };

// Set by every change made on this device, cleared once the account has it (catalogSync.ts): a
// change made where the catalog isn't synced (the calculator's "Track this import", the Tariff
// Monitor) or not saved yet (the page closed first, the save failed) is newer than the account's
// copy, so it's kept and saved on the next sync instead of being replaced by the account's
const UNSAVED_KEY = "hts-hero-tariff-tracker-unsaved";
// The list shown on this device
const ACTIVE_LIST_KEY = "hts-hero-tariff-tracker-active-list";

let state: CatalogState | null = null;
const listeners = new Set<() => void>();

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    // Unavailable (private mode): the catalog lives in memory for the visit
    return null;
  }
};

const load = (): CatalogState => {
  const s = storage();
  if (!s) return EMPTY_STATE;
  const stored = readLists(s.getItem(CATALOG_ITEMS_KEY), s.getItem(ADJUSTMENTS_KEY));
  const activeId = s.getItem(ACTIVE_LIST_KEY) ?? DEFAULT_LIST_ID;
  if (stored) return { ...stored, activeId };
  // A catalog from before it was a list of products: converted, and saved as one on the next change
  const legacy = LEGACY_TEXT_KEYS.map((key) => s.getItem(key)).find(Boolean);
  return {
    lists: [{ ...emptyList(), items: legacy ? itemsFromText(legacy) : [], adjustments: readAdjustments(s.getItem(ADJUSTMENTS_KEY)) }],
    covered: {},
    activeId,
  };
};

const getState = () => (state ??= load());

// The list shown: the active one, or the first when it isn't here
const activeOf = (st: CatalogState) => st.lists.find((l) => l.id === st.activeId) ?? st.lists[0] ?? emptyList();

// Views of the state, kept while it doesn't change (useSyncExternalStore compares them)
let viewFor: CatalogState | null = null;
let view: CatalogSnapshot = EMPTY;
let allView: CatalogSnapshot = EMPTY;
let listsView: ListsView = { lists: [], activeId: DEFAULT_LIST_ID };
const views = () => {
  const st = getState();
  if (viewFor !== st) {
    viewFor = st;
    const active = activeOf(st);
    view = {
      items: active.items.map((i) => (st.covered[itemKey(i)] === undefined ? i : { ...i, covered: st.covered[itemKey(i)] })),
      adjustments: active.adjustments,
    };
    allView = { items: unionItems(st.lists, st.covered), adjustments: unionAdjustments(st.lists) };
    listsView = { lists: st.lists.map((l) => ({ id: l.id, name: l.name, count: l.items.length })), activeId: active.id };
  }
  return { view, allView, listsView };
};

const notify = () => listeners.forEach((l) => l());

// `local`: a change made on this device, which the account doesn't have yet
const save = (next: CatalogState, local = true) => {
  const previous = getState();
  state = next;
  const s = storage();
  try {
    if (next.lists !== previous.lists || next.covered !== previous.covered) {
      const written = writeLists(next);
      s?.setItem(CATALOG_ITEMS_KEY, written.items);
      s?.setItem(ADJUSTMENTS_KEY, written.adjustments);
      if (local) s?.setItem(UNSAVED_KEY, "1");
    }
    if (next.activeId !== previous.activeId) s?.setItem(ACTIVE_LIST_KEY, next.activeId);
  } catch {
    // Full or unavailable: kept in memory
  }
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  // Another tab changed it (the list shown stays this tab's)
  const onStorage = (e: StorageEvent) => {
    if (e.key === CATALOG_ITEMS_KEY || e.key === ADJUSTMENTS_KEY) {
      const activeId = getState().activeId;
      state = { ...load(), activeId };
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

// The list shown right now, outside React
export const getCatalog = () => views().view;
// Every list and the picks, outside React: for saving the catalog to the account
export const getCatalogState = () => getState();

// Every change from this tab (not other tabs, which save their own), outside React: for saving
// the catalog to the account
export const subscribeCatalog = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// The whole catalog at once: the account's saved copy, loaded on sign-in (nothing new to save)
export const replaceCatalog = (next: StoredLists) => save({ ...next, activeId: getState().activeId }, false);

// Whether this device has changes the account doesn't have yet, and marking that it has them all
export const hasUnsavedChanges = () => {
  try {
    return storage()?.getItem(UNSAVED_KEY) === "1";
  } catch {
    return false;
  }
};

export const markCatalogSaved = () => {
  try {
    storage()?.removeItem(UNSAVED_KEY);
  } catch {
    // Unavailable: nothing was kept
  }
};

// The list shown, in a component. Empty on the server and while hydrating, then the saved one.
export const useCatalog = () => useSyncExternalStore(subscribe, () => views().view, () => EMPTY);

// Every list's imports, each code and country once, with the plan's picks: what the plan counts
export const useAllImports = () => useSyncExternalStore(subscribe, () => views().allView, () => EMPTY);

export interface ListSummary {
  id: string;
  name: string;
  // Imports in it
  count: number;
}
export interface ListsView {
  lists: ListSummary[];
  activeId: string;
}
const EMPTY_LISTS: ListsView = { lists: [], activeId: DEFAULT_LIST_ID };
export const useImportLists = () => useSyncExternalStore(subscribe, () => views().listsView, () => EMPTY_LISTS);
export const getImportLists = () => views().listsView;

// ── Lists ──

// The imports already in a list (by key), or in the one a new name would add to
export const keysInTarget = (target: ListTarget) => {
  const st = getState();
  const list = target.newListName !== undefined ? findListByName(target.newListName) : (st.lists.find((l) => l.id === target.listId) ?? activeOf(st));
  return new Set((list?.items ?? []).map(itemKey));
};

const cleanName = (name: string) => name.trim().replace(/\s+/g, " ").slice(0, 80);

// A name not already taken (case aside), for a new list
const uniqueName = (lists: ImportList[], name: string) => {
  const taken = new Set(lists.map((l) => l.name.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  for (let n = 2; ; n++) if (!taken.has(`${name} (${n})`.toLowerCase())) return `${name} (${n})`;
};

// The list a name already belongs to (case aside)
export const findListByName = (name: string) => {
  const clean = cleanName(name).toLowerCase();
  return getState().lists.find((l) => l.name.toLowerCase() === clean);
};

// A new, empty list, shown straight away; its id
export const createList = (name: string, show = true) => {
  const current = getState();
  const list: ImportList = { id: newListId(), name: uniqueName(current.lists, cleanName(name) || "New List"), createdAt: new Date().toISOString(), items: [], adjustments: {} };
  save({ ...current, lists: [...current.lists, list], activeId: show ? list.id : current.activeId });
  return list.id;
};

export const renameList = (id: string, name: string) => {
  const clean = cleanName(name);
  const current = getState();
  if (!clean) return;
  save({ ...current, lists: current.lists.map((l) => (l.id === id ? { ...l, name: uniqueName(current.lists.filter((o) => o.id !== id), clean) } : l)) });
};

// Its imports that are in no other list go with it (and stop counting for the plan). The last list
// can't go: it's emptied instead.
export const deleteList = (id: string) => {
  const current = getState();
  const rest = current.lists.filter((l) => l.id !== id);
  const lists = rest.length ? rest : [{ ...emptyList(), name: current.lists[0]?.name ?? DEFAULT_LIST_NAME, id: current.lists[0]?.id ?? DEFAULT_LIST_ID }];
  const activeId = current.activeId === id || !rest.length ? lists[0].id : current.activeId;
  save({ ...current, lists, covered: pruneCovered(lists, current.covered), activeId });
};

export const setActiveList = (id: string) => {
  const current = getState();
  if (current.activeId !== id) save({ ...current, activeId: id });
};

// The picks for imports still in a list
const pruneCovered = (lists: ImportList[], covered: Record<string, boolean>) => {
  const keys = new Set(lists.flatMap((l) => l.items.map(itemKey)));
  const next = Object.fromEntries(Object.entries(covered).filter(([k]) => keys.has(k)));
  return Object.keys(next).length === Object.keys(covered).length ? covered : next;
};

// A change to the list shown
const updateActive = (change: (list: ImportList) => ImportList, covered?: (lists: ImportList[], was: Record<string, boolean>) => Record<string, boolean>) => {
  const current = getState();
  const active = activeOf(current);
  const lists = current.lists.length ? current.lists.map((l) => (l.id === active.id ? change(l) : l)) : [change(active)];
  save({ ...current, lists, covered: covered ? covered(lists, current.covered) : current.covered });
};

// ── Changes ──

// Adds products to a list (the one shown, or `target`: an existing list, or a new one by name),
// skipping ones already in it, and shows that list. Adjustments come with new products only: ones
// already there keep what they have.
export const addToCatalog = (incoming: NewProduct[], target: ListTarget = {}) => {
  let current = getState();
  let listId = target.listId ?? activeOf(current).id;
  if (target.newListName?.trim()) {
    const existing = findListByName(target.newListName);
    listId = existing ? existing.id : createList(target.newListName, false);
    current = getState();
  }
  const list = current.lists.find((l) => l.id === listId) ?? activeOf(current);
  const now = new Date().toISOString();
  const { items, added, duplicates } = mergeItems(
    list.items,
    incoming.map((p) => ({ ...p, addedAt: now }))
  );
  const existing = new Set(list.items.map(itemKey));
  const brought = incoming.filter((p) => p.adjustments && !existing.has(itemKey(p)));
  let adjustments = list.adjustments;
  if (brought.length) {
    adjustments = { ...adjustments };
    brought.forEach((p) => {
      const merged = cleanAdjustments({ ...adjustments[itemKey(p)], ...p.adjustments });
      if (Object.keys(merged).length) adjustments[itemKey(p)] = merged;
    });
  }
  const changed = added > 0 || adjustments !== list.adjustments;
  if (changed || current.activeId !== list.id)
    save({ ...current, lists: changed ? current.lists.map((l) => (l.id === list.id ? { ...l, items, adjustments } : l)) : current.lists, activeId: list.id });
  return { added, duplicates, withAdjustments: brought.length, listId: list.id, listName: list.name };
};

// From the list shown. Their adjustments stay remembered, for if they're added back.
export const removeFromCatalog = (keys: string[]) =>
  updateActive((l) => ({ ...l, items: l.items.filter((item) => !keys.includes(itemKey(item))) }), pruneCovered);

export const clearCatalog = () => updateActive((l) => ({ ...l, items: [] }), pruneCovered);

// Picks an import for the plan's coverage, or takes it out (see TrackerContext): across every list
export const setProductCovered = (key: string, covered: boolean) => {
  const current = getState();
  save({ ...current, covered: { ...current.covered, [key]: covered } });
};

// Several imports' tracking at once (product key → tracked or not)
export const setProductsCovered = (changes: Record<string, boolean>) => {
  const current = getState();
  save({ ...current, covered: { ...current.covered, ...changes } });
};

// Shipments a year, or the origin it's moving to; undefined clears one
export const setProductMeta = (key: string, patch: CatalogItemMeta) =>
  updateActive((l) => ({
    ...l,
    items: l.items.map((item) => {
      if (itemKey(item) !== key) return item;
      const next = { ...item, ...patch };
      (Object.keys(patch) as (keyof CatalogItemMeta)[]).forEach((k) => next[k] === undefined && delete next[k]);
      return next;
    }),
  }));

const withAdjustments = (change: (adjustments: Record<string, Adjustments>) => Record<string, Adjustments> | null) =>
  updateActive((l) => {
    const adjustments = change(l.adjustments);
    return adjustments ? { ...l, adjustments } : l;
  });

export const setProductAdjustments = (key: string, patch: Adjustments) =>
  withAdjustments((was) => {
    const merged = cleanAdjustments({ ...was[key], ...patch });
    const adjustments = { ...was };
    if (Object.keys(merged).length) adjustments[key] = merged;
    else delete adjustments[key];
    return adjustments;
  });

// Back to the defaults the duty is worked out with; AD/CVD answers and reviews stay
export const resetProductAdjustments = (key: string) =>
  withAdjustments((was) => {
    if (!was[key]) return null;
    const adjustments = { ...was };
    const { adcvd, reviewed } = was[key];
    if (adcvd || reviewed) adjustments[key] = { ...(adcvd ? { adcvd } : {}), ...(reviewed ? { reviewed } : {}) };
    else delete adjustments[key];
    return adjustments;
  });

// A tariff action marked reviewed (or not) on each of the imports it may affect, in one save
export const setActionReviewed = (slug: string, keys: string[], on: boolean) =>
  withAdjustments((was) => {
    const adjustments = { ...was };
    const day = new Date().toISOString().slice(0, 10);
    for (const key of keys) {
      const prev = adjustments[key] ?? {};
      const reviewed = { ...prev.reviewed };
      if (on) reviewed[slug] = day;
      else delete reviewed[slug];
      const merged = cleanAdjustments({ ...prev, reviewed });
      if (Object.keys(merged).length) adjustments[key] = merged;
      else delete adjustments[key];
    }
    return adjustments;
  });
