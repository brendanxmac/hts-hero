"use client";

import { useMemo } from "react";
import { ArrowPathIcon, PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { formatDate } from "@/components/duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";
import { IsoDate } from "@/tariffs/engine-v2/types";
import { OriginRate, RateBasis } from "./analysis";
import { ChangeEvent, daysBetween, OriginHistory, ratesOn } from "./history";
import { SwarmChart } from "./SwarmChart";
import { Timeline } from "./useTimeline";

// The swarm, played over time: a date sweeps from the first verified revision to today, and at
// every date a rate changed, the flags glide to their new rates and the change is named (what,
// and for how many origins). Scrub the timeline, or select a marker to jump to it. The date is
// the analysis's own (useTimeline), so the globe follows it too.


const tone = (e: ChangeEvent) =>
  e.up && !e.down ? "bg-error" : e.down && !e.up ? "bg-success" : "bg-warning";

const describe = (e: ChangeEvent) =>
  [e.up ? `${e.up} up` : "", e.down ? `${e.down} down` : ""].filter(Boolean).join(", ");

const EventNote = ({ event }: { event: ChangeEvent }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
      <span className={`h-2 w-2 rounded-full ${tone(event)}`} aria-hidden />
      {formatDate(event.date)} · {describe(event) || "rates changed"}
    </div>
    <ul className="flex flex-col gap-0.5">
      {event.changes.slice(0, 3).map((c) => (
        <li key={`${c.code}:${c.kind}`} className={ui.bodySm}>
          <span className="font-medium text-base-content">{c.code === "BASE" ? "Base duty" : c.code}</span> {c.name}{" "}
          {c.kind === "added" ? "added" : c.kind === "removed" ? "removed" : "changed"} ·{" "}
          {c.countries} {c.countries === 1 ? "origin" : "origins"}
        </li>
      ))}
      {event.changes.length > 3 && <li className={ui.caption}>and {event.changes.length - 3} more changes</li>}
    </ul>
  </div>
);

export const TimeLapse = ({
  rates,
  histories,
  timeline,
  progress,
  ready,
  basis,
  selected,
  onSelect,
}: {
  rates: OriginRate[];
  histories: Map<string, OriginHistory>;
  // The analysis's shared date: these are its full controls
  timeline: Timeline;
  progress: number;
  ready: boolean;
  basis: RateBasis;
  selected: string | null;
  onSelect: (code: string) => void;
}) => {
  const { range, total, day, date, playing, events, current, frameDate } = timeline;

  const shownHistories = useMemo(
    () => rates.map((r) => histories.get(r.country.code)).filter((h): h is OriginHistory => Boolean(h)),
    [rates, histories]
  );
  // The flags only move when the latest change before the date does
  const frame = useMemo(
    () => (ready ? ratesOn(rates, histories, frameDate) : rates),
    [ready, rates, histories, frameDate]
  );
  // One scale across every date
  const maxPct = useMemo(
    () => Math.max(...shownHistories.flatMap((h) => [...h.standard, ...(h.agreement ?? [])].map((s) => s.pct)), 1),
    [shownHistories]
  );

  const pct = (d: IsoDate) => (daysBetween(range.from, d) / total) * 100;
  // How far each marker steps up to clear the one before it
  const stackLevel = events.reduce<number[]>((levels, e, i) => {
    const close = i > 0 && pct(e.date) - pct(events[i - 1].date) < 2;
    return [...levels, close ? levels[i - 1] + 1 : 0];
  }, []);

  const footer = (
    <div className="mt-5 flex flex-col gap-4 border-t border-base-300 pt-4">
      {!ready ? (
        <div className="flex flex-col gap-2">
          <span className={ui.caption}>Working out every origin&apos;s rate history…</span>
          <span className="h-1.5 overflow-hidden rounded-full bg-base-300">
            <span className="block h-full bg-primary transition-[width]" style={{ width: `${progress * 100}%` }} />
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className={ui.button({ variant: "primary", size: "sm" })}
              onClick={timeline.toggle}
              disabled={events.length === 0}
            >
              {playing ? <PauseIcon className="h-4 w-4" aria-hidden /> : <PlayIcon className="h-4 w-4" aria-hidden />}
              {playing ? "Pause" : day >= total ? "Replay" : "Play"}
            </button>
            <div className="flex flex-col">
              <span className={`${ui.metric.secondaryCompact}`}>{formatDate(date)}</span>
              <span className={ui.caption}>
                {events.length === 0
                  ? "No rate changed for these origins since " + formatDate(range.from)
                  : `${events.length} ${events.length === 1 ? "date" : "dates"} when rates changed since ${formatDate(range.from)}`}
              </span>
            </div>
            {day < total && (
              <button
                type="button"
                className={`${ui.button({ variant: "ghost", size: "sm" })} ml-auto`}
                onClick={timeline.toToday}
              >
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                Today
              </button>
            )}
          </div>

          {/* The timeline: the date to scrub, a marker at every change */}
          <div className="relative h-8">
            <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-base-300" aria-hidden />
            <span
              className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary"
              style={{ width: `${(day / total) * 100}%` }}
              aria-hidden
            />
            {events.map((e, i) => (
              <button
                key={e.date}
                type="button"
                className={`group absolute top-1/2 z-10 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-base-100 ${tone(e)}`}
                // Changes a few days apart would sit on each other: later ones step up
                style={{ left: `${pct(e.date)}%`, marginTop: -16 * stackLevel[i] }}
                onClick={() => timeline.scrub(daysBetween(range.from, e.date))}
                aria-label={`${formatDate(e.date)}: ${describe(e)}`}
              >
                <span
                  role="tooltip"
                  className={`${ui.tooltip} pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 hidden w-72 -translate-x-1/2 p-3 text-left group-hover:block group-focus-visible:block`}
                >
                  <EventNote event={e} />
                </span>
              </button>
            ))}
            <input
              type="range"
              min={0}
              max={total}
              value={day}
              onChange={(e) => timeline.scrub(Number(e.target.value))}
              className="absolute inset-0 w-full cursor-pointer opacity-0"
              aria-label="Date"
              aria-valuetext={formatDate(date)}
            />
            <span
              className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-base-100 shadow"
              style={{ left: `${(day / total) * 100}%` }}
              aria-hidden
            />
          </div>
          <div className="flex justify-between text-xs text-base-content/60">
            <span>{formatDate(range.from)}</span>
            <span>Today</span>
          </div>

          {current && (
            <div className="rounded-lg border border-base-300 bg-base-200 p-3" aria-live="polite">
              <EventNote event={current} />
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <SwarmChart
      rates={frame}
      basis={basis}
      selected={selected}
      onSelect={onSelect}
      maxPct={maxPct}
      title="Time-lapse"
      description={`Every origin's rate on any date since ${formatDate(range.from)}, the start of the verified tariff data. Press play and watch the flags move as tariffs change.`}
      footer={footer}
    />
  );
};
