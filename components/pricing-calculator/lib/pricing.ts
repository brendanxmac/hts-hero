// Every price on /pricing-calculator, and the math that turns choices into an estimate.
// Prices are monthly list prices in USD; annual billing takes ANNUAL_DISCOUNT off each one.


export type Billing = "monthly" | "annual"

export const ANNUAL_DISCOUNT = 0.15

// The Tariff Calculator is free: unlimited lookups, no account. A free account unlocks Analysis
// and the plain-English why, and the AD/CVD check on any import. See PRICING.md.

// The free plan's allowances (PRICING.md). alertImports is what every account tracks free, with
// alerts, once its trial (REVERSE_TRIAL) is over (2026-10-26; none from
// 2026-10-18). Free accounts also keep the Tariff News alerts (every new US tariff action). The
// savings and audit checks never reset
export const TRIAL_ALLOWANCE = {
  // Imports (pairs) whose savings can be checked, the qualification check included. None on the free
  // plan (2026-10-22): savings checks are the trial's and the paid plans'
  savingsChecks: 0,
  // Past entries checked against the duty in force on their date (entry audit, refund check). None
  // on the free plan, as savings
  auditChecks: 0,
  // Tracked imports: alerts and impact checks run on these; the slots can be moved. 10 before the
  // Duty Guard MVP (MVP_TRIM.md), 5 until the reverse trial, none from 2026-10-18 to 2026-10-26, 3
  // until 2026-10-31. None now: the catalog stays free and unlimited, and a free account gets only
  // a teaser email when a tariff action hits its imports
  alertImports: 0,
} as const

// The button on every Duty Guard call to action, everywhere on the site (decided 2026-10-26).
// The trial's days and the rest of the offer go in the text around it, never on the button.
export const TRY_IT_FREE = "Try it free"

// The reverse trial (PRICING.md): every account gets Duty Guard, everything the
// Duty Guard sells, on up to `imports` imports (the largest plan), for `days` days from the account's
// first imports, with no card and nothing to start. After it, the account is on the free plan:
// TRIAL_ALLOWANCE.alertImports tracked imports.
// One week from 2026-10-30 (decided then: give the value first, then ask). Trials that started
// before `shortFrom` keep the `legacyDays` they were promised; set `shortFrom` to the deploy day.
// Accounts made before `freshStartOn` got their trial from that day instead.
export const REVERSE_TRIAL = {
  days: 7,
  imports: 500,
  legacyDays: 14,
  shortFrom: "2026-11-03",
  freshStartOn: "2026-10-21",
} as const

// A trial's length in days, by when it started: a week from REVERSE_TRIAL.shortFrom, two before it
export const trialLengthDays = (startedMs: number) =>
  startedMs >= Date.parse(`${REVERSE_TRIAL.shortFrom}T00:00:00Z`) ? REVERSE_TRIAL.days : REVERSE_TRIAL.legacyDays

// Duty Guard is priced by the number of imports (HTS code + country of origin pairs) it covers.
// Before Duty Guard MVP (MVP_TRIM.md), with savings and audits included: $19 / $49 / $149 / $249
// Duty Guard plans sold until 2026-10-31, kept only so anyone still on one maps to its limit
// (LEGACY_TRACKER_PLANS)
export const TRACKER_TIERS = [
  { maxPairs: 10, price: 12 },
  { maxPairs: 30, price: 29 },
  { maxPairs: 100, price: 89 },
  { maxPairs: 500, price: 149 },
] as const

// The value ladder (PRICING.md): Duty Guard, each priced by products, 15% off
// annually.
// Every alerts plan is paid (2026-10-28: no free plan on the page), named by their size. emails
// is how many email addresses an alert can go to; Slack & Teams alerts
// start at Pro (teams).
export const ALERT_TIERS = [
  { name: "10 Products", maxPairs: 10, price: 9, emails: 1, teams: false },
  { name: "25 Products", maxPairs: 25, price: 19, emails: 3, teams: false },
  { name: "100 Products", maxPairs: 100, price: 39, emails: 6, teams: true },
  { name: "500 Products", maxPairs: 500, price: 79, emails: 20, teams: true },
] as const
// The audit plans mirror the alerts plans (2026-10-28): same imports and users, and each
// includes the alerts plan of the same size
export const AUDIT_TIERS = [
  { name: "10 Products", maxPairs: 10, price: 49, emails: 1, teams: false },
  { name: "25 Products", maxPairs: 25, price: 79, emails: 3, teams: false },
  { name: "100 Products", maxPairs: 100, price: 149, emails: 6, teams: true },
  { name: "500 Products", maxPairs: 500, price: 299, emails: 20, teams: true },
] as const
export type LadderTier =
  (typeof ALERT_TIERS)[number] | (typeof AUDIT_TIERS)[number]

export const TRACKER_MAX_LISTED_PAIRS =
  ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs

export type TrackerTier = (typeof TRACKER_TIERS)[number]

// HTS Hero Managed (Duty Guard's Expert help): we manage every tariff on the client's imports, as
// their team. A premium service, priced by the imports (pairs) we manage; above the last tier
// it's quoted. Includes Duty Guard on every managed import.
export const MANAGED_TIERS = [
  { maxPairs: 25, price: 1200 },
  { maxPairs: 50, price: 2500 },
  { maxPairs: 200, price: 4500 },
  { maxPairs: 500, price: 7500 },
] as const

// Paying for a year of HTS Hero Managed up front takes 20% off (more than the plans' 15%)
export const MANAGED_ANNUAL_DISCOUNT = 0.2

export type ClassifyPlanId = "starter" | "pro" | "team"

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
}

// Separate Pro accounts for each person, without the shared team workspace
export const CLASSIFY_LICENSE_PRICE = 60

// Who the Team plan is for
export const TEAM_MIN_CLASSIFICATIONS = 30

// The seat count where one Team workspace costs less than a license per person
export const TEAM_BREAK_EVEN_SEATS = Math.ceil(
  CLASSIFY_PLANS.team.price / CLASSIFY_LICENSE_PRICE,
)

// A monthly price after the billing discount, rounded down to the dollar. The epsilon keeps
// float error (e.g. 53.99999…) from flooring a whole-dollar result a dollar too low.
export const monthlyRate = (listPrice: number, billing: Billing) =>
  billing === "annual"
    ? Math.floor(listPrice * (1 - ANNUAL_DISCOUNT) + 1e-9)
    : listPrice


// Null above the largest tier: those lists are quoted

// The price calculator on /pricing-calculator: one tariff offer and one classification option, as
// lines and a total. A line is null past what's self-serve (more products than the largest plan).
// Classification is monthly only for now (Stripe has no annual Classify prices), so billing moves
// only the tariff line.
export type QuoteOffer = "none" | "alerts" | "audits"
export type QuoteClassify = "none" | ClassifyPlanId | "licenses"

export type QuoteInput = {
  offer: QuoteOffer
  products: number
  classify: QuoteClassify
  seats: number
}

export type QuoteLine = {
  id: "tariffs" | "classify"
  label: string
  detail: string
  // List price per month, and after billing; null when it's quoted
  listMonthly: number | null
  monthly: number | null
}

export type Quote = {
  lines: QuoteLine[]
  // Totals of the priced lines; quoted lines are left out
  monthly: number
  // What annual billing saves a year: already applied when billed annually
  annualSavings: number
  hasQuote: boolean
}

export const priceQuote = (input: QuoteInput, billing: Billing): Quote => {
  const line = (id: QuoteLine["id"], label: string, detail: string, listMonthly: number | null): QuoteLine => ({
    id,
    label,
    detail,
    listMonthly,
    monthly: listMonthly === null ? null : id === "tariffs" ? monthlyRate(listMonthly, billing) : listMonthly,
  })
  const lines: QuoteLine[] = []
  if (input.offer !== "none") {
    const name = input.offer === "alerts" ? "Duty Guard Essentials" : "Duty Guard Pro"
    const tiers = input.offer === "alerts" ? ALERT_TIERS : AUDIT_TIERS
    const tier = tiers.find((t) => input.products <= t.maxPairs)
    lines.push(
      tier
        ? line("tariffs", `${name} ${tier.maxPairs}`, `Up to ${tier.maxPairs} products`, tier.price)
        : line("tariffs", name, `More than ${tiers[tiers.length - 1].maxPairs} products`, null),
    )
  }
  if (input.classify === "licenses") {
    lines.push(line("classify", "Classify Licenses", `${input.seats} ${input.seats === 1 ? "person" : "people"} · ${formatPrice(CLASSIFY_LICENSE_PRICE)} each`, input.seats * CLASSIFY_LICENSE_PRICE))
  } else if (input.classify !== "none") {
    const plan = CLASSIFY_PLANS[input.classify]
    lines.push(line("classify", `Classify ${plan.name}`, input.classify === "team" ? "Shared workspace" : "1 person", plan.price))
  }
  const sum = (billed: Billing) =>
    lines.reduce((total, l) => {
      if (l.listMonthly === null) return total
      return total + (l.id === "tariffs" ? monthlyRate(l.listMonthly, billed) : l.listMonthly)
    }, 0)
  return {
    lines,
    monthly: sum(billing),
    annualSavings: (sum("monthly") - sum("annual")) * 12,
    hasQuote: lines.some((l) => l.monthly === null),
  }
}

// "$49", "$13.49", "$1,234"
export const formatPrice = (amount: number) =>
  amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })

// What a Duty Guard plan comes to per import, per month: its price over the imports it covers ($29 /
// 30 = $0.97). The easiest way to see the value, so every price shown also shows this.
export const perImportPrice = (tier: { price: number; maxPairs: number }) =>
  Math.round((tier.price / tier.maxPairs) * 100) / 100

// The lowest per-product price across the alerts plans ("as low as $0.16 per product")
export const LOWEST_PER_IMPORT = Math.min(...ALERT_TIERS.map(perImportPrice))
