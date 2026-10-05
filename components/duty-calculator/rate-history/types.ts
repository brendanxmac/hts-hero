// Shared types for the Duty Over Time card

// Duty shown in dollars or as a percent of the customs value
export type Metric = "usd" | "pct";

// One stacked layer of the chart: base duty, or a program
export interface Layer {
  label: string;
  color: string;
}
