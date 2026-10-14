import { SOURCES, SOURCE_IDS, type SourceId } from "@/libs/tariff-sources/types"

// The copy /tariff-updates shares between the page, its structured data and llms.txt

export const UPDATES_DEFINITION =
  "Every new US tariff action, as it happens: presidential proclamations and executive orders, Federal Register notices, CBP guidance, USTR actions and HTS revisions, each followed from announcement into the Harmonized Tariff Schedule, with a plain-English summary and links to the official sources."

export const SOURCE_NOTES: Record<SourceId, string> = {
  white_house: "Proclamations, executive orders and memoranda, usually the day they're signed.",
  federal_register_pi: "Documents filed for public inspection, often days before they're published.",
  federal_register: "The legal record: presidential documents and notices from USTR, CBP, Commerce and the ITC.",
  csms: "CBP's Cargo Systems Messaging Service: how to file and which Chapter 99 numbers to report.",
  ustr: "Section 301 actions, trade deals and exclusions.",
  usitc: "Each new revision of the Harmonized Tariff Schedule.",
}

export const SOURCE_LIST = SOURCE_IDS.map((id) => ({ id, label: SOURCES[id].label, href: SOURCES[id].home, note: SOURCE_NOTES[id] }))

export const UPDATES_FAQS = [
  {
    question: "Where do these tariff updates come from?",
    answer:
      "Only official US government sources: White House presidential actions, the Federal Register (including documents filed for public inspection before they're published), CBP's CSMS messages, USTR press releases and USITC's HTS revisions. Every update links to the documents it's based on.",
  },
  {
    question: "How often is this page updated?",
    answer:
      "Every source is checked every 15 minutes. A new tariff action appears once it has been read and summarized, and its update moves forward as later documents (the Federal Register notice, CBP guidance, the HTS revision) come out.",
  },
  {
    question: "What do the stages mean?",
    answer:
      "A tariff action usually moves through several steps: announced, signed by the President, filed early at the Federal Register, published in the Federal Register, implemented by CBP guidance, and finally written into the Harmonized Tariff Schedule. Each update shows the latest step it has reached and the document for each step.",
  },
  {
    question: "How do I know if a tariff update affects my imports?",
    answer:
      "Look up your HTS code and country of origin in the free US Tariff Calculator, which shows every duty that applies, line by line. Its tariff data is updated as each HTS revision is verified, with every change logged in its public changelog.",
  },
]
