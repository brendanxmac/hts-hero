import {
  FREE_TRACKED_PAIRS,
  TRACKER_TIERS,
  TRIAL_DAYS,
  TRIAL_PAIRS,
} from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";

// What a visitor gets in the Tariff Tracker, worked out the same way on the server (which
// decides) and in the browser (which shows it). The rules are in PRICING.md: a free account
// tracks FREE_TRACKED_PAIRS pairs; one 14-day trial of TRIAL_PAIRS can be started at any time;
// paid plans track their tier's pairs.

export type TrackerPlanKind = "anonymous" | "free" | "trial" | "paid";

export interface TrackerTrial {
  startedAt: string;
  endsAt: string;
}

export interface TrackerAccess {
  kind: TrackerPlanKind;
  // The paid plan, when there is one
  paidPlan: PricingPlan | null;
  // How many products (pairs) are tracked: the first this many in the catalog
  pairLimit: number;
  // The account's trial, running or over; null if it never started one
  trial: TrackerTrial | null;
}

// Paid plans, smallest first, with the tier each one is
export const TRACKER_PLANS = [
  { plan: PricingPlan.TARIFF_TRACKER_30, ...TRACKER_TIERS[0] },
  { plan: PricingPlan.TARIFF_TRACKER_100, ...TRACKER_TIERS[1] },
  { plan: PricingPlan.TARIFF_TRACKER_500, ...TRACKER_TIERS[2] },
] as const;

export type TrackerPlan = (typeof TRACKER_PLANS)[number];

export const isTrackerPlan = (plan: string): plan is TrackerPlan["plan"] =>
  TRACKER_PLANS.some((p) => p.plan === plan);

export const trackerPlanFor = (plan: PricingPlan) => TRACKER_PLANS.find((p) => p.plan === plan);

export const ANONYMOUS_ACCESS: TrackerAccess = {
  kind: "anonymous",
  paidPlan: null,
  pairLimit: 0,
  trial: null,
};

const DAY = 24 * 60 * 60 * 1000;

export const trialEndFrom = (start: Date) => new Date(start.getTime() + TRIAL_DAYS * DAY);

// A signed-in account's access from its trial and its active Tracker plans (largest wins)
export const trackerAccessFrom = ({
  trial,
  activePlans,
  now = new Date(),
}: {
  trial: TrackerTrial | null;
  activePlans: PricingPlan[];
  now?: Date;
}): TrackerAccess => {
  const paid = TRACKER_PLANS.filter((p) => activePlans.includes(p.plan)).pop();
  if (paid) return { kind: "paid", paidPlan: paid.plan, pairLimit: paid.maxPairs, trial };
  if (trial && new Date(trial.endsAt) > now) {
    return { kind: "trial", paidPlan: null, pairLimit: TRIAL_PAIRS, trial };
  }
  return { kind: "free", paidPlan: null, pairLimit: FREE_TRACKED_PAIRS, trial };
};

// Everything in the Tracker: rate history, savings, alerts, audits
export const isPremium = (access: TrackerAccess) => access.kind === "trial" || access.kind === "paid";

// Only an account that has never had a trial or a plan can start one
export const canStartTrial = (access: TrackerAccess) => access.kind === "free" && !access.trial;

// Whole days left, counting today; 0 once it's over
export const trialDaysLeft = (access: TrackerAccess, now = new Date()) =>
  access.trial ? Math.max(0, Math.ceil((new Date(access.trial.endsAt).getTime() - now.getTime()) / DAY)) : 0;
