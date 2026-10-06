"use client";

import { useEffect, useRef, useState } from "react";
import { addDays } from "@/tariffs/engine-v2/history";
import { IsoDate } from "@/tariffs/engine-v2/types";
import { ChangeEvent, daysBetween } from "./history";

// The analysis's date, shared by everything that can show the past: the time-lapse (which has
// the full controls) and the globe (which follows along). Starts on today. Playing sweeps from the
// first verified date to today, pausing at each change so it can be seen.

// A full play, start to end
const PLAY_MS = 9000;
const TICK_MS = 40;
// A pause at each change, so the marks settle and the change can be read
const HOLD_MS = 1100;

export interface Timeline {
  range: { from: IsoDate; to: IsoDate };
  // Days since range.from; `total` is today
  day: number;
  total: number;
  date: IsoDate;
  atToday: boolean;
  playing: boolean;
  events: ChangeEvent[];
  // The latest change on or before the date: what's on screen only changes when this does
  current?: ChangeEvent;
  frameDate: IsoDate;
  scrub: (day: number) => void;
  // Play from the start if at today; pause if playing
  toggle: () => void;
  toToday: () => void;
}

export const useTimeline = (range: { from: IsoDate; to: IsoDate }, events: ChangeEvent[]): Timeline => {
  const total = Math.max(daysBetween(range.from, range.to) - 1, 1);
  const [day, setDay] = useState(total);
  const [playing, setPlaying] = useState(false);
  const date = addDays(range.from, day);
  const current = events.filter((e) => e.date <= date).pop();

  const hold = useRef(0);
  const lastEvent = useRef<string | undefined>(current?.date);
  useEffect(() => {
    if (!playing) return;
    const step = Math.max(1, Math.round((total * TICK_MS) / PLAY_MS));
    const timer = setInterval(() => {
      if (Date.now() < hold.current) return;
      setDay((d) => Math.min(d + step, total));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, total]);
  useEffect(() => {
    if (playing && day >= total) setPlaying(false);
  }, [playing, day, total]);
  useEffect(() => {
    if (current?.date !== lastEvent.current) {
      lastEvent.current = current?.date;
      if (playing) hold.current = Date.now() + HOLD_MS;
    }
  }, [current?.date, playing]);

  return {
    range,
    day,
    total,
    date,
    atToday: day >= total,
    playing,
    events,
    current,
    frameDate: current?.date ?? range.from,
    scrub: (next) => {
      setPlaying(false);
      setDay(Math.max(0, Math.min(next, total)));
    },
    toggle: () => {
      if (playing) return setPlaying(false);
      if (day >= total) setDay(0);
      setPlaying(true);
    },
    toToday: () => {
      setPlaying(false);
      setDay(total);
    },
  };
};
