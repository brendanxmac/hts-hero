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
  price: "Free; volume and enterprise through sales",
  priceDetail:
    "Five calculations a week without an account, more with an email or a free sign-up. Tariff alerts, the MCP server and 5-row bulk upload are free; 500-row files and unlimited MCP lookups are for Gateway freight customers. Volume and enterprise use go through sales.",
  features: {
    freeToTry: { support: "yes", note: "5 a week without an account; more with an email or free sign-up", evidence: { url: "https://tariff.gatewaylines.com/faq", checkedAt: "2026-10-23", quote: "Visitors can make five calculations per rolling seven days without an account." } },
    selfServe: { support: "partial", note: "Free tool is self-serve; higher limits for Gateway freight customers", evidence: { url: "https://tariff.gatewaylines.com/compare/flexport-tariff-simulator", checkedAt: "2026-10-23", quote: "Gateway customers with an activated account can price up to 500 products a file." } },
    publishedPricing: { support: "no", note: "Free tool; volume and enterprise through sales", evidence: { url: "https://tariff.gatewaylines.com/tariff-simulator", checkedAt: "2026-10-23", quote: "Free for individual use; talk to sales for volume or enterprise needs" } },
    fullStack: { support: "yes", note: "With Chapter 99 citations", evidence: { url: "https://tariff.gatewaylines.com/", checkedAt: "2026-10-23", quote: "Only one provision applies per authority type. Gateway evaluates all relevant Chapter 99 codes." } },
    adcvd: { support: "partial", note: "Lists possible cases; deposit rates only where it holds them", evidence: { url: "https://tariff.gatewaylines.com/compare/flexport-tariff-simulator", checkedAt: "2026-10-23", quote: "Names the orders and open investigations that may cover the line, with case numbers and the published cash deposit rates where we hold them" } },
    tradePreferences: { support: "partial", note: "Shows FTA savings; no claim to make", evidence: { url: "https://tariff.gatewaylines.com/compare/flexport-tariff-simulator", checkedAt: "2026-10-23", quote: "Charges the general rate and shows the agreement rate beside it, with the total it would give" } },
    adjustments: { support: "partial", note: "Asks the AD/CVD producer or exporter", evidence: { url: "https://tariff.gatewaylines.com/", checkedAt: "2026-10-23", quote: "enter the producer/exporter to calculate a deposit where verified supplier rates are available" } },
    entryDate: { support: "no", note: "Today or later only; past entry dates not supported", evidence: { url: "https://tariff.gatewaylines.com/compare/flexport-tariff-simulator", checkedAt: "2026-10-23", quote: "Past entry dates are not supported." } },
    rateHistory: { support: "partial", note: "Dated timelines on example pages", evidence: { url: "https://tariff.gatewaylines.com/examples/consumer-drones-250-g-to-7-kg-8806-22-00-00-from-china", checkedAt: "2026-10-23", quote: "What changed on this lane 45% before the first entry below, 50% today." } },
    catalogImpact: { support: "partial", note: "Free policy emails, not tied to your products", evidence: { url: "https://tariff.gatewaylines.com/tariff-radar", checkedAt: "2026-10-23", quote: "Free. Unsubscribe in one click. We send when a rate actually changes, not on a schedule." } },
    countryCompare: { support: "yes", evidence: { url: "https://tariff.gatewaylines.com/tariff-simulator", checkedAt: "2026-10-23", quote: "Use the country comparison view or \"Compare alternatives\" after calculating" } },
    csvUpload: { support: "partial", note: "5 rows a file free; 500 for Gateway customers", evidence: { url: "https://tariff.gatewaylines.com/", checkedAt: "2026-10-23", quote: "bulk upload of up to 5 rows a file (500 for Gateway customers with an activated account)" } },
    classification: { support: "yes", note: "AI classification, 10 a day free", evidence: { url: "https://tariff.gatewaylines.com/compare/flexport-tariff-simulator", checkedAt: "2026-10-23", quote: "Up to 10 classifications a day are free, with no sign-up." } },
    api: { support: "partial", note: "Free MCP server (10 lookups a week); unlimited for freight customers", evidence: { url: "https://tariff.gatewaylines.com/mcp", checkedAt: "2026-10-23", quote: "Free. 10 lookups per week with an email address, unlimited for Gateway freight customers." } },
    changelog: { support: "yes", note: "Tariff Radar, with citations", evidence: { url: "https://tariff.gatewaylines.com/tariff-radar", checkedAt: "2026-10-23", quote: "Every US tariff change, with the source that proves it" } },
  },
  strengths: [
    "Current 2026 data, reviewed within 24 to 48 hours",
    "Chapter 99 citations on each line",
    "Country comparison and free AI classification",
    "Free tariff alerts, a free MCP server and a ChatGPT app",
  ],
  limitations: [
    "Today or later entry dates only: its own comparison page says past entry dates aren't supported",
    "Alerts are policy emails, not tied to your products",
    "Bulk upload is 5 rows a file unless you're a Gateway freight customer",
    "Volume, enterprise and API access go through sales",
    "Built as a lead source for a freight forwarder",
  ],
  sources: [{ title: "Gateway Tariff Calculator", url: "https://tariff.gatewaylines.com" }],
  checkedAt: "2026-10-23",
  vs: {
    verdict:
      "Gateway's calculator is a solid free lookup tool with bulk upload. HTS Hero is built for the next step: auditing what you paid, tracking a catalog over time, and seeing every price up front.",
    chooseHtsHero: [
      "You need to audit past entries, using the HTS revision in force on each entry date",
      "You want to see a product's duty across HTS revisions",
      "You want an independent tool that isn't part of a freight sales funnel",
      "You want every plan's price on the website",
      "You want a free AD/CVD check that lists each case that may cover an import, its deposit rates and the companies named",
    ],
    chooseThem: [
      "You want free AI classification and a free MCP server",
      "You want AD/CVD deposits added into the duty total, for the orders it has reviewed",
    ],
    differences: [
      {
        title: "History and audits",
        body: "HTS Hero calculates duty for a past entry date using the HTS revision in force that day, and charts each change to a product's duty over time. Gateway's own comparison page says past entry dates aren't supported, so it can't check what you should have paid last quarter.",
      },
      {
        title: "Independence",
        body: "Gateway's calculator is run by a freight forwarder. HTS Hero is a standalone tariff tool, so you can use it with any forwarder or broker.",
      },
    ],
    faqs: [
      {
        question: "Is the Gateway tariff calculator free?",
        answer: "Yes, for individual use: 5 calculations a week without an account, and more with an email or a free sign-up. Volume and enterprise use go through sales.",
      },
    ],
  },
};
