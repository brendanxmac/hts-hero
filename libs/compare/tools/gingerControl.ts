import type { Tool } from "../types";

export const GINGER_CONTROL: Tool = {
  slug: "gingercontrol",
  name: "GingerControl",
  url: "https://gingercontrol.com/products/tariff-calculator",
  kind: "Free calculator with paid compliance tools",
  summary:
    "A free US tariff calculator with an AI classifier, batch upload, an API and Compliance Radar alerts. The calculator needs no login; prices for its paid tools aren't published.",
  bestFor: "Teams that want a free calculator plus AI classification",
  price: "Free calculator; paid pricing not published",
  priceDetail:
    "The calculator is free with no login. Enterprise batch processing, the API and Compliance Radar are listed without published prices.",
  features: {
    freeToTry: { support: "yes", note: "No login required" },
    selfServe: { support: "partial", note: "Calculator is self-serve; paid tools list no prices" },
    publishedPricing: { support: "no" },
    fullStack: { support: "yes", note: "Each layer as its own line item" },
    tradePreferences: { support: "no", note: "No trade agreement option on its calculator" },
    adjustments: { support: "no", note: "No exemption questions to answer on its calculator" },
    entryDate: { support: "partial", note: "Says it uses date-sensitive rates" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "yes", note: "Compliance Radar alerts" },
    countryCompare: { support: "yes" },
    csvUpload: { support: "yes", note: "Spreadsheet batch upload" },
    classification: { support: "yes", note: "AI classifier" },
    api: { support: "onRequest", note: "Enterprise API, price not published" },
    changelog: { support: "unknown" },
  },
  strengths: [
    "Broad free feature set with no login",
    "Multi-country comparison in one view",
    "AI classifier and an API",
    "Compliance Radar matches trade notices to your HTS codes",
  ],
  limitations: [
    "Prices for paid tools aren't published",
    "Updated only through 2026 HTS Revision 10 as of October 6, 2026, when the current revision was 20",
    "No way to claim a trade agreement or answer the exemption questions that change the duty",
  ],
  sources: [
    { title: "GingerControl Tariff Calculator", url: "https://gingercontrol.com/products/tariff-calculator" },
    { title: "GingerControl pricing", url: "https://gingercontrol.com/pricing" },
    {
      title: "Introducing Compliance Radar",
      url: "https://gingercontrol.com/blog/introducing-compliance-radar-personalized-trade-policy-alerts",
    },
  ],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "GingerControl packs a lot into its free calculator, but as of October 6, 2026 its rates stopped at HTS Revision 10, ten revisions behind. HTS Hero is current, lets you claim trade agreements and exemptions, and publishes its prices.",
    chooseHtsHero: [
      "You need rates from the current HTS revision",
      "You want to claim USMCA or another trade agreement and see the preferential rate",
      "You want to answer the exemption questions that lower your duty",
      "You want every price on the website and monthly plans with no contract",
      "You need the duty for a past entry date, from the revision in force that day",
      "You want Duty Over Time to see how a product's duty changed",
      "You want a public, dated changelog of every tariff data update",
    ],
    chooseThem: [
      "You want a free AI classifier inside the calculator",
      "You want Compliance Radar's alerts on trade notices",
    ],
    differences: [
      {
        title: "Keeping current",
        body: "On October 6, 2026, GingerControl's calculator said it was updated to 2026 HTS Revision 10. The current revision was 20, and the ten in between brought Section 301 Brazil, the Section 301 forced-labor duties, Section 232 pharmaceuticals and drones, and Section 338 Canada. HTS Hero applies every revision and logs each one in a dated public changelog.",
      },
      {
        title: "Trade agreements and exemptions",
        body: "A lot of duty savings come from facts about your goods: a USMCA claim, metal content, a generic drug, a donation. HTS Hero shows every trade program available on the line and asks each question that could change the duty, then recalculates. We found no option on GingerControl's calculator to claim a trade agreement or answer those questions.",
      },
      {
        title: "Price transparency",
        body: "GingerControl's calculator is free, but its paid tools, including batch processing, the API and Compliance Radar, list no prices. HTS Hero publishes every plan's price, and you can start any of them yourself in a couple of minutes.",
      },
      {
        title: "Auditing and history",
        body: "GingerControl says its rates are date-sensitive. HTS Hero goes further: pick an entry date and it uses the HTS revision in force that day, and Duty Over Time charts every change to a product's duty with the revision that caused it.",
      },
      {
        title: "Integrations",
        body: "Both offer programmatic access. HTS Hero delivers tariff results by API and MCP for ERP, TMS, internal tools and AI assistants; book a call and we'll set it up with you.",
      },
    ],
    faqs: [
      {
        question: "Is GingerControl's tariff calculator free?",
        answer:
          "Yes, the calculator is free with no login. Its paid tools, such as batch processing, the API and Compliance Radar, don't list prices on its website.",
      },
      {
        question: "How is HTS Hero different from GingerControl?",
        answer:
          "HTS Hero keeps up with every HTS revision (GingerControl's calculator was on Revision 10 as of October 6, 2026), lets you claim trade agreements and answer the exemption questions that change the duty, shows past entry dates and Duty Over Time, and publishes self-serve pricing.",
      },
      {
        question: "Is GingerControl's tariff calculator up to date?",
        answer:
          "As of October 6, 2026, its calculator page said it was updated to 2026 HTS Revision 10. The current revision at the time was Revision 20, so changes from July to September 2026, including Section 301 forced-labor duties and Section 338 Canada, may be missing.",
      },
    ],
  },
  alternatives: {
    slug: "gingercontrol-alternatives",
    title: "Best GingerControl Alternatives",
    intro:
      "GingerControl offers a capable free calculator. People usually look elsewhere when they need current rates, want to claim trade agreements and exemptions, or want clear pricing for the paid tools.",
    reasons: [
      "Its calculator was updated only through HTS Revision 10 as of October 6, 2026",
      "No way to claim a trade agreement or answer exemption questions",
      "Paid tools don't publish prices",
      "You need entry-date audits and a product's duty across revisions",
      "You want a dated changelog showing which HTS revision the data reflects",
    ],
    faqs: [
      {
        question: "What's a good GingerControl alternative with published pricing?",
        answer:
          "HTS Hero publishes every plan's price and every plan is self-serve, starting with a free plan.",
      },
    ],
  },
};
