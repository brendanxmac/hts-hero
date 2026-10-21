"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { createSupabaseClient } from "@/libs/supabase/client";
import { matchCatalog } from "@/libs/tariff-updates/match";
import { useTracker } from "../TrackerContext";
import type { TrackerUpdate } from "../overview/useTariffUpdates";

// Which of the user's imports each tariff update may affect: confirmed by the duty engine on the
// server (tariff_update_impacts, signed in), and likely or possible from what the update names,
// worked out here from the catalog (libs/tariff-updates/match.ts), so it also works signed out
// and the moment an import is added.

export interface ImportMatch {
  confirmed: number;
  likely: number;
  possible: number;
  // Confirmed: the change in duty on one shipment, added up across the imports
  deltaUsd: number;
  // The imports it affects or may affect (confirmed and likely), by key
  keys: string[];
}

interface ImpactRow {
  update_id: string;
  product_key: string;
  level: "confirmed" | "likely" | "possible";
  delta_usd: number | null;
}

export const useImportMatches = (updates: TrackerUpdate[] | null) => {
  const { items } = useTracker();
  const { user } = useUser();
  const [confirmed, setConfirmed] = useState<ImpactRow[]>([]);

  useEffect(() => {
    if (!user?.id) return setConfirmed([]);
    let cancelled = false;
    createSupabaseClient()
      .from("tariff_update_impacts")
      .select("update_id, product_key, level, delta_usd")
      .eq("level", "confirmed")
      .then(({ data }) => !cancelled && setConfirmed((data ?? []) as ImpactRow[]));
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return useMemo(() => {
    const out = new Map<string, ImportMatch>();
    if (!updates?.length || !items.length) return out;
    const keys = new Set(items.map((i) => `${i.code}-${i.country}`));
    const named = matchCatalog(updates, items);
    for (const u of updates) {
      // Only imports still in the catalog
      const sure = confirmed.filter((r) => r.update_id === u.id && keys.has(r.product_key));
      const sureKeys = new Set(sure.map((r) => r.product_key));
      const m = named.get(u.slug);
      const likely = (m?.likely ?? []).filter((k) => !sureKeys.has(k)).length;
      const possible = (m?.possible ?? []).filter((k) => !sureKeys.has(k)).length;
      if (!sure.length && !likely && !possible) continue;
      out.set(u.slug, {
        confirmed: sure.length,
        likely,
        possible,
        deltaUsd: sure.reduce((sum, r) => sum + Number(r.delta_usd ?? 0), 0),
        keys: [...sureKeys, ...(m?.likely ?? []).filter((k) => !sureKeys.has(k))],
      });
    }
    return out;
  }, [updates, items, confirmed]);
};

// "Raises duty on 3 of your imports", "May affect 2 of your imports", "Your countries". No
// dollars: they'd add up each import's value (often the $10,000 default); the import pages show
// each rate before and after
export const matchLabel = (m: ImportMatch) => {
  const affected = m.confirmed + m.likely;
  if (m.confirmed) {
    const delta = Math.round(m.deltaUsd);
    const verb = delta > 0 ? "Raises duty on" : delta < 0 ? "Lowers duty on" : "Affects";
    return { text: `${verb} ${affected} of your imports`, tone: delta < 0 ? ("success" as const) : ("error" as const) };
  }
  if (m.likely) return { text: `May affect ${m.likely} of your imports`, tone: "warning" as const };
  return { text: "Your countries", tone: "primary" as const };
};
