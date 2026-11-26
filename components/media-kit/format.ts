// Numbers for sponsors: always rounded down, never up, so nothing on the media kit overstates.

const nf = new Intl.NumberFormat("en-US");

// 2,442 → "2,400+", 196,374 → "196k+", 87 → "87"
export const atLeast = (n: number) => {
  if (n < 100) return nf.format(Math.floor(n));
  if (n < 1_000) return `${nf.format(Math.floor(n / 10) * 10)}+`;
  if (n < 10_000) return `${nf.format(Math.floor(n / 100) * 100)}+`;
  if (n < 1_000_000) return `${nf.format(Math.floor(n / 1_000))}k+`;
  return `${(Math.floor(n / 100_000) / 10).toFixed(1)}M+`;
};

export const exact = (n: number) => nf.format(Math.round(n));

// 0.514 → "51%"; under 1% → "<1%"
export const percent = (share: number) => (share > 0 && share < 0.01 ? "<1%" : `${Math.floor(share * 100)}%`);

// How many times bigger, rounded down: 22.4 → "22x"
export const multiple = (now: number, before: number) => (before > 0 ? `${Math.floor(now / before)}x` : null);

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-11-13" → "Nov 13, 2026"
export const longDate = (day: string) => {
  const [y, m, d] = day.split("-").map(Number);
  return `${months[m - 1]} ${d}, ${y}`;
};

// "2026-11-09" → "Nov 9"
export const shortDate = (day: string) => {
  const [, m, d] = day.split("-").map(Number);
  return `${months[m - 1]} ${d}`;
};
