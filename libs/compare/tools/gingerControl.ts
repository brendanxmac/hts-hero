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
    entryDate: { support: "partial", note: "Says it uses date-sensitive rates" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "yes", note: "Compliance Radar alerts" },
    countryCompare: { support: "yes" },
    csvUpload: { support: "yes", note: "Spreadsheet batch upload" },
    classification: { support: "yes", note: "AI classifier" },
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
    "Its calculator page referenced HTS Revision 10 when we checked, several revisions behind the current schedule",
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
      "GingerControl packs a lot into its free calculator. HTS Hero wins when you need to audit past entries, see a product's duty across revisions, and know what you'll pay before you commit.",
    chooseHtsHero: [
      "You want every price on the website and monthly plans with no contract",
      "You need the duty for a past entry date, from the revision in force that day",
      "You want Duty Over Time to see how a product's duty changed",
      "You want a public, dated changelog of every tariff data update",
    ],
    chooseThem: [
      "You want AI classification bundled with the calculator",
      "You need an API for an ERP or TMS today",
    ],
    differences: [
      {
        title: "Price transparency",
        body: "GingerControl's calculator is free, but its paid tools, including batch processing, the API and Compliance Radar, list no prices. HTS Hero publishes every plan's price, and you can start any of them yourself in a couple of minutes.",
      },
      {
        title: "Auditing and history",
        body: "GingerControl says its rates are date-sensitive. HTS Hero goes further: pick an entry date and it uses the HTS revision in force that day, and Duty Over Time charts every change to a product's duty with the revision that caused it.",
      },
      {
        title: "Keeping current",
        body: "When we checked, GingerControl's calculator page said it was updated to 2026 HTS Revision 10. HTS Hero publishes a dated changelog for every revision it applies, so you can see exactly which revision your numbers come from.",
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
          "HTS Hero focuses on exact, auditable US duty: past entry dates from the revision in force at the time, Duty Over Time across revisions, a public changelog, and published self-serve pricing.",
      },
    ],
  },
  alternatives: {
    slug: "gingercontrol-alternatives",
    title: "Best GingerControl Alternatives",
    intro:
      "GingerControl offers a capable free calculator. People usually look elsewhere when they want clear pricing for the paid tools, or deeper history for auditing past entries.",
    reasons: [
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
