"use client";

import { TimeStepChart } from "@/components/ui/charts/kit";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../../duty-calculator/lib/format";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";

// The average duty rate across the user's imports as a step line from the first verified
// revision to today, with the rate since each change on hover (the chart kit's TimeStepChart)
export const CatalogRateChart = ({ series, to }: { series: { date: IsoDate; pct: number }[]; to: IsoDate }) => {
  if (series.length === 0) return null;
  const today = series[series.length - 1];
  return (
    <section className={`${ui.card} flex flex-col gap-4 p-5`} aria-labelledby="tt-avg-rate">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="tt-avg-rate" className={ui.cardTitle}>
            Average duty rate across your imports
          </h3>
          <p className={`${ui.caption} mt-0.5`}>
            {shortDate(series[0].date, true)} – {formatDate(to)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold leading-none tracking-tight tabular-nums text-primary">{formatRate(today.pct)}</p>
          <p className={`${ui.caption} mt-1`}>Today</p>
        </div>
      </div>
      <TimeStepChart
        steps={series.map((p) => ({ date: p.date, value: p.pct }))}
        to={to}
        format={formatRate}
        formatDate={(d) => shortDate(d, true)}
        valueLabel="Average rate"
        height={224}
        label={`Average duty rate across your imports, ${formatRate(today.pct)} today`}
      />
    </section>
  );
};
