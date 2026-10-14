"use client";

import { TimeStepChart } from "@/components/ui/charts/kit";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate, todayIso } from "../../../duty-calculator/lib/format";
import { addDays } from "../../../../tariffs/engine-v2/history";
import { formatRate } from "../../formatRate";
import { useInsights } from "../../insights/InsightsContext";
import { shortProgram, TrackedProduct } from "../../report";
import { SummaryCard } from "./SummaryCard";

// How the product's rate has moved: a step line over the verified tariff data, with the rate since
// each change on hover (the chart kit's TimeStepChart), how often it changed in the last year,
// and the latest change
const MARGIN = { top: 8, right: 8, bottom: 24, left: 40 };

export const HistoryCard = ({ product, onOpen }: { product: TrackedProduct; onOpen: () => void }) => {
  const { histories, changes } = useInsights();
  const history = histories.get(product.key);
  const mine = changes.filter((c) => c.product.key === product.key);
  const today = todayIso();
  const lastYear = mine.filter((c) => c.date >= addDays(today, -365));
  const latest = mine[0];

  if (!history?.length) {
    return (
      <SummaryCard title="Rate over time">
        <div className="h-32 animate-pulse rounded-2xl bg-tt-soft" aria-busy="true" />
      </SummaryCard>
    );
  }
  const now = history[history.length - 1];

  return (
    <SummaryCard title="Rate over time" link={{ label: "Recent changes", onClick: onOpen }}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className={tt.metricSm}>{formatRate(now.pct)}</span>
          <span className="ml-2 text-xs text-base-content/60">today</span>
        </div>
        <span className="text-sm text-base-content/70">
          {lastYear.length ? `${lastYear.length} ${lastYear.length === 1 ? "change" : "changes"} in the last 12 months` : "No changes in the last 12 months"}
        </span>
      </div>
      <TimeStepChart
        steps={history.map((seg) => ({ date: seg.from, value: seg.pct }))}
        to={today}
        format={formatRate}
        formatDate={formatDate}
        height={150}
        margin={MARGIN}
        label={`Duty rate on ${product.entry.element.htsno} over time`}
      />
      {latest && (
        <p className="m-0 text-sm text-base-content/70">
          Latest: <span className={`font-semibold ${latest.deltaPct > 0 ? "text-error" : "text-success"}`}>{latest.deltaPct > 0 ? "▲" : "▼"} {formatRate(Math.abs(latest.deltaPct))}</span> on{" "}
          {formatDate(latest.date)}
          {latest.after.changes[0] ? ` · ${shortProgram(latest.after.changes[0].name)}` : ""}
        </p>
      )}
    </SummaryCard>
  );
};
