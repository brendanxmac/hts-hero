"use client";

import { useMemo } from "react";
import { rampColor } from "@/components/ui/theme";
import { Columns, Fill } from "../charts";
import { breakdown, InsightsInput, RATE_BANDS } from "../lib/data";
import { InsightPanel } from "../shared";

// How many imports pay each band of duty rate, from duty free to 60% and up: one cobalt ramp,
// deeper for higher rates

export const RateLadder = ({ input }: { input: InsightsInput }) => {
  const rows = useMemo(() => breakdown(input, "band"), [input]);
  const n = input.products.length || 1;
  const data = RATE_BANDS.map((band, i) => {
    const row = rows.find((r) => r.key === band.key);
    const imports = row?.imports ?? 0;
    return {
      key: band.key,
      label: band.label,
      text: band.label,
      value: imports,
      display: imports.toLocaleString("en-US"),
      note: `${Math.round((imports / n) * 100)}% of your imports`,
      color: rampColor(i + 1, RATE_BANDS.length),
    };
  });
  const heavy = rows.filter((r) => r.key === "higher" || r.key === "highest").reduce((s, r) => s + r.imports, 0);
  const free = rows.find((r) => r.key === "free")?.imports ?? 0;

  return (
    <InsightPanel
      id="ti-ladder"
      title="Rate Ladder"
      subtitle="How many of your imports pay each band of duty rate"
      lesson={
        <>
          {heavy.toLocaleString("en-US")} {heavy === 1 ? "import pays" : "imports pay"} 30% or more ({Math.round((heavy / n) * 100)}% of your catalog)
          {free ? `, and ${free.toLocaleString("en-US")} ${free === 1 ? "comes" : "come"} in duty free` : ""}.
        </>
      }
    >
      <Fill min={220}>{(height) => <Columns data={data} format={(v) => Math.round(v).toLocaleString("en-US")} label="Imports by rate band" height={height} integer />}</Fill>
    </InsightPanel>
  );
};
