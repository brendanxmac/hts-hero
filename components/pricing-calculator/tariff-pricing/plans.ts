import { Billing, REVERSE_TRIAL, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, formatPrice, monthlyRate, perImportPrice, trackerBilling } from "../lib/pricing"
import { AUTO_AUDITING, FREE_FOREVER_SHORT, SAVINGS_DETECTION } from "@/components/ui/marketing/comingSoon"

// The copy for each tariff plan, shared by /pricing-calculator and the pricing section on
// /duty-calculator so both always say the same thing. See PRICING.md.

export const CALCULATOR_FEATURES = [
  "Unlimited lookups, no account and no sign-up",
  "Every tariff, exemption and fee for any HTS code and country of origin",
  "Section 232, 301 and 122 tariffs, itemized with their legal source",
  "Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF",
  "Compare countries and duty over time, plus every origin with a free account",
  "The plain-English why behind every tariff, with a free account",
  "AD/CVD checks on any import: the cases that may cover it, their rates and the companies named, with a free account",
  "Works in AI assistants through the HTS Hero MCP server",
]

// What every account gets free in the Tracker: the 14-day reverse trial (REVERSE_TRIAL, no card,
// nothing to start), then the free plan forever: no alerts on its own imports (TRIAL_ALLOWANCE.alertImports
// is 0), but Tariff News alerts and sourcing insights, and the AD/CVD check (free with any account,
// never "forever"). Savings detection and auditing are in the trial and every paid plan
export const TRACKER_TRIAL_FEATURES = [
  `${REVERSE_TRIAL.days} days of everything the Tracker does, on up to ${REVERSE_TRIAL.imports} imports`,
  "Alerts and impact checks on every tracked import, AD/CVD alerts included",
  "Insights across your catalog, plus Tariff News as it happens",
  `${SAVINGS_DETECTION.name} and ${AUTO_AUDITING.name.toLowerCase()} in the trial too`,
  `Then ${FREE_FOREVER_SHORT}, free forever`,
  "AD/CVD checks on any import, free with your account",
  "Your whole catalog, with current duty, rate history and exports to CSV or Excel, always free",
]

export const TRACKER_FEATURES = [
  "Alerts the moment a tariff change hits a tracked import, with the rate before and after",
  "AD/CVD alerts when a tracked import may fall under an antidumping or countervailing duty case",
  "Insights across your catalog: where the duty comes from, what moved it, the most exposed imports",
  "Impact checks: pick any tariff action and see exactly how it affects each import",
  "Tariff News from CBP, the Federal Register, USTR, USITC and the White House",
  "Rate history for your whole catalog: compare with past rates and see why duty changed",
  "Export every tariff on every import to CSV or Excel",
  "Paste or upload your catalog as CSV",
  `${SAVINGS_DETECTION.name}: trade programs, exemptions and lower-duty origins you may qualify for, on every import`,
  `${AUTO_AUDITING.name}: every entry checked against the duty in force on its date, flagging possible over and underpayments`,
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

// What a stop comes to per import, per month ("$0.97"); null when the plan is quoted
export const optionPerImport = (option: TrackerOption, billing: Billing) =>
  option.price === null || option.maxPairs === null
    ? null
    : formatPrice(perImportPrice({ price: monthlyRate(option.price, trackerBilling(billing)), maxPairs: option.maxPairs }))
