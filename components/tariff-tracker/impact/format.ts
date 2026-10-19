import { ERROR_MARK, PRIMARY_MARK, SUCCESS_MARK, WARNING_MARK, MUTED_MARK } from "@/components/ui/theme";
import type { ImportImpact } from "@/libs/tariff-updates/impactOf";
import { formatRate } from "../formatRate";

// How the Tariff impact tab names and colors what an update does to an import

export type ImpactGroup = "up" | "down" | "same" | "likely" | "possible";

// Confirmed changes split by direction; same: a new Chapter 99 number to report at the same duty
export const groupOf = (i: ImportImpact): ImpactGroup => {
  if (i.level === "likely") return "likely";
  if (i.level === "possible") return "possible";
  const delta = i.deltaUsd ?? 0;
  if (i.reason === "ban") return "up";
  return delta > 0.5 ? "up" : delta < -0.5 ? "down" : "same";
};

export const GROUPS: Record<ImpactGroup, { label: string; short: string; tone: "error" | "success" | "primary" | "warning" | "neutral"; mark: string; note: string }> = {
  up: { label: "Duty goes up", short: "Up", tone: "error", mark: ERROR_MARK, note: "Confirmed by the duty engine" },
  down: { label: "Duty goes down", short: "Down", tone: "success", mark: SUCCESS_MARK, note: "Confirmed by the duty engine" },
  same: { label: "New number, same duty", short: "Same duty", tone: "primary", mark: PRIMARY_MARK, note: "A new Chapter 99 number to report" },
  likely: { label: "May apply", short: "May apply", tone: "warning", mark: WARNING_MARK, note: "It names your code and country" },
  possible: { label: "Your country only", short: "Country", tone: "neutral", mark: MUTED_MARK, note: "It names the country, not the code" },
};

export const GROUP_ORDER: ImpactGroup[] = ["up", "down", "same", "likely", "possible"];

// A change in the duty rate, signed: "+25%", "−2.5%" (never "points": the rate moves by that %)
export const rateChange = (i: Pick<ImportImpact, "beforePct" | "afterPct">) => (i.afterPct ?? 0) - (i.beforePct ?? 0);
export const signedRate = (n: number) => `${n > 0.005 ? "+" : n < -0.005 ? "−" : ""}${formatRate(Math.abs(n))}`;

export const money = (n: number, signed = false) => {
  const whole = Math.round(Math.abs(n));
  const sign = signed ? (n > 0.5 ? "+" : n < -0.5 ? "−" : "") : n < -0.5 ? "−" : "";
  return `${sign}$${whole.toLocaleString("en-US")}`;
};

export const day = (iso: string, withYear = true) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });

// "in 12 days", "today", "3 days ago"
export const relativeDays = (iso: string, today: string) => {
  const days = Math.round((Date.parse(iso.slice(0, 10)) - Date.parse(today)) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days > 0) return `in ${days} days`;
  if (days === -1) return "yesterday";
  return `${-days} days ago`;
};

// A code prefix from an update's scope as people write it: "73" → "Chapter 73", "732690" →
// "7326.90", "870810-870899" → "8708.10–8708.99"
export const formatPrefix = (prefix: string): string => {
  if (prefix.includes("-")) return prefix.split("-").map(formatPrefix).join("–");
  if (prefix.length <= 2) return `Chapter ${prefix}`;
  return [prefix.slice(0, 4), prefix.slice(4, 6), prefix.slice(6, 8), prefix.slice(8, 10)].filter(Boolean).join(".");
};
