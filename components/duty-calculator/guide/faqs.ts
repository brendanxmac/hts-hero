import config from "@/config";
import { getVerifiedRevisions } from "@/tariffs/engine-v2/revisions";

// The duty calculator's questions, in sections for /duty-calculator/faq. The calculator page
// shows a shortlist (dutyCalculatorFaqs). Both pages put the same text in their FAQPage JSON-LD.

export type Faq = { question: string; answer: string };
export type FaqSection = { id: string; title: string; description: string; faqs: Faq[] };

// Facts several answers repeat, kept in one place
const MPF = "0.3464% of the customs value, with a minimum of $34.58 and a maximum of $670.86 for fiscal year 2027 (from October 1, 2026)";
// The first verified revision: "February 25, 2026" and "Revision 4"
const firstVerified = getVerifiedRevisions()[0];
export const historyStartDate = new Date(`${firstVerified.from}T00:00:00`).toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
export const historyStartRevision = firstVerified.title.replace(/ \(\d{4}\)$/, "");
const HISTORY_FROM = `${historyStartDate} (${firstVerified.from.slice(0, 4)} HTS ${historyStartRevision})`;

export const dutyCalculatorFaqSections = (revisionTitle: string): FaqSection[] => [
  {
    id: "using-the-calculator",
    title: "Using the calculator",
    description: "What the calculator does and how to get an accurate estimate.",
    faqs: [
      {
        question: "What is import duty?",
        answer:
          "Import duty, also called customs duty or a tariff, is a tax on goods brought into the United States. The importer of record pays it to US Customs and Border Protection (CBP) when the goods are entered. How much depends on the product's HTS code, its country of origin, its customs value (or quantity, for per-unit rates) and the entry date. Shipping, insurance and brokerage charges are separate.",
      },
      {
        question: "How much is duty on US imports?",
        answer:
          "There's no single rate. Each product has a base rate in the Harmonized Tariff Schedule, often under 5%, and in 2026 most imports also owe one or more additional Chapter 99 tariffs, such as Section 232 on metals or Section 301 on goods from China. As an example, a $10,000 steel article from China (HTS 7326.90.86.88) entered on October 6, 2026 owes $7,790 in duty: 2.9% base, 50% under Section 232 and 25% under Section 301.",
      },
      {
        question: "How do I calculate US import duty?",
        answer:
          "Enter the HTS code, the country of origin, the customs value and the entry date. The calculator applies the base rate for that country, adds every Chapter 99 tariff in force on that date after exemptions and stacking rules, and adds the Merchandise Processing Fee and, for ocean shipments, the Harbor Maintenance Fee. Each line shows its rate, amount and the Chapter 99 heading behind it.",
      },
      {
        question: "Do I need a full 10-digit HTS code?",
        answer:
          "For an exact result, yes. Many additional tariffs apply to specific 8- or 10-digit codes, so two codes that share their first six digits can owe very different amounts. If you only know part of the code, the code field's search helps you find the full one, and HTS Hero's HTS Explorer lets you browse the whole schedule.",
      },
      {
        question: "How do I find the right HTS code for my product?",
        answer:
          "Search by product description or code in the calculator, or browse the schedule in the HTS Explorer. Classification follows the General Rules of Interpretation and the legal notes, and the wrong code is the most common reason a duty estimate is wrong. HTS Hero Classify walks you through a classification step by step and backs it with notes and CBP rulings.",
      },
      {
        question: "Which countries are supported?",
        answer:
          "Every country of origin, including the Column 2 countries (Cuba, North Korea, Russia and Belarus), which pay the higher Column 2 base rates. The calculator applies each country's programs, deals and exemptions automatically.",
      },
      {
        question: "How do I compare duty from different countries?",
        answer:
          "Use Compare to see the same product from up to three countries of origin side by side, with each country's duty, fees and total. It's the fastest way to check whether moving a supplier would lower your landed cost.",
      },
      {
        question: "Is this US tariff calculator free?",
        answer:
          "Yes. The HTS Hero duty and tariff calculator is free to use with no sign-up. You get the full line-by-line breakdown: the base rate, every Chapter 99 tariff and exemption, trade preferences and customs fees.",
      },
      {
        question: "Can I save or share a calculation?",
        answer:
          "Yes. Copy puts a text summary of the estimate on your clipboard, and Share copies a link that reopens the same calculation, with the same code, country, value, date and answers.",
      },
    ],
  },
  {
    id: "tariffs-and-programs",
    title: "Tariffs and trade programs",
    description: "The programs behind the numbers, and how they combine.",
    faqs: [
      {
        question: "What are Section 232 tariffs?",
        answer:
          "Section 232 of the Trade Expansion Act of 1962 lets the President adjust imports that threaten national security. In 2026 it covers steel, aluminum and copper (up to 50%), autos and auto parts (25%), medium and heavy-duty vehicles, semiconductors, wood products, patented pharmaceuticals (up to 100%) and drones. Several countries have all-in rates under their deals, such as 15% including the base rate for the EU, Japan and South Korea on many of these products.",
      },
      {
        question: "What are Section 301 tariffs?",
        answer:
          "Section 301 of the Trade Act of 1974 lets USTR respond to unfair trade practices. The longest-running Section 301 tariffs are on goods from China, from 7.5% to 100% depending on the product list. Since July 2026 there are also Section 301 tariffs on goods from Brazil (25%) and the forced-labor duties on goods from about 55 countries (10% or 12.5%). The calculator applies the lists, rates and exclusions in force on your entry date.",
      },
      {
        question: "What are the Section 301 forced-labor tariffs?",
        answer:
          "From July 24, 2026, goods from 38 countries, including China and Vietnam, pay an extra 12.5%, and goods from 17 countries, including Canada, Mexico and India, pay 10%. The EU and Taiwan pay 10% including the base rate, and Japan, South Korea and Switzerland 12.5% including the base rate. The duty doesn't apply to goods that pay a Section 232 tariff, and Canadian and Mexican goods claimed under USMCA are exempt.",
      },
      {
        question: "Are the reciprocal (IEEPA) tariffs still in effect?",
        answer:
          "No. The reciprocal and fentanyl tariffs were imposed under the International Emergency Economic Powers Act. The Supreme Court ruled on February 20, 2026 that IEEPA doesn't authorize tariffs, and they stopped from February 24, 2026. A 10% Section 122 surcharge replaced them until the close of July 23, 2026, and the Section 301 forced-labor duties started the next day.",
      },
      {
        question: "What is the Section 338 tariff on Canada?",
        answer:
          "Since August 22, 2026, listed Canadian products such as alcoholic beverages, dairy, wood, paper and, since September 15, furniture, lamps and metal structures pay an extra 50% under Section 338, even when claimed under USMCA. From September 29, 2026, some of them are banned from import entirely: certain alcoholic beverages, whey and molasses, non-alcoholic beer and motorcycles over 800 cc. The calculator flags banned products.",
      },
      {
        question: "How do the tariffs stack?",
        answer:
          "By default, every Chapter 99 tariff that covers a product adds to the base rate. The exceptions come from the HTS notes: Section 301 China stacks on everything, the Section 301 forced-labor and Brazil tariffs switch off when a Section 232 tariff applies, and within Section 232 the programs exclude each other (autos win over metals, for example). The calculator applies these rules and lists every heading it checked but didn't apply, with the reason.",
      },
      {
        question: "Does the calculator include trade agreements like USMCA?",
        answer:
          "Yes. When the HTS line has a special rate for the country of origin, the calculator lists each available program, such as USMCA, CAFTA-DR or KORUS, under Possible Adjustments. Claim one to see the preferential rate and any tariffs it removes. The goods must meet the agreement's rules of origin; shipping from a partner country isn't enough. GSP expired after December 31, 2020 and isn't available.",
      },
      {
        question: "What are the questions under Possible Adjustments?",
        answer:
          "They're the facts that can change your duty: whether the goods contain steel, aluminum or copper, whether a drug is generic, whether the goods are a donation, whether Canadian alcohol is shipped in bulk, and more. Each one shows how much it would change the total. Answer the ones that apply to your goods and the estimate updates, with the exemption heading shown on its line.",
      },
    ],
  },
  {
    id: "by-country",
    title: "Duty by country",
    description: "Common questions about the biggest sources of US imports.",
    faqs: [
      {
        question: "What are the import duties from China to the US in 2026?",
        answer:
          "Goods from China pay the base rate plus their Section 301 list rate (25% for Lists 1 to 3, 7.5% for List 4A, and up to 100% for products such as EVs, semiconductors and medical gloves), plus the 12.5% forced-labor duty unless a Section 232 tariff applies. Section 232 tariffs on metals, autos and other products add on top of Section 301. Enter your HTS code with China as the origin to see the exact stack.",
      },
      {
        question: "What are the import fees from Canada to the US?",
        answer:
          "It depends on the product and on USMCA. Goods that qualify for USMCA and are claimed under it usually pay no base duty and no forced-labor duty; otherwise the 10% forced-labor duty applies. Section 232 tariffs apply to Canadian steel, aluminum, autos and other covered products, and listed products pay the 50% Section 338 tariff, with some banned from September 29, 2026. Customs fees apply on top.",
      },
      {
        question: "What are the import duties from Mexico to the US?",
        answer:
          "Goods from Mexico that qualify for USMCA and are claimed under it usually pay no base duty and no forced-labor duty. Without a USMCA claim, they pay the base rate plus the 10% forced-labor duty. Section 232 tariffs apply to covered products such as steel, aluminum and autos, with lower rates for some USMCA-qualifying steel, aluminum and vehicles.",
      },
    ],
  },
  {
    id: "fees-and-limits",
    title: "Fees and what's included",
    description: "What the total covers, and what you'll need to add yourself.",
    faqs: [
      {
        question: "What fees does the calculator include?",
        answer: `The Merchandise Processing Fee (MPF), ${MPF}, and the Harbor Maintenance Fee (HMF), 0.125% of the customs value, on ocean shipments only. Fees are shown separately from duty.`,
      },
      {
        question: "Does the calculator include antidumping and countervailing duties?",
        answer:
          "No. Antidumping and countervailing duties (AD/CVD) are set case by case by the Commerce Department for specific producers and exporters, so they aren't included. If your product is covered by an AD/CVD order, check the order's rates with CBP or your customs broker and add them to the estimate.",
      },
      {
        question: "What doesn't the calculator include?",
        answer:
          "Antidumping and countervailing duties, federal excise taxes (such as on alcohol and tobacco), other agency fees and assessments, the flat MPF on informal entries under $2,500, Chapter 98 claims such as American goods returned, and freight, insurance, brokerage and state taxes. For some auto and truck parts it charges the full rate before any manufacturer's import adjustment offset.",
      },
      {
        question: "Why does the calculator ask for a quantity?",
        answer:
          "Some base rates are per unit, such as cents per kilogram or dollars per item, sometimes combined with a percentage. The calculator needs the quantity in the right unit to work those out.",
      },
      {
        question: "Do imports under $800 still enter duty-free?",
        answer:
          "No. The $800 de minimis exemption has been suspended for every country since August 29, 2025. A new executive order kept the suspension in place after the IEEPA ruling, CBP made it indefinite by rule in June 2026, and the Court of International Trade upheld it in August 2026. Low-value shipments pay duty like any other entry.",
      },
    ],
  },
  {
    id: "data-and-history",
    title: "Data, updates and history",
    description: "Where the rates come from, how current they are, and how far back they go.",
    faqs: [
      {
        question: "Where do the tariff rates come from?",
        answer:
          "Official sources only. Base rates come from the Harmonized Tariff Schedule published by the US International Trade Commission. Chapter 99 tariffs come from the HTS and its notes, as implemented from presidential proclamations, USTR and Commerce notices in the Federal Register, and CBP's CSMS guidance. Every line links to the heading and legal notes behind it.",
      },
      {
        question: "How current are the tariff rates?",
        answer: `The calculator is updated with every revision of the Harmonized Tariff Schedule, and each revision's Chapter 99 changes are entered with their legal effective dates. Tariff data is currently verified through ${revisionTitle}.`,
      },
      {
        question: "How do I see what changed?",
        answer:
          "The calculator's changelog lists every update to its tariff data, with the date and the HTS revision. HTS Hero's blog also has a breakdown of each 2026 HTS revision and a table of every 2026 tariff change.",
      },
      {
        question: "Can I calculate duty for a past entry date?",
        answer: `Yes. Set the entry date and the calculator applies the Chapter 99 tariffs in force that day, which is what you need to check what you should have paid. Verified tariff data starts on ${HISTORY_FROM}; for earlier dates the calculator warns you that changes may be missing. Base rates come from the current HTS for every date.`,
      },
      {
        question: "Can I see how a product's duty changed over time?",
        answer:
          "Yes. Duty Over Time charts the duty on your product across every HTS revision, with each change and the heading that caused it, so you can see when a tariff started, ended or changed rate.",
      },
    ],
  },
  {
    id: "plans-and-integrations",
    title: "Tracking, integrations and plans",
    description: "Beyond one calculation at a time.",
    faqs: [
      {
        question: "Can I get tariff results through an API or MCP?",
        answer: `Yes. HTS Hero delivers the same line-by-line tariff results by API and through an MCP server, so you can use them in your ERP, TMS, internal tools or AI assistants. We set integrations up with you: book a call at ${config.bookCallUrl}.`,
      },
      {
        question: "Can I track tariff changes across my product catalog?",
        answer:
          "Yes, with Tariff Tracker. Load your HTS codes and countries of origin, by paste or CSV, and see the current duty on every product, which products a tariff change hits and by how much, with alerts when a new revision affects you.",
      },
      {
        question: "How much does HTS Hero cost?",
        answer:
          "The duty calculator is free. Paid plans, including Tariff Tracker for product catalogs and Classify for HTS classification, are monthly with published prices and no contract, and annual billing takes 10% off. See the pricing page for current prices.",
      },
      {
        question: "Is this legal or customs advice?",
        answer:
          "No. The calculator is an estimate to help importers plan and check their own entries. It isn't legal, tax or customs advice, and HTS Hero isn't acting as your customs broker. For a binding answer on classification, ask CBP for a ruling; for your entries, work with a licensed customs broker.",
      },
    ],
  },
];

// The shortlist on the calculator page
const PAGE_QUESTIONS = [
  "How do I calculate US import duty?",
  "Is this US tariff calculator free?",
  "How current are the tariff rates?",
  "What are Section 232 tariffs?",
  "What are Section 301 tariffs?",
  "Does the calculator include trade agreements like USMCA?",
  "Can I calculate duty for a past entry date?",
  "Does the calculator include antidumping and countervailing duties?",
];

export const dutyCalculatorFaqs = (revisionTitle: string): Faq[] => {
  const all = dutyCalculatorFaqSections(revisionTitle).flatMap((s) => s.faqs);
  return PAGE_QUESTIONS.map((q) => all.find((f) => f.question === q)).filter((f): f is Faq => !!f);
};
