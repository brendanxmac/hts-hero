"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { readAdjustments, writeAdjustments } from "./adjustments";
import { mergeItems, readCatalog, writeCatalog } from "./catalog";
import { CatalogSnapshot, getCatalog, hasUnsavedChanges, markCatalogSaved, replaceCatalog, subscribeCatalog } from "./catalogStore";

// Saves a signed-in user's catalog to their account (tracker_catalogs), so it follows them
// across devices. On sign-in:
// - a catalog built on this device before signing up (no owner yet) is merged into the
//   account's, so nothing made before the account is lost;
// - a catalog this device already holds for the account is only a cache: the account's wins,
//   unless the device has changes the account doesn't have yet (made outside the Tracker, or
//   not saved before the page closed): then the device's is the newer copy, and it's saved;
// - another account's catalog on this device is replaced.
// After that, every change is saved a moment after it's made, and any save still waiting when the
// Tracker closes is sent then.
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

// Stored in the same versioned shapes as on the device
const toRow = (snapshot: CatalogSnapshot) => ({
  items: JSON.parse(writeCatalog(snapshot.items)),
  adjustments: JSON.parse(writeAdjustments(snapshot.adjustments)),
});

const fromRow = (row: { items: unknown; adjustments: unknown }): CatalogSnapshot => ({
  items: readCatalog(JSON.stringify(row.items)) ?? [],
  adjustments: readAdjustments(JSON.stringify(row.adjustments)),
});

// The account's catalog first, then anything made on this device that it doesn't have.
// Adjustments the account already has for a product win.
const merge = (account: CatalogSnapshot, device: CatalogSnapshot): CatalogSnapshot => ({
  items: mergeItems(account.items, device.items).items,
  adjustments: { ...device.adjustments, ...account.adjustments },
});

// What the device should hold once the account's copy is in, and whether to save it to the account
export const resolveCatalog = ({
  account,
  device,
  owner,
  userId,
  unsaved,
}: {
  // The account's saved copy, or null when it has none yet
  account: CatalogSnapshot | null;
  device: CatalogSnapshot;
  // Whose catalog the device holds: null for one made signed out
  owner: string | null;
  userId: string;
  // The device has changes the account doesn't
  unsaved: boolean;
}): { next: CatalogSnapshot; push: boolean } => {
  if (!account) return { next: device, push: true };
  if (owner === null) return { next: merge(account, device), push: device.items.length > 0 };
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
        replaceCatalog({ items: [], adjustments: {} });
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
      const saving = getCatalog();
      const { error } = await supabase
        .from("tracker_catalogs")
        .upsert({ user_id: userId, ...toRow(saving), updated_at: new Date().toISOString() });
      // Kept as unsaved, so the next sync tries again
      if (error) console.error("Error saving the catalog to the account:", error);
      // Unless it changed again while saving (that change's own save follows)
      else if (getCatalog() === saving) markCatalogSaved();
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
      const device = getCatalog();
      const owner = readOwner();
      const account = data ? fromRow(data) : null;
      const { next, push } = resolveCatalog({ account, device, owner, userId, unsaved: hasUnsavedChanges() });
      if (next !== device) replaceCatalog(next);
      writeOwner(userId);
      loaded = true;
      markSynced(userId);
      if (push) await save();
      else markCatalogSaved();
      trackEvent(MixpanelEvent.TARIFF_TRACKER_CATALOG_SYNCED, {
        products: next.items.length,
        merged_from_device: owner === null && device.items.length > 0,
      });
    })();

    const unsubscribe = subscribeCatalog(() => {
      if (!loaded) return;
      clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY);
    });

    // A save still waiting goes now: leaving the page, or the Tracker closing
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
