"use client";

import { createContext, useContext } from "react";
import { TrackerAccess } from "@/libs/tariff-tracker/plan";
import { PremiumFeature } from "./features";

// The visitor's Tariff Tracker plan, and the ways up from it, for every part of the Tracker
export interface TrackerAccessValue {
  // Still finding out (signed in, plan not loaded yet)
  loading: boolean;
  signedIn: boolean;
  email: string | null;
  access: TrackerAccess;
  // Trial or paid: everything unlocked
  premium: boolean;
  canStartTrial: boolean;
  daysLeft: number;
  // The trial dialog, opened from a feature; anonymous visitors go to sign up instead
  openTrial: (feature: PremiumFeature) => void;
  // The plans, for a trial that's running or over, or a plan that's too small
  openUpgrade: (feature: PremiumFeature) => void;
  // The right next step for a locked feature: sign up, start the trial or upgrade
  unlock: (feature: PremiumFeature) => void;
  // What that step is called on a button
  unlockLabel: string;
}

export const TrackerAccessContext = createContext<TrackerAccessValue | null>(null);

export const useTrackerAccess = () => {
  const value = useContext(TrackerAccessContext);
  if (!value) throw new Error("useTrackerAccess must be used inside TrackerAccessProvider");
  return value;
};

// The same, or null outside the Tracker (the free calculator's pages have no provider)
export const useOptionalTrackerAccess = () => useContext(TrackerAccessContext);
