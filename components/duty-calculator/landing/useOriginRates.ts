"use client";

import { useDeferredValue, useMemo } from "react";
import { useHts } from "@/contexts/HtsContext";
import { SUMMARY_COUNTRY_CODES } from "@/libs/hts-duty-summary";
import { analysisFacts, OriginRate, originRates } from "@/components/tariff-tracker/product/analysis/analysis";
import { productFromFinder } from "@/components/tariff-tracker/report";
import { TariffFinder } from "../lib/useTariffFinder";

// This import's duty from every country of origin (about 200 calculations), worked out a beat
// behind typing and only when an input that matters changes. Feeds the Compare tab's default
// countries and its teaser, and the tab's own teaser.

// The lowest rate an origin could pay: with its best trade agreement, if it has one
export const bestPct = (o: OriginRate) => (o.agreement ? Math.min(o.pct, o.agreement.pct) : o.pct);

export const useOriginRates = (f: TariffFinder) => {
  const { htsElements } = useHts();
  const key = useDeferredValue(
    JSON.stringify([f.selectedElement?.htsno, f.country?.code, f.customsValue, f.quantity, f.entryDate, f.transportMode, f.answers])
  );
  return useMemo(() => {
    const product = productFromFinder(f, htsElements);
    const rates = product ? originRates(product) : [];
    const origin = f.country?.code;
    // The two cheapest of the largest sources of US imports (other than this one)
    const cheapestMajors = SUMMARY_COUNTRY_CODES.filter((c) => c !== origin)
      .map((code) => rates.find((r) => r.country.code === code))
      .filter((r): r is OriginRate => Boolean(r))
      .sort((a, b) => bestPct(a) - bestPct(b))
      .slice(0, 2)
      .map((r) => r.country);
    return { rates, facts: rates.length ? analysisFacts(rates, "agreements") : null, cheapestMajors };
    // The inputs, through their key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, htsElements]);
};
