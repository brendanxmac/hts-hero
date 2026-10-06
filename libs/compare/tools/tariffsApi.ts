import type { Tool } from "../types";

export const TARIFFS_API: Tool = {
  slug: "tariffsapi",
  name: "TariffsAPI",
  url: "https://tariffsapi.com/tariff-calculator",
  kind: "Tariff API with a free calculator",
  summary:
    "An API-first tariff data service with a free calculator that cites its sources. Paid plans add watch lists, alerts and bulk CSV import, starting at $99 a month.",
  bestFor: "Developers building duty rates into their own software",
  price: "Free calculator; from $99/mo",
  priceDetail:
    "Free calculator with no signup. Importer $99/mo ($74/mo annually) adds watch lists, alerts and CSV import. Developer $199/mo ($149/mo annually) adds 10,000 API calls. 14-day trial with a card.",
  features: {
    freeToTry: { support: "yes", note: "No signup" },
    selfServe: { support: "yes" },
    publishedPricing: { support: "yes" },
    fullStack: { support: "yes", note: "With citations" },
    tradePreferences: { support: "yes", note: "FTA rates such as USMCA and KORUS" },
    adjustments: { support: "unknown" },
    entryDate: { support: "partial", note: "Through the API's as_of parameter" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "paid", note: "HTS Watch, from $99/mo" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "paid", note: "From $99/mo" },
    classification: { support: "no", note: "Doesn't offer classification" },
    api: { support: "paid", note: "API and MCP server, from $199/mo" },
    changelog: { support: "unknown" },
  },
  strengths: ["Strong API with an MCP server", "Results cite the HTS subheading and CBP measures", "Published pricing"],
  limitations: [
    "Paid plans start at $99 a month",
    "No classification help",
  ],
  sources: [
    { title: "TariffsAPI tariff calculator", url: "https://tariffsapi.com/tariff-calculator" },
    { title: "TariffsAPI pricing", url: "https://tariffsapi.com/pricing" },
  ],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "TariffsAPI is built for developers who want tariff data in their own systems. HTS Hero is built for the people doing the importing: a calculator, history and catalog tools at a lower starting price.",
    chooseHtsHero: [
      "You want catalog alerts without starting at $99 a month",
      "You need classification help alongside your duty numbers",
      "You want Duty Over Time and past entry dates in a visual tool",
    ],
    chooseThem: [
      "You want self-serve API keys with published per-call pricing",
      "You're building your own product on top of duty-rate data",
    ],
    differences: [
      {
        title: "Who it's for",
        body: "TariffsAPI's paid plans are shaped around API calls and developer seats. HTS Hero is a finished tool for importers and brokers: calculator, catalog reports, history and classification, with no code required.",
      },
      {
        title: "Starting price",
        body: "TariffsAPI's Importer plan is $99 a month. HTS Hero's Tariff Calculator plan costs a fraction of that, and Tariff Tracker for catalogs starts lower too. Both companies publish their prices.",
      },
    ],
    faqs: [
      {
        question: "How much does TariffsAPI cost?",
        answer:
          "Its calculator is free. Importer is $99 a month ($74 billed annually) and Developer is $199 a month ($149 billed annually), with a 14-day trial that needs a card.",
      },
    ],
  },
};
