"use client";

import { ReactNode, useMemo } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { TimeStepChart } from "@/components/ui/charts/kit";
import * as tt from "@/components/ui/styles/tracker";
import { shortDate } from "../../../duty-calculator/rate-history/format";
import { formatRate } from "../../formatRate";
import { signedRate } from "../../impact/format";
import { FilterState } from "../../filters";
import { averageMove, breakdown, changeCauses, importMoves, InsightsInput, trendSeries, yearAgo } from "../lib/data";
import { Fill } from "../charts";
import { importsFilter, InsightPanel, NavArrow, NavArrowSpace, ShowInImports, useShowInImports } from "../shared";

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
  const show = useShowInImports();

  return (
    <InsightPanel
      id="ti-twelve"
      title="The Last 12 Months"
      subtitle={`How your rates moved since ${shortDate(from, true)}`}
      lessonAction={top && <ShowInImports filters={importsFilter("program", top.key)} />}
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
          {/* Each count with its arrow, sized to the number (em) and centered on it */}
          <div className={`${tt.metricSm} flex items-center gap-4`}>
            <span className="inline-flex items-center gap-1 text-error" aria-label={`${up} up`}>
              {up}
              <ArrowUpIcon className="h-[0.85em] w-[0.85em]" aria-hidden />
            </span>
            <span className="inline-flex items-center gap-1 text-success" aria-label={`${down} down`}>
              {down}
              <ArrowDownIcon className="h-[0.85em] w-[0.85em]" aria-hidden />
            </span>
          </div>
        </div>
      </div>
      <Fill min={150}>
        {(height) => (
          <TimeStepChart
            steps={steps}
            to={input.today}
            format={formatRate}
            formatDate={(d) => shortDate(d, true)}
            valueLabel="Average rate"
            height={height}
            label={`Average rate over the last 12 months, ${formatRate(avg.now)} today`}
          />
        )}
      </Fill>
      {causes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={tt.sectionTitle}>What moved them</span>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {causes.map((c) => (
              <li key={c.key}>
                {/* Opens the imports with this tariff (base duty has no filter of its own) */}
                <CauseRow filters={importsFilter("program", c.key)} onShow={show}>
                  <span className="truncate text-left text-base-content">{c.label}</span>
                  <span className="flex shrink-0 items-center gap-2 tabular-nums">
                    <span className="text-xs text-base-content/60">
                      {c.moved.toLocaleString("en-US")} {c.moved === 1 ? "import" : "imports"}
                    </span>
                    <span className={tt.chip(c.change > 0.005 ? "error" : c.change < -0.005 ? "success" : "neutral")}>{signedRate(c.change)}</span>
                  </span>
                </CauseRow>
              </li>
            ))}
          </ul>
        </div>
      )}
    </InsightPanel>
  );
};

const CauseRow = ({ filters, onShow, children }: { filters: FilterState | null; onShow: (f: FilterState) => void; children: ReactNode }) => {
  const row = "-mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-xl px-2 py-1 text-sm";
  return filters ? (
    <button
      type="button"
      title="Show these imports in Your Imports"
      onClick={() => onShow(filters)}
      className={`${row} group hover:bg-tt-soft focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
    >
      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">{children}</span>
      <NavArrow />
    </button>
  ) : (
    <div className={row}>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-3">{children}</span>
      <NavArrowSpace />
    </div>
  );
};
