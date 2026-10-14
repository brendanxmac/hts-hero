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

// Base duty, then one slice per program, then fees, each in its own color everywhere (partColors)
export const slices = (result: CalculationResult): Slice[] => {
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) =>
      byProgram.set(
        sliceForProgram(l.program),
        (byProgram.get(sliceForProgram(l.program)) ?? 0) + l.amount,
      ),
    );
  const colors = partColors([BASE_SLICE, ...Array.from(byProgram.keys()), FEES_SLICE]);
  return [
    { label: BASE_SLICE, amount: result.base.amount, color: colors[BASE_SLICE] },
    ...Array.from(byProgram).map(([label, amount]) => ({ label, amount, color: colors[label] })),
    { label: FEES_SLICE, amount: result.totalFees, color: colors[FEES_SLICE] },
  ];
};
