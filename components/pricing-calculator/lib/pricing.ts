// Every price on /pricing-calculator, and the math that turns choices into an estimate.
// Prices are monthly list prices in USD; annual billing takes ANNUAL_DISCOUNT off each one.

export type Billing = "monthly" | "annual";

export const ANNUAL_DISCOUNT = 0.1;

export const TARIFF_CALCULATOR_PRICE = 14.99;

// Tariff Tracker is priced by the number of HTS code + country of origin pairs it watches
export const TRACKER_TIERS = [
  { maxPairs: 30, price: 49 },
  { maxPairs: 100, price: 79 },
  { maxPairs: 500, price: 149 },
] as const;
export const TRACKER_MAX_LISTED_PAIRS = TRACKER_TIERS[TRACKER_TIERS.length - 1].maxPairs;

export type TrackerTier = (typeof TRACKER_TIERS)[number];

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

// Null above the largest tier: those lists are quoted
export const trackerTierFor = (pairs: number): TrackerTier | null =>
  TRACKER_TIERS.find((tier) => pairs <= tier.maxPairs) ?? null;

export type ClassifyAudience = "individual" | "team";
export type TeamOption = "workspace" | "licenses";

export type EstimateInput = {
  calculator: boolean;
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
  // Comes with another product in the estimate, at no extra cost
  includedWith?: string;
};

const pluralize = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

export const lineItems = (input: EstimateInput, billing: Billing): LineItem[] => {
  const lines: LineItem[] = [];

  // Tariff Tracker includes the Tariff Calculator
  if (input.tracker) {
    lines.push({
      id: "calculator",
      label: "Tariff Calculator",
      detail: "Included with Tariff Tracker",
      listMonthly: 0,
      includedWith: "Tariff Tracker",
    });
  } else if (input.calculator) {
    lines.push({
      id: "calculator",
      label: "Tariff Calculator",
      detail: "Unlimited duty calculations",
      listMonthly: TARIFF_CALCULATOR_PRICE,
    });
  }

  if (input.tracker) {
    const tier = trackerTierFor(input.pairs);
    lines.push({
      id: "tracker",
      label: "Tariff Tracker",
      detail: tier
        ? `${pluralize(input.pairs, "pair")} · up to ${tier.maxPairs} plan`
        : `${pluralize(input.pairs, "pair")} · custom plan`,
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
  const lines = lineItems(input, billing).map((line) => ({
    ...line,
    monthly: line.listMonthly === null ? null : monthlyRate(line.listMonthly, billing),
  }));
  const monthly = round2(lines.reduce((sum, line) => sum + (line.monthly ?? 0), 0));
  const listMonthly = round2(lines.reduce((sum, line) => sum + (line.listMonthly ?? 0), 0));
  return {
    lines,
    monthly,
    listMonthly,
    annualSavings: round2(
      lines.reduce((sum, line) => sum + (line.listMonthly === null ? 0 : line.listMonthly - monthlyRate(line.listMonthly, "annual")), 0) * 12
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
