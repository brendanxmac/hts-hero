import type { HtsElement } from "@/interfaces/hts";
import { dutyAnswerSentence, HtsDutySummary, inSentence, lowestTotal } from "@/libs/hts-duty-summary";
import type { FaqEntry, SectionChapter } from "./types";
import { formatImportValue, UsImports } from "@/components/duty-calculator/lib/usImportsData";
import { Countries } from "@/constants/countries";
import type { CodeCase } from "@/libs/adcvd/public";
import { CodeDutyHistory, dutyHistorySentence, latestChangeSentence } from "@/libs/hts-duty-history";

// "China, India and Vietnam"; past four, "China, India, Vietnam, Mexico and 3 other countries"
const countryNames = (codes: string[]) => {
  const names = codes.slice(0, 4).map((c) => Countries.find((x) => x.code === c)?.name ?? c);
  const more = codes.length - names.length;
  if (more) return `${names.join(", ")} and ${more} other ${more === 1 ? "country" : "countries"}`;
  return names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
};

// Commerce names cases in Title Case ("Certain Steel Nails"): lower-cased for a sentence, acronyms
// ("PET Film") kept
const caseProduct = (product: string) => product.replace(/\b[A-Z][a-z]+\b/g, (w) => w.toLowerCase());

// The page's questions, shown in the FAQ and in its FAQPage schema (which must match what's visible)
export function htsFaqs({
  element,
  productName,
  summary,
  tariffElement,
  children,
  sectionChapter,
  imports,
  importNames = {},
  adcvdCases = [],
  dutyHistory = null,
}: {
  element: HtsElement;
  productName: string;
  summary: HtsDutySummary | null;
  tariffElement: HtsElement;
  children: HtsElement[];
  sectionChapter: SectionChapter;
  // Where the US imports it from (Census), and the countries' names
  imports?: UsImports | null;
  importNames?: Record<string, string>;
  // Live AD/CVD cases whose scope lists the code (or a heading above it)
  adcvdCases?: CodeCase[];
  // How the duty has changed (the Duty History section, on the SEO test's chapters)
  dutyHistory?: CodeDutyHistory | null;
}): FaqEntry[] {
  const historyRow = dutyHistory?.rows.find((r) => r.country.code === "CN");
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
    // Whether that duty has changed: the Duty History section's lead, and its latest change
    ...(dutyHistory && historyRow
      ? [[
        `Has the US duty on HTS ${element.htsno} from China changed?`,
        [dutyHistorySentence(element.htsno, dutyHistory, historyRow), latestChangeSentence(historyRow)].filter(Boolean).join(" "),
      ] as FaqEntry]
      : []),
    // The other origins people ask about most, after China
    ...(summary
      ? ["VN", "MX"].flatMap((code): FaqEntry[] => {
        const row = summary.rows.find((r) => r.country.code === code);
        return row
          ? [[
            `What is the US tariff on ${inSentence(productName)} (HTS ${element.htsno}) from ${row.country.name}?`,
            dutyAnswerSentence({ productName, htsno: element.htsno, row, asOf: summary.asOf }) +
            (row.preference && row.preference.totalPct !== null
              ? ` Goods that qualify for ${row.preference.name} pay ${row.preference.totalPct}%.`
              : ""),
          ]]
          : [];
      })
      : []),
    ...(imports && imports.level === 10 && imports.totalValue > 0
      ? [[
        `Where does the US import HTS ${element.htsno} from?`,
        (() => {
          const top = Array.from(imports.byCountry.entries())
            .sort((a, b) => b[1].value - a[1].value)
            .slice(0, 3)
            .map(([iso, v]) => `${importNames[iso] ?? iso} (${Math.round((v.value / imports.totalValue) * 100)}%)`);
          return `In ${imports.year} the US imported ${formatImportValue(imports.totalValue)} of ${inSentence(productName)} under HTS ${element.htsno}, mostly from ${top.slice(0, -1).join(", ")}${top.length > 1 ? " and " : ""}${top[top.length - 1]}, according to U.S. Census Bureau import data.`;
        })(),
      ] as FaqEntry]
      : []),
    ...(summary && lowest
      ? [[
        `Which country has the lowest US duty on HTS ${element.htsno}?`,
        `Of the ${summary.rows.length} largest sources of US imports, the lowest total duty on HTS ${element.htsno} is ${lowest.label}, as of the tariffs in effect on ${summary.asOf}.`,
      ] as FaqEntry]
      : []),
    // Only when a live case lists the code: a code missing from every scope isn't proof none applies
    ...(adcvdCases.length > 0
      ? [[
        `Do antidumping or countervailing duties apply to HTS ${element.htsno}?`,
        `They may. Antidumping or countervailing duty (AD/CVD) cases whose scope lists HTS ${element.htsno} or a related code cover ` +
        adcvdCases
          .slice(0, 3)
          .map((c) => caseProduct(c.product) + (c.countries.length ? ` from ${countryNames(c.countries)}` : ""))
          .join("; ") +
        (adcvdCases.length > 3 ? `; and ${adcvdCases.length - 3} more` : "") +
        ". A case applies only to goods from the countries it names that fit the scope's written description, and its duty is on top of the regular duty. With a free HTS Hero account, the duty calculator checks the cases and new petitions that may cover your import and shows the deposit rates Commerce set and the companies named.",
      ] as FaqEntry]
      : []),
  ];
}
