// Straight from the price list: the pricing feature's index also pulls in its client components
import {
  CLASSIFY_PLANS,
  TARIFF_CALCULATOR_PRICE,
  TRACKER_TIERS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";
import type { Tool } from "../types";

// What the free tier offers today. One place to change when usage limits ship (planned: 5
// lookups without an account, 20 a month with one).
const FREE_TIER = "Free to start, no sign-up";

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
    "A US tariff calculator built for importers who need the exact number: every Chapter 99 tariff stacked line by line with its legal source, entry audits by date, duty over time, alerts when a tariff change hits your products, and results by API and MCP for your own systems.",
  bestFor: "Importers, brokers and compliance teams who need exact, auditable US duty",
  price: `Free, then from ${formatPrice(TARIFF_CALCULATOR_PRICE)}/mo`,
  priceDetail: `${FREE_TIER}. Tariff Calculator ${formatPrice(TARIFF_CALCULATOR_PRICE)}/mo for unlimited calculations. Tariff Tracker from ${formatPrice(TRACKER_TIERS[0].price)}/mo for your product catalog. Classification from ${formatPrice(CLASSIFY_PLANS.starter.price)}/mo. Monthly plans, no contract, 10% off annually.`,
  features: {
    freeToTry: { support: "yes", note: FREE_TIER },
    selfServe: { support: "yes", note: "Every plan is self-serve, with no demo or contract" },
    publishedPricing: { support: "yes" },
    fullStack: { support: "yes", note: "Each tariff on its own line, with its Chapter 99 heading and legal note" },
    tradePreferences: { support: "yes", note: "USMCA, CAFTA-DR, KORUS and every program on the line" },
    adjustments: { support: "yes", note: "Answer each question and see the new total" },
    entryDate: { support: "yes", note: `Entry audits, with verified rates back to ${historyFrom}` },
    rateHistory: { support: "yes", note: "Duty Over Time, revision by revision" },
    catalogImpact: { support: "paid", note: "Tariff Tracker alerts, with the cost to each product" },
    countryCompare: { support: "yes" },
    csvUpload: { support: "paid", note: "Tariff Tracker" },
    classification: { support: "paid", note: "HTS Hero Classify, with CROSS rulings" },
    api: { support: "onRequest", note: "API and MCP; plugs into ERP, TMS and internal tools" },
    changelog: { support: "yes" },
  },
  strengths: [
    "Every Chapter 99 tariff as its own line, with the heading and U.S. note behind it",
    "Audit past entries: the duty on the entry date, from the HTS revision in force that day",
    "Duty Over Time shows how a product's duty changed across revisions",
    "Alerts when a tariff change hits your products, with what it costs each one",
    "Published prices, monthly plans, start in a minute with no demo or contract",
    "Tariff results by API and MCP, built into your ERP, TMS or internal tools",
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
