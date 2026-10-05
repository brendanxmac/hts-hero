import { HistorySegment } from "@/tariffs/engine-v2/history";
import { CHART_COLORS } from "@/components/ui/theme";
import { BASE_SLICE, sliceForProgram } from "../results";
import { Layer } from "./types";

// The chart's stacked layers: base duty, then each program, grouped the way the Cost
// Breakdown groups them

// Amount per layer in one segment
export const amountsBySlice = (segment: HistorySegment) => {
  const amounts = new Map<string, number>([[BASE_SLICE, segment.result.base.amount]]);
  segment.charged
    .filter((l) => l.code !== "BASE")
    .forEach((l) => {
      const slice = sliceForProgram(l.program);
      amounts.set(slice, (amounts.get(slice) ?? 0) + l.amount);
    });
  return amounts;
};

// Layers in the order they first appear, base duty at the bottom. A layer takes its Cost
// Breakdown color, or else a chart color the breakdown isn't using.
export const layersFor = (
  history: HistorySegment[],
  sliceColors: Record<string, string>,
): Layer[] => {
  const labels: string[] = [];
  history.forEach((s) =>
    amountsBySlice(s).forEach((amount, label) => {
      if (!labels.includes(label) && amount > 0) labels.push(label);
    }),
  );
  const used = new Set(Object.values(sliceColors));
  const spare = CHART_COLORS.filter((c) => !used.has(c));
  let next = 0;
  return labels.map((label) => ({
    label,
    color:
      sliceColors[label] ??
      (label === BASE_SLICE
        ? CHART_COLORS[0]
        : spare[next++ % Math.max(spare.length, 1)] ?? CHART_COLORS[1]),
  }));
};
