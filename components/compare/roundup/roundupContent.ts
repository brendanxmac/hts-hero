import type { Faq } from "@/libs/blog/types";
import { HtsRevisions } from "@/tariffs/engine-v2/revisions";

// Revisions of this year's schedule so far, so the copy stays true as new ones are synced
const thisYear = new Date().getUTCFullYear();
const revisionsThisYear = HtsRevisions.filter((r) => r.name.startsWith(`${thisYear}HTSRev`)).length;

// The roundup's fixed copy. Quick picks name tools by slug so they follow the tool records.

export const ROUNDUP_LEAD =
  "We compared HTS Hero with the best-known duty and tariff tools, from Flexport and enterprise platforms like Avalara, Zonos and Descartes to free single-lookup calculators. Here's what each one does well, where it falls short, and which to pick for your situation.";

export const QUICK_PICKS: { label: string; slug: string }[] = [
  { label: "Best overall for US importers", slug: "hts-hero" },
  { label: "Best for Flexport freight customers", slug: "flexport" },
  { label: "Best for duty and tax at an online checkout", slug: "avalara" },
  { label: "Best for guaranteed landed cost at checkout", slug: "zonos" },
  { label: "Best for multi-country trade research", slug: "descartes-customsinfo" },
  { label: "Best free single lookups by entry date", slug: "airlift-usa" },
];

export const CRITERIA = [
  {
    title: "Is the total complete?",
    body: "The duty CBP charges is the HTS base rate plus every Chapter 99 tariff that applies, minus exemptions, plus fees. A calculator that leaves out the base rate or lumps tariffs together gives you a number you can't check.",
  },
  {
    title: "Is it current, and can you tell?",
    body: `The Harmonized Tariff Schedule has been revised ${revisionsThisYear} times so far in ${thisYear}. We looked for tools that say which revision their data reflects and keep a record of updates.`,
  },
  {
    title: "Can it look backward?",
    body: "Auditing an entry, or checking a refund, means knowing the duty that applied on the day the goods entered.",
  },
  {
    title: "Does it scale to a catalog?",
    body: "Importers have dozens or thousands of products. We looked at bulk upload, country comparison and seeing which products a change affects.",
  },
  {
    title: "Can you just start?",
    body: "Published prices and self-serve plans, versus demos, sales calls or becoming a freight customer first.",
  },
];

export const ROUNDUP_FAQS: Faq[] = [
  {
    question: "What is the best US tariff calculator?",
    answer:
      "For US importers who need an exact, auditable number, we rank HTS Hero first: it itemizes every Chapter 99 tariff with its legal source, lets you claim trade agreements and exemptions, audits past entries by date, shows duty over time, alerts you when a tariff change hits your products, and delivers results by API and MCP, on self-serve plans with published prices. We make HTS Hero, so we've linked the sources for every other tool on this page.",
  },
  {
    question: "Is there a free US tariff calculator?",
    answer:
      "Yes, several. HTS Hero is free to start with no sign-up and shows the full line-by-line breakdown, and GingerControl, Flexport, Gateway Lines, Airlift USA and AMZ Prep all offer free calculators with different limits and levels of detail.",
  },
  {
    question: "Does the US government have an official tariff calculator?",
    answer:
      "The US International Trade Commission publishes the Harmonized Tariff Schedule at hts.usitc.gov, which lists every rate and the Chapter 99 notes. It doesn't add up the total duty for you, which is why importers use calculators that stack the base rate and each additional tariff.",
  },
  {
    question: "Why do tariff calculators give different answers?",
    answer:
      "Usually for one of four reasons: some leave out the base (MFN) rate, some run on an older HTS revision, some skip exemptions or partial-value rules such as metal content under Section 232, and some estimate from a product category instead of the HTS code.",
  },
  {
    question: "Can a tariff calculator tell me what I owed on a past entry?",
    answer:
      "Only if it calculates by entry date. HTS Hero uses the HTS revision in force on the date you pick and shows how the duty changed over time. Flexport's simulator keeps rates back to January 1, 2025, and Airlift USA's free simulator also accepts an entry date for single lookups.",
  },
];
