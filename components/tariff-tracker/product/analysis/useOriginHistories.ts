"use client";

import { useEffect, useMemo, useState } from "react";
import { TrackedProduct } from "../../report";
import { OriginRate } from "./analysis";
import { historyRange, OriginHistory, originHistory } from "./history";

// Every origin's rate history for a product. About half a second of work in all, so it runs in
// small batches after the tab is on screen, never freezing it; `progress` runs 0 to 1.

const BATCH = 20;

export const useOriginHistories = (product: TrackedProduct, rates: OriginRate[]) => {
  const range = useMemo(() => historyRange(), []);
  const [state, setState] = useState<{ key: TrackedProduct; histories: Map<string, OriginHistory> }>({
    key: product,
    histories: new Map(),
  });

  useEffect(() => {
    let cancelled = false;
    let index = 0;
    const histories = new Map<string, OriginHistory>();
    setState({ key: product, histories: new Map() });
    const step = () => {
      if (cancelled) return;
      rates.slice(index, index + BATCH).forEach((o) => histories.set(o.country.code, originHistory(product, o, range)));
      index += BATCH;
      setState({ key: product, histories: new Map(histories) });
      if (index < rates.length) setTimeout(step, 0);
    };
    const start = setTimeout(step, 0);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [product, rates, range]);

  const histories = state.key === product ? state.histories : new Map<string, OriginHistory>();
  return { range, histories, progress: rates.length ? histories.size / rates.length : 1, ready: histories.size >= rates.length };
};
