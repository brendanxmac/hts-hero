"use client";

import { useMemo, useState } from "react";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { heat, PRIMARY_MARK } from "@/components/ui/theme";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";

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

const th = `${ui.label} sticky top-0 z-10 bg-base-200 px-3 py-2.5 text-left align-bottom first:pl-5 last:pr-5`;
const td = "px-3 py-2.5 align-top first:pl-5 last:pr-5";
const none = <span className="text-base-content/60">—</span>;

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
      <button type="button" className="inline-flex items-center gap-1 uppercase hover:text-base-content" onClick={() => setSort(id)}>
        {label}
        <ChevronUpDownIcon className={`h-3.5 w-3.5 ${sort === id ? "text-primary" : ""}`} aria-hidden />
      </button>
    </th>
  );

  return (
    <div className={ui.card}>
      <div className={`${ui.cardHeader} flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between`}>
        <label className="relative w-full lg:max-w-xs">
          <span className="sr-only">Find a country</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/60" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a country"
            className={`${ui.inputSm} w-full pl-9`}
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                filter === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-base-300 text-base-content/70 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {f.label} <span className="tabular-nums text-base-content/60">{rows.filter(f.test).length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* The body scrolls under the sticky header; every row stays in the page */}
      <div className="max-h-screen overflow-auto">
        <table className="w-full text-sm tabular-nums">
          <caption className={`${ui.caption} caption-bottom border-t border-base-300 bg-base-200 px-5 py-2.5 text-left`}>
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
                <tr key={r.code} className="border-t border-base-300 hover:bg-base-200/60">
                  <th scope="row" className={`${td} whitespace-nowrap text-left font-medium text-base-content`}>
                    <span aria-hidden="true" className="mr-2">{r.flag}</span>
                    {r.name}
                  </th>
                  <td className={`${td} w-44`}>
                    {r.importsLabel ? (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-base-content">{r.importsLabel}</span>
                          <span className={`${mono.className} text-xs text-base-content/60`}>#{r.rank}</span>
                        </div>
                        <div className="h-1 w-full rounded-full bg-base-300" aria-hidden>
                          {/* Bar width is a runtime value (DESIGN_SYSTEM §10) */}
                          <div
                            className="h-1 rounded-full"
                            style={{ width: `${Math.max(2, (Math.sqrt(r.imports ?? 0) / maxImports) * 100)}%`, background: PRIMARY_MARK }}
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
                        {/* heat() shades a rate by size, as totals are elsewhere */}
                        <span className="inline-block rounded px-2 py-0.5 font-semibold text-base-content" style={{ background: heat(r.forcedLaborPct) }}>
                          {capped ? `Up to ${r.forcedLaborPct}%` : r.forcedLabor}
                        </span>
                        {capped && <span className={`${ui.caption} block mt-0.5`}>incl. base rate</span>}
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
                            <span className={ui.badge("error")}>{t.name}</span>
                            <span className={ui.caption}>{t.detail}</span>
                          </span>
                        ))}
                        {r.column2 && <span className={ui.badge("error")}>Column 2 Rates</span>}
                        {r.dealRates > 0 && <span className={ui.caption}>Own Section 232 rates on some products</span>}
                      </div>
                    )}
                  </td>
                  <td className={td}>
                    {r.preferences.length ? (
                      <div className="flex flex-wrap gap-1">
                        {r.preferences.map((p) => (
                          <span key={p} className={ui.badge("success")}>
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
        {shown.length === 0 && <p className={`${ui.body} px-5 py-8 text-center`}>No country matches.</p>}
      </div>
    </div>
  );
}
