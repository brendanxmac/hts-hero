import { TariffMatrix } from "@/libs/duty-calculator-content";
import { formatDutyPct } from "@/libs/hts-duty-summary";

// "36.5%" -> 36.5; "Free" -> 0; per-unit rates ("6.3¢/liter + 25%") aren't a single number
export const pctOf = (total: string) => {
  if (total === "Free") return 0;
  const match = total.match(/^(\d+(?:\.\d+)?)%$/);
  return match ? Number(match[1]) : null;
};

// One decimal is plenty for an average
export const roundedPct = (pct: number) => formatDutyPct(Math.round(pct * 10) / 10);

// Headline facts from the table: the highest and lowest average rate, and the widest gap
export const matrixFacts = (matrix: TariffMatrix) => {
  const averages = matrix.rows
    .map((row) => {
      const values = row.cells.map((c) => pctOf(c.total)).filter((v): v is number => v !== null);
      return { country: row.country, average: values.length ? values.reduce((a, b) => a + b, 0) / values.length : null };
    })
    .filter((r): r is { country: (typeof r)["country"]; average: number } => r.average !== null);
  if (averages.length === 0) return null;
  const highest = averages.reduce((a, b) => (b.average > a.average ? b : a));
  const lowest = averages.reduce((a, b) => (b.average < a.average ? b : a));
  const spreads = matrix.products.map((product, i) => {
    const values = matrix.rows
      .map((row) => ({ country: row.country, pct: pctOf(row.cells[i].total) }))
      .filter((v): v is { country: (typeof v)["country"]; pct: number } => v.pct !== null);
    if (values.length < 2) return null;
    const min = values.reduce((a, b) => (b.pct < a.pct ? b : a));
    const max = values.reduce((a, b) => (b.pct > a.pct ? b : a));
    return { product, min, max, gap: max.pct - min.pct };
  });
  const widest = spreads.reduce<(typeof spreads)[number]>(
    (a, b) => (b && (!a || b.gap > a.gap) ? b : a),
    null,
  );
  return { highest, lowest, widest };
};
