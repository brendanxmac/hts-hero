// Straight from the price list: the pricing feature's index also pulls in its client components
import {
  ANNUAL_DISCOUNT,
  CLASSIFY_PLANS,
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  ALERT_TIERS,
  AUDIT_TIERS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { SAVINGS_AUDITS_INCLUDED } from "@/components/ui/marketing/comingSoon";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";
import type { Tool } from "../types";

// What the free tier offers. The calculator is free and unlimited with no account (PRICING.md).
const FREE_TIER = "Calculator free and unlimited, no sign-up";

const historyFrom = new Date(`${getVerifiedRevisions()[0].from}T00:00:00Z`).toLocaleDateString("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// Our own pages, checked on the day the record was
const ours = (path: string) => ({ url: `https://htshero.com${path}`, checkedAt: "2026-10-23" });

// HTS Hero, described by the same fields as every competitor. Prices come from the pricing
// page's own constants, so this never quotes a stale price.
export const HTS_HERO: Tool = {
  slug: "hts-hero",
  name: "HTS Hero",
  url: "https://htshero.com/duty-calculator",
  kind: "US tariff calculator and tariff tracker",
  summary:
    "A US tariff calculator built for importers who need the exact number: every Chapter 99 tariff stacked line by line with its legal source, the duty on any past entry date, duty over time, a free AD/CVD check on any import, tracking for every tariff on your imports with alerts and impact checks when a tariff change hits them, and results by API and MCP for your own systems.",
  bestFor: "Importers, brokers and compliance teams who need exact, auditable US duty",
  price: `Calculator and tracking free; Duty Guard Essentials from ${formatPrice(ALERT_TIERS[0].price)}/mo, Duty Guard Pro from ${formatPrice(AUDIT_TIERS[0].price)}/mo, ${REVERSE_TRIAL.days}-day free trial`,
  priceDetail: `${FREE_TIER}. A free account adds unlimited product tracking, the AD/CVD check on any product and sourcing intelligence. ${REVERSE_TRIAL.days}-day free trial of Duty Guard, no credit card required. Then Duty Guard Essentials from ${formatPrice(ALERT_TIERS[0].price)}/mo for up to ${ALERT_TIERS[0].maxPairs} products, as low as ${formatPrice(LOWEST_PER_IMPORT)} per product, and Duty Guard Pro from ${formatPrice(AUDIT_TIERS[0].price)}/mo. ${SAVINGS_AUDITS_INCLUDED} Annual billing is 15% off.`,
  features: {
    freeToTry: { support: "yes", note: `${FREE_TIER}; ${REVERSE_TRIAL.days}-day free trial of Duty Guard, no credit card required`, evidence: ours("/duty-calculator") },
    selfServe: { support: "yes", note: "Every plan is self-serve, with no demo or contract", evidence: ours("/pricing-calculator") },
    publishedPricing: { support: "yes", evidence: ours("/pricing-calculator") },
    fullStack: { support: "yes", note: "Each tariff on its own line, with its Chapter 99 heading and legal note", evidence: ours("/duty-calculator") },
    adcvd: { support: "yes", note: "Free with an account: each case, its rates and companies; not added to the estimate", evidence: ours("/duty-calculator/faq") },
    tradePreferences: { support: "yes", note: "USMCA, CAFTA-DR, KORUS and every program on the line", evidence: ours("/duty-calculator") },
    adjustments: { support: "yes", note: "Answer each question and see the new total", evidence: ours("/duty-calculator") },
    entryDate: { support: "yes", note: `Duty on any past entry date, free, with verified rates back to ${historyFrom}`, evidence: ours("/duty-calculator") },
    rateHistory: { support: "yes", note: "Duty Over Time, revision by revision, free with an account", evidence: ours("/duty-calculator") },
    catalogImpact: { support: "paid", note: `Duty Guard Essentials and impact checks, with the rate before and after on each product; free for ${REVERSE_TRIAL.days} days, then from ${formatPrice(ALERT_TIERS[0].price)}/mo`, evidence: ours("/tariff-alerts") },
    countryCompare: { support: "yes", evidence: ours("/duty-calculator/countries") },
    csvUpload: { support: "yes", note: "Duty Guard: upload your whole catalog with any account", evidence: ours("/tariff-alerts") },
    classification: { support: "paid", note: "HTS Hero Classify, with CROSS rulings", evidence: ours("/classify") },
    api: { support: "onRequest", note: "API and MCP; plugs into ERP, TMS and internal tools", evidence: ours("/pricing-calculator") },
    changelog: { support: "yes", evidence: ours("/duty-calculator/changelog") },
  },
  strengths: [
    "Every Chapter 99 tariff as its own line, with the heading and U.S. note behind it",
    "The duty on a past entry date, from the HTS revision in force that day",
    "Duty Over Time shows how a product's duty changed across revisions",
    "A free AD/CVD check on any import: the antidumping and countervailing duty cases and new petitions that may cover it, their deposit rates and the companies named",
    "Alerts and impact checks when a tariff change hits your imports, with the rate before and after",
    "Export every tariff on every import to CSV or Excel",
    `A ${REVERSE_TRIAL.days}-day free trial of Duty Guard, with no credit card required`,
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
  checkedAt: "2026-10-23",
};
