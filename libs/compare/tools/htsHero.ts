// Straight from the price list: the pricing feature's index also pulls in its client components
import {
  CLASSIFY_PLANS,
  TARIFF_CALCULATOR_PRICE,
  TRACKER_TIERS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";
import type { Tool } from "../types";

const historyFrom = new Date(`${getVerifiedRevisions()[0].from}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// HTS Hero, described by the same fields as every competitor. Prices come from the pricing
// page's own constants, so this never quotes a stale price.
export const HTS_HERO: Tool = {
  slug: "hts-hero",
  name: "HTS Hero",
  url: "https://htshero.com/duty-calculator",
  kind: "US tariff calculator and auditor",
  summary:
    "A US tariff calculator built for importers who need the exact number: every Chapter 99 tariff stacked line by line with its legal source, duty for past entry dates, duty over time, and catalog-wide impact when tariffs change.",
  bestFor: "Importers, brokers and compliance teams who need exact, auditable US duty",
  price: `Free, then from ${formatPrice(TARIFF_CALCULATOR_PRICE)}/mo`,
  priceDetail: `Free plan to start. Tariff Calculator ${formatPrice(TARIFF_CALCULATOR_PRICE)}/mo for unlimited calculations. Tariff Tracker from ${formatPrice(TRACKER_TIERS[0].price)}/mo for your product catalog. Classification from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo. Monthly plans, no contract, 10% off annually.`,
  features: {
    freeToTry: { support: "yes", note: "Free plan with monthly lookups" },
    selfServe: { support: "yes", note: "Every plan is self-serve, with no demo or contract" },
    publishedPricing: { support: "yes" },
    fullStack: { support: "yes", note: "Each tariff on its own line, with its Chapter 99 heading and legal note" },
    entryDate: { support: "yes", note: `Verified rates back to ${historyFrom}` },
    rateHistory: { support: "paid", note: "Duty Over Time, revision by revision" },
    catalogImpact: { support: "paid", note: "Tariff Tracker" },
    countryCompare: { support: "paid", note: "Tariff Calculator plan" },
    csvUpload: { support: "paid", note: "Tariff Tracker" },
    classification: { support: "paid", note: "HTS Hero Classify, with CROSS rulings" },
    changelog: { support: "yes" },
  },
  strengths: [
    "Every Chapter 99 tariff as its own line, with the heading and U.S. note behind it",
    "Duty for a past entry date, from the HTS revision in force that day",
    "Duty Over Time shows how a product's duty changed across revisions",
    "Load a catalog and see which products a tariff change hits, and by how much",
    "Published prices, monthly plans, start in a minute with no demo or contract",
  ],
  limitations: [
    "US imports only",
    `Verified historical rates start in ${historyFrom}`,
  ],
  sources: [
    { title: "HTS Hero pricing", url: "https://htshero.com/pricing-calculator" },
    { title: "HTS Hero tariff data changelog", url: "https://htshero.com/duty-calculator/changelog" },
  ],
  checkedAt: "2026-10-06",
};
