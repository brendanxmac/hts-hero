import {
  Billing,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
  monthlyRate,
  trackerBilling,
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

// What every account gets free in the Tracker, with no time limit and no card (TRIAL_ALLOWANCE).
// Tracker MVP (MVP_TRIM.md): savings and audit checks are off, so they're left out
export const TRACKER_TRIAL_FEATURES = [
  "Upload your whole catalog, with every tariff on each import",
  `Track ${TRIAL_ALLOWANCE.alertImports} imports: alerts and impact checks on each one`,
  "Tariff News: every new US tariff action, as it happens",
  "Rate history for every import: how its duty changed, and why",
  "Export every tariff on every import to CSV or Excel",
]

export const TRACKER_FEATURES = [
  "Alerts the moment a tariff change hits a tracked import, with the rate before and after",
  "Impact checks: pick any tariff action and see exactly how it affects each import",
  "Tariff News from CBP, the Federal Register, USTR, USITC and the White House",
  "Rate history for your whole catalog: compare with past rates and see why duty changed",
  "Export every tariff on every import to CSV or Excel",
  "Paste or upload your catalog as CSV",
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

// The price under each stop on the picker (monthly while Tracker annual billing is off)
export const optionPrice = (option: TrackerOption, billing: Billing) =>
  option.price === null ? "Let's talk" : formatPrice(monthlyRate(option.price, trackerBilling(billing)))
