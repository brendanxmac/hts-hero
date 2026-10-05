"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../lib/format";
import { KIND_LABEL, rateText, shortDate, signedMoney, signedPct } from "./format";
import { TREND_DOT, TREND_TEXT, trendOf } from "./trend";
import { Metric } from "./types";

// One change on the timeline: its date, how much the duty moved, and the lines that changed
export const ChangeItem = ({
  segment,
  previous,
  isEntry,
  metric,
  value,
  onPick,
}: {
  segment: HistorySegment;
  previous: HistorySegment;
  isEntry: boolean;
  metric: Metric;
  value: (amount: number) => number;
  onPick: () => void;
}) => {
  const delta = segment.result.totalDuty - previous.result.totalDuty;
  const shown = (amount: number) =>
    metric === "usd" ? signedMoney(amount) : signedPct(value(amount));
  return (
    <li className="relative pl-5 pb-4">
      {/* The timeline */}
      <span className="absolute left-1.5 top-3.5 bottom-0 w-px bg-base-300" aria-hidden />
      <span
        className={`absolute left-0.5 top-1 h-2.5 w-2.5 rounded-full ring ${TREND_DOT[trendOf(delta)]}`}
        aria-hidden
      />
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 text-sm">
          <span className="font-semibold text-base-content">{formatDate(segment.from)}</span>
        </div>
        <span
          className={`shrink-0 text-sm font-semibold tabular-nums ${TREND_TEXT[trendOf(delta)]}`}
        >
          {shown(delta)}
        </span>
      </div>
      <ul className="mt-1.5 flex flex-col gap-1.5">
        {segment.changes.map((c) => (
          <li
            key={`${c.kind}-${c.code}`}
            className="rounded-md bg-base-200 px-2.5 py-1.5 text-xs leading-snug"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="min-w-0 text-base-content/60">
                <span className="font-medium">{KIND_LABEL[c.kind]}</span>{" "}
                {c.code !== "BASE" && (
                  <span className={`${mono.className} text-xs text-base-content/70`}>
                    {c.code}
                  </span>
                )}
              </span>
              <span className={`shrink-0 tabular-nums ${TREND_TEXT[trendOf(c.delta)]}`}>
                {shown(c.delta)}
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline justify-between gap-2">
              <span className="min-w-0 text-base-content">
                {c.code === "BASE" ? "Base duty" : c.name}
              </span>
              {rateText(c) && (
                <span className="shrink-0 tabular-nums text-base-content/60">{rateText(c)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2">
        {isEntry ? (
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Your entry date is in this period
          </span>
        ) : (
          <button
            type="button"
            className={`${ui.link} inline-flex items-center gap-1 text-sm`}
            onClick={onPick}
          >
            See the duty from {shortDate(segment.from)}
            <ArrowRightIcon className="w-3.5 h-3.5" aria-hidden />
          </button>
        )}
      </div>
    </li>
  );
};
