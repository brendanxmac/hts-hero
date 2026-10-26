// What the Tariff Tracker's savings detection and auditing do, and what the free plan keeps, as
// plain strings shared by the landing pages, the pre-signup dialogs and the emails (which import
// it by relative path). Savings are always potential: the copy says "may", "could", "possible",
// never certain.

import { LAUNCH_PRICING, TRIAL_ALLOWANCE } from "../../pricing-calculator/lib/pricing"

export const SAVINGS_DETECTION = {
  name: "Automatic savings detection",
  title: "Automatic Savings Detection",
  text: "Trade programs, exemptions and lower-duty origins you may qualify for, checked on every import.",
} as const

export const AUTO_AUDITING = {
  name: "Automatic auditing",
  title: "Automatic Auditing",
  text: "Every entry checked against the duty in force on its date, flagging possible over and underpayments.",
} as const

// One sentence for both, for FAQs, meta and plain text
export const SAVINGS_AUDITS_INCLUDED = "Automatic savings detection and automatic auditing are included in the trial and every paid Tracker plan at no extra cost."

// What every account keeps after the trial, forever: alerts on TRIAL_ALLOWANCE.alertImports of its
// own imports (3, 2026-10-26), the Tariff News alerts and sourcing insights. AD/CVD checks are free
// with any account too, but never sold as "forever", so they aren't in this list
export const FREE_FOREVER_SHORT =
  `alerts on ${TRIAL_ALLOWANCE.alertImports} of your imports, Tariff News alerts and sourcing insights`
export const FREE_FOREVER_LINE = `Then ${FREE_FOREVER_SHORT} stay free, forever.`
export const FREE_FOREVER_LIST = [
  `Tariff alerts on ${TRIAL_ALLOWANCE.alertImports} of your imports, with the rate before and after`,
  "Tariff News alerts: every new US tariff action, by email",
  "Sourcing insights: the duty from every country of origin",
  "Your whole catalog with current duty, rate history and exports",
  "The Tariff Calculator, unlimited",
] as const

// The launch-pricing pitch. Render it only while launchPricingActive() (static FAQ text can state it)
export const LAUNCH_PITCH = `Subscribe before ${LAUNCH_PRICING.endsDay} and lock in launch pricing for as long as you stay subscribed, with savings detection and auditing included. New prices from ${LAUNCH_PRICING.endsDay}.`
