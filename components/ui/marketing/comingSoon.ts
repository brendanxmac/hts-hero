// What's coming to the Tariff Tracker and what the free plan keeps, as plain strings shared by
// the landing pages, the pre-signup dialogs and the emails (which import it by relative path).
// Savings and audits aren't live (libs/tariff-tracker/features.ts): every mention carries
// SAVINGS_AUDITS_LABEL, and the copy says "may", "could", "possible", never certain.

import { LAUNCH_PRICING } from "../../pricing-calculator/lib/pricing"
import { SAVINGS_AUDITS_LABEL } from "../../../libs/tariff-tracker/features"

export { SAVINGS_AUDITS_LABEL }

// The label inside a sentence: "coming Oct 2026", "(coming Oct 2026)"
export const COMING_LOWER =
  SAVINGS_AUDITS_LABEL.charAt(0).toLowerCase() + SAVINGS_AUDITS_LABEL.slice(1)
export const COMING_NOTE = `(${COMING_LOWER})`

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
export const SAVINGS_AUDITS_COMING = `Automatic savings detection and automatic auditing are ${COMING_LOWER}, included in the trial and every paid Tracker plan at no extra cost when they launch.`

// What every account keeps after the trial, forever (TRIAL_ALLOWANCE.alertImports is 0: no alerts
// on its own imports, only the Tariff News alerts; AD/CVD checks are part of the trial and plans)
export const FREE_FOREVER_SHORT =
  "Tariff News alerts and sourcing insights"
export const FREE_FOREVER_LINE = `Then ${FREE_FOREVER_SHORT} stay free, forever.`
export const FREE_FOREVER_LIST = [
  "Tariff News alerts: every new US tariff action, by email",
  "Sourcing insights: the duty from every country of origin",
  "Your whole catalog with current duty, rate history and exports",
  "The Tariff Calculator, unlimited",
] as const

// The launch-pricing pitch. Render it only while launchPricingActive() (static FAQ text can state it)
export const LAUNCH_PITCH = `Subscribe before ${LAUNCH_PRICING.endsDay} and lock in launch pricing for as long as you stay subscribed, with savings detection and auditing included when they arrive. New prices from ${LAUNCH_PRICING.endsDay}.`
