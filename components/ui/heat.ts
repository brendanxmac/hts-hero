// A duty total's tint, for tables and lists of totals: one hue, lighter to darker as the
// total climbs. Free and per-unit totals (null) stay untinted.
const HEAT = [
  { below: 10, mix: 6 },
  { below: 25, mix: 13 },
  { below: 50, mix: 21 },
  { below: 100, mix: 30 },
  { below: Infinity, mix: 40 },
];

export const heat = (pct: number | null) => {
  if (pct === null || pct === 0) return undefined;
  const level = HEAT.find((h) => pct < h.below) ?? HEAT[HEAT.length - 1];
  return `color-mix(in srgb, var(--dc-series-1, var(--dc-accent)) ${level.mix}%, transparent)`;
};
