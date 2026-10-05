"use client";

import { useState } from "react";
import { SERIES_COLORS } from "@/components/ui/theme";
import { CountryRates } from "./types";

const DEFAULT_COUNTRIES = ["CN", "MX", "VN", "DE", "JP"];

// The chosen countries, up to one per series color. Each slot holds a country; the slot sets
// its color, so others leaving don't repaint it. `added` is the order they were chosen in:
// with every slot taken, a new choice replaces the earliest one.
export const useCountrySlots = (rows: CountryRates[]) => {
  const [{ slots }, setChoice] = useState(() => {
    const preferred = DEFAULT_COUNTRIES.filter((c) => rows.some((r) => r.code === c));
    const rest = rows.map((r) => r.code).filter((c) => !preferred.includes(c));
    const initial = [...preferred, ...rest].slice(0, SERIES_COLORS.length);
    return { slots: initial as (string | null)[], added: initial };
  });

  // A chosen country's color; undefined when it isn't chosen
  const colorOf = (code: string) => {
    const i = slots.indexOf(code);
    return i >= 0 ? SERIES_COLORS[i] : undefined;
  };

  const toggle = (code: string) =>
    setChoice((current) => {
      const i = current.slots.indexOf(code);
      if (i >= 0) {
        return {
          slots: current.slots.map((c, j) => (j === i ? null : c)),
          added: current.added.filter((c) => c !== code),
        };
      }
      const free = current.slots.indexOf(null);
      const slot = free >= 0 ? free : current.slots.indexOf(current.added[0]);
      const replaced = current.slots[slot];
      return {
        slots: current.slots.map((c, j) => (j === slot ? code : c)),
        added: [...current.added.filter((c) => c !== replaced), code],
      };
    });

  // The chosen countries' rows, in slot order
  const chosen = slots
    .map((code, slot) => ({ slot, row: rows.find((r) => r.code === code) }))
    .filter((c): c is { slot: number; row: CountryRates } => Boolean(c.row));

  return { colorOf, toggle, chosen };
};
