import { ERROR_MARK, PRIMARY_MARK, SUCCESS_MARK, WARNING_MARK, MUTED_MARK } from "@/components/ui/theme";
import type { ImportImpact } from "@/libs/tariff-updates/impactOf";

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

// What it does to one import, in a few words
export const reasonText = (i: ImportImpact, effective: string | null, today: string) => {
  const future = !!i.date && i.date > today;
  switch (i.reason) {
    case "starts":
      return future ? "A new duty applies from the effective date" : "A new duty applies";
    case "ends":
      return future ? "A duty stops applying from the effective date" : "A duty stopped applying";
    case "changes":
      return "The duty under it changes";
    case "ban":
      return "An import ban starts";
    case "answer":
      return "Applies depending on an answer about your goods";
    case "named":
      return effective && effective > today ? "Named in its scope; confirmed once it's in the HTS" : "Named in its scope; not in the HTS yet";
    case "country":
      return "Covers your country of origin, not this code";
  }
};

export const money = (n: number, signed = false) => {
  const whole = Math.round(Math.abs(n));
  const sign = signed ? (n > 0.5 ? "+" : n < -0.5 ? "−" : "") : n < -0.5 ? "−" : "";
  return `${sign}$${whole.toLocaleString("en-US")}`;
};

export const compactMoney = (n: number, signed = false) => {
  const abs = Math.abs(n);
  const sign = signed ? (n > 0.5 ? "+" : n < -0.5 ? "−" : "") : n < -0.5 ? "−" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 10_000) return `${sign}$${Math.round(abs / 1000)}k`;
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
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
