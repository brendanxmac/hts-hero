"use client";

import { useSyncExternalStore } from "react";

// Whether the import takeover is open, and at which step: opened by itself on a visit without
// imports (ImportTakeover), and again from the empty Home and Imports pages (SetupPanel), the plan
// card or the imports-to-finish banner. An ask starts at the beginning unless it names a step. One copy for the whole Tracker, outside React so any component can open it.

// "finish": the rows left to fix from an earlier sheet (toFinish.ts), opened from the Tracker
export type TakeoverStep = "hook" | "explain" | "choose" | "recent" | "paste" | "file" | "handy" | "done" | "finish";

interface TakeoverState {
  open: boolean;
  step: TakeoverStep;
  // What opened it, for analytics: "auto" on arrival, else the ask that was clicked
  from: string;
}

let state: TakeoverState = { open: false, step: "hook", from: "auto" };
const listeners = new Set<() => void>();
const set = (next: Partial<TakeoverState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export const openImportTakeover = (from: string, step: TakeoverStep = "hook") => set({ open: true, step, from });
export const closeImportTakeover = () => set({ open: false });
export const setTakeoverStep = (step: TakeoverStep) => set({ step });

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const CLOSED: TakeoverState = { open: false, step: "hook", from: "auto" };
export const useImportTakeover = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => CLOSED,
  );
