import { SectionSlug } from "../sections";

// What each premium part of the Tracker is, for the trial and upgrade dialogs: what the user was
// looking at when they chose to start, so the dialog talks about that

export type PremiumFeature = Extract<
  SectionSlug,
  "history" | "savings" | "alerts" | "entries" | "sourcing" | "trends" | "charts" | "expert-help"
> | "tracking" | "plan" | "qualify" | "refunds";

export const PREMIUM_FEATURES: Record<PremiumFeature, { name: string; benefit: string }> = {
  history: { name: "Rate history", benefit: "See every tariff change that hit your products, when, and by how much" },
  savings: { name: "Savings", benefit: "See every way you could pay less duty on the products you already import" },
  alerts: { name: "Alerts", benefit: "Know as soon as a tariff change hits one of your products" },
  entries: { name: "Entry audit", benefit: "Check the duty you paid on every entry against the rates in force" },
  sourcing: { name: "Sourcing", benefit: "Find the countries with the lowest duty on each of your products" },
  trends: { name: "Trends", benefit: "Follow your catalog's duty rate and exposure over time" },
  charts: { name: "Charts", benefit: "Share clear charts of your tariffs with your team" },
  "expert-help": { name: "Expert help", benefit: "Work with the HTS Hero team on your tariff strategy" },
  tracking: { name: "Tracking", benefit: "Track every product in your catalog, not just the first few" },
  plan: { name: "Tariff Tracker", benefit: "Everything in the Tracker, for your whole catalog" },
  qualify: { name: "Qualification check", benefit: "Step through a guided check that works out exactly which exemptions and trade programs should apply to your goods, and the proof you'd need" },
  refunds: { name: "Refund check", benefit: "Compare what you paid on past entries with the duty in force, to spot refunds to request or underpayments to fix" },
};

// Everything the trial and paid plans include, for the dialogs' lists
export const PREMIUM_INCLUDES = [
  "Rate history for every product: each change, when and why",
  "Potential savings: trade programs, exemptions and cheaper origins",
  "Alerts when a tariff change hits your products",
  "Qualification checks for exemptions and trade programs",
  "Refund checks on what you paid for past entries",
  "Entry audits, sourcing and trends as they launch",
];
