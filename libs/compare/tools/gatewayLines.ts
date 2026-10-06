import type { Tool } from "../types";

export const GATEWAY_LINES: Tool = {
  slug: "gateway-lines",
  name: "Gateway Tariff Calculator",
  vendor: "Gateway Lines",
  url: "https://tariff.gatewaylines.com",
  kind: "Free calculator from a freight forwarder",
  summary:
    "A free tariff calculator from Gateway Lines, a New York freight forwarder, with current 2026 data, Chapter 99 citations, bulk upload, AI classification and a free MCP server. It calculates current-day entries only.",
  bestFor: "Free lookups with bulk upload and no signup",
  price: "Free; alerts and API priced separately",
  priceDetail:
    "The calculator is free with no signup. An alerts subscription and an enterprise API are offered without published prices.",
  features: {
    freeToTry: { support: "yes", note: "5 a week without an account, unlimited with a free one" },
    selfServe: { support: "yes" },
    publishedPricing: { support: "no", note: "Free tool; alerts and API through sales" },
    fullStack: { support: "yes", note: "With Chapter 99 citations and AD/CVD" },
    tradePreferences: { support: "partial", note: "Shows FTA savings; no claim to make" },
    adjustments: { support: "partial", note: "Questions for drones and AD/CVD only" },
    entryDate: { support: "no", note: "Current-day entries only, per its own code" },
    rateHistory: { support: "partial", note: "Dated timelines on example pages" },
    catalogImpact: { support: "partial", note: "Policy emails, not tied to your products" },
    countryCompare: { support: "yes" },
    csvUpload: { support: "yes", note: "500 rows on a free account" },
    classification: { support: "yes", note: "AI search" },
    api: { support: "onRequest", note: "Free MCP server and a ChatGPT app; API on request" },
    changelog: { support: "yes", note: "Tariff Radar, with citations" },
  },
  strengths: [
    "Current 2026 data, reviewed within 24 to 48 hours",
    "Chapter 99 citations, including the Canadian import bans",
    "Bulk upload and country comparison on a free account",
    "Free MCP server and a ChatGPT app",
  ],
  limitations: [
    "Current-day entries only: no past entry dates or history",
    "Alerts are policy emails, not tied to your products",
    "Alerts and the API don't publish prices",
    "Built as a lead source for a freight forwarder",
  ],
  sources: [{ title: "Gateway Tariff Calculator", url: "https://tariff.gatewaylines.com" }],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "Gateway's calculator is a solid free lookup tool with bulk upload. HTS Hero is built for the next step: auditing what you paid, tracking a catalog over time, and seeing every price up front.",
    chooseHtsHero: [
      "You need to audit past entries, using the HTS revision in force on each entry date",
      "You want to see a product's duty across HTS revisions",
      "You want an independent tool that isn't part of a freight sales funnel",
      "You want every plan's price on the website",
    ],
    chooseThem: [
      "You want free bulk lookups and a free MCP server",
      "You also want antidumping and countervailing duty tracking in the same tool",
    ],
    differences: [
      {
        title: "History and audits",
        body: "HTS Hero calculates duty for a past entry date using the HTS revision in force that day, and charts each change to a product's duty over time. Gateway's calculator estimates current-day entries only, so it can't check what you should have paid last quarter.",
      },
      {
        title: "Independence",
        body: "Gateway's calculator is run by a freight forwarder. HTS Hero is a standalone tariff tool, so you can use it with any forwarder or broker.",
      },
    ],
    faqs: [
      {
        question: "Is the Gateway tariff calculator free?",
        answer: "Yes. You get 5 calculations a week without an account and unlimited ones with a free account. Its alerts and enterprise API don't publish prices.",
      },
    ],
  },
};
