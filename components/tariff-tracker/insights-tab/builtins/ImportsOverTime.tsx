"use client";

import { useMemo } from "react";
import { SERIES_COLORS } from "@/components/ui/theme";
import { shortDate } from "../../../duty-calculator/rate-history/format";
import { formatRate } from "../../formatRate";
import { useInsights } from "../../insights/InsightsContext";
import { Fill, StepLines } from "../charts";
import { importSeries, InsightsInput } from "../lib/data";
import { InsightPanel } from "../shared";

// A handful of imports side by side over time: each one's rate since the first verified tariff
// data, so it's plain which moved, when, and which way

export const ImportsOverTime = ({ input }: { input: InsightsInput }) => {
  const { range } = useInsights();
  const series = useMemo(() => importSeries(input, input.products.slice(0, 5), range.from), [input, range.from]);
  const colors = Object.fromEntries(series.map((s, i) => [s.key, SERIES_COLORS[i]]));
  const swings = series
    .map((s) => {
      const values = s.points.map((p) => p.value);
      return { label: s.label, low: Math.min(...values), high: Math.max(...values) };
    })
    .sort((a, b) => b.high - b.low - (a.high - a.low));
  const widest = swings[0];

  return (
    <InsightPanel
      id="ti-imports-time"
      title="Your Imports Over Time"
      subtitle={`Each import's rate since ${shortDate(range.from, true)}`}
      lesson={
        widest && widest.high - widest.low > 0.005 ? (
          <>
            {widest.label} swung the most: between {formatRate(widest.low)} and {formatRate(widest.high)}.
          </>
        ) : (
          "None of your imports' rates moved in this period."
        )
      }
    >
      {/* Less the legend's line above the chart */}
      <Fill min={260}>
        {(height) => (
          <StepLines series={series} colors={colors} to={input.today} format={formatRate} height={height - (series.length > 1 ? 32 : 0)} label="Each import's rate over time" />
        )}
      </Fill>
    </InsightPanel>
  );
};
