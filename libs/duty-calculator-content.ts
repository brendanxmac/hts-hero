import { unstable_cache } from "next/cache";
import { Country } from "../constants/countries";
import { POPULAR_HTS_CODES } from "../constants/popular-hts-codes";
import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import { getLatestVerifiedRevision } from "../tariffs/engine-v2/revisions";
import {
  describeTotal,
  findRateElement,
  formatDutyPct,
  getHtsDutySummary,
  htsProductName,
  inSentence,
} from "./hts-duty-summary";
import {
  getHtsElementByCode,
  getHtsElementParentsServer,
  getHtsElementsServer,
} from "./hts-server";

// Server-rendered content for /duty-calculator, from the same engine as the calculator: what
// common imports pay from the largest sources of US imports, and one entry worked through
// line by line. Cached for a day; the page itself renders on every request.

// Columns of the rates table: everyday imports that tariffs hit differently
const MATRIX_CODES = [
  "6109.10.00", // cotton T-shirts
  "6404.11.90", // sneakers
  "9403.60.80", // wooden furniture
  "8507.60.00", // lithium-ion batteries
  "7318.15.20", // steel bolts
  "8471.30.01.00", // laptops
];

const EXAMPLE = { code: "6109.10.00", country: "CN", customsValue: 10000 };

export interface TariffMatrix {
  products: { code: string; label: string }[];
  rows: {
    country: Country;
    // One per product: the total, and the lower total from a trade preference when there is one
    cells: { total: string; preference?: string }[];
  }[];
}

export interface WorkedExample {
  htsno: string;
  productName: string;
  countryName: string;
  customsValue: number;
  baseRate: string;
  baseAmount: number;
  lines: { code: string; program: string; ratePct: number; amount: number }[];
  fees: { name: string; ratePct: number; amount: number }[];
  totalDuty: number;
  totalFees: number;
}

export interface DutyCalculatorContent {
  asOf: string;
  revisionTitle: string; // "2026 HTS Revision 20"
  matrix: TariffMatrix;
  example: WorkedExample | null;
}

const popularLabel = (code: string) =>
  POPULAR_HTS_CODES.flatMap((c) => c.codes).find((c) => c.code === code)?.label ?? code;

const programName = (id?: string) =>
  AllRules.programs.find((p) => p.id === id)?.name ?? "Additional duty";

const buildContent = async (asOf: string): Promise<DutyCalculatorContent> => {
  const elements = await getHtsElementsServer();
  const revision = getLatestVerifiedRevision();

  const summaries = MATRIX_CODES.flatMap((code) => {
    const element = getHtsElementByCode(code, elements);
    if (!element) return [];
    const parents = getHtsElementParentsServer(element, elements);
    const summary = getHtsDutySummary(element, findRateElement(element, parents));
    return summary ? [{ code, summary }] : [];
  });

  const countries = summaries[0]?.summary.rows.map((r) => r.country) ?? [];
  const matrix: TariffMatrix = {
    products: summaries.map(({ code }) => ({ code, label: popularLabel(code) })),
    rows: countries.map((country) => ({
      country,
      cells: summaries.map(({ summary }) => {
        const row = summary.rows.find((r) => r.country.code === country.code);
        if (!row) return { total: "—" };
        return {
          total: describeTotal(row),
          preference:
            row.preference && row.preference.totalPct !== null
              ? `${formatDutyPct(row.preference.totalPct)} ${row.preference.name}`
              : undefined,
        };
      }),
    })),
  };

  let example: WorkedExample | null = null;
  const element = getHtsElementByCode(EXAMPLE.code, elements);
  if (element) {
    const parents = getHtsElementParentsServer(element, elements);
    const rateElement = findRateElement(element, parents);
    const result = calculate(AllRules, {
      htsCode: element.htsno,
      country: EXAMPLE.country,
      asOf,
      customsValue: EXAMPLE.customsValue,
      quantity: 1000,
      baseRates: {
        general: rateElement.general,
        special: rateElement.special,
        other: rateElement.other,
      },
      transportMode: "ocean",
    });
    example = {
      htsno: element.htsno,
      productName: inSentence(htsProductName(element, parents)),
      countryName: summaries[0]?.summary.rows.find((r) => r.country.code === EXAMPLE.country)
        ?.country.name ?? EXAMPLE.country,
      customsValue: EXAMPLE.customsValue,
      baseRate: result.base.reasons[0] ?? "Free",
      baseAmount: result.base.amount,
      lines: result.lines
        .filter((l) => l.status === "applies" && l.amount > 0)
        .map((l) => ({
          code: l.code,
          program: programName(l.program),
          ratePct: l.ratePct ?? 0,
          amount: l.amount,
        })),
      fees: result.fees.map((f) => ({ name: f.name, ratePct: f.ratePct, amount: f.amount })),
      totalDuty: result.totalDuty,
      totalFees: result.totalFees,
    };
  }

  return {
    asOf,
    revisionTitle: revision.title.replace(/^Revision (\d+) \((\d{4})\)$/, "$2 HTS Revision $1"),
    matrix,
    example,
  };
};

const cachedContent = unstable_cache(buildContent, ["duty-calculator-content"], {
  revalidate: 86400,
});

// Local date as "YYYY-MM-DD"; part of the cache key, so the content follows the date
export const getDutyCalculatorContent = () =>
  cachedContent(new Date().toLocaleDateString("en-CA"));
