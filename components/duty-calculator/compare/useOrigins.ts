"use client";

import { useMemo } from "react";
import { SERIES_COLORS } from "@/components/ui/theme";
import { originRates, partsOf, supplierCodes } from "@/components/tariff-tracker/product/analysis/analysis";
import { useOriginHistories } from "@/components/tariff-tracker/product/analysis/useOriginHistories";
import { programColors } from "@/components/tariff-tracker/programColors";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { useUsImports } from "../lib/usImports";

// Everything the Compare tab knows about a product's origins, worked out once for all its views:
// every country's rate today (about 200 calculations), which ones the US imports it from and how
// much (Census), every origin's rate history (in the background), and the tariff colors (today's
// tariffs as everywhere else, and any that only applied on an earlier date, so a past date's bars
// are colored too)

export const useOrigins = (product: TrackedProduct) => {
  const rates = useMemo(() => originRates(product), [product]);
  const imports = useUsImports(product.entry.element.htsno);
  const suppliers = useMemo(() => supplierCodes(imports), [imports]);
  const { range, histories, progress, ready } = useOriginHistories(product, rates);
  const colors = useMemo(() => {
    const today = programColors(rates.flatMap((r) => [{ parts: partsOf(r, "standard") }, { parts: partsOf(r, "agreements") }]));
    if (!ready) return today;
    // Today's tariffs keep their colors; ones that only applied on an earlier date get one too
    const past = programColors(Array.from(histories.values()).flatMap((h) => [...h.standard, ...(h.agreement ?? [])]).map((s) => ({ parts: s.parts })));
    return { ...past, ...today };
  }, [rates, ready, histories]);
  return { rates, imports, suppliers, range, histories, progress, ready, colors };
};

export type Origins = ReturnType<typeof useOrigins>;

// Each compared country's own color, by its place in Compare (the import's own origin first, so
// it's always the first series color), the same in every view
export const compareColors = (codes: string[]) => Object.fromEntries(codes.map((code, i) => [code, SERIES_COLORS[i % SERIES_COLORS.length]]));
