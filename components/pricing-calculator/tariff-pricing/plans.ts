import {
  Billing,
  FREE_TRACKED_PAIRS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  formatPrice,
  monthlyRate,
} from "../lib/pricing";

// The copy for each tariff plan, shared by /pricing-calculator and the pricing section on
// /duty-calculator so both always say the same thing. See PRICING.md.

export const CALCULATOR_FEATURES = [
  "Unlimited lookups, no account and no sign-up",
  "Every tariff, exemption and fee for any HTS code and country of origin",
  "Section 232, 301 and 122 tariffs, itemized with their legal source",
  "Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF",
  "Compare countries and duty over time, plus every origin with a free account",
  "Works in AI assistants through the HTS Hero MCP server",
];

export const TRACKER_FREE_FEATURES = [
  `Monitoring for ${FREE_TRACKED_PAIRS} HTS code + country pairs`,
  "An alert when a tariff change hits one of them",
];

export const TRACKER_FEATURES = [
  "Alerts the moment a tariff change hits one of your products",
  "Rate history: every change to each product's duty, and why",
  "Entry audit: flag over- and underpaid duty on past entries",
  "Savings: lower-tariff origins, trade programs and exemptions",
  "Paste or upload your catalog as CSV",
  "Reports to share with your team",
];

// The Tracker features the free plan doesn't have: everything but alerts
export const TRACKER_PAID_ONLY_FEATURES = new Set(TRACKER_FEATURES.slice(1));

// One stop on the Tracker card's tier picker. A price of 0 is the free plan; null means the
// plan is quoted.
export type TrackerOption = {
  id: string;
  label: string;
  maxPairs: number | null;
  price: number | null;
};

export const FREE_TRACKER_OPTION: TrackerOption = {
  id: "free",
  label: String(FREE_TRACKED_PAIRS),
  maxPairs: FREE_TRACKED_PAIRS,
  price: 0,
};

export const TRACKER_OPTIONS: TrackerOption[] = [
  FREE_TRACKER_OPTION,
  ...TRACKER_TIERS.map((tier) => ({
    id: String(tier.maxPairs),
    label: String(tier.maxPairs),
    maxPairs: tier.maxPairs,
    price: tier.price,
  })),
  { id: "custom", label: `${TRACKER_MAX_LISTED_PAIRS}+`, maxPairs: null, price: null },
];

// The price under each stop on the picker
export const optionPrice = (option: TrackerOption, billing: Billing) =>
  option.price === null ? "Let's talk" : option.price === 0 ? "Free" : formatPrice(monthlyRate(option.price, billing));
