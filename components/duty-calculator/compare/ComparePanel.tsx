"use client";

import { ReactNode, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRightIcon, GlobeAltIcon } from "@heroicons/react/20/solid";
import { Country } from "@/constants/countries";
import { useUser } from "@/contexts/UserContext";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { AnalysisGate } from "@/components/tariff-tracker/product/analysis/AnalysisGate";
import { changeEvents, OriginHistory, ratesOn } from "@/components/tariff-tracker/product/analysis/history";
import { TimeLapse } from "@/components/tariff-tracker/product/analysis/TimeLapse";
import { useTimeline } from "@/components/tariff-tracker/product/analysis/useTimeline";
import { TrackedProduct } from "@/components/tariff-tracker/report";
import { todayIso } from "../lib/format";
import { InsightsTab } from "./InsightsTab";
import { CountryCard, optionSub, supplyOf } from "./CountryCard";
import { optionResult, optionsFor, ProgramMode } from "./options";
import { OriginsList } from "./OriginsList";
import { RatesShown, SideBySide } from "./SideBySide";
import { Origins, useOrigins } from "./useOrigins";
import { onShipment } from "../lib/valueBasis";

// The map loads only when the Globe view opens
const WorldMap = dynamic(() => import("@/components/tariff-tracker/product/analysis/WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className={`${ui.skeleton} m-5 h-112`} />,
});

// The Compare tab: Duty Comparison, what it costs to import this from other countries. One header
// (like History's Duty Over Time) with the view on the right (Insights, Side by Side, Globe, Table,
// Chart; a visitor gets Side by Side first) and two controls under it: the import's entry date (the same date as everywhere else) and
// standard rates or with trade programs, which every view follows. Side by Side is free: the
// countries being compared, ranked. The other views cover every country the import could come
// from and need a free account (signed out, a blurred preview and the sign-up). On
// /duty-calculator, Side by Side ends with the way to more: a free account, or tracking the import.

type View = "side" | "insights" | "globe" | "table" | "chart";

// Insights first for someone signed in (it's theirs to read); second for a visitor, after the
// free Side by Side
const viewsFor = (signedIn: boolean): { id: View; label: string }[] => [
  ...(signedIn
    ? [
        { id: "insights" as const, label: "Insights" },
        { id: "side" as const, label: "Side by Side" },
      ]
    : [
        { id: "side" as const, label: "Side by Side" },
        { id: "insights" as const, label: "Insights" },
      ]),
  { id: "globe", label: "Globe" },
  { id: "table", label: "Table" },
  { id: "chart", label: "Chart" },
];

export const ComparePanel = ({
  product,
  page,
  countries,
  max,
  entryDate,
  dateControl,
  onAdd,
  onRemove,
  onReplace,
  onViewDetails,
  onTrack,
  onCreateAccount,
  note,
}: {
  product: TrackedProduct;
  page: "calculator" | "tracker_calculator" | "tracker_product";
  // The countries compared, the import's own origin first
  countries: Country[];
  max: number;
  entryDate: string;
  // The entry date's picker, in the header
  dateControl: ReactNode;
  onAdd: (country: Country) => void;
  onRemove: (countryCode: string) => void;
  onReplace: (countryCode: string, country: Country) => void;
  // A country's full breakdown, with a program claimed
  onViewDetails: (country: Country, preference?: string) => void;
  // On /duty-calculator, signed in: tracking the import, landing on its Compare
  onTrack?: () => void;
  // On /duty-calculator, signed out: the free account's pitch, led by advanced comparisons
  onCreateAccount?: () => void;
  // Under the side by side: why the picked countries are on it (Census)
  note?: ReactNode;
}) => {
  const { user } = useUser();
  const [view, setView] = useState<View>("side");
  const [shown, setShown] = useState<RatesShown>("standard");
  const mode: ProgramMode = shown === "programs" ? "with" : "without";

  const origins = useOrigins(product);
  const { rates, histories, ready, range } = origins;
  // Every origin's rates on the entry date, when it isn't today
  const asOf = ready && entryDate < todayIso() ? entryDate : undefined;
  const dated: Origins = useMemo(() => (asOf ? { ...origins, rates: ratesOn(rates, histories, asOf) } : origins), [asOf, origins, rates, histories]);
  const key = countries.map((c) => c.code).join();
  const options = useMemo(
    () =>
      countries.flatMap((c) => {
        const origin = dated.rates.find((r) => r.country.code === c.code);
        return origin ? optionsFor(origin, "without") : [];
      }),
    [key, dated.rates] // eslint-disable-line react-hooks/exhaustive-deps
  );
  // The Chart view's own timeline: it's the one view that moves through dates
  const events = useMemo(
    () => (ready ? changeEvents(rates.map((r) => histories.get(r.country.code)).filter((h): h is OriginHistory => Boolean(h)), mode === "with" ? "agreements" : "standard") : []),
    [ready, rates, histories, mode]
  );
  const timeline = useTimeline(range, events);
  // The country the globe is turned to: the map's own focus, nothing more
  // The country whose summary floats on the globe: yours until another is picked, none once hidden
  const [mapFocus, setMapFocus] = useState<string | null | undefined>(undefined);

  const yours = rates.find((r) => r.isOrigin);
  const focus = mapFocus === undefined ? (yours?.country.code ?? null) : mapFocus;
  // The globe's card: the focused country at the rates shown, against yours
  const focusCard = useMemo(() => {
    const origin = focus ? dated.rates.find((r) => r.country.code === focus) : undefined;
    const mine = dated.rates.find((r) => r.isOrigin);
    if (!origin || !mine) return null;
    const at = (o: typeof origin) => optionsFor(o, mode)[0];
    const option = at(origin);
    const result = optionResult(product, option, asOf);
    const value = product.customsValue > 0 ? product.customsValue : 1;
    return (
      <CountryCard
        country={option.origin.country}
        sub={optionSub(option)}
        result={result}
        value={value}
        colors={origins.colors}
        show="pct"
        supply={supplyOf(origins.imports, origin.country.code)}
        diff={origin.isOrigin ? undefined : result.totalDuty - optionResult(product, at(mine), asOf).totalDuty}
        onClose={() => setMapFocus(null)}
        onOpen={() => onViewDetails(origin.country, option.agreement?.symbol)}
      />
    );
  }, [focus, dated.rates, mode, product, asOf, origins.colors, origins.imports]); // eslint-disable-line react-hooks/exhaustive-deps
  const cheaper = rates.filter((r) => !r.isOrigin && (r.agreement?.pct ?? r.pct) < (yours?.pct ?? 0) - 0.005).length;
  const action = page === "calculator" ? (onCreateAccount ?? onTrack) : undefined;
  // Every view but Side by Side needs a free account
  const gated = (node: ReactNode) => (
    <AnalysisGate product={product} page={page}>
      {node}
    </AnalysisGate>
  );

  return (
    // Sections of the results box: the header, then the open view
    <>
      {/* One line: what it is, then the view and the two controls every view follows */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <h3 className={ui.cardTitle}>Duty Comparison</h3>
          <p className={`${ui.caption} mt-0.5`}>
            See what it costs to import this from other countries; dollars {onShipment(product.customsValue)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<View> label="Compare as" options={viewsFor(Boolean(user))} value={view} onChange={setView} size="sm" />
          {dateControl}
          <SegmentedControl<RatesShown>
            label="Rates shown"
            options={[
              { id: "standard", label: "Standard" },
              { id: "programs", label: "Trade programs" },
            ]}
            value={shown}
            onChange={setShown}
            size="sm"
          />
        </div>
      </div>

      {view === "side" && (
        <>
          <SideBySide
            product={product}
            origins={dated}
            options={options}
            mode={shown}
            asOf={asOf}
            countries={countries}
            max={max}
            onAdd={onAdd}
            onRemove={onRemove}
            onReplace={onReplace}
            onViewDetails={onViewDetails}
          />
          {note && <div className={ui.cardSection}>{note}</div>}
          {/* On /duty-calculator, the way to every other country: a free account (signed out), or
              tracking the import (signed in) */}
          {action && (
            <div className={`${ui.cardSection} flex flex-col items-start gap-4 sm:flex-row sm:items-center`}>
              <span className={`${tt.chip("primary")} h-10 w-10 shrink-0 justify-center rounded-xl`} aria-hidden>
                <GlobeAltIcon className="h-5 w-5 shrink-0" />
              </span>
              <p className="m-0 flex-1 text-sm text-base-content/70">
                <span className="font-semibold text-base-content">{onCreateAccount ? "Get advanced comparisons, free." : "Find a cheaper country for this import."}</span>{" "}
                {cheaper
                  ? `${cheaper} of ${rates.length} countries could pay less than ${yours?.country.name ?? "yours"}. See every one ranked, on a globe, in a table and over time.`
                  : `See all ${rates.length} countries ranked, on a globe, in a table and over time.`}
              </p>
              <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={action}>
                {onCreateAccount ? "Create a free account" : "Track this import"}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </>
      )}

      {view === "insights" &&
        gated(
          <div className="flex flex-col divide-y divide-base-300">
            <InsightsTab origins={dated} mode={mode} />
          </div>
        )}
      {view === "globe" &&
        gated(
          <WorldMap
            rates={dated.rates}
            shown={dated.rates}
            basis={mode === "with" ? "agreements" : "standard"}
            selected={focus}
            onSelect={setMapFocus}
            card={focusCard}
            onShowCard={yours ? () => setMapFocus(yours.country.code) : undefined}
            showCardLabel={yours ? `Show ${yours.country.name} (yours)` : undefined}
          />
        )}
      {view === "table" && gated(<OriginsList origins={dated} mode={mode} customsValue={product.customsValue} />)}
      {view === "chart" &&
        gated(
          <TimeLapse rates={rates} histories={histories} timeline={timeline} progress={origins.progress} ready={ready} basis={mode === "with" ? "agreements" : "standard"} />
        )}
    </>
  );
};
