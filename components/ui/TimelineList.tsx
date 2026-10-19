"use client";

import { ReactNode, useState } from "react";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// A vertical timeline of dates: a line with a dot per date (red when duty went up, green when it
// went down, amber when both), the date and a short summary, then the lines that changed (the
// first few, with "Show all" per date) and an optional note. One date can be lit (a soft tile), the
// ones after it faded, and a date can be selected. It never scrolls on its own: the list is as tall
// as its dates. Used by the calculator's "What changed" and the Time Lapse's "Every change".

export type TimelineTone = "up" | "down" | "mixed" | "neutral";

export type TimelineEntry = {
  key: string;
  // The date, as shown
  date: ReactNode;
  // To the right of the date, e.g. "+$1,250" or "40 up, 114 down"
  summary?: ReactNode;
  tone: TimelineTone;
  // What changed on this date, one node per line
  lines?: ReactNode[];
  // Under the lines, e.g. "Your entry date is in this period"
  note?: ReactNode;
  active?: boolean;
  faded?: boolean;
  onSelect?: () => void;
};

const DOT: Record<TimelineTone, string> = {
  up: "bg-error ring-error/15",
  down: "bg-success ring-success/15",
  mixed: "bg-warning ring-warning/20",
  neutral: "bg-base-content/40 ring-base-200",
};

export const TimelineList = ({
  entries,
  limit = 3,
  after,
  ariaLabel,
}: {
  // In the order shown
  entries: TimelineEntry[];
  // Lines shown per date before "Show all"
  limit?: number;
  // A last row on the line, e.g. the starting point
  after?: ReactNode;
  ariaLabel?: string;
}) => {
  // The dates showing every line
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string) =>
    setExpanded((was) => {
      const next = new Set(was);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  return (
    <ol className="m-0 flex list-none flex-col p-0" aria-label={ariaLabel}>
      {entries.map((e, i) => {
        const lines = e.lines ?? [];
        const open = expanded.has(e.key);
        const shown = open ? lines : lines.slice(0, limit);
        const last = i === entries.length - 1 && !after;
        const head = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-sm font-semibold text-base-content">{e.date}</span>
              {e.summary && <span className="shrink-0 text-sm font-semibold tabular-nums">{e.summary}</span>}
            </div>
            {shown.length > 0 && (
              <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0">
                {shown.map((line, j) => (
                  <li key={j} className={ui.bodySm}>
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </>
        );
        return (
          <li
            key={e.key}
            aria-current={e.active ? "step" : undefined}
            className={`relative rounded-xl py-2.5 pl-8 pr-2.5 transition-[background-color,opacity] ${e.active ? tt.tile : e.onSelect ? "hover:bg-tt-soft" : ""} ${e.faded ? "opacity-50" : ""}`}
          >
            {/* The line, through the dot */}
            <span
              className={`absolute left-[15px] w-px bg-base-300 ${i === 0 ? "top-[18px]" : "top-0"} ${last ? "h-[18px]" : "bottom-0"}`}
              aria-hidden
            />
            <span
              className={`absolute left-[11px] top-[14px] h-2.5 w-2.5 rounded-full ${e.active ? "bg-primary ring-4 ring-primary/20" : `ring ${DOT[e.tone]}`}`}
              aria-hidden
            />
            {e.onSelect ? (
              <button
                type="button"
                onClick={e.onSelect}
                className="block w-full rounded-md text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {head}
              </button>
            ) : (
              head
            )}
            {lines.length > limit && (
              <button type="button" className={`${ui.link} mt-1.5 text-xs`} onClick={() => toggle(e.key)}>
                {open ? "Show fewer" : `Show all ${lines.length} changes`}
              </button>
            )}
            {e.note && <div className="mt-2">{e.note}</div>}
          </li>
        );
      })}
      {after && (
        <li className="relative py-2 pl-8 pr-2.5">
          <span className="absolute left-[15px] top-0 h-[16px] w-px bg-base-300" aria-hidden />
          <span
            className="absolute left-[11px] top-[12px] h-2.5 w-2.5 rounded-full border-2 border-base-content/20 bg-base-100"
            aria-hidden
          />
          {after}
        </li>
      )}
    </ol>
  );
};
