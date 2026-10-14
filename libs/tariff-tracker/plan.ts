import { TRACKER_TIERS, TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";

// What a visitor gets in the Tariff Tracker, worked out the same way on the server (which
// decides) and in the browser (which shows it). The rules are in PRICING.md: every account is on
// the usage-based trial from sign-up, with no time limit: savings checks on
// TRIAL_ALLOWANCE.savingsChecks imports, TRIAL_ALLOWANCE.auditChecks audit checks and alerts on
// TRIAL_ALLOWANCE.alertImports imports, never reset. Paid plans cover their tier's imports, with
// unlimited audit checks.

export type TrackerPlanKind = "anonymous" | "trial" | "paid";

// The kinds of check an allowance counts
export type CheckKind = "savings" | "audit";

// What the account has spent, kept in tracker_checks
export interface TrackerUsage {
  // Product keys (HTS code + country) whose savings were checked
  savingsChecked: string[];
  // Entry ids that were audited
  auditsChecked: string[];
}

export interface TrackerAccess {
  kind: TrackerPlanKind;
  // The paid plan, when there is one
  paidPlan: PricingPlan | null;
  // How many imports (pairs) the plan covers with alerts (and, paid, savings)
  pairLimit: number;
  usage: TrackerUsage;
}

// Paid plans, smallest first, with the tier each one is
export const TRACKER_PLANS = [
  { plan: PricingPlan.TARIFF_TRACKER_10, ...TRACKER_TIERS[0] },
  { plan: PricingPlan.TARIFF_TRACKER_30, ...TRACKER_TIERS[1] },
  { plan: PricingPlan.TARIFF_TRACKER_100, ...TRACKER_TIERS[2] },
  { plan: PricingPlan.TARIFF_TRACKER_500, ...TRACKER_TIERS[3] },
] as const;

export type TrackerPlan = (typeof TRACKER_PLANS)[number];

export const isTrackerPlan = (plan: string): plan is TrackerPlan["plan"] =>
  TRACKER_PLANS.some((p) => p.plan === plan);

export const trackerPlanFor = (plan: PricingPlan) => TRACKER_PLANS.find((p) => p.plan === plan);

export const NO_USAGE: TrackerUsage = { savingsChecked: [], auditsChecked: [] };

export const ANONYMOUS_ACCESS: TrackerAccess = {
  kind: "anonymous",
  paidPlan: null,
  pairLimit: 0,
  usage: NO_USAGE,
};

// A signed-in account's access from what it has spent and its active Tracker plans (largest wins)
export const trackerAccessFrom = ({
  usage,
  activePlans,
}: {
  usage: TrackerUsage;
  activePlans: PricingPlan[];
}): TrackerAccess => {
  const paid = TRACKER_PLANS.filter((p) => activePlans.includes(p.plan)).pop();
  if (paid) return { kind: "paid", paidPlan: paid.plan, pairLimit: paid.maxPairs, usage };
  return { kind: "trial", paidPlan: null, pairLimit: TRIAL_ALLOWANCE.alertImports, usage };
};

export const isPaid = (access: TrackerAccess) => access.kind === "paid";

// How many of a kind of check the account may spend in all; null when unlimited (or, for savings
// on a paid plan, when it follows the plan's coverage instead)
export const checkLimit = (access: TrackerAccess, kind: CheckKind): number | null => {
  if (access.kind === "anonymous") return 0;
  if (access.kind === "paid") return null;
  return kind === "savings" ? TRIAL_ALLOWANCE.savingsChecks : TRIAL_ALLOWANCE.auditChecks;
};

const spent = (access: TrackerAccess, kind: CheckKind) =>
  kind === "savings" ? access.usage.savingsChecked : access.usage.auditsChecked;

// Checks left to spend; Infinity when unlimited
export const checksLeft = (access: TrackerAccess, kind: CheckKind) => {
  const limit = checkLimit(access, kind);
  return limit === null ? Infinity : Math.max(0, limit - spent(access, kind).length);
};

export const hasChecked = (access: TrackerAccess, kind: CheckKind, ref: string) => spent(access, kind).includes(ref);

// Whether one more check of this ref may be spent: a ref checked before costs nothing again
export const canSpendCheck = (access: TrackerAccess, kind: CheckKind, ref: string) =>
  hasChecked(access, kind, ref) || checksLeft(access, kind) > 0;

// The products whose savings are shown: those checked with the trial's allowance, and on a paid
// plan every product it covers as well
export const savingsUnlocked = (access: TrackerAccess, coveredKeys: Set<string>) => {
  const keys = new Set(access.usage.savingsChecked);
  if (access.kind === "paid") coveredKeys.forEach((k) => keys.add(k));
  return keys;
};

// Whether an audited entry's result is shown
export const auditUnlocked = (access: TrackerAccess, entryId: string) =>
  access.kind === "paid" || hasChecked(access, "audit", entryId);
