import { HtsElement } from "../../interfaces/hts";
import { getHtsElementParents } from "../../libs/hts";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { Authority, CalculationInput, CalculationResult } from "../../tariffs/engine-v2/types";
import { findTariffElement } from "../duty-calculator/estimate";
import { countOpenQuestions, questionImpacts } from "../duty-calculator/questions";
import { WatchEntry } from "./parse";

// One product on a watch list, worked out for the "rates as of" date

// Same label as the calculator's Cost Breakdown slice
export const BASE_PART = "Base duty";

export const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

export const programAuthority = (id?: string): Authority =>
  AllRules.programs.find((p) => p.id === id)?.authority ?? "other";

// Rates are shown as a percentage of the customs value. Rates with per-unit parts (e.g. 24¢
// each) depend on the shipment, so they're worked out for this value and quantity.
export const VALUE = 10000;
export const UNITS = 1000;

export interface RatePart {
  key: string; // BASE_PART or a program name
  pct: number;
}

export interface WatchRow {
  entry: WatchEntry<HtsElement>;
  result: CalculationResult;
  description: string;
  totalPct: number;
  parts: RatePart[];
  openQuestions: number;
  // The most one answer could lower the rate by, in percentage points (0 if none)
  bestSavingPct: number;
}

const plain = (text: string) => text.replace(/<[^>]+>/g, "").replace(/:\s*$/, "").trim();

// The nearest two levels that say what the product is; "Other" levels say nothing on their own
const describe = (element: HtsElement, htsElements: HtsElement[]) => {
  const levels = [...getHtsElementParents(element, htsElements), element]
    .map((el) => plain(el.description))
    .filter((text) => text && !/^other\b[\s.,]*$/i.test(text));
  return levels.slice(-2).join(" › ") || "Other";
};

// "Section 232 – Steel, Aluminum & Copper" → "Section 232"
export const shortProgram = (name: string) => name.split(" – ")[0];

export const watchProduct = (entry: WatchEntry<HtsElement>, htsElements: HtsElement[], asOf: string): WatchRow => {
  const tariffElement = findTariffElement(entry.element, htsElements);
  const input: CalculationInput = {
    htsCode: entry.element.htsno,
    country: entry.country.code,
    asOf,
    customsValue: VALUE,
    quantity: UNITS,
    baseRates: { general: tariffElement.general, special: tariffElement.special, other: tariffElement.other },
    transportMode: "ocean",
  };
  const result = calculate(AllRules, { ...input, answers: {} });
  const impacts = questionImpacts(input, result, {});

  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) => {
      const key = programName(l.program);
      byProgram.set(key, (byProgram.get(key) ?? 0) + (l.amount / VALUE) * 100);
    });

  return {
    entry,
    result,
    description: describe(entry.element, htsElements),
    totalPct: (result.totalDuty / VALUE) * 100,
    parts: [
      { key: BASE_PART, pct: (result.base.amount / VALUE) * 100 },
      ...Array.from(byProgram).map(([key, value]) => ({ key, pct: value })),
    ].filter((p) => p.pct > 0),
    openQuestions: countOpenQuestions(result, impacts),
    bestSavingPct: Math.max(0, ...Object.values(impacts).map((d) => (-d / VALUE) * 100)),
  };
};
