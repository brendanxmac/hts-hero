"use client";

import { useMemo, useState } from "react";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as mk from "@/components/ui/marketing/styles";
import { dutyTint } from "../country/dutyTint";

// Every country of origin and what its goods face. All rows render on the server, so the whole
// table is in the page's HTML; searching, filtering and sorting only rearrange it. The body
// scrolls under a sticky header so the page stays short.

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

type Sort = "imports" | "name" | "forcedLabor";
type Filter = "all" | "forcedLabor" | "specific" | "agreements" | "none";

const FILTERS: { id: Filter; label: string; test: (r: HubRow) => boolean }[] = [
  { id: "all", label: "All", test: () => true },
  { id: "forcedLabor", label: "Forced-labor tariff", test: (r) => r.forcedLabor !== null },
  { id: "specific", label: "Own tariffs or Column 2 Rates", test: (r) => r.otherTariffs.length > 0 || r.column2 },
  { id: "agreements", label: "Trade agreement", test: (r) => r.preferences.length > 0 },
  { id: "none", label: "No added tariff", test: (r) => !r.forcedLabor && r.otherTariffs.length === 0 && !r.column2 },
];

const SORTS: Record<Sort, (a: HubRow, b: HubRow) => number> = {
  imports: (a, b) => (b.imports ?? -1) - (a.imports ?? -1),
  name: (a, b) => a.name.localeCompare(b.name),
  forcedLabor: (a, b) => (b.forcedLaborPct ?? -1) - (a.forcedLaborPct ?? -1) || a.name.localeCompare(b.name),
};

const th =
  "sticky top-0 z-10 border-b border-slate-200 bg-slate-50 px-3 py-3 text-left align-bottom text-xs font-semibold uppercase tracking-wider text-slate-500 first:pl-6 last:pr-6";
const td = "px-3 py-3 align-top first:pl-6 last:pr-6";
const none = <span className="text-slate-300">—</span>;
const pill = "inline-block rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset";
const caption = "text-xs text-slate-500";

export function CountriesTable({ rows, asOf, asOfLabel }: { rows: HubRow[]; asOf: string; asOfLabel: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("imports");

  // Import bars on a square-root scale, so mid-size sources still show
  const maxImports = useMemo(() => Math.sqrt(Math.max(...rows.map((r) => r.imports ?? 0))), [rows]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const test = FILTERS.find((f) => f.id === filter)!.test;
    return rows
      .filter((r) => test(r) && (!q || r.name.toLowerCase().includes(q) || r.code.toLowerCase() === q))
      .sort(SORTS[sort]);
  }, [rows, query, filter, sort]);

  const SortHeader = ({ id, label, className = "" }: { id: Sort; label: string; className?: string }) => (
    <th scope="col" className={`${th} ${className}`} aria-sort={sort === id ? (id === "name" ? "ascending" : "descending") : "none"}>
      <button type="button" className="inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-900" onClick={() => setSort(id)}>
        {label}
        <ChevronUpDownIcon className={`h-3.5 w-3.5 ${sort === id ? "text-teal-600" : "text-slate-400"}`} aria-hidden />
      </button>
    </th>
  );

  return (
    <div className={`${mk.card} overflow-hidden`}>
      <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full lg:max-w-xs">
          <span className="sr-only">Find a country</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a country"
            className={`${mk.input} h-10 pl-9 text-sm`}
          />
        </label>
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

      {/* The body scrolls under the sticky header; every row stays in the page */}
      <div className="max-h-screen overflow-auto">
        <table className="w-full text-sm tabular-nums">
          <caption className="caption-bottom border-t border-slate-200 bg-slate-50 px-6 py-3 text-left text-xs leading-relaxed text-slate-500">
            US tariffs by country of origin for goods entered <time dateTime={asOf}>{asOfLabel}</time>. Showing{" "}
            {shown.length} of {rows.length}. Section 232 applies to every country; trade agreements apply only to goods
            that meet their rules of origin. Imports: US Census Bureau, 2025.
          </caption>
          <thead>
            <tr>
              <SortHeader id="name" label="Country" />
              <SortHeader id="imports" label="US imports 2025" />
              <SortHeader id="forcedLabor" label="Forced-labor tariff" />
              <th scope="col" className={th}>Country tariffs</th>
              <th scope="col" className={th}>Trade agreements</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const capped = r.forcedLabor?.startsWith("Up to");
              return (
                <tr key={r.code} className="border-t border-slate-100 transition-colors first:border-t-0 hover:bg-slate-50/70">
                  <th scope="row" className={`${td} whitespace-nowrap text-left font-semibold text-slate-900`}>
                    <span aria-hidden="true" className="mr-2">{r.flag}</span>
                    {r.name}
                  </th>
                  <td className={`${td} w-44`}>
                    {r.importsLabel ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-slate-900">{r.importsLabel}</span>
                          <span className={`${mono.className} text-xs text-slate-400`}>#{r.rank}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100" aria-hidden>
                          {/* Bar width is a runtime value (DESIGN_SYSTEM §10) */}
                          <div
                            className="h-1.5 rounded-full bg-teal-500"
                            style={{ width: `${Math.max(2, (Math.sqrt(r.imports ?? 0) / maxImports) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      none
                    )}
                  </td>
                  <td className={`${td} whitespace-nowrap`}>
                    {r.forcedLabor ? (
                      <>
                        {/* dutyTint() shades a rate by size, as totals are elsewhere */}
                        <span className="inline-block rounded-md px-2 py-0.5 font-semibold text-slate-900" style={{ background: dutyTint(r.forcedLaborPct) }}>
                          {capped ? `Up to ${r.forcedLaborPct}%` : r.forcedLabor}
                        </span>
                        {capped && <span className={`${caption} mt-0.5 block`}>incl. base rate</span>}
                      </>
                    ) : (
                      none
                    )}
                  </td>
                  <td className={td}>
                    {r.otherTariffs.length === 0 && !r.column2 && r.dealRates === 0 ? (
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
                    )}
                  </td>
                  <td className={td}>
                    {r.preferences.length ? (
                      <div className="flex flex-wrap gap-1">
                        {r.preferences.map((p) => (
                          <span key={p} className={`${pill} bg-emerald-50 text-emerald-700 ring-emerald-200`}>
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      none
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shown.length === 0 && <p className={`${mk.body} px-6 py-10 text-center`}>No country matches.</p>}
      </div>
    </div>
  );
}
