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
