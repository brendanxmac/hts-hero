import { partColors } from "@/components/ui/charts/partColors";
import { RatePart } from "./report";

// A color for each part of the rate across a set of products, the same one it has on every other
// screen (partColors: base duty first, each program by its kind)
export const programColors = (rows: { parts: RatePart[] }[]) => partColors(rows.flatMap((r) => r.parts.map((p) => p.key)));
