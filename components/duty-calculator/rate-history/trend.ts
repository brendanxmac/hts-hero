// Whether a change in duty went up, down or nowhere, and the classes for each.
// An increase reads as an error, a decrease as a saving.

export type Trend = "up" | "down" | "flat";

export const trendOf = (delta: number): Trend =>
  delta > 0.005 ? "up" : delta < -0.005 ? "down" : "flat";

export const TREND_TEXT: Record<Trend, string> = {
  up: "text-error",
  down: "text-success",
  flat: "text-base-content/60",
};
export const TREND_PILL: Record<Trend, string> = {
  up: "bg-error/10 text-error",
  down: "bg-success/10 text-success",
  flat: "bg-base-200 text-base-content/60",
};
export const TREND_DOT: Record<Trend, string> = {
  up: "bg-error ring-error/15",
  down: "bg-success ring-success/15",
  flat: "bg-base-content/60 ring-base-200",
};
export const TREND_STROKE: Record<Trend, string> = {
  up: "stroke-error",
  down: "stroke-success",
  flat: "stroke-base-content/60",
};
