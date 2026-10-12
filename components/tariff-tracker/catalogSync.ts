"use client";

import { useEffect } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { readAdjustments, writeAdjustments } from "./adjustments";
import { mergeItems, readCatalog, writeCatalog } from "./catalog";
import { CatalogSnapshot, getCatalog, replaceCatalog, subscribeCatalog } from "./catalogStore";

// Saves a signed-in user's catalog to their account (tracker_catalogs), so it follows them
// across devices. On sign-in:
// - a catalog built on this device before signing up (no owner yet) is merged into the
//   account's, so nothing made before the account is lost;
// - a catalog this device already holds for the account is only a cache: the account's wins;
// - another account's catalog on this device is replaced.
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
      const { error } = await supabase
        .from("tracker_catalogs")
        .upsert({ user_id: userId, ...toRow(getCatalog()), updated_at: new Date().toISOString() });
      if (error) console.error("Error saving the catalog to the account:", error);
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
      const next = !account ? device : owner === null ? merge(account, device) : account;
      if (next !== device) replaceCatalog(next);
      writeOwner(userId);
      loaded = true;
      if (!account || (owner === null && device.items.length > 0)) await save();
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

    return () => {
      cancelled = true;
      unsubscribe();
      clearTimeout(timer);
    };
  }, [userId]);
};
