import { HistorySegment } from "@/tariffs/engine-v2/history";
import { partColors } from "@/components/ui/charts/partColors";
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

// Layers in the order they first appear, base duty at the bottom, each in its color everywhere
// (partColors; sliceColors, from the Cost Breakdown, agree with it)
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
  const colors = partColors(labels);
  return labels.map((label) => ({ label, color: sliceColors[label] ?? colors[label] ?? colors[BASE_SLICE] }));
};
