// Where the money goes: duty and fees split into slices, one per program
import { CHART_COLORS, FEES_COLOR } from "@/components/ui/theme";
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

// Base duty, then one slice per program, then fees
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
  return [
    { label: BASE_SLICE, amount: result.base.amount, color: CHART_COLORS[0] },
    ...Array.from(byProgram).map(([label, amount], i) => ({
      label,
      amount,
      color: CHART_COLORS[(i + 1) % CHART_COLORS.length],
    })),
    { label: FEES_SLICE, amount: result.totalFees, color: FEES_COLOR },
  ];
};
