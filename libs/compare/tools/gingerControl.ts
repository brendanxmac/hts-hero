import type { Tool } from "../types";

export const GINGER_CONTROL: Tool = {
  slug: "gingercontrol",
  name: "GingerControl",
  url: "https://gingercontrol.com/products/tariff-calculator",
  kind: "Free calculator with paid compliance tools",
  summary:
    "A free US tariff calculator from Flowyth Co of Austin, with an AI classifier, entry dates, a 200+ country comparison and Compliance Radar alerts in beta. The calculator needs no login; plan prices appear only after you log in.",
  bestFor: "Teams that want a free calculator plus AI classification",
  price: "Free calculator; paid pricing not published",
  priceDetail:
    "The calculator is free with no login. Enterprise batch processing, the API and Compliance Radar are listed without published prices.",
  features: {
    freeToTry: { support: "yes", note: "No login required" },
    selfServe: { support: "partial", note: "Calculator is self-serve; plan prices only after login" },
    publishedPricing: { support: "no" },
    fullStack: { support: "yes", note: "Each layer as its own line item" },
    tradePreferences: { support: "partial", note: "Paid area only; none on the free calculator" },
    adjustments: { support: "no", note: "Uncertain tariffs shown as \"Potential\" and left out of the total" },
    entryDate: { support: "yes" },
    rateHistory: { support: "partial" },
    catalogImpact: { support: "partial", note: "Compliance Radar, in private beta" },
    countryCompare: { support: "yes", note: "200+ countries" },
    csvUpload: { support: "paid", note: "100 products per import" },
    classification: { support: "yes", note: "AI classifier" },
    api: { support: "onRequest", note: "Price not published" },
    changelog: { support: "no" },
  },
  strengths: [
    "Broad free feature set with no login",
    "Entry dates and a 200+ country comparison",
    "AI classifier",
    "Covers the 2026 Section 301, 232 and 338 programs",
  ],
  limitations: [
    "Plan prices aren't published",
    "No exemption questions: uncertain tariffs are shown as \"Potential\" and left out of the total",
    "Trade agreements only in the paid area",
    "Its calculator banner said \"Revision 10\" on October 6, 2026, when the current revision was 20",
    "We found no handling of the September 29, 2026 Canadian import bans",
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
      "GingerControl packs a lot into its free calculator. HTS Hero goes further where the total depends on facts about your goods: it asks the exemption questions, lets you claim trade agreements on the free calculator, flags banned goods, and publishes its prices.",
    chooseHtsHero: [
      "You want to claim USMCA or another trade agreement on the free calculator",
      "You want to answer the exemption questions that lower your duty",
      "You want every price on the website and monthly plans with no contract",
      "You want Duty Over Time to see how a product's duty changed",
      "You need goods banned from import flagged, not priced",
      "You want a public, dated changelog of every tariff data update",
    ],
    chooseThem: [
      "You want a free AI classifier inside the calculator",
      "You want to compare more than three countries at once",
    ],
    differences: [
      {
        title: "Exemptions and trade agreements",
        body: "A lot of duty savings come from facts about your goods: a USMCA claim, metal content, a generic drug, a donation. HTS Hero asks each question that could change the duty and recalculates, and lets you claim any trade program on the line. GingerControl's free calculator has no trade agreement option, and where a tariff depends on a fact it shows the line as \"Potential\" and leaves it out of the total.",
      },
      {
        title: "Banned goods and freshness",
        body: "From September 29, 2026, some Canadian alcohol, dairy and motorcycles can't be imported at all. HTS Hero flags them; we found no sign that GingerControl does. Its calculator banner also still said \"Revision 10\" on October 6, 2026. HTS Hero logs every revision it applies in a dated public changelog.",
      },
      {
        title: "Price transparency",
        body: "GingerControl's calculator is free, but its paid tools, including batch processing, the API and Compliance Radar, list no prices. HTS Hero publishes every plan's price, and you can start any of them yourself in a couple of minutes.",
      },
      {
        title: "History",
        body: "Both calculate duty for a past entry date. HTS Hero also charts it: Duty Over Time shows every change to a product's duty with the revision and heading that caused it.",
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
          "HTS Hero asks the exemption questions that change the duty, lets you claim trade agreements on the free calculator, flags goods banned from import, charts Duty Over Time and publishes self-serve pricing.",
      },
      {
        question: "Does GingerControl include exemptions?",
        answer:
          "Not as questions. When a tariff depends on a fact about your goods, GingerControl shows it as \"Potential\" and leaves it out of the total for you to self-report. HTS Hero asks the question and recalculates.",
      },
    ],
  },
  alternatives: {
    slug: "gingercontrol-alternatives",
    title: "Best GingerControl Alternatives",
    intro:
      "GingerControl offers a capable free calculator. People usually look elsewhere when they want exemptions and trade agreements built into the total, or clear pricing for the paid tools.",
    reasons: [
      "Exemptions are left out of the total as \"Potential\" lines",
      "No trade agreement option on the free calculator",
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
