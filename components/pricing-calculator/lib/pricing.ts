// Every price on /pricing-calculator, and the math that turns choices into an estimate.
// Prices are monthly list prices in USD; annual billing takes ANNUAL_DISCOUNT off each one.

import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";

export type Billing = "monthly" | "annual";

export const ANNUAL_DISCOUNT = 0.15;

// The Tariff Calculator is free: unlimited lookups, no account. A free account unlocks Analysis
// and the plain-English why. See PRICING.md.

// The free plan's allowances (PRICING.md). alertImports is what every account tracks free once its
// 14-day trial (REVERSE_TRIAL) is over: none (2026-10-18). Free accounts keep the Tariff News alerts
// (every new US tariff action), not alerts on their own imports. The savings and audit checks are
// paused with savings and audits (libs/tariff-tracker/features.ts) and never reset
export const TRIAL_ALLOWANCE = {
  // Imports (pairs) whose savings can be checked, the qualification check included
  savingsChecks: 5,
  // Past entries checked against the duty in force on their date (entry audit, refund check)
  auditChecks: 10,
  // Tracked imports: alerts and impact checks run on these; the slots can be moved. 10 before the
  // Tracker MVP (MVP_TRIM.md), 5 until the reverse trial
  alertImports: 0,
} as const;

// The Tariff Tracker's reverse trial (PRICING.md): every account gets everything the Tracker sells,
// on up to `imports` imports, for `days` days from sign-up, with no card and nothing to start.
// Accounts made before `freshStartOn` get their `days` from that day instead (set it to the deploy
// day). After it, the account is on the free plan: TRIAL_ALLOWANCE.alertImports tracked imports.
export const REVERSE_TRIAL = {
  days: 14,
  imports: 200,
  freshStartOn: "2026-10-20",
} as const;

// Tariff Tracker is priced by the number of imports (HTS code + country of origin pairs) it covers.
// Before the Tracker MVP (MVP_TRIM.md), with savings and audits included: $19 / $49 / $149 / $249
export const TRACKER_TIERS = [
  { maxPairs: 10, price: 12 },
  { maxPairs: 30, price: 29 },
  { maxPairs: 100, price: 89 },
  { maxPairs: 500, price: 149 },
] as const;
// Launch pricing (PRICING.md): today's tiers are the tracking-only launch prices, locked in for as
// long as a subscriber stays subscribed. From `endsAt`, savings and audits join the Tracker and new
// subscribers pay `nextPrices` (by tier imports). Shown in the plans dialog until it ends.
export const LAUNCH_PRICING = {
  // New prices from mid-November, after savings and audits ship in October (moved from Oct 23 on
  // 2026-10-18)
  endsAt: "2026-11-13T23:59:59-05:00",
  endsLabel: "Fri, Nov 13",
  endsDay: "Nov 13",
  nextPrices: { 10: 19, 30: 49, 100: 149, 500: 249 } as Record<number, number>,
} as const;

export const launchPricingActive = (now = Date.now()) => now < Date.parse(LAUNCH_PRICING.endsAt);

export const TRACKER_MAX_LISTED_PAIRS = TRACKER_TIERS[TRACKER_TIERS.length - 1].maxPairs;

export type TrackerTier = (typeof TRACKER_TIERS)[number];

// HTS Hero Managed (the Tracker's Expert help): we manage every tariff on the client's imports, as
// their team. A premium service, priced by the imports (pairs) we manage; above the last tier
// it's quoted. Includes the Tariff Tracker on every managed import.
export const MANAGED_TIERS = [
  { maxPairs: 25, price: 1200 },
  { maxPairs: 50, price: 2500 },
  { maxPairs: 200, price: 4500 },
  { maxPairs: 500, price: 7500 },
] as const;

// Paying for a year of HTS Hero Managed up front takes 20% off (more than the plans' 15%)
export const MANAGED_ANNUAL_DISCOUNT = 0.2;

export type ClassifyPlanId = "starter" | "pro" | "team";

export const CLASSIFY_PLANS: Record<
  ClassifyPlanId,
  { name: string; price: number; description: string; features: string[] }
> = {
  starter: {
    name: "Starter",
    price: 39,
    description: "Classify with confidence and avoid blind spots",
    features: [
      "10 classifications / month",
      "Build legally defensible classifications",
      "Validate decisions with CROSS rulings",
      "Reduce audit exposure",
    ],
  },
  pro: {
    name: "Pro",
    price: 89,
    description: "Defend every code and reduce your customs audit exposure",
    features: [
      "Up to 100 classifications / month",
      "Everything in Starter",
      "Audit existing classifications",
      "One-click classification reports",
      "Catch tariff changes before they cost you",
    ],
  },
  team: {
    name: "Team",
    price: 429,
    description: "Standardize classifications across your entire team",
    features: [
      "One shared workspace for your team",
      "Review & approve each other's work",
      "Find issues in your current product catalog",
      "Onboarding & team training included",
    ],
  },
};

// Separate Pro accounts for each person, without the shared team workspace
export const CLASSIFY_LICENSE_PRICE = 60;

// Who the Team plan is for
export const TEAM_MIN_CLASSIFICATIONS = 30;

// The seat count where one Team workspace costs less than a license per person
export const TEAM_BREAK_EVEN_SEATS = Math.ceil(CLASSIFY_PLANS.team.price / CLASSIFY_LICENSE_PRICE);

// A monthly price after the billing discount, rounded down to the dollar. The epsilon keeps
// float error (e.g. 53.99999…) from flooring a whole-dollar result a dollar too low.
export const monthlyRate = (listPrice: number, billing: Billing) =>
  billing === "annual" ? Math.floor(listPrice * (1 - ANNUAL_DISCOUNT) + 1e-9) : listPrice;

// The billing period a Tracker price follows: monthly only while TRACKER_ANNUAL_ENABLED is off
// (MVP_TRIM.md), whatever the page's toggle says. Classification and Managed keep annual billing.
export const trackerBilling = (billing: Billing): Billing => (TRACKER_ANNUAL_ENABLED ? billing : "monthly");

// Null above the largest tier: those lists are quoted
export const trackerTierFor = (pairs: number): TrackerTier | null =>
  TRACKER_TIERS.find((tier) => pairs <= tier.maxPairs) ?? null;

export type ClassifyAudience = "individual" | "team";
export type TeamOption = "workspace" | "licenses";

export type EstimateInput = {
  tracker: boolean;
  pairs: number;
  classify: boolean;
  audience: ClassifyAudience;
  individualPlan: Exclude<ClassifyPlanId, "team">;
  seats: number;
  teamOption: TeamOption;
};

export type LineItem = {
  id: string;
  label: string;
  detail: string;
  // List price per month; null when it's quoted
  listMonthly: number | null;
  // Set up with our team rather than through self-serve checkout
  viaSales?: boolean;
};

const pluralize = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

export const lineItems = (input: EstimateInput, billing: Billing): LineItem[] => {
  const lines: LineItem[] = [];

  if (input.tracker) {
    const tier = trackerTierFor(input.pairs);
    lines.push({
      id: "tracker",
      label: "Tariff Tracker",
      detail: tier
        ? `${pluralize(input.pairs, "import")} · up to ${tier.maxPairs} plan`
        : `${pluralize(input.pairs, "import")} · custom plan`,
      listMonthly: tier ? tier.price : null,
      viaSales: !tier,
    });
  }

  if (input.classify) {
    if (input.audience === "individual") {
      const plan = CLASSIFY_PLANS[input.individualPlan];
      lines.push({
        id: "classify",
        label: `Classify ${plan.name}`,
        detail: "1 person",
        listMonthly: plan.price,
      });
    } else if (input.teamOption === "workspace") {
      lines.push({
        id: "classify",
        label: "Classify Team",
        detail: `Shared workspace · ${input.seats} people`,
        listMonthly: CLASSIFY_PLANS.team.price,
        viaSales: true,
      });
    } else {
      lines.push({
        id: "classify",
        label: "Classify licenses",
        detail: `${input.seats} people · ${formatPrice(monthlyRate(CLASSIFY_LICENSE_PRICE, billing))} each`,
        listMonthly: input.seats * CLASSIFY_LICENSE_PRICE,
      });
    }
  }

  return lines;
};

export type Estimate = {
  lines: (LineItem & { monthly: number | null })[];
  // Totals of the priced lines; quoted lines are left out
  monthly: number;
  listMonthly: number;
  // What annual billing saves a year: already applied when billed annually
  annualSavings: number;
  hasQuote: boolean;
};

export const estimate = (input: EstimateInput, billing: Billing): Estimate => {
  // The Tracker line follows its own billing period (trackerBilling)
  const lineBilling = (line: LineItem, period: Billing) => (line.id === "tracker" ? trackerBilling(period) : period);
  const lines = lineItems(input, billing).map((line) => ({
    ...line,
    monthly: line.listMonthly === null ? null : monthlyRate(line.listMonthly, lineBilling(line, billing)),
  }));
  const monthly = round2(lines.reduce((sum, line) => sum + (line.monthly ?? 0), 0));
  const listMonthly = round2(lines.reduce((sum, line) => sum + (line.listMonthly ?? 0), 0));
  return {
    lines,
    monthly,
    listMonthly,
    annualSavings: round2(
      lines.reduce((sum, line) => sum + (line.listMonthly === null ? 0 : line.listMonthly - monthlyRate(line.listMonthly, lineBilling(line, "annual"))), 0) * 12
    ),
    hasQuote: lines.some((line) => line.monthly === null),
  };
};

const round2 = (n: number) => Math.round(n * 100) / 100;

// "$49", "$13.49", "$1,234"
export const formatPrice = (amount: number) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });

// What a Tracker plan comes to per import, per month: its price over the imports it covers ($29 /
// 30 = $0.97). The easiest way to see the value, so every price shown also shows this.
export const perImportPrice = (tier: { price: number; maxPairs: number }) => Math.round((tier.price / tier.maxPairs) * 100) / 100;

// "$0.97/import"
export const formatPerImport = (tier: { price: number; maxPairs: number }) => `${formatPrice(perImportPrice(tier))}/import`;

// The lowest per-import price across the tiers ("as low as $0.30 per import")
export const LOWEST_PER_IMPORT = Math.min(...TRACKER_TIERS.map(perImportPrice));
