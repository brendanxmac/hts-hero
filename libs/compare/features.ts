import type { FeatureKey, Support } from "./types";

// The rows of every comparison table, in order: what a US importer actually needs from a
// tariff calculator. HTS Hero's strengths are near the top because they're what buyers ask
// about first, not because the list leaves anything out.
export const FEATURES: { key: FeatureKey; label: string; help: string }[] = [
  {
    key: "freeToTry",
    label: "Free to try",
    help: "You can calculate a real duty without paying.",
  },
  {
    key: "selfServe",
    label: "Start without a demo or sales call",
    help: "Sign up and use every plan yourself, with no demo, contract or freight account.",
  },
  {
    key: "publishedPricing",
    label: "Pricing published",
    help: "Every paid plan's price is on the website.",
  },
  {
    key: "fullStack",
    label: "Every Chapter 99 tariff, line by line",
    help: "The base rate plus Section 232, Section 301 and every other additional duty, each as its own line with exemptions applied.",
  },
  {
    key: "entryDate",
    label: "Duty for a past entry date",
    help: "Calculate the duty that applied on a specific date, to audit past entries.",
  },
  {
    key: "rateHistory",
    label: "Duty over time",
    help: "See how a product's duty changed across HTS revisions.",
  },
  {
    key: "catalogImpact",
    label: "See which of your products a tariff change hits",
    help: "Load your catalog once and see the duty impact of each change across it.",
  },
  {
    key: "countryCompare",
    label: "Compare countries of origin",
    help: "The same product's duty from several countries, side by side.",
  },
  {
    key: "csvUpload",
    label: "Bulk upload (CSV)",
    help: "Add many products at once.",
  },
  {
    key: "classification",
    label: "HTS classification help",
    help: "Guidance to find and document the right HTS code for a product.",
  },
  {
    key: "changelog",
    label: "Public changelog of rate updates",
    help: "A dated record of every change to the tool's tariff data.",
  },
];

export const SUPPORT_LABELS: Record<Support, string> = {
  yes: "Yes",
  partial: "Partly",
  paid: "Paid plan",
  gated: "Customers only",
  no: "No",
  unknown: "Not found",
};
