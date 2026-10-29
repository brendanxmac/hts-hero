import {
  ALERT_TIERS,
  ANNUAL_DISCOUNT,
  AUDIT_TIERS,
  CLASSIFY_PLANS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing"
import { GUARANTEE_DAYS } from "@/components/tariff-alerts/lib/copy"
import { AUDIT_GUARANTEE_AUDITS, AUDIT_GUARANTEE_DAYS } from "@/components/tariff-audit/lib/copy"

// The homepage's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so the two
// always match. Prices come from the price list (PRICING.md).

// The one-sentence answer to "what is HTS Hero?", written so it can be quoted on its own
export const DEFINITION =
  "HTS Hero is US tariff software for importers, customs brokers and freight forwarders: it calculates the full duty on any HTS code and country of origin, checks it for antidumping and countervailing duty (AD/CVD) cases, alerts you when a tariff change hits your products, and audits past entries for duty you may be able to get back."

// The plans' range, from the smallest plan to the largest (PRICING.md's value ladder)
const range = (tiers: readonly { name: string; maxPairs: number; price: number }[]) =>
  tiers.map((t) => `${t.name} ${formatPrice(t.price)} (${t.maxPairs} products)`).join(", ")
const alertsFrom = formatPrice(ALERT_TIERS[0].price)
const auditsFrom = formatPrice(AUDIT_TIERS[0].price)
const largest = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs
const teams = ALERT_TIERS.find((t) => t.teams)?.name ?? "Pro"

export const HOME_FAQS = [
  {
    question: "What is HTS Hero?",
    answer: `${DEFINITION} It also includes an AI classification assistant for finding and documenting HTS codes.`,
  },
  {
    question: "Is the tariff calculator free?",
    answer:
      "Yes. The HTS Hero Tariff Calculator is free and unlimited, with no account. Enter an HTS code and country of origin to see every duty line: the base rate, each Chapter 99 tariff with its legal source, exemptions, trade preferences and fees. A free account adds the AD/CVD check: the antidumping and countervailing duty cases that may cover the import, their deposit rates and the companies named.",
  },
  {
    question: "How do I get alerts when tariffs change on my products?",
    answer: `With Tariff Alerts. Upload your products, each an HTS code and country of origin, and you get an alert when a new tariff affects them: when it's proposed, and again when it's published, with the rate before and after on each product. Alerts come by email, and in Slack or Microsoft Teams on the ${teams} and Scale plans. Plans start at ${alertsFrom} a month for 10 products.`,
  },
  {
    question: "Can HTS Hero find duty I overpaid?",
    answer: `Yes. Tariff Audits recalculates each of your entries with the rules in force on its entry date and flags duty you may have overpaid, missed exemptions and refundable tariffs such as IEEPA, in seconds. HTS Hero finds and flags; you or your broker file, and you keep 100% of any refund. Plans start at ${auditsFrom} a month and include Tariff Alerts for the same products.`,
  },
  {
    question: "How much does HTS Hero cost?",
    answer: `The Tariff Calculator is free. Tariff Alerts is ${range(ALERT_TIERS)} a month. Tariff Audits is ${range(AUDIT_TIERS)} a month, each with Tariff Alerts for the same products included. Over ${largest} products, we price to your catalog. The classification assistant starts at ${formatPrice(CLASSIFY_PLANS.starter.price)} a month. No contract, cancel anytime, and ${ANNUAL_DISCOUNT * 100}% off with annual billing.`,
  },
  {
    question: "What counts as a product?",
    answer:
      "A product is one HTS code from one country of origin. The same HTS code from two countries is two products; many shipments of the same product count once. Plans are priced by how many products you have.",
  },
  {
    question: "Is there a free trial?",
    answer: `No. Tariff Alerts and Tariff Audits are paid from the start, and both come with a guarantee instead. Tariff Alerts has a ${GUARANTEE_DAYS}-day money-back guarantee. With Tariff Audits, if you run ${AUDIT_GUARANTEE_AUDITS} audits on your products within ${AUDIT_GUARANTEE_DAYS} days and aren't satisfied with the results, we refund you in full. The Tariff Calculator is free, and you can try the classification assistant free.`,
  },
  {
    question: "Where does HTS Hero's tariff data come from?",
    answer:
      "From the official Harmonized Tariff Schedule published by the US International Trade Commission, with every revision's changes entered on the dates they take effect, plus the proclamations, executive orders, Federal Register notices and CBP messages behind them. Every change is logged in a public changelog.",
  },
  {
    question: "Is HTS Hero a customs broker?",
    answer:
      "No. HTS Hero is software that calculates, monitors and audits US duty from official sources. We never file entries, corrections or refund claims; you or your broker do.",
  },
]
