"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";
import { ChangeItem } from "./ChangeItem";
import { shortDate } from "./format";
import { Metric } from "./types";

// Changes shown before "Show all"
const COLLAPSED_CHANGES = 3;

// What changed, latest first, down to the starting point. Or, with no changes, a note saying so.
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

  return (
    <div className="flex flex-col gap-2">
      <h4 className={ui.label}>What changed</h4>
      <ol className="flex flex-col">
        {history
          .map((segment, i) => ({ segment, i }))
          .slice(1)
          .reverse()
          .slice(0, showAll ? undefined : COLLAPSED_CHANGES)
          .map(({ segment, i }) => (
            <ChangeItem
              key={segment.from}
              segment={segment}
              previous={history[i - 1]}
              isEntry={i === entryIndex}
              metric={metric}
              value={value}
              onPick={() => onPick(segment.from)}
            />
          ))}
        <li className="relative pl-5 pt-1">
          <span
            className="absolute left-0.5 top-2 h-2 w-2 rounded-full border-2 border-base-content/20 bg-base-100"
            aria-hidden
          />
          <div className={`${ui.caption} flex items-baseline justify-between gap-3`}>
            <span>{formatDate(first.from)} · Starting point</span>
            <span className="font-semibold tabular-nums text-base-content/70">
              {show(first.result.totalDuty)}
            </span>
          </div>
        </li>
      </ol>
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
