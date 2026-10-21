import { useSyncExternalStore } from "react";

// What the plans dialog can say about the user's own imports. The dialog sits above the Tracker's
// data (in TrackerAccessProvider), so the Tracker publishes these from inside it (UpgradeStatsBridge).

export interface UpgradeStats {
  imports: number;
  tracked: number;
  // Rate changes that hit the imports in the last 12 months, and how many imports they hit
  changes12m: number;
  productsHit12m: number;
  // The biggest increase among them, in %
  biggestRise: { code: string; country: string; pct: number } | null;
  // What the free plan would take away (the trial's loss): tracked imports that would lose alerts
  // and impact checks, and imports an AD/CVD case may cover (in all, and among those losing alerts)
  losingAlerts: number;
  adcvdFlagged: number;
  adcvdLosing: number;
  // Flagged imports without alerts now (after the trial: what it lost)
  adcvdUntracked: number;
}

let stats: UpgradeStats | null = null;
const listeners = new Set<() => void>();

export const setUpgradeStats = (next: UpgradeStats | null) => {
  if (JSON.stringify(next) === JSON.stringify(stats)) return;
  stats = next;
  listeners.forEach((l) => l());
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useUpgradeStats = () => useSyncExternalStore(subscribe, () => stats, (): UpgradeStats | null => null);
