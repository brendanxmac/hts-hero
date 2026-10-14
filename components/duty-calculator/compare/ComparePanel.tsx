"use client";

import { ReactNode, useMemo } from "react";
import { ArrowRightIcon, GlobeAltIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { ratesOn } from "@/components/tariff-tracker/product/analysis/history";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { todayIso } from "../lib/format";
import { optionsFor } from "./options";
import { SideBySide } from "./SideBySide";
import { Origins, shortlistColors, useOrigins } from "./useOrigins";

// The Compare tab: countries side by side, and that's all. Up to four, each at the trade program
// claimed for it, with the agreement it could claim and what that would save, on the import's
// entry date. Finding a cheaper country among all of them (every country ranked, the globe, how
// rates have moved, who already ships it) is the import's Sourcing tab in the Tariff Tracker: one
// card here points there (tracking the import free, on /duty-calculator).

export const ComparePanel = ({
  product,
  page,
  countries,
  max,
  claimed,
  onClaim,
  entryDate,
  onAdd,
  onRemove,
  onViewDetails,
  onTrack,
  onOpenSourcing,
  note,
}: {
  product: TrackedProduct;
  page: "calculator" | "tracker_calculator" | "tracker_product";
  // The shortlist, the import's own origin first
  countries: Country[];
  max: number;
  // The trade program claimed for each country, and the way to claim or drop one
  claimed: Record<string, string>;
  onClaim: (code: string, symbol: string) => void;
  entryDate: string;
  onAdd: (country: Country) => void;
  onRemove: (countryCode: string) => void;
  // A country's full breakdown, with a program claimed
  onViewDetails: (country: Country, preference?: string) => void;
  // On /duty-calculator: tracking the import, landing on its Sourcing
  onTrack?: () => void;
  // In the Tracker: the import's Sourcing tab
  onOpenSourcing?: () => void;
  // Under the table: why the picked countries are on it (Census)
  note?: ReactNode;
}) => {
  const origins = useOrigins(product);
  const { rates, histories, ready } = origins;
  // Every origin's rates on the entry date, when it isn't today
  const asOf = ready && entryDate < todayIso() ? entryDate : undefined;
  const dated: Origins = useMemo(() => (asOf ? { ...origins, rates: ratesOn(rates, histories, asOf) } : origins), [asOf, origins, rates, histories]);
  const key = countries.map((c) => c.code).join();
  const colors = useMemo(() => shortlistColors(countries.map((c) => c.code)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const options = useMemo(
    () =>
      countries.flatMap((c) => {
        const origin = dated.rates.find((r) => r.country.code === c.code);
        return origin ? optionsFor(origin, "without") : [];
      }),
    [key, dated.rates] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const yours = rates.find((r) => r.isOrigin);
  const cheaper = rates.filter((r) => !r.isOrigin && (r.agreement?.pct ?? r.pct) < (yours?.pct ?? 0) - 0.005).length;
  const goToSourcing = page === "calculator" ? onTrack : onOpenSourcing;

  return (
    // Sections of the results box: the table, why the picks are there, the way to Sourcing
    <>
      <SideBySide
        product={product}
        origins={dated}
        options={options}
        claimed={claimed}
        onClaim={onClaim}
        asOf={asOf}
        countries={countries}
        colors={colors}
        max={max}
        onAdd={onAdd}
        onRemove={onRemove}
        onViewDetails={onViewDetails}
      />
      {note && <div className="results-pad">{note}</div>}

      {/* The way to every other country: the import's Sourcing */}
      {goToSourcing && (
        <div className={`${ui.card} flex flex-col items-start gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6`}>
          <span className={`${tt.chip("primary")} h-10 w-10 shrink-0 justify-center rounded-xl`} aria-hidden>
            <GlobeAltIcon className="h-5 w-5 shrink-0" />
          </span>
          <p className="m-0 flex-1 text-sm text-base-content/80">
            <span className="font-semibold text-base-content">Find a cheaper country for this import.</span>{" "}
            {cheaper
              ? `${cheaper} of ${rates.length} countries could pay less than ${yours?.country.name ?? "yours"}. See them all ranked, on a globe, with who already ships it to the US and how steady each rate has been.`
              : `See all ${rates.length} countries ranked, on a globe, with who already ships it to the US.`}
          </p>
          <button type="button" className={tt.button("next", "sm", "rounded")} onClick={goToSourcing}>
            {page === "calculator" ? "Track this import free" : "Open Sourcing"}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </>
  );
};
