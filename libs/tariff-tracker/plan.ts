import { ALERT_TIERS, AUDIT_TIERS, REVERSE_TRIAL, TRACKER_TIERS, TRIAL_ALLOWANCE, trialLengthDays } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";

// What a visitor gets in Duty Guard, worked out the same way on the server (which
// decides) and in the browser (which shows it). The rules are in PRICING.md: every account gets
// a 14-day reverse trial (REVERSE_TRIAL: everything, on up to 200 imports) that starts when it adds
// its first real imports, then drops to the free plan (alerts on TRIAL_ALLOWANCE.alertImports
// imports: none, so a teaser email only). Before it starts, the account has the trial's access with
// no end date. Paid plans cover their tier's products: Duty Guard Essentials plans get alerts, Duty Guard Pro
// plans add Savings and Audits with unlimited checks (TrackerEntitlements).

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

// What the account's plan unlocks beyond its products
export interface TrackerEntitlements {
  // Savings and Audits: Duty Guard Pro plans and the trial
  audits: boolean;
  // Slack and Microsoft Teams alerts: plans for 100+ products and the trial
  chat: boolean;
  // How many email addresses alerts can go to
  alertEmails: number;
}

export interface TrackerAccess {
  kind: TrackerPlanKind;
  entitlements: TrackerEntitlements;
  // The paid plan, when there is one
  paidPlan: PricingPlan | null;
  // How many imports (pairs) the plan covers with alerts (and, paid, savings)
  pairLimit: number;
  usage: TrackerUsage;
  // When the 14-day trial ends (or ended); null signed out, and on a trial not started yet
  trialEndsAt: string | null;
  // Duty Guard plan the account had, when it has none now (cancelled or unpaid)
  pastPlan?: PastPlan | null;
  // Set when the admin is previewing a trial stage (?trialPreview=): what's shown, not what's covered
  preview?: TrialPreview;
}

export interface PastPlan {
  plan: PricingPlan;
  endedAt: string;
}

// The plan stages the admin can preview on their own account (the access route's ?trialPreview=)
export type TrialPreview = "start" | "trial" | "ending" | "ended" | "paid" | "alerts" | "lapsed";
export const TRIAL_PREVIEWS: TrialPreview[] = ["start", "trial", "ending", "ended", "paid", "alerts", "lapsed"];

const EVERYTHING: TrackerEntitlements = { audits: true, chat: true, alertEmails: AUDIT_TIERS[AUDIT_TIERS.length - 1].emails };
const FREE_ENTITLEMENTS: TrackerEntitlements = { audits: false, chat: false, alertEmails: 1 };

// The access as it would look at that stage: before the trial starts, mid-trial (10 days left), its
// last days (2 left), just after it ended, on a 25-product plan of either offer, or a week after
// that plan ended
export const previewAccess = (access: TrackerAccess, stage: TrialPreview, now = Date.now()): TrackerAccess => {
  const days = stage === "trial" ? 10 : stage === "ending" ? 2 : -1;
  const trialEndsAt = new Date(now + days * DAY - 60 * 60 * 1000).toISOString();
  const free: TrackerAccess = { ...access, kind: "free", entitlements: FREE_ENTITLEMENTS, paidPlan: null, pairLimit: TRIAL_ALLOWANCE.alertImports, trialEndsAt, pastPlan: null, preview: stage };
  const sample = AUDIT_PLANS[1];
  switch (stage) {
    case "start":
      return { ...access, kind: "trial", entitlements: EVERYTHING, paidPlan: null, pairLimit: REVERSE_TRIAL.imports, trialEndsAt: null, pastPlan: null, preview: stage };
    case "ended":
      return free;
    case "paid":
      return { ...access, kind: "paid", entitlements: entitlementsOf(sample), paidPlan: sample.plan, pairLimit: sample.maxPairs, pastPlan: null, preview: stage };
    case "alerts":
      return { ...access, kind: "paid", entitlements: entitlementsOf(ALERT_PLANS[1]), paidPlan: ALERT_PLANS[1].plan, pairLimit: ALERT_PLANS[1].maxPairs, pastPlan: null, preview: stage };
    case "lapsed":
      return { ...free, pastPlan: { plan: sample.plan, endedAt: new Date(now - 7 * DAY).toISOString() } };
    default:
      return { ...access, kind: "trial", entitlements: EVERYTHING, paidPlan: null, pairLimit: REVERSE_TRIAL.imports, trialEndsAt, pastPlan: null, preview: stage };
  }
};

export type TrackerOffer = "alerts" | "audits";

// The plans on sale, smallest first, each with its tier
export const ALERT_PLANS = [
  { plan: PricingPlan.DUTY_GUARD_ESSENTIALS_10, offer: "alerts", ...ALERT_TIERS[0] },
  { plan: PricingPlan.DUTY_GUARD_ESSENTIALS_25, offer: "alerts", ...ALERT_TIERS[1] },
  { plan: PricingPlan.DUTY_GUARD_ESSENTIALS_100, offer: "alerts", ...ALERT_TIERS[2] },
  { plan: PricingPlan.DUTY_GUARD_ESSENTIALS_500, offer: "alerts", ...ALERT_TIERS[3] },
] as const;

export const AUDIT_PLANS = [
  { plan: PricingPlan.DUTY_GUARD_PRO_10, offer: "audits", ...AUDIT_TIERS[0] },
  { plan: PricingPlan.DUTY_GUARD_PRO_25, offer: "audits", ...AUDIT_TIERS[1] },
  { plan: PricingPlan.DUTY_GUARD_PRO_100, offer: "audits", ...AUDIT_TIERS[2] },
  { plan: PricingPlan.DUTY_GUARD_PRO_500, offer: "audits", ...AUDIT_TIERS[3] },
] as const;

export const TRACKER_PLANS = [...ALERT_PLANS, ...AUDIT_PLANS] as const;

export type TrackerPlan = (typeof TRACKER_PLANS)[number];

// Duty Guard plans sold until 2026-10-31. Not on sale; anyone still on one keeps its
// products and everything else, at the price they pay.
export const LEGACY_TRACKER_PLANS = [
  { plan: PricingPlan.TARIFF_TRACKER_10, ...TRACKER_TIERS[0] },
  { plan: PricingPlan.TARIFF_TRACKER_30, ...TRACKER_TIERS[1] },
  { plan: PricingPlan.TARIFF_TRACKER_100, ...TRACKER_TIERS[2] },
  { plan: PricingPlan.TARIFF_TRACKER_500, ...TRACKER_TIERS[3] },
] as const;

type OwnedPlan = TrackerPlan | (typeof LEGACY_TRACKER_PLANS)[number];

// Every plan an account can hold, the one that wins last when it holds more than one: Duty Guard Pro
// beat alerts, then the most products
const OWNED_PLANS: readonly OwnedPlan[] = [...ALERT_PLANS, ...LEGACY_TRACKER_PLANS, ...AUDIT_PLANS];

export const OWNED_PLAN_NAMES = OWNED_PLANS.map((p) => p.plan);

const isLegacy = (plan: OwnedPlan) => !("offer" in plan);

// Whether a plan is one of Duty Guard's, on sale or not
export const isTrackerPlan = (plan: string): plan is OwnedPlan["plan"] => OWNED_PLANS.some((p) => p.plan === plan);

// Whether a plan can be bought today
export const isSellablePlan = (plan: string): plan is TrackerPlan["plan"] => TRACKER_PLANS.some((p) => p.plan === plan);

export const trackerPlanFor = (plan: PricingPlan) => OWNED_PLANS.find((p) => p.plan === plan);

// The Duty Guard Essentials or Duty Guard Pro plan that fits a number of products; null above the largest
export const planFitting = (offer: TrackerOffer, imports: number): TrackerPlan | null =>
  (offer === "alerts" ? ALERT_PLANS : AUDIT_PLANS).find((p) => imports <= p.maxPairs) ?? null;

const entitlementsOf = (plan: OwnedPlan): TrackerEntitlements =>
  isLegacy(plan) ? EVERYTHING : { audits: (plan as TrackerPlan).offer === "audits", chat: (plan as TrackerPlan).teams, alertEmails: (plan as TrackerPlan).emails };

export const NO_USAGE: TrackerUsage = { savingsChecked: [], auditsChecked: [] };

export const ANONYMOUS_ACCESS: TrackerAccess = {
  kind: "anonymous",
  entitlements: FREE_ENTITLEMENTS,
  paidPlan: null,
  pairLimit: 0,
  usage: NO_USAGE,
  trialEndsAt: null,
};

const DAY = 24 * 60 * 60 * 1000;

// When an account's trial ends: its length (trialLengthDays: a week, two for older trials) after it started (its first real imports, or
// the day existing accounts got a fresh trial, whichever is later); null until it starts
export const trialEndsAt = (startedAt: string | null | undefined) => {
  const started = startedAt ? Date.parse(startedAt) : NaN;
  if (Number.isNaN(started)) return null;
  const fresh = Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`);
  const from = Math.max(started, fresh);
  return new Date(from + trialLengthDays(from) * DAY).toISOString();
};

// A trial's length in days, from when it started
export const trialLengthFrom = (startedAt: string | null | undefined) => {
  const started = startedAt ? Date.parse(startedAt) : NaN;
  if (Number.isNaN(started)) return REVERSE_TRIAL.days;
  return trialLengthDays(Math.max(started, Date.parse(`${REVERSE_TRIAL.freshStartOn}T00:00:00Z`)));
};

// Signed in, on the trial, and it hasn't started: no imports yet, so no countdown
export const trialNotStarted = (access: Pick<TrackerAccess, "kind" | "trialEndsAt">) =>
  access.kind === "trial" && access.trialEndsAt === null;

// Days left on the trial, rounded up (1 on its last day, 0 or less once it's over); null without one
export const trialDaysLeft = (access: Pick<TrackerAccess, "trialEndsAt">, now = Date.now()) =>
  access.trialEndsAt ? Math.ceil((Date.parse(access.trialEndsAt) - now) / DAY) : null;

// A signed-in account's access from what it has spent and its active Duty Guard plans (largest wins)
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
  // The latest Duty Guard purchase, active or not
  pastPlan?: PastPlan | null;
  now?: number;
}): TrackerAccess => {
  const ends = trialEndsAt(trialStartedAt);
  const paid = OWNED_PLANS.filter((p) => activePlans.includes(p.plan)).pop();
  if (paid) return { kind: "paid", entitlements: entitlementsOf(paid), paidPlan: paid.plan, pairLimit: paid.maxPairs, usage, trialEndsAt: ends };
  if (ends === null || now < Date.parse(ends)) return { kind: "trial", entitlements: EVERYTHING, paidPlan: null, pairLimit: REVERSE_TRIAL.imports, usage, trialEndsAt: ends, pastPlan };
  return { kind: "free", entitlements: FREE_ENTITLEMENTS, paidPlan: null, pairLimit: TRIAL_ALLOWANCE.alertImports, usage, trialEndsAt: ends, pastPlan };
};

export const isPaid = (access: TrackerAccess) => access.kind === "paid";

// Alerts on the plan's products: a paid plan, or the trial
export const hasAlerts = (access: TrackerAccess) => access.kind === "paid" || access.kind === "trial";

// Savings and Audits: a Duty Guard Pro plan, or the trial
export const hasAudits = (access: TrackerAccess) => access.entitlements.audits;

// How many of a kind of check the account may spend in all; null when unlimited (or, for savings
// on a paid plan, when it follows the plan's coverage instead)
export const checkLimit = (access: TrackerAccess, kind: CheckKind): number | null => {
  if (access.kind === "anonymous") return 0;
  if (hasAudits(access)) return null;
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

// Nothing to spend or record: already checked, or savings on a plan that covers them
export const freeCheck = (access: TrackerAccess, kind: CheckKind, ref: string) =>
  hasChecked(access, kind, ref) || (kind === "savings" && isPaid(access) && hasAudits(access));

// The products whose savings are shown: those checked with the trial's allowance, and on a paid
// plan every product it covers as well
export const savingsUnlocked = (access: TrackerAccess, coveredKeys: Set<string>) => {
  const keys = new Set(access.usage.savingsChecked);
  if (hasAudits(access)) coveredKeys.forEach((k) => keys.add(k));
  return keys;
};

// Whether an audited entry's result is shown
export const auditUnlocked = (access: TrackerAccess, entryId: string) =>
  hasAudits(access) || hasChecked(access, "audit", entryId);

// Import keys, highest duty first (keys without a product last, in their order): which picks stay
// tracked when there are more than the plan covers, as when a trial ends
export const byDuty = (keys: string[], products: { key: string; result: { totalDuty: number } }[]) => {
  const duty = new Map(products.map((p) => [p.key, p.result.totalDuty]));
  return [...keys].sort((a, b) => (duty.get(b) ?? -Infinity) - (duty.get(a) ?? -Infinity));
};
