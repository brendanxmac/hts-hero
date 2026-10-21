"use client";

import { useSyncExternalStore } from "react";

// The rows left to fix when a sheet's ready rows were tracked without them (SheetReview's "Start
// with the N ready"): kept on this device, per account, so the footer's "can be added any time" is
// true. The banner over the Tracker (FinishSetupBanner) counts them and reopens them in the same grid and fix panel
// (ImportTakeover's "finish" step); a row leaves the list once it's tracked or deleted. Only the
// code, the country, what was wrong and the product's own description are kept.

export interface RowToFinish {
  code: string;
  country: string;
  reason: string;
  description?: string;
  // The file (or "Your pasted list") it came from
  from?: string;
}

const PREFIX = "tt-imports-to-finish:";
const keyFor = (userId: string | null | undefined) => `${PREFIX}${userId ?? "guest"}`;
const NONE: RowToFinish[] = [];

const storage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

// One parsed copy per key, so the snapshot stays the same object until it changes
const cache = new Map<string, { raw: string | null; rows: RowToFinish[] }>();
const read = (key: string): RowToFinish[] => {
  const raw = storage()?.getItem(key) ?? null;
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.rows;
  let rows = NONE;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) rows = parsed.filter((r) => r && typeof r.code === "string" && typeof r.country === "string");
  } catch {
    rows = NONE;
  }
  cache.set(key, { raw, rows });
  return rows;
};

const listeners = new Set<() => void>();
const write = (key: string, rows: RowToFinish[]) => {
  try {
    if (rows.length) storage()?.setItem(key, JSON.stringify(rows));
    else storage()?.removeItem(key);
  } catch {
    // Full or blocked storage: nothing to keep them in
  }
  listeners.forEach((l) => l());
};

const same = (a: RowToFinish, b: RowToFinish) =>
  a.code.trim() === b.code.trim() && a.country.trim() === b.country.trim() && (a.description ?? "") === (b.description ?? "");

// More rows left from another sheet: added to the ones already waiting, each once
export const keepToFinish = (userId: string | null | undefined, rows: RowToFinish[]) => {
  if (!rows.length) return;
  const key = keyFor(userId);
  const kept = read(key);
  write(key, [...kept, ...rows.filter((r) => !kept.some((k) => same(k, r)))]);
};

// After a pass over them: the ones still left, in place of the list
export const replaceToFinish = (userId: string | null | undefined, rows: RowToFinish[]) => write(keyFor(userId), rows);

const subscribe = (l: () => void) => {
  listeners.add(l);
  // Another tab changing the list
  const onStorage = (e: StorageEvent) => e.key?.startsWith(PREFIX) && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
};

export const useToFinish = (userId: string | null | undefined) =>
  useSyncExternalStore(
    subscribe,
    () => read(keyFor(userId)),
    () => NONE
  );

// The rows as a little sheet for the review grid: a header, then one row each
export const TO_FINISH_HEADER = ["HTS code", "Country of origin", "Product", "From"];
export const toFinishSheet = (rows: RowToFinish[]): string[][] => [
  TO_FINISH_HEADER,
  ...rows.map((r) => [r.code, r.country, r.description ?? "", r.from ?? ""]),
];
