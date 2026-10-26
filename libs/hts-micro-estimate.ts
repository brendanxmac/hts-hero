import { calculate } from "../tariffs/engine-v2/calculate";
import { AllRules } from "../tariffs/engine-v2/data";
import { CalculationInput, IsoDate } from "../tariffs/engine-v2/types";
import { preferenceName } from "./hts-duty-summary";
import { hubForProgram, hubPath } from "./tariff-programs/hubs";

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
  // The Chapter 99 lines behind the program slices, each with its heading's name ("Section 301
  // China: List 3") and its program's /tariffs page when there is one
  lines: { code: string; name: string; programHref: string | null }[];
  // The base rate is per unit, so the duty assumes MICRO_QUANTITY units
  requiresQuantity: boolean;
  // Part of the base rate can't be calculated ("The rate applicable to…"), so the totals exclude it
  baseNotCalculated: boolean;
  // Trade preferences the goods might claim ("USMCA"), and questions that could change the duty
  preferences: string[];
  openQuestions: number;
}

const programName = (id?: string) => AllRules.programs.find((p) => p.id === id)?.name ?? "Other";

export type MicroInput = {
  htsCode: string;
  baseRates: { general: string | null; special: string | null; other: string | null };
  country: string;
  asOf: IsoDate;
};

// The standard shipment the estimate and its history are worked out on
export const microInput = ({ htsCode, baseRates, country, asOf }: MicroInput): CalculationInput => ({
  htsCode,
  country,
  asOf,
  customsValue: MICRO_CUSTOMS_VALUE,
  quantity: MICRO_QUANTITY,
  baseRates,
  transportMode: "ocean",
});

export const microEstimate = (input: MicroInput): MicroEstimate => {
  const { country, asOf } = input;
  const result = calculate(AllRules, microInput(input));

  const charged = result.lines.filter((l) => l.status === "applies" && l.amount > 0);
  const byProgram = new Map<string, number>();
  charged.forEach((l) => {
    const label = programName(l.program);
    byProgram.set(label, (byProgram.get(label) ?? 0) + l.amount);
  });
  const hub = (program?: string) => (program ? hubForProgram(program) : null);

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
    lines: charged.map((l) => {
      const programHub = hub(l.program);
      return { code: l.code, name: l.name, programHref: programHub ? hubPath(programHub) : null };
    }),
    requiresQuantity: result.requiresQuantity,
    baseNotCalculated: result.baseNotCalculated,
    preferences: Array.from(new Set(result.availablePreferences.map((p) => preferenceName(p.name)))),
    openQuestions: result.unansweredInputs.length,
  };
};
