"use client";

import { useEffect, useMemo, useState } from "react";
import { originRates } from "@/components/tariff-tracker/product/analysis/analysis";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { matchCases, type CaseMatch, type MatchableCase } from "@/libs/adcvd/match";
import type { Bilateral, TradeData } from "@/libs/sourcing/trade";
import { CapacityEntry, CapacityFile, sourcingRows } from "./model";

// Everything the Sourcing finder knows about one product: every country's duty (the engine, in the
// browser), what the US imported of it and how (/api/sourcing/trade, Census), who exports it to the
// world (the Atlas, one static file per chapter), and the AD/CVD cases that may cover it from the
// countries worth comparing (/api/adcvd/index). Each arrives on its own; the rows are redrawn as
// they do.

const capacityChapters = new Map<string, Promise<CapacityFile | null>>();
const loadCapacity = (chapter: string) => {
  if (!capacityChapters.has(chapter)) {
    capacityChapters.set(
      chapter,
      fetch(`/data/sourcing/capacity/${chapter}.json`)
        .then((r): Promise<CapacityFile> | null => (r.ok ? r.json() : null))
        .catch((): null => null)
    );
  }
  return capacityChapters.get(chapter)!;
};

type Load<T> = { data: T | null; ready: boolean };

// What the US imported of a 10-digit code (Census), loaded once per code. The route widens to the
// code's 8 digits or 6-digit subheading by itself when the code had no imports lately.
export const useTrade = (code: string | null): Load<TradeData> => {
  const key = code;
  const [state, setState] = useState<Load<TradeData> & { key: string | null }>({ data: null, ready: false, key: null });
  useEffect(() => {
    if (!code) return;
    let live = true;
    fetch(`/api/sourcing/trade?code=${code}`)
      .then((r): Promise<TradeData> | null => (r.ok ? r.json() : null))
      .catch((): null => null)
      .then((data) => live && setState({ data, ready: true, key: code }));
    return () => {
      live = false;
    };
  }, [code]);
  return state.key === key ? state : { data: null, ready: false };
};

const useCapacity = (code: string | null): Load<{ file: CapacityFile; entry: CapacityEntry | null }> => {
  const [state, setState] = useState<Load<{ file: CapacityFile; entry: CapacityEntry | null }> & { code: string | null }>({ data: null, ready: false, code: null });
  useEffect(() => {
    if (!code) return;
    let live = true;
    loadCapacity(code.slice(0, 2)).then((file) => live && setState({ data: file ? { file, entry: file.codes[code.slice(0, 6)] ?? null } : null, ready: true, code }));
    return () => {
      live = false;
    };
  }, [code]);
  return state.code === code ? state : { data: null, ready: false };
};

// A case as /api/adcvd/index sends it: what matching needs, and when it began
export type AdcvdCase = MatchableCase & { initiated_on: string | null; order_on: string | null };

// The AD/CVD cases of the countries worth comparing, matched to this code
const useAdcvd = (code: string | null, countries: string[]) => {
  const key = countries.slice().sort().join(",");
  const [cases, setCases] = useState<{ key: string; cases: AdcvdCase[] } | null>(null);
  useEffect(() => {
    if (!key) return;
    let live = true;
    fetch(`/api/adcvd/index?countries=${key}`)
      .then((r): Promise<{ cases: AdcvdCase[] }> | null => (r.ok ? r.json() : null))
      .catch((): null => null)
      .then((d) => live && setCases({ key, cases: d?.cases ?? [] }));
    return () => {
      live = false;
    };
  }, [key]);
  return useMemo(() => {
    if (!code || !cases || cases.key !== key) return null;
    const matches = new Map<string, CaseMatch[]>();
    key.split(",").forEach((country) => matches.set(country, matchCases(cases.cases, { code, country })));
    return { matches, cases: cases.cases };
  }, [cases, code, key]);
};

// The countries the AD/CVD lookup covers (its API takes 60 at most)
const ADCVD_COUNTRIES = 60;

// trade: useTrade's, loaded by the host (the product's quantity comes from it)
// code: the HTS code's digits, known before the product is (so world exports load alongside Census)
// bilateral: where each country's exports of the group go, once loaded (the mismatch flag's evidence)
export const useSourcing = (code: string | null, product: TrackedProduct | null, trade: Load<TradeData>, withAgreements: boolean, bilateral: Bilateral | null) => {
  // Every country's duty: about 200 calculations, on the product's own value and answers
  const rates = useMemo(() => (product ? originRates(product) : []), [product]);
  const capacity = useCapacity(code);

  // The largest US suppliers and world exporters
  const adcvdCountries = useMemo(() => {
    const us = Object.entries(trade.data?.countries ?? {})
      .sort((a, b) => b[1].last.value - a[1].last.value)
      .map(([c]) => c);
    const world = (capacity.data?.entry?.c ?? []).map(([c]) => c);
    return Array.from(new Set([...us.slice(0, 35), ...world.slice(0, 35)]))
      .filter((c) => c !== "US")
      .slice(0, ADCVD_COUNTRIES);
  }, [trade.data, capacity.data]);
  const adcvd = useAdcvd(code, trade.ready && capacity.ready ? adcvdCountries : []);

  const rows = useMemo(
    () =>
      product
        ? sourcingRows({ rates, withAgreements, trade: trade.data, capacity: capacity.data?.entry ?? null, htsno: product.entry.element.htsno, adcvd, worldYear: capacity.data?.file.year, bilateral })
        : [],
    [product, rates, withAgreements, trade.data, capacity.data, adcvd, bilateral]
  );
  // Looked up, or nothing to look up (no country ships or exports it)
  const adcvdReady = Boolean(adcvd) || (trade.ready && capacity.ready && adcvdCountries.length === 0);

  return {
    rows,
    trade: trade.data,
    capacity: capacity.data,
    ready: trade.ready && capacity.ready && rows.length > 0 && adcvdReady,
    capacityReady: capacity.ready,
    adcvdReady,
    // The cases that may cover this code, from any of those countries
    adcvdCases: adcvd ? adcvd.cases.filter((c) => Array.from(adcvd.matches.values()).some((m) => m.some((x) => x.case_number === c.case_number && x.level !== "history"))) : [],
  };
};

export type Sourcing = ReturnType<typeof useSourcing>;
