import { formatMoney } from "../../duty-calculator/lib/format";
import { formatRate } from "../formatRate";
import { wholeDollars } from "../insights/teasers";

// How a product's Savings page shows amounts: as a percentage of the entered value (the default,
// so it holds for any shipment size) or in dollars for the product's own shipment

export type Measure = "pct" | "usd";

export const MEASURES: { id: Measure; label: string }[] = [
  { id: "pct", label: "%" },
  { id: "usd", label: "$" },
];

// An amount of duty: "12.5%" of the value, or "$1,250.00"
export const formatDuty = (usd: number, customsValue: number, measure: Measure) =>
  measure === "pct" ? formatRate((usd / customsValue) * 100) : formatMoney(Math.round(usd * 100) / 100);

// A saving: what it takes off the rate ("7.5%" of the value), or "$750"
export const formatSaving = (usd: number, customsValue: number, measure: Measure) =>
  measure === "pct" ? formatRate((usd / customsValue) * 100) : wholeDollars(usd);
