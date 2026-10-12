// A soft wash (teal unless a color is given) behind a duty rate or total, deeper as the rate climbs, so the eye finds the
// expensive rows. Free and per-unit totals (null) stay untinted. A runtime value, so it's set inline.
const STEPS = [
  { below: 10, mix: 10 },
  { below: 25, mix: 18 },
  { below: 50, mix: 28 },
  { below: 100, mix: 40 },
  { below: Infinity, mix: 52 },
];

export const dutyTint = (pct: number | null, color = "#14b8a6") => {
  if (pct === null || pct === 0) return undefined;
  const step = STEPS.find((s) => pct < s.below) ?? STEPS[STEPS.length - 1];
  return `color-mix(in srgb, ${color} ${step.mix}%, transparent)`;
};
