import { HistorySegment, lastDay, LineChange } from "@/tariffs/engine-v2/history";
import { formatDate, formatMoney, formatPct } from "../lib/format";

// Text formatting for the Duty Over Time card

// "Apr 8", or "Apr 8, 2026" when asked
export const shortDate = (iso: string, withYear = false) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });

export const dateRange = (segment: HistorySegment) => {
  const end = lastDay(segment);
  return end === segment.from
    ? formatDate(segment.from)
    : `${shortDate(segment.from)} – ${formatDate(end)}`;
};

export const compactMoney = (amount: number) => {
  if (amount === 0) return "$0";
  if (Math.abs(amount) >= 1000) {
    const k = amount / 1000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `$${Math.round(amount)}`;
};

export const signedMoney = (amount: number) =>
  `${amount > 0 ? "+" : amount < 0 ? "−" : ""}${formatMoney(Math.abs(amount))}`;

export const signedPct = (pct: number) =>
  `${pct > 0 ? "+" : pct < 0 ? "−" : ""}${formatPct(Math.abs(Math.round(pct * 100) / 100))}`;

export const KIND_LABEL: Record<LineChange["kind"], string> = {
  added: "Added",
  removed: "Removed",
  changed: "Changed",
};

// A changed line's rate: "25%", or "10% → 25%"
export const rateText = (change: LineChange) => {
  const before = change.before?.ratePct;
  const after = change.after?.ratePct;
  if (change.kind === "added") return after !== undefined ? formatPct(after) : "";
  if (change.kind === "removed") return before !== undefined ? formatPct(before) : "";
  if (before !== undefined && after !== undefined && before !== after) {
    return `${formatPct(before)} → ${formatPct(after)}`;
  }
  return "";
};
