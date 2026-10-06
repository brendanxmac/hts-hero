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
    key: "tradePreferences",
    label: "Trade agreements and preference programs",
    help: "Claim USMCA, CAFTA-DR, KORUS and other programs and see the preferential rate.",
  },
  {
    key: "adjustments",
    label: "Exemption questions that change the duty",
    help: "Answer the facts that unlock exemptions (metal content, generics, donations and more) and see the new total.",
  },
  {
    key: "entryDate",
    label: "Audit past entries by date",
    help: "Calculate the duty that applied on an entry date, to check what you paid.",
  },
  {
    key: "rateHistory",
    label: "Duty over time",
    help: "See how a product's duty changed across HTS revisions.",
  },
  {
    key: "catalogImpact",
    label: "Alerts when a tariff change hits your products",
    help: "Load your catalog once and hear when a change affects it, with the duty impact on each product.",
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
    key: "api",
    label: "API, MCP and ERP/TMS integration",
    help: "Get tariff results inside your ERP, TMS, internal tools or AI assistant.",
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
  onRequest: "On request",
  no: "No",
  unknown: "Not found",
};
