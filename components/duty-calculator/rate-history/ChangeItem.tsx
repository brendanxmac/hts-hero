"use client";

import { HistorySegment } from "@/tariffs/engine-v2/history";
import { mono } from "@/components/ui/font";
import { KIND_LABEL, rateText } from "./format";
import { TREND_TEXT, trendOf } from "./trend";

// One line that changed on a date in "What changed": what happened to it (added, removed,
// changed) and its code, how much it moved the duty, then its name and rate
export const ChangeLine = ({
  change: c,
  shown,
}: {
  change: HistorySegment["changes"][number];
  shown: (amount: number) => string;
}) => (
  <div className="text-xs leading-snug">
    <div className="flex items-baseline justify-between gap-2">
      <span className="min-w-0 text-base-content/60">
        <span className="font-medium">{KIND_LABEL[c.kind]}</span>{" "}
        {c.code !== "BASE" && <span className={`${mono.className} text-xs text-base-content/70`}>{c.code}</span>}
      </span>
      <span className={`shrink-0 tabular-nums ${TREND_TEXT[trendOf(c.delta)]}`}>{shown(c.delta)}</span>
    </div>
    <div className="mt-0.5 flex items-baseline justify-between gap-2">
      <span className="min-w-0 text-base-content">{c.code === "BASE" ? "Base duty" : c.name}</span>
      {rateText(c) && <span className="shrink-0 tabular-nums text-base-content/60">{rateText(c)}</span>}
    </div>
  </div>
);
