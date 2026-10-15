"use client";

import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/libs/supabase/client";
import type { Authority, Kind, Stage } from "@/libs/tariff-updates/types";

// The latest published tariff updates (/tariff-updates), read straight from Supabase: published
// updates are public through row-level security. Loaded once per visit and shared by every
// component that asks.

export interface TrackerUpdate {
  slug: string;
  title: string;
  kind: Kind;
  authority: Authority;
  countries: string[];
  hts_codes: string[];
  effective_on: string | null;
  stage: Stage;
  last_activity_at: string;
}

const DAYS = 45;
const LIMIT = 12;

let cache: Promise<TrackerUpdate[]> | null = null;

const load = () =>
  (cache ??= (async () => {
    const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
    const { data, error } = await createSupabaseClient()
      .from("tariff_updates")
      .select("slug, title, kind, authority, countries, hts_codes, effective_on, stage, last_activity_at")
      .eq("status", "published")
      .gte("last_activity_at", since)
      .order("last_activity_at", { ascending: false })
      .limit(LIMIT);
    if (error) {
      cache = null;
      throw new Error(error.message);
    }
    return (data ?? []) as TrackerUpdate[];
  })());

export const useTariffUpdates = () => {
  const [updates, setUpdates] = useState<TrackerUpdate[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    load()
      .then((u) => !cancelled && setUpdates(u))
      .catch(() => !cancelled && setUpdates([]));
    return () => {
      cancelled = true;
    };
  }, []);
  return updates;
};
