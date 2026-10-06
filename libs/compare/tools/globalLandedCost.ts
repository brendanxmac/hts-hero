import type { Tool } from "../types";

// Landed-cost and duty platforms built for cross-border ecommerce checkouts and global trade,
// rather than for a US importer's own duty bill

export const AVALARA: Tool = {
  slug: "avalara",
  name: "Avalara AvaTax Cross-Border",
  vendor: "Avalara",
  url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html",
  kind: "Cross-border duty and tax API for ecommerce",
  summary:
    "Avalara AvaTax Cross-Border calculates or estimates customs duty and import tax in online shopping carts, with HS-6 or HS-10 classification, for retailers selling across borders. It's built into stores and marketplaces rather than used as a standalone calculator.",
  bestFor: "Retailers that need duty and tax at checkout, in many countries",
  price: "Contact Avalara",
  priceDetail: "We didn't find published prices for Avalara's cross-border products.",
  features: {
    freeToTry: { support: "unknown" },
    selfServe: { support: "unknown" },
    publishedPricing: { support: "unknown" },
    fullStack: { support: "unknown" },
    tradePreferences: { support: "unknown" },
    adjustments: { support: "unknown" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "unknown" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "unknown" },
    classification: { support: "yes", note: "Avalara Tariff Code Classification" },
    api: { support: "onRequest", note: "Built into stores and marketplaces" },
    changelog: { support: "unknown" },
  },
  strengths: ["Duty and tax at checkout for many countries", "Large ecommerce and marketplace integrations", "HS classification services"],
  limitations: [
    "Designed for checkout estimates across many countries; US Chapter 99 itemization isn't documented",
    "No published prices found",
  ],
  sources: [
    {
      title: "Avalara AvaTax Cross-Border",
      url: "https://www.avalara.com/us/en/products2/global-commerce-offerings/avatax-cross-border.html",
    },
    {
      title: "Avalara and eBay partner on cross-border compliance (Business Wire)",
      url: "https://www.businesswire.com/news/home/20230427005209/en/Avalara-and-eBay-Partner-to-Solve-Cross-Border-Compliance-for-Global-Sellers",
    },
  ],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "Avalara and HTS Hero solve different problems. Avalara estimates duty and tax at a store's checkout across many countries; HTS Hero tells a US importer exactly what each import owes, tariff by tariff, and how that changed over time.",
    chooseHtsHero: [
      "You import into the US and need the exact duty on each entry",
      "You need every Chapter 99 tariff itemized, with exemptions",
      "You want to audit past entries and track your catalog's duty over time",
      "You want to start today on a free plan, with published prices",
    ],
    chooseThem: [
      "You sell cross-border to consumers in many countries and need duty at checkout",
      "You already use Avalara for sales tax and want one vendor",
    ],
    differences: [
      {
        title: "Checkout estimates versus an importer's duty bill",
        body: "Avalara's cross-border tools are designed to show a shopper the landed cost before they buy. A US importer of record needs something narrower and deeper: the base rate plus each Section 232, Section 301 and other Chapter 99 tariff that applies to a specific HTS code, country and entry date. That's what HTS Hero is built for.",
      },
      {
        title: "Getting started",
        body: "We didn't find published prices for Avalara's cross-border products. HTS Hero has a free plan and published monthly prices, and you can start in a couple of minutes.",
      },
    ],
    faqs: [
      {
        question: "Does Avalara calculate US Section 301 and 232 tariffs?",
        answer:
          "Avalara calculates customs duty for cross-border sales, but its public pages we reviewed don't detail how it itemizes US Chapter 99 tariffs such as Section 301 and 232. HTS Hero shows each of them as its own line with its legal source.",
      },
    ],
  },
  alternatives: {
    slug: "avalara-landed-cost-alternatives",
    title: "Best Avalara Landed Cost Alternatives for US Importers",
    intro:
      "Avalara's cross-border tools are made for ecommerce checkouts in many countries. US importers often want something more specific: the exact duty on each entry, with every Chapter 99 tariff shown.",
    reasons: [
      "You import into the US and don't need checkout integration",
      "You need Section 232, 301 and other tariffs itemized",
      "You want published prices and a self-serve start",
    ],
    faqs: [
      {
        question: "What's a simpler alternative to Avalara for US import duty?",
        answer:
          "HTS Hero is a self-serve US tariff calculator with a free plan. It shows the base rate and each Chapter 99 tariff for an HTS code, country and entry date.",
      },
    ],
  },
};

export const ZONOS: Tool = {
  slug: "zonos",
  name: "Zonos Landed Cost",
  vendor: "Zonos",
  url: "https://zonos.com/landed-cost",
  kind: "Landed cost at checkout for cross-border ecommerce",
  summary:
    "Zonos calculates and can guarantee landed cost at checkout for cross-border ecommerce, across 200+ countries and territories, with plugins for the major store platforms.",
  bestFor: "Cross-border stores that want guaranteed landed cost at checkout",
  price: "Not published",
  priceDetail: "No prices on its landed cost page, which offers a demo booking alongside sign-up.",
  features: {
    freeToTry: { support: "unknown" },
    selfServe: { support: "partial", note: "Offers sign-up and demo booking" },
    publishedPricing: { support: "no" },
    fullStack: { support: "unknown", note: "Section 301 and 232 aren't mentioned on its landed cost page" },
    tradePreferences: { support: "unknown" },
    adjustments: { support: "unknown" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "unknown" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "unknown" },
    classification: { support: "yes", note: "Zonos Classify" },
    api: { support: "onRequest", note: "API and store plugins" },
    changelog: { support: "unknown" },
  },
  strengths: ["Guaranteed landed cost at checkout", "200+ countries and territories", "Store platform plugins"],
  limitations: [
    "Designed for store checkouts, with no documented US Chapter 99 breakdown",
    "No published prices on its landed cost page",
  ],
  sources: [{ title: "Zonos Landed Cost", url: "https://zonos.com/landed-cost" }],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "Zonos is a checkout tool for cross-border stores. HTS Hero is a duty tool for US importers: every tariff on every entry, past entry dates, and catalog-wide impact when tariffs change.",
    chooseHtsHero: [
      "You're the importer of record and need the exact US duty per entry",
      "You want Section 232, 301 and other tariffs itemized",
      "You want published prices and no demo",
    ],
    chooseThem: ["You run a store selling internationally and want landed cost guaranteed at checkout"],
    differences: [
      {
        title: "What it's for",
        body: "Zonos shows shoppers a landed cost at checkout across many countries. HTS Hero shows a US importer the full duty on an import, tariff by tariff, with the Chapter 99 heading and legal note behind each one.",
      },
      {
        title: "Pricing",
        body: "Zonos doesn't publish prices on its landed cost page. HTS Hero publishes every plan's price and has a free plan.",
      },
    ],
    faqs: [
      {
        question: "Is Zonos a good tariff calculator for US importers?",
        answer:
          "Zonos is built for cross-border checkout. For US importers who need each Chapter 99 tariff on an entry, a US-specific calculator such as HTS Hero is a closer fit.",
      },
    ],
  },
  alternatives: {
    slug: "zonos-alternatives",
    title: "Best Zonos Alternatives for US Import Duty",
    intro:
      "Zonos is a strong checkout product for cross-border stores. If you're a US importer working out duty on your own entries, you probably need a different kind of tool.",
    reasons: [
      "You need US Chapter 99 tariffs itemized for each entry",
      "You want published prices without booking a demo",
      "You don't need checkout integration",
    ],
    faqs: [
      {
        question: "What's a Zonos alternative for US importers?",
        answer:
          "HTS Hero calculates the full US duty for an HTS code, country and entry date, with each Chapter 99 tariff itemized, on self-serve plans with published prices.",
      },
    ],
  },
};

export const SIMPLY_DUTY: Tool = {
  slug: "simplyduty",
  name: "SimplyDuty",
  url: "https://www.simplyduty.com/import-calculator",
  kind: "Global duty calculator and API",
  summary:
    "A global import duty calculator and API covering 100+ destinations. Free use needs registration and is capped at 5 calculations a day; paid plans are priced by API calls.",
  bestFor: "Developers who need cheap duty estimates for many countries",
  price: "From £9.99/mo",
  priceDetail:
    "5 free calculations a day after registering. Basic £9.99/mo (100 API calls), Start-up £49.99, Professional £99.99, Enterprise £499.99, or £0.10 per call.",
  features: {
    freeToTry: { support: "partial", note: "5 calculations a day, registration required" },
    selfServe: { support: "yes" },
    publishedPricing: { support: "yes", note: "In GBP" },
    fullStack: { support: "unknown", note: "Section 301 and 232 not mentioned on its pricing page" },
    tradePreferences: { support: "unknown" },
    adjustments: { support: "unknown" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "unknown" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "unknown" },
    classification: { support: "paid", note: "£0.10 per API call" },
    api: { support: "paid", note: "From £9.99/mo" },
    changelog: { support: "unknown" },
  },
  strengths: ["Global coverage", "Inexpensive API pricing", "Published prices"],
  limitations: ["Registration needed even for free use, capped at 5 a day", "Covers many countries, with no documented US Chapter 99 breakdown"],
  sources: [
    { title: "SimplyDuty pricing", url: "https://www.simplyduty.com/pricing/" },
    { title: "SimplyDuty import calculator", url: "https://www.simplyduty.com/import-calculator" },
  ],
  checkedAt: "2026-10-06",
  vs: {
    verdict:
      "SimplyDuty is a handy global API at a low price. For US imports, HTS Hero gives you the detail that matters: every Chapter 99 tariff itemized, past entry dates and Duty Over Time.",
    chooseHtsHero: [
      "Your imports come into the US and you need each tariff itemized",
      "You want to audit past entries and see duty across revisions",
    ],
    chooseThem: ["You need duty estimates for many destination countries through an API"],
    differences: [
      {
        title: "US depth versus global breadth",
        body: "SimplyDuty covers 100+ destinations. HTS Hero covers one, the US, in depth: the base rate plus each Section 232, Section 301 and other Chapter 99 tariff, with exemptions and fees.",
      },
    ],
    faqs: [
      {
        question: "Is SimplyDuty free?",
        answer: "Registered users get 5 free calculations a day. Paid plans start at £9.99 a month for 100 API calls.",
      },
    ],
  },
  alternatives: {
    slug: "simplyduty-alternatives",
    title: "Best SimplyDuty Alternatives for US Imports",
    intro:
      "SimplyDuty is a low-cost global duty API. US importers often look for something built around the US tariff stack instead.",
    reasons: [
      "Free use needs registration and is capped at 5 calculations a day",
      "You need Section 232, 301 and other US tariffs itemized",
      "You want history and auditing for past entries",
    ],
    faqs: [
      {
        question: "What's a SimplyDuty alternative for US import duty?",
        answer: "HTS Hero is built for US imports: every Chapter 99 tariff itemized, past entry dates and Duty Over Time, with a free plan.",
      },
    ],
  },
};

export const DESCARTES: Tool = {
  slug: "descartes-customsinfo",
  name: "Descartes CustomsInfo",
  vendor: "Descartes",
  url: "https://www.customsinfo.com",
  kind: "Enterprise classification and tariff research",
  summary:
    "Enterprise trade content for classification and tariff research: duty and tariff data for 152 countries and territories and 600,000 US and EU binding rulings, used by brokers, forwarders and large compliance teams.",
  bestFor: "Large compliance teams researching tariffs in many countries",
  price: "From about $750 per user",
  priceDetail: "Software directories list it from about US$750 per user. Descartes doesn't publish prices on its site.",
  features: {
    freeToTry: { support: "partial", note: "Free trial, per Capterra" },
    selfServe: { support: "unknown" },
    publishedPricing: { support: "no" },
    fullStack: { support: "unknown" },
    tradePreferences: { support: "unknown" },
    adjustments: { support: "unknown" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "partial", note: "Regulatory update notices" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "unknown" },
    classification: { support: "yes", note: "Classification research" },
    api: { support: "unknown" },
    changelog: { support: "unknown" },
  },
  strengths: ["Duty data for 152 countries and territories", "600,000 US and EU binding rulings", "Established with brokers and enterprises"],
  limitations: ["Enterprise pricing, from about $750 per user", "Built for many countries, more than most US importers need"],
  sources: [
    { title: "Descartes CustomsInfo product information (PDF)", url: "https://www.descartes.com/sites/default/files/documents/pi_descartes_customs_info.pdf" },
    { title: "Descartes CustomsInfo on Capterra", url: "https://www.capterra.co.za/software/220216/descartes-customsinfo" },
  ],
  checkedAt: "2026-10-06",
  alternatives: {
    slug: "descartes-customsinfo-alternatives",
    title: "Best Descartes CustomsInfo Alternatives",
    intro:
      "Descartes CustomsInfo is a deep enterprise research tool for trade content in many countries. Teams focused on US imports often want something faster to start and much cheaper per seat.",
    reasons: [
      "Pricing starts around $750 per user",
      "You only need US duty, done thoroughly",
      "You want to be up and running this week",
    ],
    faqs: [
      {
        question: "Is there a cheaper alternative to Descartes CustomsInfo for US imports?",
        answer:
          "Yes. HTS Hero covers US duty in depth on self-serve monthly plans with published prices, starting with a free plan.",
      },
    ],
  },
};

export const EASYSHIP: Tool = {
  slug: "easyship",
  name: "Easyship Duties & Taxes Calculator",
  vendor: "Easyship",
  url: "https://www.easyship.com/duties-and-taxes-calculator/usa",
  kind: "Free estimator from a shipping platform",
  summary:
    "A free duties and taxes estimator from the shipping platform Easyship. It estimates by product category rather than by HTS code.",
  bestFor: "Small parcel shippers who want a quick ballpark",
  price: "Free",
  priceDetail: "Free to use; signing up for the shipping platform shows more couriers.",
  features: {
    freeToTry: { support: "yes" },
    selfServe: { support: "yes" },
    publishedPricing: { support: "yes", note: "Free" },
    fullStack: { support: "no", note: "Estimates by product category" },
    tradePreferences: { support: "unknown" },
    adjustments: { support: "unknown" },
    entryDate: { support: "unknown" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "unknown" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "unknown" },
    classification: { support: "no", note: "Uses product categories" },
    api: { support: "unknown" },
    changelog: { support: "unknown" },
  },
  strengths: ["Free and quick", "Part of a shipping platform"],
  limitations: ["Estimates from product categories, so the HTS code isn't used", "No breakdown of Section 232 or 301 tariffs"],
  sources: [{ title: "Easyship duties and taxes calculator (USA)", url: "https://www.easyship.com/duties-and-taxes-calculator/usa" }],
  checkedAt: "2026-10-06",
  alternatives: {
    slug: "easyship-duty-calculator-alternatives",
    title: "Best Easyship Duty Calculator Alternatives",
    intro:
      "Easyship's estimator is quick, but it works from product categories. Once you know your HTS code, you can get the exact US duty instead of a category average.",
    reasons: [
      "It estimates by product category rather than HTS code",
      "It doesn't break out Section 232 or 301 tariffs",
      "You need a number you can price or file against",
    ],
    faqs: [
      {
        question: "Why doesn't my Easyship estimate match my customs bill?",
        answer:
          "Easyship estimates duty from a product category. The duty CBP charges depends on the exact HTS code, the country of origin and every Chapter 99 tariff in force on the entry date, which a category average can't capture.",
      },
    ],
  },
};

export const AIRLIFT_USA: Tool = {
  slug: "airlift-usa",
  name: "Airlift USA Tariff Simulator",
  vendor: "Airlift USA",
  url: "https://airliftusa.com/tariff-simulator",
  kind: "Free calculator from a forwarder and broker",
  summary:
    "A free tariff simulator from a freight forwarder and customs broker, with each tariff as a separate line and an entry-date input. Single lookups, no account.",
  bestFor: "Free single lookups by entry date",
  price: "Free",
  priceDetail: "Free, with no account and no usage limits.",
  features: {
    freeToTry: { support: "yes", note: "No account, no limits" },
    selfServe: { support: "yes" },
    publishedPricing: { support: "yes", note: "Free" },
    fullStack: { support: "yes", note: "Separate line items" },
    tradePreferences: { support: "unknown" },
    adjustments: { support: "unknown" },
    entryDate: { support: "yes" },
    rateHistory: { support: "unknown" },
    catalogImpact: { support: "unknown" },
    countryCompare: { support: "unknown" },
    csvUpload: { support: "unknown" },
    classification: { support: "unknown" },
    api: { support: "unknown" },
    changelog: { support: "unknown" },
  },
  strengths: ["Free with no account", "Entry-date input", "Itemized tariff lines"],
  limitations: ["One product at a time", "No catalog or history tools found"],
  sources: [{ title: "Airlift USA tariff simulator", url: "https://airliftusa.com/tariff-simulator" }],
  checkedAt: "2026-10-06",
};
