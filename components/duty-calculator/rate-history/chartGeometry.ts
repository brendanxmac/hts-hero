// Sizes and axis math for the Duty Over Time chart

export const HEIGHT = 176;
export const PAD = { top: 14, right: 6, bottom: 24, left: 48 };
// Room each month label needs
export const MONTH_LABEL_WIDTH = 48;
// Tooltip width, w-52
export const TOOLTIP_WIDTH = 208;

const DAY_MS = 24 * 60 * 60 * 1000;
export const dayNumber = (iso: string) => Date.parse(`${iso}T00:00:00Z`) / DAY_MS;

// Rounds up to 1, 2, 2.5 or 5 times a power of ten, for axis steps
export const niceStep = (raw: number) => {
  if (raw <= 0) return 1;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * power >= raw) ?? 10;
  return step * power;
};

// The first of each month after `from` and before `to`, thinned to at most `max` evenly spaced
// ones. "Jan" months, and the first label, carry the year: "Jan '27".
export const monthTicks = (from: string, to: string, max: number) => {
  const months: string[] = [];
  const [year, month] = from.split("-").map(Number);
  for (let i = 1; ; i++) {
    const d = new Date(Date.UTC(year, month - 1 + i, 1)).toISOString().slice(0, 10);
    if (d >= to) break;
    months.push(d);
  }
  const every = Math.ceil(months.length / max);
  return months
    .filter((_, i) => i % every === 0)
    .map((date, i) => {
      const d = new Date(`${date}T00:00:00`);
      const name = d.toLocaleDateString("en-US", { month: "short" });
      const withYear = i === 0 || d.getMonth() === 0;
      return { date, label: withYear ? `${name} '${String(d.getFullYear()).slice(2)}` : name };
    });
};
