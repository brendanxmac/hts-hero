"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Countries } from "@/constants/countries";
import { MAX_COMPARE, TariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { todayIso } from "@/components/duty-calculator/lib/format";
import { Explorer } from "@/components/duty-calculator/compare/Explorer";
import { Origins, shortlistColors, useOrigins } from "@/components/duty-calculator/compare/useOrigins";
import { AnalysisGate } from "../analysis/AnalysisGate";
import { ratesOn } from "../analysis/history";
import { TrackedProduct } from "../../report";

// An import's Sourcing tab: finding a cheaper country to make it in. Every country it could come
// from (the answer, the globe, every origin ranked, where you stand, the cheaper options, risk and
// change, the time-lapse), on the import's entry date. Selecting a country adds it to the
// import's Compare (its shortlist, up to four, the import's own origin always on it). Behind a
// free account.
export const ProductSourcing = ({ product, f }: { product: TrackedProduct; f: TariffFinder }) => {
  const origins = useOrigins(product);
  const { rates, histories, ready } = origins;
  const asOf = ready && f.entryDate < todayIso() ? f.entryDate : undefined;
  const dated: Origins = useMemo(() => (asOf ? { ...origins, rates: ratesOn(rates, histories, asOf) } : origins), [asOf, origins, rates, histories]);
  const key = f.countries.map((c) => c.code).join();
  const shortlist = useMemo(() => new Set(f.countries.map((c) => c.code)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const colors = useMemo(() => shortlistColors(f.countries.map((c) => c.code)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  const toggle = (code: string) => {
    if (code === product.entry.country.code) return;
    if (shortlist.has(code)) return f.removeCountry(code);
    const added = Countries.find((c) => c.code === code);
    if (!added) return;
    if (f.countries.length >= MAX_COMPARE) {
      toast(`Compare holds ${MAX_COMPARE} countries. Remove one to add ${added.name}.`);
      return;
    }
    f.changeCountries([...f.countries, added]);
    setLastAdded(code);
    toast.success(`${added.name} added to Compare`);
  };

  return (
    <AnalysisGate product={product} page="tracker_product">
      <Explorer origins={dated} customsValue={product.customsValue} shortlist={shortlist} colors={colors} lastAdded={lastAdded} onToggle={toggle} />
    </AnalysisGate>
  );
};
