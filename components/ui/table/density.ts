"use client";

import { useSyncExternalStore } from "react";

// How tightly a long table's rows are drawn (DESIGN_SYSTEM.md §15 "Tables"): comfortable by
// default (about 48px a row), compact for scanning many rows (about 40px). Remembered on this
// device for each table that offers the switch.

export type Density = "comfortable" | "compact";

const KEY = "hts-hero-table-density";
const listeners = new Set<() => void>();

const read = (table: string): Density => {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, Density>;
    return all[table] === "compact" ? "compact" : "comfortable";
  } catch {
    return "comfortable";
  }
};

const write = (table: string, density: Density) => {
  try {
    const all = JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, Density>;
    window.localStorage.setItem(KEY, JSON.stringify({ ...all, [table]: density }));
  } catch {
    // Unavailable (private mode): kept for this visit
  }
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// The density for one table ("imports"), and the way to change it
export const useDensity = (table: string): [Density, (density: Density) => void] => {
  const density = useSyncExternalStore(subscribe, () => read(table), () => "comfortable" as Density);
  return [density, (next) => write(table, next)];
};
