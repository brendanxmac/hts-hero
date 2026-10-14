"use client";

import { ReactNode, useMemo, useState } from "react";
import { Country } from "@/constants/countries";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { AnalysisGate } from "@/components/tariff-tracker/product/analysis/AnalysisGate";
import { changeEvents, OriginHistory, ratesOn } from "@/components/tariff-tracker/product/analysis/history";
import { useTimeline } from "@/components/tariff-tracker/product/analysis/useTimeline";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { AllTab } from "./AllTab";
import { CompareControls } from "./CompareControls";
import { InsightsTab } from "./InsightsTab";
import { optionsFor, ProgramMode } from "./options";
import { SideBySide } from "./SideBySide";
import { Origins, shortlistColors, useOrigins } from "./useOrigins";

// The calculator's Compare tab: one shortlist, three ways to look, one control bar.
// - Side by Side (first): the shortlist alone, in depth, with its charts
// - All: the whole field (the headline, the globe, every origin by its rate, proven cheaper
//   suppliers, rate tiers, cheap vs stable, every origin as one list)
// - Insights: the answer first, then the questions behind it, each opening its chart
// The control bar sets two things for every tab and chart at once: trade programs (without them,
// with each country's agreement applied, or both side by side) and the date the rates are for.
// The shortlist is the only selection, its colors the same everywhere; selecting a country
// anywhere adds it (or takes it off). Side by Side is free; All, Insights and the band behind its
// chart take a free account.

type Tab = "side" | "all" | "insights";

const TABS: { id: Tab; label: string }[] = [
  { id: "side", label: "Side by Side" },
  { id: "all", label: "All" },
  { id: "insights", label: "Insights" },
];

export const ComparePanel = ({
  product,
  page,
  signedIn,
  countries,
  max,
  lastAdded,
  onToggle,
  onAdd,
  onRemove,
  onViewDetails,
  note,
}: {
  product: TrackedProduct;
  page: string;
  signedIn: boolean;
  // The shortlist, the import's own origin first
  countries: Country[];
  max: number;
  lastAdded: string | null;
  onToggle: (code: string) => void;
  onAdd: (country: Country) => void;
  onRemove: (countryCode: string) => void;
  // A country's full breakdown, with the agreement claimed for an agreement option
  onViewDetails: (country: Country, preference?: string) => void;
  // Under Side by Side: why the picked countries are on the shortlist (Census)
  note?: ReactNode;
}) => {
  const [tab, setTab] = useState<Tab>("side");
  const [mode, setMode] = useState<ProgramMode>("both");
  const origins = useOrigins(product);
  const { rates, histories, range, ready } = origins;

  // The control bar's date, for everything in Compare
  const all = useMemo(() => rates.map((r) => histories.get(r.country.code)).filter((h): h is OriginHistory => Boolean(h)), [rates, histories]);
  const events = useMemo(() => (ready ? changeEvents(all, "standard") : []), [ready, all]);
  const timeline = useTimeline(range, events);
  const asOf = ready && !timeline.atToday ? timeline.date : undefined;
  // Every origin's rates on that date: what every tab works from
  const dated: Origins = useMemo(() => (asOf ? { ...origins, rates: ratesOn(rates, histories, asOf) } : origins), [asOf, origins, rates, histories]);

  const key = countries.map((c) => c.code).join();
  const colors = useMemo(() => shortlistColors(countries.map((c) => c.code)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const shortlist = useMemo(() => new Set(countries.map((c) => c.code)), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  // The shortlist's options, in its order, under the control bar's choice
  const options = useMemo(
    () =>
      countries.flatMap((c) => {
        const origin = dated.rates.find((r) => r.country.code === c.code);
        return origin ? optionsFor(origin, mode) : [];
      }),
    [key, dated.rates, mode] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const agreements = dated.rates.filter((r) => r.agreement).length;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="compare-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 id="compare-title" className={ui.cardTitle}>
            Compare origins
          </h3>
          {/* What the open tab is for, in a line */}
          <p className={`${ui.caption} mt-0.5`}>
            {tab === "side"
              ? `Your shortlist of up to ${max} countries, detail by detail. Add one here, or from any country in All or Insights.`
              : tab === "all"
                ? `All ${rates.length} countries this could come from: where it's cheapest, every origin's rate and who already ships it to the US.`
                : "What the field means for you: the answer first, then the questions behind it, each with its chart."}
          </p>
        </div>
        <SegmentedControl<Tab>
          label="Compare view"
          options={TABS}
          value={tab}
          onChange={(next) => {
            setTab(next);
            trackEvent(MixpanelEvent.TARIFF_TRACKER_ANALYSIS_VIEWED, { origins: rates.length, view: next });
          }}
          tone="accent"
        />
      </div>
      {/* On the calculator's page it stays in view under the site header as the tabs scroll; in the
          Tracker the import's own header sticks there instead */}
      <div className={page === "calculator" ? "sticky top-[4.5rem] z-20" : ""}>
      <CompareControls
        mode={mode}
        onModeChange={(next) => {
          setMode(next);
          trackEvent(MixpanelEvent.TARIFF_TRACKER_ANALYSIS_BASIS_CHANGED, { basis: next });
        }}
        timeline={timeline}
        ready={ready}
        agreements={agreements}
      />
      </div>

      {tab === "side" && (
        <>
          <SideBySide
            product={product}
            origins={dated}
            options={options}
            asOf={asOf}
            countries={countries}
            colors={colors}
            max={max}
            signedIn={signedIn}
            onAdd={onAdd}
            onRemove={onRemove}
            onViewDetails={onViewDetails}
          />
          {note}
        </>
      )}
      {tab === "all" && (
        <AnalysisGate product={product} page={page}>
          <AllTab origins={dated} mode={mode} customsValue={product.customsValue} shortlist={shortlist} colors={colors} lastAdded={lastAdded} onToggle={onToggle} />
        </AnalysisGate>
      )}
      {tab === "insights" && (
        <AnalysisGate product={product} page={page}>
          <InsightsTab origins={dated} mode={mode} timeline={timeline} customsValue={product.customsValue} shortlist={shortlist} colors={colors} onToggle={onToggle} />
        </AnalysisGate>
      )}
    </section>
  );
};
