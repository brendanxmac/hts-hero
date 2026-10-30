"use client";

import { useSyncExternalStore } from "react";

// Whether the feature tour (FeatureTour) is open, and at which step. It opens by itself once: on
// the first Tracker visit, and again once right after the first imports are added (from the
// alerts on, since the imports are in). The sidebar's "Product Tour" opens it any time. One copy
// for the whole Tracker, outside React so any component can open it (like takeoverStore).

export type TourStepId = "welcome" | "imports" | "alerts" | "manage" | "adcvd" | "savings" | "audits";

interface TourState {
  open: boolean;
  start: TourStepId;
  // What opened it, for analytics: "first_visit", "imports_added" or "sidebar"
  from: string;
}

let state: TourState = { open: false, start: "imports", from: "sidebar" };
const listeners = new Set<() => void>();
const set = (next: Partial<TourState>) => {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
};

export const openFeatureTour = (from: string, start: TourStepId = "imports") => set({ open: true, start, from });
export const closeFeatureTour = () => set({ open: false });

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
const CLOSED: TourState = { open: false, start: "imports", from: "sidebar" };
export const useFeatureTour = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => CLOSED,
  );

// Seen on this device, per account: the first-visit tour, and the one after the first imports
const SEEN_KEY = "hts-hero-tariff-tracker-tour-seen";
export type TourMoment = "first_visit" | "imports_added";
const key = (userId: string, moment: TourMoment) => `${SEEN_KEY}:${userId}:${moment}`;
export const tourSeen = (userId: string, moment: TourMoment) => {
  try {
    return window.localStorage.getItem(key(userId, moment)) === "1";
  } catch {
    // Storage blocked: never open it by itself, rather than every visit
    return true;
  }
};
export const markTourSeen = (userId: string, moment: TourMoment) => {
  try {
    window.localStorage.setItem(key(userId, moment), "1");
  } catch {
    // Not critical
  }
};

// Opens it by itself, once per account on this device, at that moment
export const openTourOnce = (userId: string, moment: TourMoment, start: TourStepId) => {
  if (tourSeen(userId, moment)) return;
  markTourSeen(userId, moment);
  // After the imports, the first-visit tour has nothing left to show
  if (moment === "imports_added") markTourSeen(userId, "first_visit");
  openFeatureTour(moment, start);
};
