"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { programColors } from "../../programColors";
import { TrackedProduct } from "../../report";
import {
  analysisFacts,
  CountrySelection,
  originRates,
  partsOf,
  RateBasis,
  rateTiers,
  visibleOrigins,
} from "./analysis";
import { AnalysisFacts } from "./AnalysisFacts";
import { CheapVsStable } from "./CheapVsStable";
import { CountryChips, CountryPicker } from "./CountryPicker";
import { OriginDetail } from "./OriginDetail";
import { OriginsTable } from "./OriginsTable";
import { RateTiers } from "./RateTiers";
import { SwarmChart } from "./SwarmChart";
import { changeEvents, OriginHistory, ratesOn } from "./history";
import { TimeLapse } from "./TimeLapse";
import { useTimeline } from "./useTimeline";
import { useOriginHistories } from "./useOriginHistories";

// The map and its data load with this tab only
const WorldMap = dynamic(() => import("./WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className={`${ui.skeleton} h-[28rem] w-full`} />,
});

// The product's Analysis tab: its duty from every country of origin, for its own shipment. The
// headline facts, every origin as a flag on one axis, a world map, the same flags over time,
// rate against stability, the distinct rate tiers, and every origin in a table. Selecting an origin anywhere selects it everywhere and opens it beside the chart.
// Standard rates, or with each origin's best trade agreement, applies to all of it, and so does
// the choice of countries (remembered on this device, across products).

const SELECTION_KEY = "hts-hero-tariff-tracker-analysis-countries";

const readSelection = (): CountrySelection => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SELECTION_KEY) ?? "null");
    return Array.isArray(saved) && saved.every((c) => typeof c === "string") ? saved : null;
  } catch {
    return null;
  }
};

const BASES: { id: RateBasis; label: string }[] = [
  { id: "standard", label: "Standard rates" },
  { id: "agreements", label: "With trade agreements" },
];

export const AnalysisTab = ({ product }: { product: TrackedProduct }) => {
  const [basis, setBasis] = useState<RateBasis>("standard");
  const [selected, setSelected] = useState<string | null>(null);
  const [countries, setCountries] = useState<CountrySelection>(null);
  useEffect(() => setCountries(readSelection()), []);
  const chooseCountries = (next: CountrySelection, how: string) => {
    setCountries(next);
    try {
      window.localStorage.setItem(SELECTION_KEY, JSON.stringify(next));
    } catch {
      // Not critical
    }
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ANALYSIS_COUNTRIES_CHOSEN, { how, countries: next?.length ?? "all" });
  };

  // Every origin, worked out once per product and shipment (about 200 calculations, quick)
  const rates = useMemo(() => originRates(product), [product]);
  // The chosen countries, and the product's own origin
  const shown = useMemo(() => visibleOrigins(rates, countries), [rates, countries]);
  const facts = useMemo(() => analysisFacts(shown, basis), [shown, basis]);
  const tiers = useMemo(() => rateTiers(shown, basis), [shown, basis]);
  const colors = useMemo(
    () => programColors(rates.flatMap((r) => [{ parts: partsOf(r, "standard") }, { parts: partsOf(r, "agreements") }])),
    [rates]
  );
  const withAgreements = rates.filter((r) => r.agreement).length;
  // Every origin's rate history, worked out in the background for the time-lapse and stability
  const { range, histories, progress, ready } = useOriginHistories(product, rates);

  // The analysis's date: today, or wherever the time-lapse has been taken. The globe follows it.
  const shownHistories = useMemo(
    () => shown.map((r) => histories.get(r.country.code)).filter((h): h is OriginHistory => Boolean(h)),
    [shown, histories]
  );
  const events = useMemo(() => (ready ? changeEvents(shownHistories, basis) : []), [ready, shownHistories, basis]);
  const timeline = useTimeline(range, events);
  const shownOnDate = useMemo(
    () => (ready && !timeline.atToday ? ratesOn(shown, histories, timeline.frameDate) : shown),
    [ready, timeline.atToday, timeline.frameDate, shown, histories]
  );

  useEffect(() => {
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ANALYSIS_VIEWED, { origins: rates.length, tiers: tiers.length });
    // Once per product
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.key]);

  const select = (code: string) => {
    setSelected((current) => (current === code ? null : code));
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ANALYSIS_ORIGIN_SELECTED, { country_code: code, basis });
  };
  // A selected origin that's no longer shown closes
  const chosen = shown.find((r) => r.country.code === selected);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={ui.bodySm}>
          The duty on this product from every country of origin, for this product&apos;s shipment and answers.
          {withAgreements > 0 && ` ${withAgreements} origins have a trade agreement that can lower it.`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <CountryPicker rates={rates} basis={basis} selection={countries} onChange={chooseCountries} />
          <SegmentedControl<RateBasis>
            label="Rates"
            options={BASES}
            value={basis}
            onChange={(next) => {
              setBasis(next);
              trackEvent(MixpanelEvent.TARIFF_TRACKER_ANALYSIS_BASIS_CHANGED, { basis: next });
            }}
            size="sm"
          />
        </div>
      </div>

      {countries && <CountryChips rates={rates} selection={countries} onChange={chooseCountries} />}

      <AnalysisFacts facts={facts} customsValue={product.customsValue} filtered={Boolean(countries)} />

      <div className={`grid items-start gap-4 ${chosen ? "xl:grid-cols-[minmax(0,1fr)_20rem]" : ""}`}>
        <SwarmChart rates={shown} basis={basis} selected={selected} onSelect={select} />
        {chosen && (
          <OriginDetail
            product={product}
            origin={chosen}
            yours={facts.origin}
            basis={basis}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      <WorldMap
        rates={rates}
        shown={shownOnDate}
        basis={basis}
        selected={selected}
        onSelect={select}
        timeline={ready && events.length > 0 ? timeline : undefined}
      />

      <TimeLapse
        rates={shown}
        histories={histories}
        timeline={timeline}
        progress={progress}
        ready={ready}
        basis={basis}
        selected={selected}
        onSelect={select}
      />

      <CheapVsStable
        rates={shown}
        histories={histories}
        ready={ready}
        progress={progress}
        basis={basis}
        since={range.from}
        selected={selected}
        onSelect={select}
      />

      <RateTiers tiers={tiers} colors={colors} selected={selected} onSelect={select} />

      <OriginsTable rates={shown} basis={basis} colors={colors} selected={selected} onSelect={select} />
    </div>
  );
};
