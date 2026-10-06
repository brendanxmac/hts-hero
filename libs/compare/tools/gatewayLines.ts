import type { Tool } from "../types";

export const GATEWAY_LINES: Tool = {
  slug: "gateway-lines",
  name: "Gateway Tariff Calculator",
  vendor: "Gateway Lines",
  url: "https://tariff.gatewaylines.com",
  kind: "Free calculator from a freight forwarder",
  summary:
    "A free tariff calculator and import duty simulator from Gateway Lines, a New York ocean freight company. No signup, with bulk upload, AI classification and a paid alerts subscription.",
  bestFor: "Free lookups with bulk upload and no signup",
  price: "Free; alerts and API priced separately",
  priceDetail:
    "The calculator is free with no signup. An alerts subscription and an enterprise API are offered without published prices.",
  features: {
    freeToTry: { support: "yes", note: "No signup" },
    selfServe: { support: "partial", note: "Calculator is self-serve; API and alerts priced separately" },
    publishedPricing: { support: "no" },
    fullStack: { support: "yes", note: "Includes AD/CVD tracking" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "partial", note: "Tariff alerts subscription" },
    countryCompare: { support: "yes" },
    csvUpload: { support: "yes" },
    classification: { support: "yes", note: "AI classification" },
    changelog: { support: "unknown" },
  },
  strengths: ["Free with no signup", "Bulk upload and country comparison", "Tracks AD/CVD alongside Chapter 99"],
  limitations: [
    "Alerts and the API don't publish prices",
    "Built as a lead source for a freight forwarder",
  ],
  sources: [{ title: "Gateway Tariff Calculator", url: "https://tariff.gatewaylines.com" }],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "Gateway's calculator is a solid free lookup tool with bulk upload. HTS Hero is built for the next step: auditing what you paid, tracking a catalog over time, and seeing every price up front.",
    chooseHtsHero: [
      "You need the duty for a past entry date, from the revision in force that day",
      "You want to see a product's duty across HTS revisions",
      "You want an independent tool that isn't part of a freight sales funnel",
      "You want every plan's price on the website",
    ],
    chooseThem: [
      "You want free bulk lookups with no account at all",
      "You also want antidumping and countervailing duty tracking in the same tool",
    ],
    differences: [
      {
        title: "History and audits",
        body: "HTS Hero calculates duty for a past entry date using the HTS revision in force that day, and charts each change to a product's duty over time. We didn't find an entry-date option on Gateway's calculator.",
      },
      {
        title: "Independence",
        body: "Gateway's calculator is run by a freight forwarder. HTS Hero is a standalone tariff tool, so you can use it with any forwarder or broker.",
      },
    ],
    faqs: [
      {
        question: "Is the Gateway tariff calculator free?",
        answer: "Yes, with no signup. Its alerts subscription and enterprise API are offered separately without published prices.",
      },
    ],
  },
};
