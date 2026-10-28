import { unstable_cache } from "next/cache";
import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import { Answers } from "../tariffs/engine-v2/types";
import { findRateElement } from "./hts-duty-summary";
import { getHtsElementByCode, getHtsElementParentsServer, getHtsElementsServer } from "./hts-server";

// One past entry audited by the engine, for /tariff-audit: the duty as it was commonly filed
// (Section 122 charged) against the duty owed (the Section 122 exemption for Section 232 articles
// claimed, since steel wire is all steel). Both sides are real engine output for the entry date.

const ENTRY = {
  code: "7217.10.90.00",
  product: "Steel wire",
  country: "CN",
  countryName: "China",
  entryDate: "2026-03-12",
  customsValue: 40000,
};
const OWED_ANSWERS: Answers = { steelContentPct: 100 };

export interface AuditLine {
  code: string;
  name: string;
  paid: number;
  owed: number;
}

export interface AuditExample {
  htsno: string;
  product: string;
  countryName: string;
  entryDate: string;
  customsValue: number;
  lines: AuditLine[];
  paidTotal: number;
  owedTotal: number;
}

const build = async (): Promise<AuditExample | null> => {
  const elements = await getHtsElementsServer();
  const element = getHtsElementByCode(ENTRY.code, elements);
  if (!element) return null;
  const rate = findRateElement(element, getHtsElementParentsServer(element, elements));
  const input = {
    htsCode: element.htsno,
    country: ENTRY.country,
    asOf: ENTRY.entryDate,
    customsValue: ENTRY.customsValue,
    quantity: 1000,
    baseRates: { general: rate.general, special: rate.special, other: rate.other },
    transportMode: "ocean" as const,
  };
  const paid = calculate(AllRules, input);
  const owed = calculate(AllRules, { ...input, answers: OWED_ANSWERS });

  // Every line charged on either side, in the paid calculation's order
  const amounts = (r: typeof paid) =>
    new Map([
      ["BASE", r.base.amount],
      ...r.lines.filter((l) => l.status === "applies" && l.amount > 0).map((l) => [l.code, l.amount] as [string, number]),
      ...r.fees.map((f) => [f.name, f.amount] as [string, number]),
    ]);
  const names = new Map([
    ["BASE", "Base rate"],
    ...paid.lines.map((l) => [l.code, l.name] as [string, string]),
    ...paid.fees.map((f) => [f.name, f.name] as [string, string]),
  ]);
  const paidAmounts = amounts(paid);
  const owedAmounts = amounts(owed);
  const codes = Array.from(new Set([...Array.from(paidAmounts.keys()), ...Array.from(owedAmounts.keys())]));

  return {
    htsno: element.htsno,
    product: ENTRY.product,
    countryName: ENTRY.countryName,
    entryDate: ENTRY.entryDate,
    customsValue: ENTRY.customsValue,
    lines: codes.map((code) => ({
      code: code === "BASE" ? element.htsno : names.get(code) === code ? "" : code,
      name: names.get(code) ?? code,
      paid: paidAmounts.get(code) ?? 0,
      owed: owedAmounts.get(code) ?? 0,
    })),
    paidTotal: paid.totalDuty + paid.totalFees,
    owedTotal: owed.totalDuty + owed.totalFees,
  };
};

// Cached for a day: the entry is in the past, so its result only changes with the tariff data
export const getAuditExample = unstable_cache(build, ["tariff-audit-example"], { revalidate: 86400 });

// The hero's scans: three new entries, each checked by the engine for its entry date, one per
// outcome. Overpaid: the steel wire above (Section 122 charged though Section 232 articles were
// exempt). Underpaid: upholstered wooden chairs from China filed without the Section 232 wood
// tariff. Correct: pendant lights from China, paid as owed. Paid and owed include fees.

export type ScanVerdict = "overpaid" | "underpaid" | "correct";

export interface AuditScan {
  verdict: ScanVerdict;
  // Why, in a few words
  reason: string;
  product: string;
  htsno: string;
  countryName: string;
  entryDate: string;
  customsValue: number;
  paid: number;
  owed: number;
}

const SCANS: {
  verdict: ScanVerdict;
  reason: string;
  code: string;
  product: string;
  country: string;
  countryName: string;
  entryDate: string;
  customsValue: number;
  // Answers that make the owed side right (the paid side left them out)
  owedAnswers?: Answers;
  // A tariff the paid side left off
  missed?: string;
}[] = [
  { verdict: "overpaid", reason: "Section 122 charged, but Section 232 steel is exempt", ...ENTRY, owedAnswers: OWED_ANSWERS },
  {
    verdict: "underpaid",
    reason: "Section 232 wood tariff left off",
    code: "9401.61.60.11",
    product: "Upholstered dining chairs",
    country: "CN",
    countryName: "China",
    entryDate: "2026-04-08",
    customsValue: 30000,
    missed: "9903.76.02",
  },
  {
    verdict: "correct",
    reason: "Matches the duty owed",
    code: "9405.42.84.40",
    product: "Pendant lights",
    country: "CN",
    countryName: "China",
    entryDate: "2026-04-08",
    customsValue: 20000,
  },
];

const buildScans = async (): Promise<AuditScan[]> => {
  const elements = await getHtsElementsServer();
  return SCANS.flatMap((s) => {
    const element = getHtsElementByCode(s.code, elements);
    if (!element) return [];
    const rate = findRateElement(element, getHtsElementParentsServer(element, elements));
    const input = {
      htsCode: element.htsno,
      country: s.country,
      asOf: s.entryDate,
      customsValue: s.customsValue,
      quantity: 1000,
      baseRates: { general: rate.general, special: rate.special, other: rate.other },
      transportMode: "ocean" as const,
    };
    const asFiled = calculate(AllRules, input);
    const owedResult = s.owedAnswers ? calculate(AllRules, { ...input, answers: s.owedAnswers }) : asFiled;
    const owed = owedResult.totalDuty + owedResult.totalFees;
    const missedAmount = s.missed ? (owedResult.lines.find((l) => l.code === s.missed && l.status === "applies")?.amount ?? 0) : 0;
    const paid = s.owedAnswers ? asFiled.totalDuty + asFiled.totalFees : owed - missedAmount;
    // Only show an example the engine still agrees with
    const verdict: ScanVerdict = Math.round(paid) > Math.round(owed) ? "overpaid" : Math.round(paid) < Math.round(owed) ? "underpaid" : "correct";
    if (verdict !== s.verdict) return [];
    return [{ verdict, reason: s.reason, product: s.product, htsno: element.htsno, countryName: s.countryName, entryDate: s.entryDate, customsValue: s.customsValue, paid, owed }];
  });
};

export const getAuditScans = unstable_cache(buildScans, ["tariff-audit-scans-v2"], { revalidate: 86400 });
