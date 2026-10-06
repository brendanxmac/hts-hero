import { CHART_COLORS } from "@/components/ui/theme";
import { BASE_PART, RatePart } from "./report";

// One color per program across the whole report, in order of first appearance. Same series
// as the calculator's Cost Breakdown: base duty first.
export const programColors = (rows: { parts: RatePart[] }[]) => {
  const map: Record<string, string> = { [BASE_PART]: CHART_COLORS[0] };
  let next = 1;
  rows.forEach((r) =>
    r.parts.forEach((p) => {
      if (!map[p.key]) map[p.key] = CHART_COLORS[next++ % CHART_COLORS.length] ?? CHART_COLORS[1];
    })
  );
  return map;
};
