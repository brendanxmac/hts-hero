import {
  ANNUAL_DISCOUNT,
  CLASSIFY_PLANS,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";

// The homepage's fixed copy. The FAQ is shown on the page and in its FAQPage schema, so the two
// always match. Prices come from the price list (PRICING.md).

// The one-sentence answer to "what is HTS Hero?", written so it can be quoted on its own
export const DEFINITION =
  "HTS Hero is US tariff software for importers, customs brokers and freight forwarders: it calculates the full duty on any HTS code and country of origin, tracks every tariff on your imports, and alerts you when a tariff change hits one, with impact checks that show exactly how each tariff action affects you.";

const trackerFrom = formatPrice(TRACKER_TIERS[0].price);

export const HOME_FAQS = [
  {
    question: "What is HTS Hero?",
    answer: `${DEFINITION} It also includes an AI classification assistant for finding and documenting HTS codes.`,
  },
  {
    question: "Is the tariff calculator free?",
    answer:
      "Yes. The HTS Hero Tariff Calculator is free and unlimited, with no account. Enter an HTS code and country of origin to see every duty line: the base rate, each Chapter 99 tariff with its legal source, exemptions, trade preferences and fees.",
  },
  {
    question: "How do I get alerts when tariffs change on my products?",
    answer: `Add your products to the Tariff Tracker as HTS code and country of origin pairs. When a tariff is announced, and again when it reaches the HTS, you get an alert by email, in the app, or in Slack or Microsoft Teams. Alerts are free on ${TRIAL_ALLOWANCE.alertImports} imports with any account, no credit card.`,
  },
  {
    question: "How do I see how a new tariff affects my imports?",
    answer:
      "Run an impact check in the Tariff Tracker: pick any tariff action and see exactly how it affects each of your imports, with the rate before and after. Every import's rate history shows how its duty changed and why, and you can export every tariff on every import to CSV or Excel.",
  },
  {
    question: "How much does HTS Hero cost?",
    answer: `The Tariff Calculator is free. The Tariff Tracker is free to start: track ${TRIAL_ALLOWANCE.alertImports} imports with alerts and impact checks, then from ${trackerFrom} a month, billed monthly. The classification assistant starts at ${formatPrice(CLASSIFY_PLANS.starter.price)} a month, ${ANNUAL_DISCOUNT * 100}% off with annual billing. No contract.`,
  },
  {
    question: "How do you count imports?",
    answer:
      "One import is one HTS code from one country of origin. Upload your product catalog or your import history as a CSV; we group it by HTS code and country of origin, and each pair counts as one import. Repeat shipments, quantities and values don't add to your count. The same code from a second country does.",
  },
  {
    question: "Where does HTS Hero's tariff data come from?",
    answer:
      "From the official Harmonized Tariff Schedule published by the US International Trade Commission, with every revision's changes entered on the dates they take effect, plus the proclamations, executive orders, Federal Register notices and CBP messages behind them. Every change is logged in a public changelog.",
  },
  {
    question: "Is HTS Hero a customs broker?",
    answer:
      "No. HTS Hero is software that calculates and monitors US duty from official sources. Entries, corrections and refunds are filed by a licensed customs broker or the importer of record.",
  },
];
