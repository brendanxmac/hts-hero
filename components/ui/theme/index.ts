// Everything a component needs from the theme. Hex values live in ./palette.js; here they're
// referenced as CSS variables, so they follow light and dark mode.

// Put on a page's outermost element to apply the analytical theme inside it
export const THEME = "hts-theme";

// For a themed component embedded in a page that isn't themed yet: keeps the host's background
export const THEME_EMBEDDED = "hts-theme hts-theme-embedded";

// Parts of one whole (a duty's stacked bar), in order: base duty first, then each added
// program. Fees always take FEES_COLOR, last.
export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
export const BASE_DUTY_COLOR = CHART_COLORS[0];
export const PROGRAM_COLORS = CHART_COLORS.slice(1);
export const FEES_COLOR = "var(--chart-6)";

// Entities compared side by side (countries), assigned in slot order
export const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)"];

// A mark in the primary color, when series colors aren't in use
export const PRIMARY_MARK = "oklch(var(--p))";

// Bars and marks that aren't selected
export const MUTED_MARK = "oklch(var(--bc) / 0.18)";

// A duty total's tint, for tables and lists of totals: the primary color, lighter to darker
// as the total climbs. Free and per-unit totals (null) stay untinted.
const HEAT = [
  { below: 10, mix: 6 },
  { below: 25, mix: 12 },
  { below: 50, mix: 19 },
  { below: 100, mix: 27 },
  { below: Infinity, mix: 36 },
];

export const heat = (pct: number | null) => {
  if (pct === null || pct === 0) return undefined;
  const level = HEAT.find((h) => pct < h.below) ?? HEAT[HEAT.length - 1];
  return `color-mix(in srgb, oklch(var(--p)) ${level.mix}%, transparent)`;
};
