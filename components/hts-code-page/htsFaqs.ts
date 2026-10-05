import type { HtsElement } from "@/interfaces/hts";
import { dutyAnswerSentence, HtsDutySummary, inSentence, lowestTotal } from "@/libs/hts-duty-summary";
import type { FaqEntry, SectionChapter } from "./types";

// The page's questions, shown in the FAQ and in its FAQPage schema (which must match what's visible)
export function htsFaqs({
  element,
  productName,
  summary,
  tariffElement,
  children,
  sectionChapter,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  tariffElement: HtsElement;
  children: HtsElement[];
  sectionChapter: SectionChapter;
}): FaqEntry[] {
  const chapterCtx = sectionChapter
    ? `, classified under Chapter ${element.chapter} (${sectionChapter.chapterDescription})`
    : "";
  const dutyCtx = tariffElement.general ? ` The general duty rate is ${tariffElement.general}.` : "";
  const subCodesCtx = children.length > 0
    ? ` There are ${children.length} more specific sub-classifications under this code.`
    : "";

  const china = summary?.rows.find((r) => r.country.code === "CN");
  const lowest = summary ? lowestTotal(summary.rows) : null;
  // Chapter 99 lines carry sentences in the rate columns
  const general = tariffElement.general && tariffElement.general.length <= 40 && !element.htsno.startsWith("99")
    ? tariffElement.general
    : null;

  return [
    [
      `What does HTS code ${element.htsno} cover?`,
      `HTS code ${element.htsno} covers ${inSentence(productName)}${productName === element.description ? "" : ` (${element.description})`}${chapterCtx} in the US Harmonized Tariff Schedule.${dutyCtx}${subCodesCtx}`,
    ],
    ...(general
      ? [[
        `What is the duty rate for HTS ${element.htsno}?`,
        `The general (Column 1) rate of duty for HTS ${element.htsno} is ${general}.` +
        (tariffElement.special ? ` Goods that qualify for a trade program can enter at the special rate: ${tariffElement.special}.` : "") +
        (tariffElement.other ? ` The Column 2 rate, for countries without normal trade relations, is ${tariffElement.other}.` : "") +
        (summary ? " Additional Chapter 99 tariffs, such as Section 301 and Section 232, can apply on top depending on the country of origin." : ""),
      ] as FaqEntry]
      : []),
    ...(summary && china
      ? [[
        `What is the US tariff on ${inSentence(productName)} (HTS ${element.htsno}) from China?`,
        dutyAnswerSentence({ productName, htsno: element.htsno, row: china, asOf: summary.asOf }),
      ] as FaqEntry]
      : []),
    ...(summary && lowest
      ? [[
        `Which country has the lowest US duty on HTS ${element.htsno}?`,
        `Of the ${summary.rows.length} largest sources of US imports, the lowest total duty on HTS ${element.htsno} is ${lowest.label}, as of the tariffs in effect on ${summary.asOf}.`,
      ] as FaqEntry]
      : []),
  ];
}
