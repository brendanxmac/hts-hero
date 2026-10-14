"use client";

import { barWidth } from "@/components/ui/charts/kit";
import { useMemo, useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import { DataTable, TableSearch, useDataTable } from "@/components/ui/table";
import { dutyTint } from "../country/dutyTint";

// Every country of origin and what its goods face. All rows render on the server, so the whole
// table is in the page's HTML; searching, filtering and sorting (the shared DataTable: click a
// heading) only rearrange it. The body scrolls under a sticky header so the page stays short.

export interface HubRow {
  code: string;
  name: string;
  flag: string;
  imports: number | null; // millions of USD, for sorting
  importsLabel: string | null; // "$194 billion"
  rank: number | null;
  forcedLabor: string | null;
  forcedLaborPct: number | null;
  // Tariffs written for this country: program name and what it charges
  otherTariffs: { name: string; detail: string }[];
  dealRates: number;
  preferences: string[];
  column2: boolean;
}

type Filter = "all" | "forcedLabor" | "specific" | "agreements" | "none";

const FILTERS: { id: Filter; label: string; test: (r: HubRow) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "forcedLabor", label: "Forced-labor tariff", test: (r) => r.forcedLabor !== null },
  { id: "specific", label: "Own tariffs or Column 2 Rates", test: (r) => r.otherTariffs.length > 0 || r.column2 },
  { id: "agreements", label: "Trade agreement", test: (r) => r.preferences.length > 0 },
  { id: "none", label: "No added tariff", test: (r) => !r.forcedLabor && r.otherTariffs.length === 0 && !r.column2 },
];

const none = <span className="text-slate-300">—</span>;
const pill = "inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset";
const caption = "text-xs text-slate-500";

const byName = (a: Row<HubRow>, b: Row<HubRow>) => a.original.name.localeCompare(b.original.name);

const columns = (maxImports: number): ColumnDef<HubRow, any>[] => [
  {
    id: "name",
    accessorFn: (r) => r.name,
    header: "Country",
    sortingFn: byName,
    meta: { rowHeader: true },
    cell: ({ row: { original: r } }) => (
      <span className="whitespace-nowrap font-semibold text-slate-900">
        <span aria-hidden="true" className="mr-2">{r.flag}</span>
        {r.name}
      </span>
    ),
  },
  {
    id: "imports",
    // Countries without a figure sort after every country with one
    accessorFn: (r) => r.imports ?? -1,
    header: "US imports 2025",
    sortDescFirst: true,
    meta: { width: "w-44" },
    cell: ({ row: { original: r } }) =>
      r.importsLabel ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-slate-900">{r.importsLabel}</span>
            <span className={`${mono.className} text-xs text-slate-400`}>#{r.rank}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100" aria-hidden>
            {/* Bar width is a runtime value (DESIGN_SYSTEM §10) */}
            <div className="h-1.5 rounded-full bg-teal-500" style={{ width: barWidth(Math.sqrt(r.imports ?? 0), maxImports, 2) }} />
          </div>
        </div>
      ) : (
        none
      ),
  },
  {
    id: "forcedLabor",
    accessorFn: (r) => r.forcedLaborPct ?? -1,
    header: "Forced-labor tariff",
    sortDescFirst: true,
    // Highest first, then A to Z (the whole comparison flips when sorting high to low)
    sortingFn: (a, b) => (a.original.forcedLaborPct ?? -1) - (b.original.forcedLaborPct ?? -1) || byName(b, a),
    cell: ({ row: { original: r } }) => {
      const capped = r.forcedLabor?.startsWith("Up to");
      return r.forcedLabor ? (
        <span className="whitespace-nowrap">
          {/* dutyTint() shades a rate by size, as totals are elsewhere */}
          <span className="inline-block rounded-md px-2 py-0.5 font-semibold text-slate-900" style={{ background: dutyTint(r.forcedLaborPct) }}>
            {capped ? `Up to ${r.forcedLaborPct}%` : r.forcedLabor}
          </span>
          {capped && <span className={`${caption} mt-0.5 block`}>incl. base rate</span>}
        </span>
      ) : (
        none
      );
    },
  },
  {
    id: "otherTariffs",
    header: "Country tariffs",
    enableSorting: false,
    cell: ({ row: { original: r } }) =>
      r.otherTariffs.length === 0 && !r.column2 && r.dealRates === 0 ? (
        none
      ) : (
        <div className="flex flex-col items-start gap-1">
          {r.otherTariffs.map((t) => (
            <span key={t.name} className="flex flex-wrap items-baseline gap-x-1.5">
              <span className={`${pill} bg-rose-50 text-rose-700 ring-rose-200`}>{t.name}</span>
              <span className={caption}>{t.detail}</span>
            </span>
          ))}
          {r.column2 && <span className={`${pill} bg-rose-50 text-rose-700 ring-rose-200`}>Column 2 Rates</span>}
          {r.dealRates > 0 && <span className={caption}>Own Section 232 rates on some products</span>}
        </div>
      ),
  },
  {
    id: "preferences",
    header: "Trade agreements",
    enableSorting: false,
    cell: ({ row: { original: r } }) =>
      r.preferences.length ? (
        <div className="flex flex-wrap gap-1">
          {r.preferences.map((p) => (
            <span key={p} className={`${pill} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
              {p}
            </span>
          ))}
        </div>
      ) : (
        none
      ),
  },
];

export function CountriesTable({ rows, asOf, asOfLabel }: { rows: HubRow[]; asOf: string; asOfLabel: string }) {
  const [filter, setFilter] = useState<Filter>("all");

  // Import bars on a square-root scale, so mid-size sources still show
  const maxImports = useMemo(() => Math.sqrt(Math.max(...rows.map((r) => r.imports ?? 0))), [rows]);
  const cols = useMemo(() => columns(maxImports), [maxImports]);
  // The quick filters overlap (a country can be in several), so they pick the rows the table gets
  const data = useMemo(() => rows.filter(FILTERS.find((f) => f.id === filter)!.test), [rows, filter]);

  // Biggest sources first until a heading is clicked
  const table = useDataTable<HubRow>({
    data,
    columns: cols,
    getRowId: (r) => r.code,
    searchText: (r) => `${r.name} ${r.code}`,
    initialSorting: [{ id: "imports", desc: true }],
  });

  return (
    <div>
      {/* The body scrolls under the sticky header; every row stays in the page */}
      <div className="max-h-screen overflow-auto">
        <DataTable
          table={table}
          label="US tariffs by country of origin"
          // Rows of several lines read from the top
          rowClassName={() => "[&>*]:align-top"}
          empty={<p className={`${mk.body} py-2 text-center`}>No country matches.</p>}
          toolbar={
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <TableSearch table={table} placeholder="Find a country" />
              <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 ${
                      filter === f.id
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {f.label} <span className={`tabular-nums ${filter === f.id ? "text-white/60" : "text-slate-400"}`}>{rows.filter(f.test).length}</span>
                  </button>
                ))}
              </div>
            </div>
          }
        />
      </div>
      {/* What the table shows, under its card */}
      <p className="mt-3 px-1 text-xs leading-relaxed text-slate-500">
        US tariffs by country of origin for goods entered <time dateTime={asOf}>{asOfLabel}</time>. Showing{" "}
        {table.getRowModel().rows.length} of {rows.length}. Section 232 applies to every country; trade agreements apply only to goods
        that meet their rules of origin. Imports: US Census Bureau, 2025.
      </p>
    </div>
  );
}
