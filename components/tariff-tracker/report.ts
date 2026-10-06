import { HtsElement } from "../../interfaces/hts";
import { getHtsElementParents } from "../../libs/hts";
import { calculate } from "../../tariffs/engine-v2/calculate";
import { AllRules } from "../../tariffs/engine-v2/data";
import { Authority, CalculationInput, CalculationResult } from "../../tariffs/engine-v2/types";
import { buildEstimateInput, findTariffElement } from "../duty-calculator/lib/estimate";
import { countOpenQuestions, questionImpacts } from "../duty-calculator/lib/questions";
import {
  Adjustments,
  cleanAdjustments,
  DEFAULT_MODE,
  DEFAULT_UNITS,
  DEFAULT_VALUE,
  productKey,
} from "./adjustments";
import { CatalogEntry } from "./parse";

// One product in a catalog, worked out for the "rates as of" date with its adjustments

// Same label as the calculator's Cost Breakdown slice
export const BASE_PART = "Base duty";

export const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

export const programAuthority = (id?: string): Authority =>
  AllRules.programs.find((p) => p.id === id)?.authority ?? "other";

// The value and quantity unadjusted products are worked out for
export const VALUE = DEFAULT_VALUE;
export const UNITS = DEFAULT_UNITS;

export interface RatePart {
  key: string; // BASE_PART or a program name
  pct: number;
}

export interface TrackedProduct {
  // HTS code + country: what adjustments are remembered by
  key: string;
  entry: CatalogEntry<HtsElement>;
  adjustments: Adjustments;
  // The shipment it's worked out for: its adjustments, or the defaults
  customsValue: number;
  quantity: number;
  // The engine's input, without answers
  input: Omit<CalculationInput, "answers">;
  result: CalculationResult;
  description: string;
  totalPct: number;
  parts: RatePart[];
  // What answering each yes/no question would change, in dollars
  impacts: Record<string, number>;
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

// A result's total as parts of the customs value: base duty, then each program that applies
export const rateParts = (result: CalculationResult, customsValue: number): RatePart[] => {
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) => {
      const key = programName(l.program);
      byProgram.set(key, (byProgram.get(key) ?? 0) + (l.amount / customsValue) * 100);
    });
  return [
    { key: BASE_PART, pct: (result.base.amount / customsValue) * 100 },
    ...Array.from(byProgram).map(([key, pct]) => ({ key, pct })),
  ].filter((p) => p.pct > 0);
};

// "Section 232 – Steel, Aluminum & Copper" → "Section 232"
export const shortProgram = (name: string) => name.split(" – ")[0];

export const trackProduct = (
  entry: CatalogEntry<HtsElement>,
  htsElements: HtsElement[],
  asOf: string,
  rawAdjustments: Adjustments = {}
): TrackedProduct => {
  const adjustments = cleanAdjustments(rawAdjustments);
  const customsValue = adjustments.customsValue ?? VALUE;
  const quantity = adjustments.quantity ?? UNITS;
  const answers = adjustments.answers ?? {};
  const input = buildEstimateInput({
    element: entry.element,
    tariffElement: findTariffElement(entry.element, htsElements),
    country: entry.country,
    asOf,
    customsValue,
    quantity,
    transportMode: adjustments.transportMode ?? DEFAULT_MODE,
    claimedPreference: adjustments.claimedPreference,
  });
  const result = calculate(AllRules, { ...input, answers });
  const impacts = questionImpacts(input, result, answers);

  return {
    key: productKey(entry.element.htsno, entry.country),
    entry,
    adjustments,
    customsValue,
    quantity,
    input,
    result,
    description: describe(entry.element, htsElements),
    totalPct: (result.totalDuty / customsValue) * 100,
    parts: rateParts(result, customsValue),
    impacts,
    openQuestions: countOpenQuestions(result, impacts),
    bestSavingPct: Math.max(0, ...Object.values(impacts).map((d) => (-d / customsValue) * 100)),
  };
};
