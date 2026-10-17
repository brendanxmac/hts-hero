"use client";

import { HistorySegment } from "@/tariffs/engine-v2/history";
import { mono } from "@/components/ui/font";
import { BASE_SLICE, sliceForProgram } from "../results";
import { KIND_LABEL } from "./format";
import { TREND_PILL, trendOf } from "./trend";

// One line that changed on a date in "What changed": a bar in its tariff's color (the same as its
// layer in the chart above), its name first and bold, how much it moved the duty as a + or − chip,
// then, small and quiet, what happened to it and its code. Only the change: the rate itself is in
// the chart and the headline.

// The chart layer a changed line belongs to: base duty, or its program
export const layerOf = (change: HistorySegment["changes"][number]) => (change.code === "BASE" ? BASE_SLICE : sliceForProgram(change.program));

export const ChangeLine = ({
  change: c,
  shown,
  color,
}: {
  change: HistorySegment["changes"][number];
  shown: (amount: number) => string;
  // Its layer's color in the chart
  color?: string;
}) => (
  <div
    className="flex items-start justify-between gap-3 border-l-[3px] border-base-300 py-0.5 pl-2.5"
    // Layer color, as in the chart (DESIGN_SYSTEM §10)
    style={color ? { borderLeftColor: color } : undefined}
  >
    <div className="min-w-0">
      <div className="text-sm font-semibold leading-snug text-base-content">{c.code === "BASE" ? "Base duty" : c.name}</div>
      <div className="mt-0.5 text-xs text-base-content/60">
        {KIND_LABEL[c.kind]}
        {c.code !== "BASE" && (
          <>
            {" · "}
            <span className={mono.className}>{c.code}</span>
          </>
        )}
      </div>
    </div>
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${TREND_PILL[trendOf(c.delta)]}`}>{shown(c.delta)}</span>
  </div>
);
