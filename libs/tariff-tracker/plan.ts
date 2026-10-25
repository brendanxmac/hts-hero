import { REVERSE_TRIAL, TRACKER_TIERS, TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";

// What a visitor gets in the Tariff Tracker, worked out the same way on the server (which
// decides) and in the browser (which shows it). The rules are in PRICING.md: every account gets
// a 14-day reverse trial (REVERSE_TRIAL: everything, on up to 200 imports) that starts when it adds
// its first real imports, then drops to the free plan (alerts on TRIAL_ALLOWANCE.alertImports
// imports). Before it starts, the account has the trial's access with no end date. Paid plans
// cover their tier's imports, with unlimited checks.

export type TrackerPlanKind = "anonymous" | "trial" | "free" | "paid";

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
  // When the 14-day trial ends (or ended); null signed out, and on a trial not started yet
  trialEndsAt: string | null;
  // The Tracker plan the account had, when it has none now (cancelled or unpaid)
  pastPlan?: PastPlan | null;
  // Set when the admin is previewing a trial stage (?trialPreview=): what's shown, not what's covered
  preview?: TrialPreview;
}

export interface PastPlan {
  plan: PricingPlan;
  endedAt: string;
}

// The plan stages the admin can preview on their own account (the access route's ?trialPreview=)
export type TrialPreview = "start" | "trial" | "ending" | "ended" | "paid" | "lapsed";
export const TRIAL_PREVIEWS: TrialPreview[] = ["start", "trial", "ending", "ended", "paid", "lapsed"];

// The access as it would look at that stage: before the trial starts, mid-trial (10 days left), its
// last days (2 left), just after it ended, on the 30-import plan, or a week after that plan ended
export const previewAccess = (access: TrackerAccess, stage: TrialPreview, now = Date.now()): TrackerAccess => {
  const days = stage === "trial" ? 10 : stage === "ending" ? 2 : -1;
  const trialEndsAt = new Date(now + days * DAY - 60 * 60 * 1000).toISOString();
  const free: TrackerAccess = { ...access, kind: "free", paidPlan: null, pairLimit: TRIAL_ALLOWANCE.alertImports, trialEndsAt, pastPlan: null, preview: stage };
  switch (stage) {
    case "start":
      return { ...access, kind: "trial", paidPlan: null, pairLimit: REVERSE_TRIAL.imports, trialEndsAt: null, pastPlan: null, preview: stage };
    case "ended":
      return free;
    case "paid":
      return { ...access, kind: "paid", paidPlan: TRACKER_PLANS[1].plan, pairLimit: TRACKER_PLANS[1].maxPairs, pastPlan: null, preview: stage };
    case "lapsed":
      return { ...free, pastPlan: { plan: TRACKER_PLANS[1].plan, endedAt: new Date(now - 7 * DAY).toISOString() } };
    default:
      return { ...access, kind: "trial", paidPlan: null, pairLimit: REVERSE_TRIAL.imports, trialEndsAt, pastPlan: null, preview: stage };
  }
};

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
  trialEndsAt: null,
};

const DAY = 24 * 60 * 60 * 1000;

// When an account's trial ends: REVERSE_TRIAL.days after it started (its first real imports, or
// the day existing accounts got a fresh trial, whichever is later); null until it starts
export const trialEndsAt = (startedAt: string | null | undefined) => {
  const started = startedAt ? Date.parse(startedAt) : NaN;
  if (Number.isNaN(started)) return null;
  const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`);
  return new Date(Math.max(started, fresh) + REVERSE_TRIAL.days * DAY).toISOString();
};

// Signed in, on the trial, and it hasn't started: no imports yet, so no countdown
export const trialNotStarted = (access: Pick<TrackerAccess, "kind" | "trialEndsAt">) =>
  access.kind === "trial" && access.trialEndsAt === null;

// Days left on the trial, rounded up (1 on its last day, 0 or less once it's over); null without one
export const trialDaysLeft = (access: Pick<TrackerAccess, "trialEndsAt">, now = Date.now()) =>
  access.trialEndsAt ? Math.ceil((Date.parse(access.trialEndsAt) - now) / DAY) : null;

// A signed-in account's access from what it has spent and its active Tracker plans (largest wins)
export const trackerAccessFrom = ({
  usage,
  activePlans,
  trialStartedAt,
  pastPlan = null,
  now = Date.now(),
}: {
  usage: TrackerUsage;
  activePlans: PricingPlan[];
  // When the trial started (tracker_onboarding.trial_started_at); null until the first imports
  trialStartedAt?: string | null;
  // The latest Tracker purchase, active or not
  pastPlan?: PastPlan | null;
  now?: number;
}): TrackerAccess => {
  const ends = trialEndsAt(trialStartedAt);
  const paid = TRACKER_PLANS.filter((p) => activePlans.includes(p.plan)).pop();
  if (paid) return { kind: "paid", paidPlan: paid.plan, pairLimit: paid.maxPairs, usage, trialEndsAt: ends };
  if (ends === null || now < Date.parse(ends)) return { kind: "trial", paidPlan: null, pairLimit: REVERSE_TRIAL.imports, usage, trialEndsAt: ends, pastPlan };
  return { kind: "free", paidPlan: null, pairLimit: TRIAL_ALLOWANCE.alertImports, usage, trialEndsAt: ends, pastPlan };
};

export const isPaid = (access: TrackerAccess) => access.kind === "paid";

// Everything the Tracker sells: a paid plan, or the 14-day trial
export const hasFullAccess = (access: TrackerAccess) => access.kind === "paid" || access.kind === "trial";

// How many of a kind of check the account may spend in all; null when unlimited (or, for savings
// on a paid plan, when it follows the plan's coverage instead)
export const checkLimit = (access: TrackerAccess, kind: CheckKind): number | null => {
  if (access.kind === "anonymous") return 0;
  if (hasFullAccess(access)) return null;
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
  if (hasFullAccess(access)) coveredKeys.forEach((k) => keys.add(k));
  return keys;
};

// Whether an audited entry's result is shown
export const auditUnlocked = (access: TrackerAccess, entryId: string) =>
  hasFullAccess(access) || hasChecked(access, "audit", entryId);

// Import keys, highest duty first (keys without a product last, in their order): which picks stay
// tracked when there are more than the plan covers, as when a trial ends
export const byDuty = (keys: string[], products: { key: string; result: { totalDuty: number } }[]) => {
  const duty = new Map(products.map((p) => [p.key, p.result.totalDuty]));
  return [...keys].sort((a, b) => (duty.get(b) ?? -Infinity) - (duty.get(a) ?? -Infinity));
};
