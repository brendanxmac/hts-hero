import {
  ANNUAL_DISCOUNT,
  CLASSIFY_PLANS,
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  TRACKER_TIERS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing"

// The homepage's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so the two
// always match. Prices come from the price list (PRICING.md).

// The one-sentence answer to "what is HTS Hero?", written so it can be quoted on its own
export const DEFINITION =
  "HTS Hero is US tariff software for importers, customs brokers and freight forwarders: it calculates the full duty on any HTS code and country of origin, checks it for antidumping and countervailing duty (AD/CVD) cases, alerts you when a tariff change hits your products, and audits past entries for duty you can get back."

const trackerFrom = formatPrice(TRACKER_TIERS[0].price)

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
    answer: `Add your products to the Tariff Tracker as HTS code and country of origin pairs. When a tariff is announced, and again when it reaches the HTS, you get an alert by email, in the app, or in Slack or Microsoft Teams. Every new account gets the whole Tariff Tracker free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, alerts included, with no credit card. After that, alerts on your own imports come with a paid plan.`,
  },
  {
    question: "Can HTS Hero find duty I overpaid?",
    answer:
      "Yes. Our tariff audit recalculates each of your past entries with the rules in force on its entry date and flags potentially overpaid duty, missed exemptions and refundable tariffs such as IEEPA.",
  },
  {
    question: "How much does HTS Hero cost?",
    answer: `The Tariff Calculator is free. A free account adds AD/CVD checks and sourcing intelligence on any import. The Tariff Tracker is free for ${REVERSE_TRIAL.days} days on up to ${REVERSE_TRIAL.imports} imports, with no credit card, then from ${trackerFrom} a month, as low as ${formatPrice(LOWEST_PER_IMPORT)} per import a month on the largest plan. The classification assistant starts at ${formatPrice(CLASSIFY_PLANS.starter.price)} a month. Monthly plans, no contract, and ${ANNUAL_DISCOUNT * 100}% off with annual billing.`,
  },
  {
    question: "Where does HTS Hero's tariff data come from?",
    answer:
      "From the official Harmonized Tariff Schedule published by the US International Trade Commission, with every revision's changes entered on the dates they take effect, plus the proclamations, executive orders, Federal Register notices and CBP messages behind them. Every change is logged in a public changelog.",
  },
  {
    question: "Is HTS Hero a customs broker?",
    answer:
      "No. HTS Hero is software that calculates, monitors and audits US duty from official sources. We NEVER process entires, corrections, or refunds.",
  },
]
