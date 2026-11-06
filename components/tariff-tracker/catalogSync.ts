"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { DEFAULT_LIST_ID, DEFAULT_LIST_NAME, ImportList, itemKey, mergeItems, newListId, NewProduct, readLists, StoredLists, writeLists } from "./catalog";
import { getCatalogState, getImportLists, hasUnsavedChanges, ListTarget, markCatalogSaved, replaceCatalog, setActiveList, subscribeCatalog } from "./catalogStore";

// Saves a signed-in user's catalog to their account (tracker_catalogs), so it follows them
// across devices. On sign-in:
// - a catalog built on this device before signing up (no owner yet) is merged into the
//   account's, so nothing made before the account is lost;
// - a catalog this device already holds for the account is only a cache: the account's wins,
//   unless the device has changes the account doesn't have yet (made outside Duty Guard, or
//   not saved before the page closed): then the device's is the newer copy, and it's saved;
// - another account's catalog on this device is replaced.
// After that, every change is saved a moment after it's made, and any save still waiting when the
// Duty Guard closes is sent then.
// Signed out, a catalog that belongs to an account is cleared from the device.

const OWNER_KEY = "hts-hero-tariff-tracker-owner";
const SAVE_DELAY = 800;

const readOwner = () => {
  try {
    return window.localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
};

const writeOwner = (owner: string | null) => {
  try {
    if (owner) window.localStorage.setItem(OWNER_KEY, owner);
    else window.localStorage.removeItem(OWNER_KEY);
  } catch {
    // Unavailable: the catalog still saves to the account
  }
};

// Stored in the same versioned shapes as on the device (catalog.ts writeLists): `items` holds every
// import once plus the lists, so whatever reads `items` (billing, the trial trigger, alerts) counts
// each import once
const toRow = (catalog: StoredLists) => {
  const written = writeLists(catalog);
  return { items: JSON.parse(written.items), adjustments: JSON.parse(written.adjustments) };
};

const fromRow = (row: { items: unknown; adjustments: unknown }): StoredLists =>
  readLists(JSON.stringify(row.items), JSON.stringify(row.adjustments)) ?? { lists: [], covered: {} };

const importCount = (catalog: StoredLists) => catalog.lists.reduce((n, l) => n + l.items.length, 0);

// The account's lists first, then anything made on this device that they don't have: a list the
// account also has (by id) gets the device's imports added, others are added whole. Adjustments
// and picks the account already has for an import win.
const merge = (account: StoredLists, device: StoredLists): StoredLists => {
  const lists = account.lists.map((l) => ({ ...l }));
  for (const d of device.lists) {
    if (!d.items.length) continue;
    const into = lists.find((l) => l.id === d.id);
    if (into) {
      into.items = mergeItems(into.items, d.items).items;
      into.adjustments = { ...d.adjustments, ...into.adjustments };
    } else lists.push(d);
  }
  return { lists, covered: { ...device.covered, ...account.covered } };
};

// What the device should hold once the account's copy is in, and whether to save it to the account
export const resolveCatalog = ({
  account,
  device,
  owner,
  userId,
  unsaved,
}: {
  // The account's saved copy, or null when it has none yet
  account: StoredLists | null;
  device: StoredLists;
  // Whose catalog the device holds: null for one made signed out
  owner: string | null;
  userId: string;
  // The device has changes the account doesn't
  unsaved: boolean;
}): { next: StoredLists; push: boolean } => {
  if (!account) return { next: device, push: true };
  if (owner === null) return { next: merge(account, device), push: importCount(device) > 0 };
  if (owner === userId && unsaved) return { next: device, push: true };
  return { next: account, push: false };
};

// Whose catalog this device has loaded from the account, this visit: until then a signed-in
// catalog that looks empty may just not be here yet (the import takeover waits for it)
let syncedFor: string | null = null;
const syncedListeners = new Set<() => void>();
const markSynced = (userId: string) => {
  syncedFor = userId;
  syncedListeners.forEach((l) => l());
};
const subscribeSynced = (l: () => void) => {
  syncedListeners.add(l);
  return () => {
    syncedListeners.delete(l);
  };
};
export const useCatalogSynced = (userId: string | null | undefined) =>
  useSyncExternalStore(subscribeSynced, () => Boolean(userId) && syncedFor === userId, () => false);

// userId: null when signed out; undefined while that's still being found out
export const useCatalogSync = (userId: string | null | undefined) => {
  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      if (readOwner()) {
        replaceCatalog({ lists: [{ id: DEFAULT_LIST_ID, name: DEFAULT_LIST_NAME, items: [], adjustments: {} }], covered: {} });
        writeOwner(null);
      }
      return;
    }

    const supabase = createSupabaseClient();
    let cancelled = false;
    let loaded = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const save = async () => {
      timer = undefined;
      const saving = getCatalogState();
      const { error } = await supabase
        .from("tracker_catalogs")
        .upsert({ user_id: userId, ...toRow(saving), updated_at: new Date().toISOString() });
      // Kept as unsaved, so the next sync tries again
      if (error) console.error("Error saving the catalog to the account:", error);
      // Unless it changed again while saving (that change's own save follows)
      else if (getCatalogState().lists === saving.lists && getCatalogState().covered === saving.covered) markCatalogSaved();
    };

    (async () => {
      const { data, error } = await supabase
        .from("tracker_catalogs")
        .select("items, adjustments")
        .eq("user_id", userId)
        .maybeSingle<{ items: unknown; adjustments: unknown }>();
      if (cancelled) return;
      // The account's copy is unknown: never overwrite it with this device's
      if (error) {
        console.error("Error loading the account's catalog:", error);
        return;
      }
      const device = getCatalogState();
      const owner = readOwner();
      const account = data ? fromRow(data) : null;
      const { next, push } = resolveCatalog({ account, device, owner, userId, unsaved: hasUnsavedChanges() });
      if (next.lists !== device.lists || next.covered !== device.covered) replaceCatalog(next);
      writeOwner(userId);
      loaded = true;
      markSynced(userId);
      if (push) await save();
      else markCatalogSaved();
      // Only when this device's imports actually went into the account (made before signing in),
      // not on every load
      if (owner === null && importCount(device) > 0 && push) {
        trackEvent(MixpanelEvent.DUTY_GUARD_CATALOG_SYNCED, {
          products: importCount(next),
          from_device: importCount(device),
          account_had_catalog: Boolean(account),
        });
      }
    })();

    const unsubscribe = subscribeCatalog(() => {
      if (!loaded) return;
      clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY);
    });

    // A save still waiting goes now: leaving the page, or Duty Guard closing
    const flush = () => {
      if (timer === undefined) return;
      clearTimeout(timer);
      void save();
    };
    const onHide = () => document.visibilityState === "hidden" && flush();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);

    return () => {
      cancelled = true;
      unsubscribe();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [userId]);
};

// Adds imports to a signed-in account's saved catalog straight away, from outside Duty Guard (the
// calculator's "Stop Overpaying", which keeps the visitor on the calculator): the account's copy
// plus these, in the list they picked (by id, or a new one by name; the list shown on this device
// when neither), so alerts start on them without waiting for the next Duty Guard visit. Adjustments
// the account already has for an import win, as in merge. Best effort: the device keeps them too
// (addToCatalog, called first, with the same target), and the next sync saves them if this fails.
export const addToAccountCatalog = async (userId: string, products: NewProduct[], target: ListTarget = {}) => {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from("tracker_catalogs")
    .select("items, adjustments")
    .eq("user_id", userId)
    .maybeSingle<{ items: unknown; adjustments: unknown }>();
  if (error) throw error;
  const account = data ? fromRow(data) : { lists: [], covered: {} };
  const now = new Date().toISOString();
  const incoming = products.map(({ adjustments: _adjustments, ...item }) => ({ ...item, addedAt: now }));
  const adjustments = Object.fromEntries(products.filter((p) => p.adjustments).map((p) => [itemKey(p), p.adjustments!]));
  // The device's list of that id or name (addToCatalog made it), so both copies agree
  const deviceLists = getImportLists();
  const name = target.newListName?.trim();
  const deviceList = target.listId
    ? deviceLists.lists.find((l) => l.id === target.listId)
    : name
      ? deviceLists.lists.find((l) => l.name.toLowerCase() === name.toLowerCase())
      : deviceLists.lists.find((l) => l.id === deviceLists.activeId);
  const id = deviceList?.id ?? target.listId ?? (name ? newListId() : DEFAULT_LIST_ID);
  const lists: ImportList[] = account.lists.length ? account.lists.map((l) => ({ ...l })) : [];
  let list = lists.find((l) => l.id === id) ?? (name ? lists.find((l) => l.name.toLowerCase() === name.toLowerCase()) : undefined);
  if (!list) {
    list = { id, name: deviceList?.name ?? name ?? DEFAULT_LIST_NAME, createdAt: now, items: [], adjustments: {} };
    lists.push(list);
  }
  list.items = mergeItems(list.items, incoming).items;
  list.adjustments = { ...adjustments, ...list.adjustments };
  const { error: saveError } = await supabase
    .from("tracker_catalogs")
    .upsert({ user_id: userId, ...toRow({ lists, covered: account.covered }), updated_at: now });
  if (saveError) throw saveError;
  setActiveList(list.id);
};
