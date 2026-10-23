// The guide's fixed copy: the steps of the method, and what the calculator does and doesn't
// include.

import {
  FEES_NOTICE_URL,
  HMF_REGULATION_URL,
  HTS_GENERAL_NOTE_3_URL,
  MPF_REGULATION_URL,
  USITC_HTS_URL,
  htsChapterPdfUrl,
} from "@/libs/official-sources";

// How a duty is worked out, in order
export const STEPS = [
  {
    title: "Find the HTS code.",
    text: "Every import is classified under a 10-digit code in the Harmonized Tariff Schedule.",
  },
  {
    title: "Apply the base rate.",
    text: "Column 1 General for most countries, a Special rate when the goods qualify for a trade agreement such as USMCA, or Column 2 for Cuba, North Korea, Russia and Belarus.",
  },
  {
    title: "Add the Chapter 99 tariffs.",
    text: "Section 122, 232, 301, 338 and other additional duties stack on top, depending on the product, the country of origin and the entry date, unless an exemption applies.",
  },
  {
    title: "Add customs fees.",
    text: "The Merchandise Processing Fee on every formal entry, and the Harbor Maintenance Fee on ocean shipments.",
  },
];

// What the calculator is built from, each with the official sources it comes from
export const INCLUDED: { title: string; text: string; items?: string[]; sources: { label: string; url: string }[] }[] = [
  {
    title: "Base rates",
    text: "The General, Special and Column 2 rates in each line of the current Harmonized Tariff Schedule, published by the US International Trade Commission. The current rates are used for every entry date.",
    sources: [{ label: "USITC, Harmonized Tariff Schedule", url: USITC_HTS_URL }],
  },
  {
    title: "Trade preferences",
    text: "Free trade agreements and preference programs such as USMCA, from each line's Special rate, when you claim one.",
    sources: [{ label: "HTS General Note 3 (PDF)", url: HTS_GENERAL_NOTE_3_URL }],
  },
  {
    title: "Customs fees",
    text: "The Merchandise Processing Fee (0.3464%, within the minimum and maximum CBP sets each fiscal year) on formal entries, and the Harbor Maintenance Fee (0.125%) on ocean shipments.",
    sources: [
      { label: "19 CFR 24.23 (MPF)", url: MPF_REGULATION_URL },
      { label: "19 CFR 24.24 (HMF)", url: HMF_REGULATION_URL },
      ...(FEES_NOTICE_URL ? [{ label: "FY2027 fee amounts (Federal Register)", url: FEES_NOTICE_URL }] : []),
    ],
  },
  {
    title: "Chapter 99 tariffs",
    text: "Every additional duty and exemption in Chapter 99 and its notes, including which ones stack and which replace each other:",
    sources: [{ label: "HTS Chapter 99 and its notes (PDF)", url: htsChapterPdfUrl(99) }],
    items: [
      "Section 122 (Now Expired)",
      "Section 201 Safeguards",
      "Section 232: steel, aluminum and copper",
      "Section 232: autos, trucks and parts",
      "Section 232: wood, pharmaceuticals, semiconductors, drones",
      "Section 301: China, Brazil",
      "Section 301: Forced Labor",
      "Section 338: Canada",
      "Country trade deals and quotas",
    ],
  },
];

// What it leaves out, and why
export const EXCLUDED: { title: string; text: string }[] = [
  {
    title: "Antidumping and countervailing duties",
    text: "Set case by case by the Commerce Department for specific producers and exporters. HTS Hero checks each import for cases that may cover it separately, free with an account.",
  },
  {
    title: "Federal excise taxes",
    text: "Such as those on alcohol, tobacco and fuel, which CBP collects at entry.",
  },
  {
    title: "Other agency fees and assessments",
    text: "Including commodity research and promotion assessments, and the MPF on informal entries under $2,500.",
  },
  {
    title: "Import adjustment offsets",
    text: "Set per manufacturer for some auto and truck parts. The calculator charges the full rate and asks before applying it.",
  },
  {
    title: "Chapter 98 claims",
    text: "Special treatment such as American goods returned or articles repaired abroad.",
  },
  {
    title: "Freight, insurance, brokerage and state taxes",
    text: "Landed cost here is the customs value plus duty and fees.",
  },
];
