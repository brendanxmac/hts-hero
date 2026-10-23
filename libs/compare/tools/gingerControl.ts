import type { Tool } from "../types";

export const GINGER_CONTROL: Tool = {
  slug: "gingercontrol",
  name: "GingerControl",
  url: "https://gingercontrol.com/products/tariff-calculator",
  kind: "Paid compliance app with a tariff calculator",
  summary:
    "A US tariff calculator from Flowyth Co of Austin, part of its GingerLite app ($150 a month for 300 credits) with an AI classification researcher, a Parts Library for bulk codes and Compliance Radar alerts. The calculator shows each Chapter 99 duty on its own line, for an entry date and any of 200+ origins.",
  bestFor: "Compliance teams that want a credit-based app with AI classification",
  price: "$150/mo for 300 credits",
  priceDetail:
    "The Tariff Calculator, Classification Researcher, Parts Library and Compliance Radar come in the GingerLite app at $150 a month for 300 credits; each calculation or classification uses credits. The API and GingerOS services are quoted after a call.",
  features: {
    freeToTry: { support: "no", note: "$150/mo app; each calculation uses credits", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "Is the tariff calculator free? No. The Tariff Calculator is one of the GingerLite tools" } },
    selfServe: { support: "partial", note: "App is self-serve; API and GingerOS start with a call", evidence: { url: "https://gingercontrol.com/faq", checkedAt: "2026-10-23", quote: "The GingerLite app at app.gingercontrol.com needs no sales call; it is $150 a month for 300 credits." } },
    publishedPricing: { support: "partial", note: "App $150/mo published; API and services quoted", evidence: { url: "https://gingercontrol.com/services", checkedAt: "2026-10-23", quote: "the Tariff Calculator, Compliance Radar and Parts Library, at $150 a month for 300 credits" } },
    fullStack: { support: "paid", note: "Each Chapter 99 duty as its own line", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "lists total duty and total cost side by side, cheapest first, each line with its Chapter 99 heading and rate" } },
    adcvd: { support: "no", note: "Not calculated, per its FAQ", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "the Tariff Calculator does not compute AD/CVD." } },
    tradePreferences: { support: "partial", note: "Shows the special rate; the total keeps the general rate", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "The total keeps the general rate, because whether your goods qualify depends on your rules-of-origin records" } },
    adjustments: { support: "partial", note: "Asks Section 232 metal content; other conditional tariffs shown as \"Potential\"", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "When the HTS code is a Section 232 metal article, the form adds a Material content box." } },
    entryDate: { support: "paid", note: "In the $150/mo app", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "Yes. The calculation is dated by the entry date you enter, and the date of loading is asked too." } },
    rateHistory: { support: "unknown", searched: { urls: ["https://gingercontrol.com/products/tariff-calculator", "https://gingercontrol.com/products/product-sandbox", "https://gingercontrol.com/products/compliance-radar", "https://gingercontrol.com/faq"], checkedAt: "2026-10-23" } },
    catalogImpact: { support: "partial", note: "Compliance Radar, in the $150/mo app; names affected products, no before/after rate", evidence: { url: "https://gingercontrol.com/products/compliance-radar", checkedAt: "2026-10-23", quote: "you get an alert that names the affected products and their HTS codes" } },
    countryCompare: { support: "paid", note: "200+ origins, in the $150/mo app", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "An HTS code, the value, the entry date and any of 200+ origins" } },
    csvUpload: { support: "paid", note: "Parts Library, CSV or Excel", evidence: { url: "https://gingercontrol.com/products/tariff-calculator", checkedAt: "2026-10-23", quote: "GingerControl's Parts Library imports a CSV or Excel file and calculates every code against every origin in one matrix." } },
    classification: { support: "paid", note: "AI Classification Researcher, in the $150/mo app", evidence: { url: "https://gingercontrol.com/services", checkedAt: "2026-10-23", quote: "Classify the SKU nobody wants to touch, and get a 10-digit code with the reasoning on paper." } },
    api: { support: "onRequest", note: "Enterprise customers; starts with a call", evidence: { url: "https://gingercontrol.com/services", checkedAt: "2026-10-23", quote: "The Classification + Tariff Calculation API is for enterprise customers and starts with a call." } },
    changelog: { support: "unknown", searched: { urls: ["https://gingercontrol.com/products/tariff-calculator", "https://gingercontrol.com/briefings", "https://gingercontrol.com/faq"], checkedAt: "2026-10-23" } },
  },
  strengths: [
    "Each Chapter 99 duty on its own line, with its heading and rate",
    "Entry dates and a 200+ country comparison",
    "AI classification researcher in the same app",
    "Parts Library calculates a CSV or Excel file of codes against every origin",
  ],
  limitations: [
    "No free calculator: the app is $150 a month, and each calculation uses credits",
    "The total keeps the general rate; trade agreement rates are shown but not claimed",
    "Conditional tariffs other than Section 232 metal content are shown as \"Potential\" and left out of the total",
    "Doesn't calculate AD/CVD, per its FAQ",
    "API and services priced after a call",
  ],
  sources: [
    { title: "GingerControl Tariff Calculator", url: "https://gingercontrol.com/products/tariff-calculator" },
    { title: "GingerControl services and pricing", url: "https://gingercontrol.com/services" },
    { title: "GingerControl FAQ", url: "https://gingercontrol.com/faq" },
    {
      title: "Introducing Compliance Radar",
      url: "https://gingercontrol.com/blog/introducing-compliance-radar-personalized-trade-policy-alerts",
    },
  ],
  checkedAt: "2026-10-23",
  vs: {
    verdict:
      "GingerControl is a capable credit-based app for compliance teams, at $150 a month. HTS Hero's calculator is free and unlimited with no sign-up, claims trade agreements and asks the exemption questions that change the total, and checks AD/CVD free with an account.",
    chooseHtsHero: [
      "You want a free, unlimited calculator with no sign-up and no credits",
      "You want to claim USMCA or another trade agreement into the total",
      "You want to answer the exemption questions that lower your duty",
      "You want a free AD/CVD check on any import",
      "You want Duty Over Time to see how a product's duty changed",
      "You want a public, dated changelog of every tariff data update",
    ],
    chooseThem: [
      "You want AI classification research and the calculator in one credit-based app",
      "You want to compare more than three countries at once",
    ],
    differences: [
      {
        title: "Free versus credits",
        body: "HTS Hero's calculator is free and unlimited with no sign-up. GingerControl's calculator is part of its GingerLite app at $150 a month for 300 credits, and each calculation uses credits.",
      },
      {
        title: "Exemptions and trade agreements",
        body: "A lot of duty savings come from facts about your goods: a USMCA claim, metal content, a generic drug, a donation. HTS Hero asks each question that could change the duty, recalculates, and lets you claim any trade program on the line. GingerControl asks for Section 232 metal content, shows the special rate without claiming it (its total keeps the general rate), and lists other conditional tariffs as \"Potential\", outside the total.",
      },
      {
        title: "AD/CVD",
        body: "HTS Hero checks any import for the antidumping and countervailing duty cases that may cover it, free with an account. GingerControl's FAQ says its calculator doesn't compute AD/CVD.",
      },
      {
        title: "History",
        body: "Both calculate duty for a past entry date. HTS Hero also charts it: Duty Over Time shows every change to a product's duty with the revision and heading that caused it.",
      },
      {
        title: "Integrations",
        body: "Both offer programmatic access after a conversation. HTS Hero delivers tariff results by API and MCP for ERP, TMS, internal tools and AI assistants; book a call and we'll set it up with you.",
      },
    ],
    faqs: [
      {
        question: "Is GingerControl's tariff calculator free?",
        answer:
          "No. Its FAQ says the Tariff Calculator is one of the GingerLite tools in its app, which is $150 a month for 300 credits, and each calculation uses credits. HTS Hero's calculator is free and unlimited with no sign-up.",
      },
      {
        question: "How is HTS Hero different from GingerControl?",
        answer:
          "HTS Hero's calculator is free, claims trade agreements and asks the exemption questions that change the total, checks AD/CVD free with an account, charts Duty Over Time and publishes self-serve pricing.",
      },
      {
        question: "Does GingerControl include exemptions?",
        answer:
          "Partly. It asks for Section 232 metal content; other tariffs that depend on a fact about your goods are shown as \"Potential\" and left out of the total for you to self-report. HTS Hero asks the question and recalculates.",
      },
    ],
  },
  alternatives: {
    slug: "gingercontrol-alternatives",
    title: "Best GingerControl Alternatives",
    intro:
      "GingerControl offers a capable credit-based compliance app. People usually look elsewhere when they want a free calculator, or exemptions and trade agreements built into the total.",
    reasons: [
      "The calculator costs $150 a month and uses credits",
      "Trade agreement rates are shown but not claimed in the total",
      "Most conditional tariffs are left out of the total as \"Potential\" lines",
      "AD/CVD isn't calculated",
      "You want a product's duty across revisions and a dated changelog",
    ],
    faqs: [
      {
        question: "What's a free GingerControl alternative?",
        answer:
          "HTS Hero's tariff calculator is free and unlimited with no sign-up, and every paid plan's price is published and self-serve.",
      },
    ],
  },
};
