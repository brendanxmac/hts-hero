"use client";

import { PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import { Timeline } from "@/components/tariff-tracker/product/analysis/useTimeline";
import { shortDate } from "../rate-history/format";
import { ProgramMode } from "./options";

// Compare's one control bar, which every tab and chart follows: trade programs (without them,
// with each country's agreement applied, or both side by side) and the date the rates are for (a
// slider from the start of the verified data to today, each date a rate changed marked on it, and
// a play button that walks through them). Nothing else in Compare has a date or a rates switch of
// its own.

const MODES: { id: ProgramMode; label: string }[] = [
  { id: "without", label: "Without" },
  { id: "with", label: "With" },
  { id: "both", label: "Both" },
];

export const CompareControls = ({
  mode,
  onModeChange,
  timeline,
  ready,
  agreements,
}: {
  mode: ProgramMode;
  onModeChange: (mode: ProgramMode) => void;
  timeline: Timeline;
  // Every rate's history is in, so the date can move
  ready: boolean;
  // How many countries have a trade program that lowers the rate
  agreements: number;
}) => {
  const { day, total, date, atToday, playing, events, range } = timeline;
  return (
    <div className={`${ui.card} flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-5`} role="group" aria-label="Compare settings">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={ui.label}>Trade programs</span>
        <SegmentedControl<ProgramMode> label="Trade programs" options={MODES} value={mode} onChange={onModeChange} size="sm" tone="accent" />
        <span className="text-xs text-base-content/60">
          {mode === "without"
            ? "Standard rates"
            : mode === "with"
              ? `${agreements} ${agreements === 1 ? "country's" : "countries'"} agreement applied`
              : "Each agreement beside its country"}
        </span>
      </div>

      <div className="flex min-w-[18rem] flex-1 items-center gap-3">
        <span className={`${ui.label} whitespace-nowrap`}>Rates on</span>
        <span className="w-28 whitespace-nowrap text-sm font-semibold tabular-nums text-base-content" aria-live="polite">
          {atToday ? "Today" : shortDate(date, true)}
        </span>
        <button
          type="button"
          onClick={timeline.toggle}
          disabled={!ready || events.length === 0}
          className={ui.button({ size: "sm", icon: true })}
          aria-label={playing ? "Pause" : "Play through every change"}
          title={playing ? "Pause" : "Play through every change"}
        >
          {playing ? <PauseIcon className="h-4 w-4" aria-hidden /> : <PlayIcon className="h-4 w-4" aria-hidden />}
        </button>
        <div className="relative flex-1">
          {/* Each date a rate changed, as a tick under the slider (runtime position, DESIGN_SYSTEM §10) */}
          <div className="pointer-events-none absolute inset-x-2 top-1/2 h-0" aria-hidden>
            {events.map((e) => (
              <span
                key={e.date}
                className="absolute top-1.5 h-1.5 w-px bg-base-content/40"
                style={{ left: `${(Math.round((Date.parse(e.date) - Date.parse(range.from)) / 86400000) / total) * 100}%` }}
              />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={total}
            step={1}
            value={day}
            disabled={!ready}
            onChange={(e) => timeline.scrub(Number(e.target.value))}
            className="w-full cursor-pointer accent-primary disabled:cursor-wait"
            aria-label="The date the rates are for"
            aria-valuetext={atToday ? "Today" : shortDate(date, true)}
          />
          <div className="flex justify-between text-[11px] text-base-content/50">
            <span>{shortDate(range.from, true)}</span>
            <span>Today</span>
          </div>
        </div>
        {!atToday && (
          <button type="button" className={ui.button({ size: "sm" })} onClick={timeline.toToday}>
            Back to today
          </button>
        )}
      </div>
    </div>
  );
};
