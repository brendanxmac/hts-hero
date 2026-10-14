"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import * as ui from "@/components/ui/styles";
import { changeEvents, OriginHistory } from "@/components/tariff-tracker/product/analysis/history";
import { useTimeline } from "@/components/tariff-tracker/product/analysis/useTimeline";
import { InsightsTab } from "./InsightsTab";
import { OriginsList } from "./OriginsList";
import { Origins } from "./useOrigins";

// The map loads with the explorer only
const WorldMap = dynamic(() => import("@/components/tariff-tracker/product/analysis/WorldMap").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => <div className={`${ui.skeleton} h-[28rem] w-full`} />,
});

// Every country for this import, as one page read top to bottom (under the shortlist in Compare):
// the answer and the numbers behind it, where in the world it's cheapest (the globe, as it is),
// every origin (a chart of flags or a table, with search and a filter), then the insights: where
// you stand, the cheaper options, risk and change, and the time-lapse. Each country's trade
// agreement counts as an option of its own. Selecting a country anywhere adds it to the shortlist.
// The rates are those on the import's entry date.
export const Explorer = ({
  origins,
  customsValue,
  shortlist,
  colors,
  lastAdded,
  onToggle,
}: {
  origins: Origins;
  customsValue: number;
  shortlist: ReadonlySet<string>;
  colors: Record<string, string>;
  lastAdded: string | null;
  onToggle: (code: string) => void;
}) => {
  // The time-lapse's own timeline: it's the one view that moves through dates
  const { rates, histories, ready, range } = origins;
  const events = useMemo(
    () => (ready ? changeEvents(rates.map((r) => histories.get(r.country.code)).filter((h): h is OriginHistory => Boolean(h)), "standard") : []),
    [ready, rates, histories]
  );
  const timeline = useTimeline(range, events);
  return (
    <section className="flex flex-col gap-4" aria-labelledby="explorer-title">
      <div>
        <h3 id="explorer-title" className={ui.cardTitle}>
          Every country for this import
        </h3>
        <p className={`${ui.caption} mt-0.5`}>
          All {origins.rates.length} countries it could come from, each with the trade agreement it could claim. Select any country to add it to your shortlist.
        </p>
      </div>
      <InsightsTab
        origins={origins}
        mode="both"
        timeline={timeline}
        customsValue={customsValue}
        shortlist={shortlist}
        colors={colors}
        onToggle={onToggle}
        afterAnswer={
          <>
            <WorldMap rates={origins.rates} shown={origins.rates} basis="standard" selected={lastAdded} onSelect={onToggle} />
            <OriginsList origins={origins} mode="both" shortlist={shortlist} colors={colors} onToggle={onToggle} />
          </>
        }
      />
    </section>
  );
};
