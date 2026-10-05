import * as ui from "@/components/ui/styles";

// Shared scale math, formatting and surface for the rates-by-country charts

// A round axis maximum, with four or five gridlines
export const axis = (max: number) => {
  const step = [5, 10, 20, 25, 50, 100].find((s) => max / s <= 5) ?? 100;
  const top = Math.max(step * Math.ceil(max / step), step);
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
};

export const average = (values: (number | null)[]) => {
  const numbers = values.filter((v): v is number => v !== null);
  return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null;
};

export const pct = (v: number) => `${Math.round(v * 10) / 10}%`;

// A chart card. <figure> comes with a margin.
export const figureCard = `${ui.card} m-0 p-5 sm:p-6`;
