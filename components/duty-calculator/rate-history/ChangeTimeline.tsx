"use client";

import { useState } from "react";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";
import { TimelineEntry, TimelineList } from "@/components/ui/TimelineList";
import { ChangeLine } from "./ChangeItem";
import { shortDate, signedMoney, signedPct } from "./format";
import { TREND_TEXT, trendOf } from "./trend";
import { Metric } from "./types";

// Changes shown before "Show all"
const COLLAPSED_CHANGES = 3;

// What changed, latest first, down to the starting point, on the shared timeline (TimelineList):
// each date with how much the duty moved and the lines that changed. The entry date's period is
// lit; select a date to see the duty from it. Or, with no changes, a note saying so.
export const ChangeTimeline = ({
  history,
  entryIndex,
  lastDate,
  metric,
  value,
  show,
  onPick,
}: {
  history: HistorySegment[];
  // The segment holding the entry date, or -1
  entryIndex: number;
  lastDate: string;
  metric: Metric;
  value: (amount: number) => number;
  show: (amount: number) => string;
  onPick: (date: string) => void;
}) => {
  const [showAll, setShowAll] = useState(false);
  const first = history[0];
  const changes = history.length - 1;

  if (changes === 0) {
    return (
      <p className={`${ui.bodySm} flex gap-2 rounded-md bg-base-200 px-3.5 py-3`}>
        <CheckCircleIcon className="w-4 h-4 shrink-0 mt-0.5 text-success" aria-hidden />
        <span>
          No tariff changes affected this entry from {shortDate(first.from)} to{" "}
          {formatDate(lastDate)}.
        </span>
      </p>
    );
  }

  const shown = (amount: number) =>
    metric === "usd" ? signedMoney(amount) : signedPct(value(amount));
  const entries: TimelineEntry[] = history
    .map((segment, i) => ({ segment, i }))
    .slice(1)
    .reverse()
    .slice(0, showAll ? undefined : COLLAPSED_CHANGES)
    .map(({ segment, i }) => {
      const delta = segment.result.totalDuty - history[i - 1].result.totalDuty;
      const trend = trendOf(delta);
      const isEntry = i === entryIndex;
      return {
        key: segment.from,
        date: formatDate(segment.from),
        summary: <span className={TREND_TEXT[trend]}>{shown(delta)}</span>,
        tone: trend === "flat" ? "neutral" : trend,
        lines: segment.changes.map((c) => <ChangeLine key={`${c.kind}-${c.code}`} change={c} shown={shown} />),
        active: isEntry,
        onSelect: () => onPick(segment.from),
        note: isEntry ? (
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Your entry date is in this period
          </span>
        ) : (
          <button
            type="button"
            className={`${ui.link} inline-flex items-center gap-1 text-sm`}
            onClick={() => onPick(segment.from)}
          >
            See the duty from {shortDate(segment.from)}
            <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden />
          </button>
        ),
      };
    });

  return (
    <div className="flex flex-col gap-2">
      <h4 className={ui.label}>What changed</h4>
      <TimelineList
        entries={entries}
        ariaLabel="What changed, latest first"
        after={
          <div className={`${ui.caption} flex items-baseline justify-between gap-3`}>
            <span>{formatDate(first.from)} · Starting point</span>
            <span className="font-semibold tabular-nums text-base-content/70">
              {show(first.result.totalDuty)}
            </span>
          </div>
        }
      />
      {changes > COLLAPSED_CHANGES && (
        <button
          type="button"
          className={`${ui.link} self-start text-sm`}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show fewer" : `Show all ${changes} changes`}
        </button>
      )}
    </div>
  );
};
