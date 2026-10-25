import type { Tool } from "../types";

export const TARIFFS_API: Tool = {
  slug: "tariffsapi",
  name: "TariffsAPI",
  url: "https://tariffsapi.com/tariff-calculator",
  kind: "Tariff API with a free calculator",
  summary:
    "An API-first tariff data service from Brightworks Digital of Singapore. The free calculator shows the effective rate; the line-by-line breakdown needs a free email, and the API, history and Terminal start at $99 a month.",
  bestFor: "Developers building duty rates into their own software",
  price: "Free calculator; from $99/mo",
  priceDetail:
    "Free calculator; the breakdown needs an email. Starter $99/mo ($74/mo annually) includes bulk CSV import and 1,000 API calls a month. Developer $199/mo ($149/mo annually) adds the MCP server. Enterprise is priced on a call.",
  features: {
    freeToTry: { support: "partial", note: "Effective rate free; the breakdown needs an email", evidence: { url: "https://tariffsapi.com/tariff-calculator", checkedAt: "2026-10-23", quote: "Enter your email to see the full landed cost, the duty breakdown line by line, and every Chapter 99 measure" } },
    selfServe: { support: "partial", note: "Starter and Developer self-serve with a card; Enterprise on a call", evidence: { url: "https://tariffsapi.com/pricing", checkedAt: "2026-10-23", quote: "White-label, reseller and high-volume terms are priced on a call." } },
    publishedPricing: { support: "partial", note: "$99 and $199 plans published; Enterprise custom", evidence: { url: "https://tariffsapi.com/pricing", checkedAt: "2026-10-23", quote: "Public pricing. Start today." } },
    fullStack: { support: "yes", note: "Line by line after a free email sign-in", evidence: { url: "https://tariffsapi.com/tariff-calculator", checkedAt: "2026-10-23", quote: "Base duty + Chapter 99 surcharges + MPF + HMF, each line citing the measure that applied it." } },
    adcvd: { support: "no", note: "Not included, per its calculator page and API docs", evidence: { url: "https://tariffsapi.com/tariff-calculator", checkedAt: "2026-10-23", quote: "Antidumping and countervailing duty (AD/CVD) orders are not included." } },
    tradePreferences: { support: "yes", note: "FTA rates such as USMCA and KORUS", evidence: { url: "https://tariffsapi.com/tariff-calculator", checkedAt: "2026-10-23", quote: "Claim FTA preference if available (USMCA, KORUS, etc.)" } },
    adjustments: { support: "paid", note: "API conditions: metal origin, patent status, end use", evidence: { url: "https://tariffsapi.com/api-documentation", checkedAt: "2026-10-23", quote: "Selectable: preference_claimed, metal_melt_and_pour_origin, quota_fill_at_entry, patent_status, and end_use" } },
    entryDate: { support: "paid", note: "Through the API's as_of date", evidence: { url: "https://tariffsapi.com/pricing", checkedAt: "2026-10-23", quote: "Historical rates with as_of" } },
    rateHistory: { support: "paid", note: "API timeline and Terminal", evidence: { url: "https://tariffsapi.com/api-documentation", checkedAt: "2026-10-23", quote: "Every dated change we hold for one HTS code, oldest first: Chapter 99 measures and exemptions that started or ended." } },
    catalogImpact: { support: "partial", note: "Terminal watchlist shows moves; notice matching not built yet", evidence: { url: "https://tariffsapi.com/tariff-terminal", checkedAt: "2026-10-23", quote: "Does the wire tell me whether a notice affects my lanes? Not yet, and we will not fake it." } },
    countryCompare: { support: "paid", note: "Terminal, about 42 origins", evidence: { url: "https://tariffsapi.com/tariff-terminal", checkedAt: "2026-10-23", quote: "it resolves that code across roughly forty two origins in a single batch call, ranked by effective rate" } },
    csvUpload: { support: "paid", note: "From $99/mo", evidence: { url: "https://tariffsapi.com/pricing", checkedAt: "2026-10-23", quote: "Bulk CSV import with column mapping" } },
    classification: { support: "no", note: "Doesn't offer classification", evidence: { url: "https://tariffsapi.com/llms.md", checkedAt: "2026-10-23", quote: "Tariffs API does not perform HTS classification (placing a product into a code)." } },
    api: { support: "paid", note: "API from $99/mo; MCP server from $199/mo", evidence: { url: "https://tariffsapi.com/api-documentation", checkedAt: "2026-10-23", quote: "MCP server access is included on the Developer plan ($199/month) and on Enterprise." } },
    changelog: { support: "yes", evidence: { url: "https://tariffsapi.com/changelog", checkedAt: "2026-10-23", quote: "Changes to the tariff data we serve, the government notices we read, and what shipped in the API" } },
  },
  strengths: ["Strong API with an MCP server", "Results cite the HTS subheading and CBP measures", "Published pricing"],
  limitations: [
    "Paid plans start at $99 a month",
    "No classification help",
    "Doesn't yet match tariff notices to your products, per its Terminal page",
  ],
  sources: [
    { title: "TariffsAPI tariff calculator", url: "https://tariffsapi.com/tariff-calculator" },
    { title: "TariffsAPI pricing", url: "https://tariffsapi.com/pricing" },
    { title: "TariffsAPI API documentation", url: "https://tariffsapi.com/api-documentation" },
  ],
  checkedAt: "2026-10-23",
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
        body: "TariffsAPI's Starter plan is $99 a month. HTS Hero's Tariff Calculator is free, and Tariff Tracker for catalogs starts lower too. Both companies publish their prices.",
      },
    ],
    faqs: [
      {
        question: "How much does TariffsAPI cost?",
        answer:
          "Its calculator is free, and the line-by-line breakdown needs an email. Starter is $99 a month ($74 billed annually), Developer is $199 a month ($149 billed annually), and Enterprise is priced on a call.",
      },
    ],
  },
};
