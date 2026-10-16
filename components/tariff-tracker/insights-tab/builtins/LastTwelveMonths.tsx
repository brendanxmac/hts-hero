"use client";

import { useMemo } from "react";
import { TimeStepChart } from "@/components/ui/charts/kit";
import * as tt from "@/components/ui/styles/tracker";
import { shortDate } from "../../../duty-calculator/rate-history/format";
import { formatRate } from "../../formatRate";
import { signedRate } from "../../impact/format";
import { averageMove, breakdown, changeCauses, importMoves, InsightsInput, trendSeries, yearAgo } from "../lib/data";
import { InsightPanel } from "../shared";

// How much of the catalog changed in the last 12 months: the average rate then and now, how many
// imports went up or down, and the tariffs that moved them

export const LastTwelveMonths = ({ input }: { input: InsightsInput }) => {
  const from = yearAgo(input.today);
  const { steps, avg, up, down, causes } = useMemo(() => {
    const series = trendSeries(input, "all", "avgRate", from, breakdown(input, "all"))[0];
    const moves = importMoves(input);
    return {
      steps: (series?.points ?? []).map((p) => ({ date: p.date, value: p.value })),
      avg: averageMove(moves),
      up: moves.filter((m) => m.change > 0.005).length,
      down: moves.filter((m) => m.change < -0.005).length,
      causes: changeCauses(input).slice(0, 4),
    };
  }, [input, from]);
  const moved = up + down;
  const n = input.products.length;
  const top = causes[0];

  return (
    <InsightPanel
      id="ti-twelve"
      title="The Last 12 Months"
      subtitle={`How your rates moved since ${shortDate(from, true)}`}
      lesson={
        moved === 0 ? (
          "None of your imports' rates changed in the last 12 months."
        ) : (
          <>
            {moved === n ? "Every one" : `${moved.toLocaleString("en-US")} of ${n.toLocaleString("en-US")}`} of your imports changed rate in a year
            {top ? (
              <>
                , most often because of <b>{top.label}</b> ({top.moved.toLocaleString("en-US")} {top.moved === 1 ? "import" : "imports"}, {signedRate(top.change)} each on average)
              </>
            ) : null}
            .
          </>
        )
      }
    >
      <div className="grid grid-cols-3 gap-2.5">
        <div className={`${tt.tile} px-4 py-3`}>
          <span className="text-xs text-base-content/60">A year ago</span>
          <div className={tt.metricSm}>{formatRate(avg.then)}</div>
        </div>
        <div className={`${tt.tile} px-4 py-3`}>
          <span className="text-xs text-base-content/60">Today</span>
          <div className={tt.metricSm}>
            {formatRate(avg.now)}{" "}
            <span className={`text-sm ${avg.change > 0.005 ? "text-error" : avg.change < -0.005 ? "text-success" : "text-base-content/60"}`}>{signedRate(avg.change)}</span>
          </div>
        </div>
        <div className={`${tt.tile} px-4 py-3`}>
          <span className="text-xs text-base-content/60">Imports moved</span>
          <div className={tt.metricSm}>
            <span className="text-error">{up}↑</span> <span className="text-success">{down}↓</span>
          </div>
        </div>
      </div>
      <TimeStepChart
        steps={steps}
        to={input.today}
        format={formatRate}
        formatDate={(d) => shortDate(d, true)}
        valueLabel="Average rate"
        height={200}
        label={`Average rate over the last 12 months, ${formatRate(avg.now)} today`}
      />
      {causes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={tt.eyebrow()}>What moved them</span>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {causes.map((c) => (
              <li key={c.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-base-content">{c.label}</span>
                <span className="flex shrink-0 items-center gap-2 tabular-nums">
                  <span className="text-xs text-base-content/60">
                    {c.moved.toLocaleString("en-US")} {c.moved === 1 ? "import" : "imports"}
                  </span>
                  <span className={tt.chip(c.change > 0.005 ? "error" : c.change < -0.005 ? "success" : "neutral")}>{signedRate(c.change)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </InsightPanel>
  );
};
