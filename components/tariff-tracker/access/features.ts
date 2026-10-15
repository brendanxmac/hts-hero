import { SectionSlug } from "../sections"

// What each premium part of the Tracker is, for the plans dialog: what the user was looking at
// when they ran out of free checks (or asked to see plans), so the dialog talks about that

export type PremiumFeature =
  | Extract<
      SectionSlug,
      | "history"
      | "savings"
      | "alerts"
      | "entries"
      | "sourcing"
      | "expert-help"
    >
  | "tracking"
  | "plan"
  | "qualify"
  | "refunds"

export const PREMIUM_FEATURES: Record<
  PremiumFeature,
  { name: string; benefit: string }
> = {
  history: {
    name: "Rate history",
    benefit:
      "See every tariff change that hit your products, when, and by how much",
  },
  savings: {
    name: "Savings",
    benefit:
      "See every way you could pay less duty on the products you already import",
  },
  alerts: {
    name: "Alerts",
    benefit: "Know as soon as a tariff change hits one of your products",
  },
  entries: {
    name: "Entry audit",
    benefit:
      "Check the duty you paid on every entry against the rates in force",
  },
  sourcing: {
    name: "Sourcing",
    benefit: "Find the countries with the lowest duty on each of your products",
  },
  "expert-help": {
    name: "Expert help",
    benefit: "Work with the HTS Hero team on your tariff strategy",
  },
  tracking: {
    name: "Alerts",
    benefit: "Get alerts on every one of your imports, not just the first few",
  },
  plan: {
    name: "Tariff Tracker",
    benefit: "Everything in the Tracker, for all your imports",
  },
  qualify: {
    name: "Qualification check",
    benefit:
      "Step through a guided check that works out exactly which exemptions and trade programs should apply to your goods, and the proof you'd need",
  },
  refunds: {
    name: "Refund check",
    benefit:
      "Compare what you paid on past entries with the duty in force, to spot refunds to request or underpayments to fix",
  },
}

// Everything the paid plans include, for the plans dialog's list
export const PREMIUM_INCLUDES = [
  "Savings checks on every import your plan covers, with the qualification check",
  "Unlimited audit checks: what you paid on past entries against what you owed",
  "Alerts when a tariff change hits any import your plan covers",
  "Rate history and Sourcing for all your imports",
  "Share tariff reports with your team, clients, or broker",
]

// The Tracker tab where each feature lives, for the calculator's upsells: every account can use
// them there (with the trial's checks)
export const featureTab = (feature: PremiumFeature): SectionSlug => {
  switch (feature) {
    case "qualify":
    case "savings":
      return "savings"
    case "refunds":
    case "entries":
      return "entries"
    case "tracking":
    case "alerts":
      return "alerts"
    case "plan":
      return "overview"
    default:
      return feature
  }
}
