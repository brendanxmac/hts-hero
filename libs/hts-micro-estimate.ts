import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import { IsoDate } from "../tariffs/engine-v2/types";
import { preferenceName } from "./hts-duty-summary";

// The headline duty estimate on the /hts/[code] pages: one country, a standard shipment.
// Runs on the server for the first render, and in the browser (loaded on demand, since the
// tariff data is large) when the visitor picks another country.

// A standard shipment, as in the duty-by-country table
export const MICRO_CUSTOMS_VALUE = 10000;
export const MICRO_QUANTITY = 1000;

export interface MicroEstimate {
  country: string;
  asOf: IsoDate;
  totalDuty: number;
  totalFees: number;
  fees: string; // "MPF + HMF"
  // Base duty, then one slice per program, then fees, as in the calculator's cost bar
  slices: { label: string; amount: number }[];
  // The base rate is per unit, so the duty assumes MICRO_QUANTITY units
  requiresQuantity: boolean;
  // Trade preferences the goods might claim ("USMCA"), and questions that could change the duty
  preferences: string[];
  openQuestions: number;
}

const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

export const microEstimate = ({
  htsCode,
  baseRates,
  country,
  asOf,
}: {
  htsCode: string;
  baseRates: { general: string | null; special: string | null; other: string | null };
  country: string;
  asOf: IsoDate;
}): MicroEstimate => {
  const result = calculate(AllRules, {
    htsCode,
    country,
    asOf,
    customsValue: MICRO_CUSTOMS_VALUE,
    quantity: MICRO_QUANTITY,
    baseRates,
    transportMode: "ocean",
  });

  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) => {
      const label = programName(l.program);
      byProgram.set(label, (byProgram.get(label) ?? 0) + l.amount);
    });

  return {
    country,
    asOf,
    totalDuty: result.totalDuty,
    totalFees: result.totalFees,
    fees: result.fees.map((f) => f.id.toUpperCase()).join(" + ") || "None",
    slices: [
      { label: "Base duty", amount: result.base.amount },
      ...Array.from(byProgram, ([label, amount]) => ({ label, amount })),
      { label: "Customs fees", amount: result.totalFees },
    ],
    requiresQuantity: result.requiresQuantity,
    preferences: Array.from(new Set(result.availablePreferences.map((p) => preferenceName(p.name)))),
    openQuestions: result.unansweredInputs.length,
  };
};
