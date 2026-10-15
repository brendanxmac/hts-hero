import type { Kind } from "@/libs/tariff-updates/types";

// A tariff action's color in the Tracker (DESIGN_SYSTEM.md §15, color is meaning): red a new or
// higher tariff, green one lifted, amber a heads-up, cobalt the rest
export type NewsTone = "error" | "success" | "warning" | "primary";

export const NEWS_DOTS: Record<NewsTone, string> = { error: "bg-error", success: "bg-success", warning: "bg-warning", primary: "bg-primary" };

export const newsToneOf = (kind: Kind): NewsTone =>
  ["new_tariff", "rate_change", "scope_change"].includes(kind)
    ? "error"
    : ["end", "exclusion", "pause"].includes(kind)
      ? "success"
      : ["investigation", "deadline"].includes(kind)
        ? "warning"
        : "primary";
