"use client";

import { ChartCaption } from "./ChartCaption";
import { average, figureCard, pct } from "./scale";
import { CountryRates } from "./types";

// Every country's average total duty across the products, highest first. Selecting a country
// chooses it for the comparison.
export const AverageByCountryChart = ({
  rows,
  productCount,
  colorOf,
  barOf,
  toggle,
}: {
  rows: CountryRates[];
  productCount: number;
  colorOf: (code: string) => string | undefined;
  barOf: (code: string) => string;
  toggle: (code: string) => void;
}) => {
  const averages = rows
    .map((r) => ({ row: r, average: average(r.values) }))
    .filter((r): r is { row: CountryRates; average: number } => r.average !== null)
    .sort((a, b) => b.average - a.average);
  const maxAverage = Math.max(...averages.map((a) => a.average), 1);

  return (
    <figure className={figureCard}>
      <ChartCaption title="Average total duty by country">
        Across the {productCount} products. Select a country to compare it.
      </ChartCaption>
      <ol className="mt-4 flex flex-col tabular-nums">
        {averages.map(({ row, average }) => {
          const chosenRow = Boolean(colorOf(row.code));
          return (
            <li key={row.code}>
              <button
                type="button"
                onClick={() => toggle(row.code)}
                aria-pressed={chosenRow}
                className="grid w-full grid-cols-[7rem_minmax(0,1fr)_3rem] items-center gap-3 rounded-md px-1.5 py-1 text-left hover:bg-base-200"
                aria-label={`${row.name}: ${pct(average)} average`}
              >
                <span className={`truncate text-sm ${chosenRow ? "font-semibold text-base-content" : "text-base-content/70"}`}>
                  <span aria-hidden className="mr-1.5">{row.flag}</span>
                  {row.name}
                </span>
                <span className="relative h-2.5">
                  <span
                    className="absolute inset-y-0 left-0 rounded-r"
                    style={{ width: `${(average / maxAverage) * 100}%`, background: barOf(row.code) }}
                  />
                </span>
                <span className={`text-right text-sm ${chosenRow ? "font-semibold text-base-content" : "text-base-content/70"}`}>
                  {pct(average)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </figure>
  );
};
