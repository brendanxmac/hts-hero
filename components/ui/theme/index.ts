// Everything a component needs from the theme. Hex values live in ./palette.js; here they're
// referenced as CSS variables, so they follow light and dark mode.

// Put on a page's outermost element to apply the analytical theme inside it
export const THEME = "hts-theme";

// For a themed component embedded in a page that isn't themed yet: keeps the host's background
export const THEME_EMBEDDED = "hts-theme hts-theme-embedded";

// Always light, ignoring the dark-mode toggle: marketing pages and the components embedded in them
export const THEME_LIGHT = "hts-theme hts-theme-light";

// Always dark with no background, for themed text placed straight on a dark marketing band
export const THEME_ON_DARK = "hts-theme hts-theme-dark";

// Parts of one whole (a duty's stacked bar), in order: base duty first, then each added
// program. Fees always take FEES_COLOR, last.
export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
export const BASE_DUTY_COLOR = CHART_COLORS[0];
export const PROGRAM_COLORS = CHART_COLORS.slice(1);
export const FEES_COLOR = "var(--chart-6)";

// Entities compared side by side (countries), assigned in slot order
export const SERIES_COLORS = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)"];

// A mark in the primary color, when series colors aren't in use
export const PRIMARY_MARK = "var(--color-primary)";

// Marks for a saving or a decrease, and for an increase
export const SUCCESS_MARK = "var(--color-success)";
export const ERROR_MARK = "var(--color-error)";
// A caution: an amount that went up without being an error
export const WARNING_MARK = "var(--color-warning)";

// Bars and marks that aren't selected
export const MUTED_MARK = "color-mix(in oklab, var(--color-base-content) 18%, transparent)";

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
  return `color-mix(in srgb, var(--color-primary) ${level.mix}%, transparent)`;
};

// A sequential ramp for magnitude in one hue (dataviz: one hue, light to dark): step 0 of `steps`
// is the full primary color, the last the lightest, all opaque (mixed into the surface, so it
// follows light and dark mode). For tiers of one measure, like rates from highest to lowest.
export const rampColor = (step: number, steps: number) => {
  const share = steps <= 1 ? 100 : Math.round(100 - (Math.min(step, steps - 1) / (steps - 1)) * 70);
  return `color-mix(in srgb, var(--color-primary) ${share}%, var(--color-base-100))`;
};

// A neutral, opaque fill for "none" in a chart of parts (no added tariff)
export const NEUTRAL_FILL = "color-mix(in srgb, var(--color-base-content) 16%, var(--color-base-100))";
