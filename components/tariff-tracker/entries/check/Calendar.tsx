"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { Select } from "@/components/ui/Select";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// A month on show, always open: the entry audit's date step. Days outside from–to can't be picked;
// month and year jump straight to any month; the arrow keys move the day (Page Up/Down a month).
// Dates are ISO strings throughout, worked on in UTC so no time zone shifts a day.

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const iso = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
const parts = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return { y, m: m - 1, d };
};
const addDays = (date: string, days: number) => {
  const { y, m, d } = parts(date);
  return iso(y, m, d + days);
};
const addMonths = (date: string, months: number) => {
  const { y, m, d } = parts(date);
  // The same day, or the month's last when it's shorter
  const last = new Date(Date.UTC(y, m + months + 1, 0)).getUTCDate();
  return iso(y, m + months, Math.min(d, last));
};
const clamp = (date: string, from: string, to: string) => (date < from ? from : date > to ? to : date);

export const Calendar = ({
  value,
  onChange,
  from,
  to,
  onPicked,
}: {
  value: string;
  onChange: (date: string) => void;
  from: string;
  to: string;
  // A day clicked (not moved to with the keys): the step can move on
  onPicked?: () => void;
}) => {
  // The month on show: the picked date's, or this month's
  const [shown, setShown] = useState(() => {
    const { y, m } = parts(value || to);
    return { y, m };
  });
  // A date typed or picked elsewhere brings its month into view
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const { y, m } = parts(value);
      if (y !== shown.y || m !== shown.m) setShown({ y, m });
    }
  }
  const grid = useRef<HTMLDivElement>(null);
  const focusKey = useRef(false);
  useEffect(() => {
    if (!focusKey.current) return;
    focusKey.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${value}"]`)?.focus();
  }, [value, shown]);

  const first = new Date(Date.UTC(shown.y, shown.m, 1)).getUTCDay();
  const days = new Date(Date.UTC(shown.y, shown.m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => iso(shown.y, shown.m, i + 1))];
  const monthStart = iso(shown.y, shown.m, 1);
  const canBack = monthStart > from;
  const canNext = iso(shown.y, shown.m + 1, 1) <= to;
  const go = (months: number) => {
    const next = parts(addMonths(monthStart, months));
    setShown({ y: next.y, m: next.m });
  };
  const fromYear = parts(from).y;
  const toYear = parts(to).y;
  // The day the keys move from: the picked one, or the first that can be picked this month
  const focusable = value && value.startsWith(monthStart.slice(0, 7)) ? value : clamp(monthStart, from, to);

  const onKey = (e: KeyboardEvent) => {
    const moves: Record<string, (d: string) => string> = {
      ArrowLeft: (d) => addDays(d, -1),
      ArrowRight: (d) => addDays(d, 1),
      ArrowUp: (d) => addDays(d, -7),
      ArrowDown: (d) => addDays(d, 7),
      PageUp: (d) => addMonths(d, -1),
      PageDown: (d) => addMonths(d, 1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    focusKey.current = true;
    onChange(clamp(move(value || focusable), from, to));
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-(--tt-ob-tile) p-4 ring-1 ring-(--tt-ob-tile-edge)">
      <div className="flex items-center gap-2">
        <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={() => go(-1)} disabled={!canBack} aria-label="Previous month">
          <ChevronLeftIcon className="h-5 w-5" aria-hidden />
        </button>
        <div className="flex flex-1 items-center justify-center gap-2">
          <Select
            size="sm"
            label="Month"
            className="w-36"
            value={shown.m}
            onChange={(m) => setShown((s) => ({ ...s, m }))}
            options={MONTHS.map((label, m) => ({ value: m, label, disabled: iso(shown.y, m + 1, 0) < from || iso(shown.y, m, 1) > to }))}
          />
          <Select
            size="sm"
            label="Year"
            className="w-24"
            value={shown.y}
            onChange={(y) => {
              // Into range: a month that's before the first date or after today moves to the nearest
              const next = parts(clamp(iso(y, shown.m, 1), from.slice(0, 8) + "01", to));
              setShown({ y: next.y, m: next.m });
            }}
            options={Array.from({ length: toYear - fromYear + 1 }, (_, i) => ({ value: fromYear + i, label: String(fromYear + i) }))}
          />
        </div>
        <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={() => go(1)} disabled={!canNext} aria-label="Next month">
          <ChevronRightIcon className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <div ref={grid} role="grid" aria-label={`${MONTHS[shown.m]} ${shown.y}`} onKeyDown={onKey} className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((d) => (
          <span key={d} role="columnheader" className="pb-1 text-center text-[0.7rem] font-semibold uppercase tracking-wide text-base-content/45">
            {d}
          </span>
        ))}
        {cells.map((date, i) =>
          date ? (
            <button
              key={date}
              type="button"
              role="gridcell"
              data-date={date}
              aria-selected={date === value}
              tabIndex={date === focusable ? 0 : -1}
              disabled={date < from || date > to}
              onClick={() => {
                onChange(date);
                onPicked?.();
              }}
              className={`${tt.display} flex h-10 items-center justify-center rounded-lg text-sm tabular-nums transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-default disabled:text-base-content/20 ${
                date === value
                  ? "bg-primary font-semibold text-primary-content"
                  : `text-base-content enabled:hover:bg-primary/10 ${date === to ? "font-semibold ring-1 ring-inset ring-primary/40" : ""}`
              }`}
            >
              {parts(date).d}
            </button>
          ) : (
            <span key={`pad-${i}`} />
          )
        )}
      </div>
    </div>
  );
};
