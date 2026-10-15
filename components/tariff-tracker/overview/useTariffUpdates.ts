"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import type { Authority, Kind, Stage } from "@/libs/tariff-updates/types";

// Published tariff updates (/tariff-updates), read straight from Supabase: published updates are
// public through row-level security. Two views, each loaded once per visit and shared by every
// component that asks: the recent ones (the Overview's news tape) and the full list with
// summaries (the Tariff news tab).

export interface TrackerUpdate {
  id: string;
  slug: string;
  title: string;
  summary: string;
  kind: Kind;
  authority: Authority;
  countries: string[];
  hts_codes: string[];
  products: string | null;
  effective_on: string | null;
  stage: Stage;
  first_seen_at: string;
  last_activity_at: string;
  scope_codes: string[] | null;
  scope_excluded_codes: string[] | null;
  scope_countries: string[] | null;
  scope_excluded_countries: string[] | null;
  scope_headings: string[] | null;
}

const COLUMNS =
  "id, slug, title, summary, kind, authority, countries, hts_codes, products, effective_on, stage, first_seen_at, last_activity_at, scope_codes, scope_excluded_codes, scope_countries, scope_excluded_countries, scope_headings";

const VIEWS = {
  recent: { days: 45, limit: 12 },
  all: { days: null, limit: 500 },
} as const;

type View = keyof typeof VIEWS;

const cache: Partial<Record<View, Promise<TrackerUpdate[]>>> = {};

const load = (view: View) =>
  (cache[view] ??= (async () => {
    const { days, limit } = VIEWS[view];
    let query = createSupabaseClient().from("tariff_updates").select(COLUMNS).eq("status", "published");
    if (days) query = query.gte("last_activity_at", new Date(Date.now() - days * 86_400_000).toISOString());
    const { data, error } = await query.order("last_activity_at", { ascending: false }).limit(limit);
    if (error) {
      delete cache[view];
      throw new Error(error.message);
    }
    return (data ?? []) as TrackerUpdate[];
  })());

// null while loading; [] when there are none or they couldn't be loaded
export const useTariffUpdates = (view: View = "recent") => {
  const [updates, setUpdates] = useState<TrackerUpdate[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    load(view)
      .then((u) => !cancelled && setUpdates(u))
      .catch(() => !cancelled && setUpdates([]));
    return () => {
      cancelled = true;
    };
  }, [view]);
  return updates;
};

// When the user last opened the Tariff news tab, for the sidebar's "N new" (this browser only)
const SEEN_KEY = "tt-news-seen";
const seenListeners = new Set<() => void>();

export const newsSeenAt = () => {
  try {
    return window.localStorage.getItem(SEEN_KEY);
  } catch {
    return null;
  }
};

export const markNewsSeen = () => {
  try {
    window.localStorage.setItem(SEEN_KEY, new Date().toISOString());
  } catch {
    // Private mode: the count just stays
  }
  seenListeners.forEach((l) => l());
};

export const onNewsSeen = (listener: () => void) => {
  seenListeners.add(listener);
  return () => {
    seenListeners.delete(listener);
  };
};
