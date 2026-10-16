// Every price on /pricing-calculator, and the math that turns choices into an estimate.
// Prices are monthly list prices in USD; annual billing takes ANNUAL_DISCOUNT off each one.

import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";

export type Billing = "monthly" | "annual";

export const ANNUAL_DISCOUNT = 0.15;

// The Tariff Calculator is free: unlimited lookups, no account. A free account unlocks Analysis
// and the plain-English why. See PRICING.md.

// Tariff Tracker's usage-based trial: every account is on it from sign-up, with no time limit and
// no card. These allowances never reset; past them, a feature needs a paid plan (PRICING.md)
export const TRIAL_ALLOWANCE = {
  // Imports (pairs) whose savings can be checked, the qualification check included
  savingsChecks: 5,
  // Past entries checked against the duty in force on their date (entry audit, refund check)
  auditChecks: 10,
  // Tracked imports: alerts and impact checks run on these; the slots can be moved. 10 before the
  // Tracker MVP (MVP_TRIM.md)
  alertImports: 5,
} as const;

// Tariff Tracker is priced by the number of imports (HTS code + country of origin pairs) it covers.
// Before the Tracker MVP (MVP_TRIM.md), with savings and audits included: $19 / $49 / $149 / $249
export const TRACKER_TIERS = [
  { maxPairs: 10, price: 12 },
  { maxPairs: 30, price: 29 },
  { maxPairs: 100, price: 89 },
  { maxPairs: 500, price: 149 },
] as const;
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
