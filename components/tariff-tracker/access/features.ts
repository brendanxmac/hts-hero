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
      | "insights"
      | "expert-help"
    >
  | "tracking"
  // Tracking one more import than the plan allows
  | "limit"
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
  insights: {
    name: "Insights",
    benefit: "See where the duty on your imports comes from, what moved it, and your most exposed imports and countries",
  },
  "expert-help": {
    name: "Expert help",
    benefit: "Work with the HTS Hero team on your tariff strategy",
  },
  tracking: {
    name: "Alerts",
    benefit: "Get alerts and impact checks on every one of your imports, not just the first few",
  },
  limit: {
    name: "Alerts",
    benefit: "Get alerts and impact checks on every one of your imports, not just the first few",
  },
  plan: {
    name: "Tariff Tracker",
    benefit: "Alerts and impact checks on every import you track",
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
  "Alerts when a tariff change hits any import your plan tracks, and by how much",
  "Impact checks: see exactly how any tariff action affects each import",
  "Insights across your whole catalog: where the duty comes from and what moved it",
  "Tariff News: every tariff action from CBP, the Federal Register, USTR, USITC and the White House",
  "Rate history for all your imports",
  "Export every tariff on every import to CSV or Excel, or share reports with your team or broker",
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
    case "limit":
    case "alerts":
      return "alerts"
    case "plan":
      return "overview"
    default:
      return feature
  }
}
