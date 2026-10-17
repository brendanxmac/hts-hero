// Where the money goes: duty and fees split into slices, one per program
import { partColors } from "@/components/ui/charts/partColors";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { programName } from "./labels";

// Which slice a line belongs to: base duty, its program, or fees
export const BASE_SLICE = "Base duty";
export const FEES_SLICE = "Customs fees";
export const sliceForProgram = (program?: string) => programName(program);

export interface Slice {
  label: string;
  amount: number;
  color: string;
}

// Base duty, then one slice per program, then fees, each in its own color everywhere (partColors).
// `colors`: the host's colors for every slice the import has had on any date (sliceColorsFor),
// so a slice keeps one color while the entry date changes; else they're worked out from this
// result alone
export const slices = (result: CalculationResult, fixed?: Record<string, string>): Slice[] => {
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) =>
      byProgram.set(
        sliceForProgram(l.program),
        (byProgram.get(sliceForProgram(l.program)) ?? 0) + l.amount,
      ),
    );
  const own = partColors([BASE_SLICE, ...Array.from(byProgram.keys()), FEES_SLICE]);
  const colors = fixed ? { ...own, ...fixed } : own;
  return [
    { label: BASE_SLICE, amount: result.base.amount, color: colors[BASE_SLICE] },
    ...Array.from(byProgram).map(([label, amount]) => ({ label, amount, color: colors[label] })),
    { label: FEES_SLICE, amount: result.totalFees, color: colors[FEES_SLICE] },
  ];
};

// One color per slice for an import across its whole history (and the result shown), so moving
// the entry date never re-colors a tariff: partColors gives programs that meet on one chart
// different slots, and which programs meet depends on the date unless every date is counted
export const sliceColorsFor = (results: CalculationResult[]): Record<string, string> => {
  const labels = new Set<string>();
  results.forEach((r) =>
    r.lines.filter((l) => l.status === "applies" && l.amount > 0).forEach((l) => labels.add(sliceForProgram(l.program)))
  );
  return partColors([BASE_SLICE, ...Array.from(labels), FEES_SLICE]);
};
