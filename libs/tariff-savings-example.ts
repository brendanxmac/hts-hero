import { unstable_cache } from "next/cache";
import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import { CalculationInput } from "../tariffs/engine-v2/types";
import { findRateElement } from "./hts-duty-summary";
import { getHtsElementByCode, getHtsElementParentsServer, getHtsElementsServer } from "./hts-server";

type HtsElementsServer = Awaited<ReturnType<typeof getHtsElementsServer>>;

// Three savings finds for the homepage, most common first: an exemption that wasn't claimed, a
// trade program that wasn't claimed, then a cheaper country of origin. Each has at most three
// options, so the homepage card reads at a glance. Every figure is engine
// output for today on $100,000 of imports a year.

const YEARLY_VALUE = 100000;

export type SavingsKind = "exemption" | "program" | "origin";

export interface SavingsOption {
  label: string;
  current: boolean;
  duty: number; // a year, on YEARLY_VALUE
  ratePct: number;
  detail?: string; // one short line under the label
}

export interface SavingsExample {
  kind: SavingsKind;
  htsno: string;
  product: string;
  countryName: string;
  yearlyValue: number;
  asOf: string;
  options: SavingsOption[]; // the current duty first
  action: string; // what to do to get the saving, e.g. "Claim USMCA"
}

const PREFERENCE_SHORT: Record<string, string> = { S: "USMCA", "S+": "USMCA" };

const option = (label: string, duty: number, current: boolean, detail?: string): SavingsOption => ({
  label,
  current,
  duty,
  ratePct: (duty / YEARLY_VALUE) * 100,
  detail,
});

const inputFor = (elements: HtsElementsServer, code: string, country: string, asOf: string): CalculationInput | null => {
  const element = getHtsElementByCode(code, elements);
  if (!element) return null;
  const rate = findRateElement(element, getHtsElementParentsServer(element, elements));
  return {
    htsCode: element.htsno,
    country,
    asOf,
    customsValue: YEARLY_VALUE,
    quantity: 1000,
    baseRates: { general: rate.general, special: rate.special, other: rate.other },
    transportMode: "ocean",
  };
};

// A Chapter 99 exemption the importer qualifies for but didn't claim
const exemption = (elements: HtsElementsServer, asOf: string): SavingsExample | null => {
  const heading = "9903.05.89";
  const input = inputFor(elements, "3402.42.90.00", "KR", asOf);
  if (!input) return null;
  const filed = calculate(AllRules, input);
  const claimed = calculate(AllRules, { ...input, answers: { [`confirm:${heading}`]: true } });
  const line = claimed.lines.find((l) => l.code === heading && l.status === "applies");
  if (!line || claimed.totalDuty >= filed.totalDuty) return null;
  return {
    kind: "exemption",
    htsno: input.htsCode,
    product: "Non-ionic surfactant",
    countryName: "South Korea",
    yearlyValue: YEARLY_VALUE,
    asOf,
    options: [
      option("Today", filed.totalDuty, true, "Exemption not claimed"),
      option(`Claim ${heading}`, claimed.totalDuty, false, "For pharmaceutical use"),
    ],
    action: `Claim ${heading}`,
  };
};

// A trade program the goods qualify for, left unclaimed
const program = (elements: HtsElementsServer, asOf: string): SavingsExample | null => {
  const input = inputFor(elements, "6911.10.80.10", "CA", asOf);
  if (!input) return null;
  const filed = calculate(AllRules, input);
  const pref = filed.availablePreferences.find((p) => p.symbol === "S");
  if (!pref) return null;
  const claimed = calculate(AllRules, { ...input, claimedPreference: pref.symbol });
  if (claimed.totalDuty >= filed.totalDuty) return null;
  const name = PREFERENCE_SHORT[pref.symbol] ?? pref.name;
  return {
    kind: "program",
    htsno: input.htsCode,
    product: "Porcelain dinnerware",
    countryName: "Canada",
    yearlyValue: YEARLY_VALUE,
    asOf,
    options: [
      option("Today", filed.totalDuty, true, `${name} not claimed`),
      option(`Claim ${name}`, claimed.totalDuty, false, "Made in Canada, so it qualifies"),
    ],
    action: `Claim ${name}`,
  };
};

// The same product from other countries of origin
const ORIGINS: { code: string; name: string }[] = [
  { code: "CN", name: "China" },
  { code: "VN", name: "Vietnam" },
  { code: "MX", name: "Mexico" },
];

const origin = (elements: HtsElementsServer, asOf: string): SavingsExample | null => {
  const options: SavingsOption[] = [];
  let htsno = "";
  for (const { code, name } of ORIGINS) {
    const input = inputFor(elements, "6109.10.00.12", code, asOf);
    if (!input) return null;
    htsno = input.htsCode;
    let best = { duty: calculate(AllRules, input).totalDuty, tag: undefined as string | undefined };
    for (const p of calculate(AllRules, input).availablePreferences) {
      const duty = calculate(AllRules, { ...input, claimedPreference: p.symbol }).totalDuty;
      if (duty < best.duty) best = { duty, tag: PREFERENCE_SHORT[p.symbol] ?? p.name };
    }
    const detail = code === "CN" ? "Where you buy today" : best.tag ? `With ${best.tag}, if it qualifies` : undefined;
    options.push(option(name, best.duty, code === "CN", detail));
  }
  const [current, ...others] = options;
  const best = options.reduce((a, b) => (b.duty < a.duty ? b : a));
  return {
    kind: "origin",
    htsno,
    product: "Men's cotton T-shirts",
    countryName: "China",
    yearlyValue: YEARLY_VALUE,
    asOf,
    options: [current, ...others.sort((a, b) => b.duty - a.duty)],
    action: `Source from ${best.label}`,
  };
};

const build = async (): Promise<SavingsExample[]> => {
  const elements = await getHtsElementsServer();
  const asOf = new Date().toISOString().slice(0, 10);
  return [exemption(elements, asOf), program(elements, asOf), origin(elements, asOf)].filter((e): e is SavingsExample => e !== null);
};

// Cached for a day, like the other homepage examples
export const getSavingsExamples = unstable_cache(build, ["tariff-savings-examples-v4"], { revalidate: 86400 });
