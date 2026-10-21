"use client";

import { createContext, useContext } from "react";
import { CheckKind, TrackerAccess } from "@/libs/tariff-tracker/plan";
import { PremiumFeature } from "./features";

// The visitor's Tariff Tracker plan, and the ways up from it, for every part of the Tracker
export interface TrackerAccessValue {
  // Still finding out (signed in, plan not loaded yet)
  loading: boolean;
  signedIn: boolean;
  email: string | null;
  access: TrackerAccess;
  // On a paid plan (otherwise, signed in, on the usage-based trial)
  paid: boolean;
  // Checks left in the trial's allowance; Infinity when unlimited
  savingsLeft: number;
  auditsLeft: number;
  // Spends one check (a ref checked before is free again). Resolves to whether it's unlocked;
  // with none left it opens the plans instead, and signed out it goes to sign up
  spendCheck: (kind: CheckKind, ref: string, feature: PremiumFeature) => Promise<boolean>;
  // The plans, for an allowance that's used up or a plan that's too small
  openUpgrade: (feature: PremiumFeature) => void;
  // The right next step for a locked feature: sign up, or pick a plan
  unlock: (feature: PremiumFeature) => void;
  // What that step is called on a button
  unlockLabel: string;
  // Asks the server again: after the first imports start the trial
  refreshAccess: () => void;
}

export const TrackerAccessContext = createContext<TrackerAccessValue | null>(null);

export const useTrackerAccess = () => {
  const value = useContext(TrackerAccessContext);
  if (!value) throw new Error("useTrackerAccess must be used inside TrackerAccessProvider");
  return value;
};

// The same, or null outside the Tracker (the free calculator's pages have no provider)
export const useOptionalTrackerAccess = () => useContext(TrackerAccessContext);
