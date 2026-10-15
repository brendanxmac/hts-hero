"use client";

import { useEffect, useMemo, useState } from "react";
import { dutyOn, importImpacts, type ImpactUpdate, type ImportImpact } from "@/libs/tariff-updates/impactOf";
import { useTracker } from "../TrackerContext";

// What one tariff update does to each of the user's imports, worked out here in the browser with
// the same code the alerts use (libs/tariff-updates/impactOf.ts): any update, every import, the
// moment it's added. A big catalog is worked out a slice at a time, so the page stays responsive
// and shows how far along it is; each update's answer is kept until the catalog changes.

const SLICE = 40;

export interface UpdateImpactState {
  // null while it's worked out
  impacts: ImportImpact[] | null;
  // 0 to 1
  progress: number;
}

export const useUpdateImpact = (update: ImpactUpdate | null): UpdateImpactState => {
  const { items, products, loading } = useTracker();
  // The engine's answers by import and day, and each update's impacts, for this catalog
  const engine = useMemo(() => ({ on: dutyOn(), done: new Map<string, ImportImpact[]>() }), [products]);
  const [state, setState] = useState<UpdateImpactState & { id: string | null }>({ id: null, impacts: null, progress: 0 });

  useEffect(() => {
    if (!update || loading) return;
    const cached = engine.done.get(update.id);
    if (cached) {
      setState({ id: update.id, impacts: cached, progress: 1 });
      return;
    }
    let cancelled = false;
    setState({ id: update.id, impacts: null, progress: 0 });
    const out: ImportImpact[] = [];
    let at = 0;
    const step = () => {
      if (cancelled) return;
      const slice = products.slice(at, at + SLICE);
      const keys = new Set(slice.map((p) => p.key));
      out.push(...importImpacts(update, items.filter((i) => keys.has(`${i.code}-${i.country}`)), slice, engine.on));
      at += SLICE;
      if (at < products.length) {
        setState({ id: update.id, impacts: null, progress: at / products.length });
        setTimeout(step, 0);
      } else {
        engine.done.set(update.id, out);
        setState({ id: update.id, impacts: out, progress: 1 });
      }
    };
    step();
    return () => {
      cancelled = true;
    };
  }, [update, engine, items, products, loading]);

  return update && state.id === update.id ? state : { impacts: null, progress: 0 };
};
