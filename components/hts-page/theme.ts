// Type and color helpers for the /hts/[code] page, on the duty calculator's design tokens
// (components/duty-calculator/theme.module.css), so the two pages read as one product.

export const h2Class = "text-[22px] sm:text-[26px] font-semibold leading-tight tracking-tight text-[var(--dc-text)]";
export const bodyClass = "text-[15px] leading-relaxed text-[var(--dc-text-2)]";
export const eyebrowClass = "text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--dc-accent)]";
export const cardClass =
  "rounded-[8px] border border-[var(--dc-border)] bg-[var(--dc-surface)] shadow-[var(--dc-shadow)]";

// A total's tint, as on the calculator's rates-by-country table: one hue, lighter to darker
// as the total climbs; free and per-unit totals stay untinted
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
