import { Billing, TRACKER_MAX_LISTED_PAIRS, TRACKER_TIERS, formatPrice, monthlyRate } from "../lib/pricing";

// The copy for each plan in the tariff pricing section

export const FREE_FEATURES = [
  "Every tariff, exemption and fee for any HTS code and country of origin",
  "Section 232, 301 and 122 tariffs, itemized with their legal source",
  "Trade preferences like USMCA and CAFTA-DR, plus MPF and HMF",
];

export const STARTER_FEATURES = [
  "Unlimited duty calculations",
  "Compare countries and see how a duty changed over time",
];

export const PRO_FEATURES = [
  "Paste or upload your catalog as CSV",
  "The current duty for every product, in one report",
  "See which products a tariff change hits, and by how much",
  "Export reports to share with your team",
];

// One stop on the Pro card's tier picker. A null price means the plan is quoted.
export type TrackerOption = {
  id: string;
  label: string;
  maxPairs: number | null;
  price: number | null;
};

export const TRACKER_OPTIONS: TrackerOption[] = [
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
  option.price === null ? "Let's talk" : formatPrice(monthlyRate(option.price, billing));
