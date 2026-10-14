import {
  Billing,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
  monthlyRate,
} from "../lib/pricing"

// The copy for each tariff plan, shared by /pricing-calculator and the pricing section on
// /duty-calculator so both always say the same thing. See PRICING.md.

export const CALCULATOR_FEATURES = [
  "Unlimited lookups, no account and no sign-up",
  "Every tariff, exemption and fee for any HTS code and country of origin",
  "Section 232, 301 and 122 tariffs, itemized with their legal source",
  "Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF",
  "Compare countries and duty over time, plus every origin with a free account",
  "The plain-English why behind every tariff, with a free account",
  "Works in AI assistants through the HTS Hero MCP server",
]

// The Tracker's usage-based trial: every account is on it from sign-up, with no time limit and no
// card. The allowances never reset (TRIAL_ALLOWANCE)
export const TRACKER_TRIAL_FEATURES = [
  "Upload your whole catalog, with the current duty on each import",
  "Overview insights, rate history and sourcing for the whole catalog",
  `Check ${TRIAL_ALLOWANCE.savingsChecks} imports for savings, including which programs they may qualify for`,
  `${TRIAL_ALLOWANCE.auditChecks} audit checks: what you paid on a past entry vs. what was owed`,
  `Alerts on up to ${TRIAL_ALLOWANCE.alertImports} imports`,
]

export const TRACKER_FEATURES = [
  "Alerts the moment a tariff change hits a covered import",
  "Savings on every covered import: lower-tariff origins, trade programs and exemptions",
  "Unlimited audit checks: flag over- and underpaid duty on past entries",
  "Rate history and sourcing for your whole catalog",
  "Paste or upload your catalog as CSV",
  "Share reports with your team or clients",
]

// One stop on the Tracker card's tier picker; a null price means the plan is quoted
export type TrackerOption = {
  id: string
  label: string
  maxPairs: number | null
  price: number | null
}

export const TRACKER_OPTIONS: TrackerOption[] = [
  ...TRACKER_TIERS.map((tier) => ({
    id: String(tier.maxPairs),
    label: String(tier.maxPairs),
    maxPairs: tier.maxPairs,
    price: tier.price,
  })),
  {
    id: "custom",
    label: `${TRACKER_MAX_LISTED_PAIRS}+`,
    maxPairs: null,
    price: null,
  },
]

// The price under each stop on the picker
export const optionPrice = (option: TrackerOption, billing: Billing) =>
  option.price === null ? "Let's talk" : formatPrice(monthlyRate(option.price, billing))
