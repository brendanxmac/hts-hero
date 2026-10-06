import type { Tool } from "../types";

export const TARIFFS_API: Tool = {
  slug: "tariffsapi",
  name: "TariffsAPI",
  url: "https://tariffsapi.com/tariff-calculator",
  kind: "Tariff API with a free calculator",
  summary:
    "An API-first tariff data service from Brightworks Digital of Singapore. The free calculator shows the effective rate; the breakdown, legal sources and history sit behind an email or a paid plan from $99 a month.",
  bestFor: "Developers building duty rates into their own software",
  price: "Free calculator; from $99/mo",
  priceDetail:
    "Free calculator with no signup. Importer $99/mo ($74/mo annually) adds watch lists, alerts and CSV import. Developer $199/mo ($149/mo annually) adds 10,000 API calls. 14-day trial with a card.",
  features: {
    freeToTry: { support: "partial", note: "Effective rate free; the breakdown needs an email" },
    selfServe: { support: "yes", note: "Card required for the trial" },
    publishedPricing: { support: "yes" },
    fullStack: { support: "partial", note: "Legal sources on paid plans" },
    tradePreferences: { support: "yes", note: "FTA rates such as USMCA and KORUS" },
    adjustments: { support: "partial", note: "Lists claimable exemptions; no questions" },
    entryDate: { support: "paid", note: "Through the API's as_of date" },
    rateHistory: { support: "paid", note: "In private beta" },
    catalogImpact: { support: "paid", note: "HTS Watch, from $99/mo" },
    countryCompare: { support: "partial", note: "Blurred until you give an email" },
    csvUpload: { support: "paid", note: "From $99/mo" },
    classification: { support: "no", note: "Doesn't offer classification" },
    api: { support: "paid", note: "API and MCP server, from $199/mo" },
    changelog: { support: "yes" },
  },
  strengths: ["Strong API with an MCP server", "Results cite the HTS subheading and CBP measures", "Published pricing"],
  limitations: [
    "Paid plans start at $99 a month",
    "No classification help",
    "Its changelog shows the September 29, 2026 Canadian import bans added about 5 days late",
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
