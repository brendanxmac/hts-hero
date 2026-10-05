"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { ChartCaption } from "./ChartCaption";
import { CountryMarker } from "./CountryMarker";
import { CountryRates, Product } from "./types";

// Every rate, in the same style as the charts: the total and a bar on the charts' scale.
// Selecting a country chooses it for the comparison.
export const AllRatesTable = ({
  products,
  rows,
  x,
  flags,
  colorOf,
  barOf,
  toggle,
  footnote,
}: {
  products: Product[];
  rows: CountryRates[];
  x: (v: number) => string;
  flags: boolean;
  colorOf: (code: string) => string | undefined;
  barOf: (code: string) => string;
  toggle: (code: string) => void;
  // Under the table: what the rates include
  footnote?: ReactNode;
}) => (
  <figure className={`${ui.card} m-0`}>
    <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3">
      <ChartCaption title="All rates">
        Total duty by country and product, on the same scale as the chart above. Select a
        country to compare it.
      </ChartCaption>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm tabular-nums">
        <thead>
          <tr className="border-b border-base-300 text-left">
            <th
              scope="col"
              className={`${ui.label} sticky left-0 z-10 bg-base-100 px-5 sm:px-6 py-2 align-bottom`}
            >
              Country
            </th>
            {products.map((p) => (
              <th key={p.code} scope="col" className="min-w-32 px-3 py-2 align-bottom font-normal">
                <Link
                  href={`/hts/${p.code}`}
                  className="block text-sm font-medium leading-tight text-base-content hover:text-primary hover:underline"
                >
                  {p.label}
                </Link>
                <span className={`${mono.className} block ${ui.caption}`}>{p.code}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const chosenRow = Boolean(colorOf(row.code));
            return (
              <tr key={row.code} className="group border-t border-base-300 first:border-t-0">
                {/* Pinned so the country stays in view while the products scroll on small screens */}
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-base-100 group-hover:bg-base-200 px-5 sm:px-6 py-2 text-left font-normal whitespace-nowrap"
                >
                  <button
                    type="button"
                    onClick={() => toggle(row.code)}
                    aria-pressed={chosenRow}
                    className={`inline-flex items-center gap-2 text-sm hover:text-primary ${
                      chosenRow ? "font-semibold text-base-content" : "text-base-content/70"
                    }`}
                  >
                    <span aria-hidden>{row.flag}</span>
                    {row.name}
                    {chosenRow && !flags && (
                      <CountryMarker row={row} size="chip" flags={flags} color={colorOf(row.code)} />
                    )}
                  </button>
                </th>
                {row.labels.map((label, i) => {
                  const value = row.values[i];
                  return (
                    <td key={products[i].code} className="px-3 py-2 align-top group-hover:bg-base-200">
                      {/* The total, with any trade preference beside it, then its bar */}
                      <span className="flex items-baseline justify-between gap-2">
                        <span className={`whitespace-nowrap text-base-content ${chosenRow ? "font-semibold" : ""}`}>
                          {label}
                        </span>
                        {row.preferences[i] && (
                          <span
                            className="min-w-0 truncate text-xs text-success"
                            title={row.preferences[i]}
                          >
                            {row.preferences[i]}
                          </span>
                        )}
                      </span>
                      {value !== null && (
                        <span className="mt-1 block h-1.5 rounded-full bg-base-300" aria-hidden>
                          <span className="block h-full rounded-full" style={{ width: x(value), background: barOf(row.code) }} />
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    {footnote && (
      <div className="px-5 sm:px-6 py-4 border-t border-base-300 bg-base-200 text-xs leading-relaxed text-base-content/60">
        {footnote}
      </div>
    )}
  </figure>
);
