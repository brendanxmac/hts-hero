"use client";

import { useEffect } from "react";
import { MUTED_MARK, PRIMARY_MARK, SUCCESS_MARK } from "@/components/ui/theme";
import * as tt from "@/components/ui/styles/tracker";
import { formatPct } from "../lib/format";
import { MAX_COMPARE, TariffFinder } from "../lib/useTariffFinder";
import { CompareCards } from "./CompareCards";
import { Teaser } from "./Teaser";
import { thisPageWith } from "./redirect";
import { useOriginRates } from "./useOriginRates";

// The Compare tab: this import from up to two other countries, card by card with the duty, fees
// and landed cost (CompareCards, in the Tracker's look). It opens with the two cheapest of
// the largest US import sources; either can be removed and any country picked. Underneath, the
// Tracker's Sourcing Intelligence (every origin ranked), teased with a real fact about this import.

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

// Made-up bars behind the teaser's blur, never real data (DESIGN_SYSTEM §10.5)
const BARS = [4, 9, 13, 18, 22, 27, 31, 36, 44, 52, 61, 70, 82, 95];

const RankStandIn = () => (
  <div className="flex flex-col gap-5">
    <div className="grid grid-cols-3 gap-3">
      {["Your rank", "Cheaper origins", "Lowest rate"].map((label, i) => (
        <div key={label} className={`${tt.tile} flex flex-col gap-1 px-4 py-3`}>
          <span className="text-xs font-bold text-base-content/60">{label}</span>
          <span className={tt.metric}>{["#12", "38", "0.0%"][i]}</span>
        </div>
      ))}
    </div>
    <svg viewBox="0 0 140 60" className="h-48 w-full" preserveAspectRatio="none">
      {BARS.map((h, i) => (
        // Theme marks (DESIGN_SYSTEM §10)
        <rect key={i} x={i * 10 + 1} y={60 - h * 0.6} width="7" height={h * 0.6} rx="1.5" fill={i < 3 ? SUCCESS_MARK : i === 8 ? PRIMARY_MARK : MUTED_MARK} />
      ))}
    </svg>
  </div>
);

export const CompareTab = ({ f, autoAdded, onViewDetails }: { f: TariffFinder; autoAdded: { current: boolean }; onViewDetails: () => void }) => {
  const { facts, cheapestMajors } = useOriginRates(f);

  // On first opening, compare with the two cheapest major sources (once a visit: removing them sticks)
  useEffect(() => {
    if (autoAdded.current || f.countries.length !== 1 || cheapestMajors.length === 0) return;
    autoAdded.current = true;
    f.changeCountries([...f.countries, ...cheapestMajors].slice(0, MAX_COMPARE));
    // Once the rates are in
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cheapestMajors]);

  const origin = f.country?.name ?? "this country";
  const cheaper = facts?.cheaper.length ?? 0;
  const lowestNames = facts?.lowest.origins.slice(0, 2).map((o) => o.country.name).join(" and ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className={`${tt.title} m-0`}>The same import from other countries</h2>
        <p className={`${tt.subtitle} m-0`}>
          Starting with the two lowest-duty of the 20 largest sources of US imports. Remove either, or add any country.
        </p>
      </div>
      {f.compareEntries.length > 0 && (
        <CompareCards
          entries={f.compareEntries}
          countries={f.countries}
          max={MAX_COMPARE}
          onAdd={(added) => f.changeCountries([...f.countries, added])}
          customsValue={f.customsValue}
          onRemove={f.removeCountry}
          onPreferenceChange={f.setPreference}
          onViewDetails={(country) => {
            f.viewCountryDetails(country);
            onViewDetails();
          }}
        />
      )}
      <Teaser
        feature="sourcing-intelligence"
        tone="success"
        title="Unlock Sourcing Intelligence"
        teaser={
          facts && cheaper > 0 ? (
            <>
              {cheaper} {cheaper === 1 ? "country pays" : "countries pay"} less duty than {origin} on this import. The lowest could be{" "}
              <span className={tt.numberChip("success")}>{pct(facts.lowest.pct)}</span>
              {lowestNames ? `, from ${lowestNames}` : ""}.
            </>
          ) : facts ? (
            <>{origin} is already among the lowest-duty origins for this import. See every country ranked, and what could change that.</>
          ) : (
            <>See this import&apos;s duty from every country in the world, ranked.</>
          )
        }
        points={["Every origin ranked by duty", "Trade agreements that could apply", "Where your rate sits"]}
        cta="See every country free"
        redirect={() => thisPageWith({ view: "analysis" })}
        preview={<RankStandIn />}
      />
    </div>
  );
};
