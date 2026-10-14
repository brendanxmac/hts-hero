"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { barWidth } from "@/components/ui/charts/kit";
import { ChartCaption } from "@/components/duty-calculator/country-rate-charts/ChartCaption";
import * as tt from "@/components/ui/styles/tracker";
import { DataTable, TableSearch, useDataTable } from "@/components/ui/table";
import { formatRate } from "../../formatRate";
import { BASE_PART, shortProgram } from "../../report";
import { OriginRate, partsOf, RateBasis, rateOf } from "./analysis";

// Every origin's rate, on the shared table: searchable, sorted by any heading (lowest rate first
// to begin with): a bar on one scale (its tariffs stacked, like the other charts), the rate, the
// rate with a trade agreement, the difference from the product's own origin, and the tariffs
// behind it. Full height; the heading row stays in view. The product's origin and the selected
// country are lit.

const columnsFor = ({
  basis,
  colors,
  selected,
  yourPct,
  top,
}: {
  basis: RateBasis;
  colors: Record<string, string>;
  selected: string | null;
  yourPct: number;
  top: number;
}): ColumnDef<OriginRate, any>[] => [
  {
    id: "name",
    accessorFn: (r) => r.country.name,
    header: "Country",
    meta: { rowHeader: true },
    cell: ({ row: { original: r } }) => (
      <span className="inline-flex items-center gap-2 whitespace-nowrap text-base-content">
        <span aria-hidden>{r.country.flag}</span>
        {r.country.name}
        {r.isOrigin && <span className={tt.chip("primary")}>Yours</span>}
      </span>
    ),
  },
  {
    id: "bar",
    header: () => <span className="sr-only">Rate, as a bar</span>,
    enableSorting: false,
    meta: { width: "w-[30%]" },
    cell: ({ row: { original: r } }) => {
      const pct = rateOf(r, basis);
      return (
        <span className="flex h-2.5 w-full overflow-hidden rounded-r bg-transparent" aria-hidden>
          <span className="flex h-full motion-safe:transition-[width] motion-safe:duration-500" style={{ width: barWidth(pct, top) }}>
            {partsOf(r, basis).map((p) => (
              <span
                key={p.key}
                className={`h-full ${r.isOrigin || selected === r.country.code ? "" : "opacity-80"}`}
                style={{ width: barWidth(p.pct, pct), background: colors[p.key] }}
              />
            ))}
          </span>
        </span>
      );
    },
  },
  {
    id: "rate",
    accessorFn: (r) => rateOf(r, basis),
    header: "Rate",
    meta: { align: "right" },
    cell: ({ getValue }) => <span className="font-semibold">{formatRate(getValue())}</span>,
  },
  {
    id: "agreement",
    // With an agreement first, then by rate
    accessorFn: (r) => (r.agreement ? 0 : 1) * 1000 + rateOf(r, basis),
    header: "Trade agreement",
    cell: ({ row: { original: r } }) =>
      r.agreement ? (
        <span className="text-success" title={r.agreement.name}>
          {formatRate(r.agreement.pct)} · {r.agreement.symbol}
        </span>
      ) : (
        <span className="text-base-content/70">—</span>
      ),
  },
  {
    id: "diff",
    accessorFn: (r) => rateOf(r, basis) - yourPct,
    header: "Vs yours",
    meta: { align: "right" },
    cell: ({ row: { original: r }, getValue }) => {
      const diff = getValue() as number;
      const same = Math.abs(diff) <= 0.005;
      return (
        <span className={r.isOrigin || same ? "text-base-content/50" : diff < 0 ? "text-success" : "text-error"}>
          {r.isOrigin ? "—" : same ? "Same" : `${diff < 0 ? "−" : "+"}${formatRate(Math.abs(diff))}`}
        </span>
      );
    },
  },
  {
    id: "tariffs",
    header: "Tariffs",
    enableSorting: false,
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-xs text-base-content/70">
        {partsOf(r, basis).length === 0
          ? "Duty free"
          : partsOf(r, basis).map((p) => (
              <span key={p.key} className="inline-flex items-center gap-1 whitespace-nowrap">
                <span className="h-2 w-2 rounded-sm" style={{ background: colors[p.key] }} aria-hidden />
                {p.key === BASE_PART ? "Base" : shortProgram(p.key)} {formatRate(p.pct)}
              </span>
            ))}
      </span>
    ),
  },
];

export const OriginsTable = ({
  rates,
  basis,
  colors,
  selected,
  onSelect,
}: {
  rates: OriginRate[];
  basis: RateBasis;
  colors: Record<string, string>;
  selected: string | null;
  onSelect: (code: string) => void;
}) => {
  const yours = rates.find((r) => r.isOrigin);
  const yourPct = yours ? rateOf(yours, basis) : 0;
  // One scale for both bases, so switching shows bars shrinking rather than a rescale
  const top = Math.max(...rates.map((r) => rateOf(r, "standard")), 1);
  const columns = useMemo(() => columnsFor({ basis, colors, selected, yourPct, top }), [basis, colors, selected, yourPct, top]);
  const table = useDataTable<OriginRate>({
    data: rates,
    columns,
    getRowId: (r) => r.country.code,
    searchText: (r) => `${r.country.name} ${r.country.code}`,
    initialSorting: [{ id: "rate", desc: false }],
  });

  return (
    <DataTable
      table={table}
      label="Every origin's rate"
      onRowClick={(r) => onSelect(r.country.code)}
      rowClassName={(r) => (r.isOrigin ? "bg-primary/5" : selected === r.country.code ? "bg-success/10" : "")}
      estimateRowHeight={44}
      toolbar={
        <ChartCaption title="All origins" action={<TableSearch table={table} placeholder="Find a country" />}>
          {rates.length} countries. Select one to compare it with yours.
        </ChartCaption>
      }
      empty={<p className="text-sm text-base-content/70">No country matches “{table.getState().globalFilter}”</p>}
    />
  );
};
