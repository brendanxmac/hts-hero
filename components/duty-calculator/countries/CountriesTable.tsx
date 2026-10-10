"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";

// Every country of origin and what its goods face. All rows render on the server, so the whole
// table is in the page's HTML; searching, filtering and sorting only rearrange it.

export interface HubRow {
  code: string;
  name: string;
  flag: string;
  slug: string | null;
  imports: number | null; // millions of USD, for sorting
  importsLabel: string | null; // "$194 billion"
  rank: number | null;
  forcedLabor: string | null;
  forcedLaborPct: number | null;
  otherTariffs: string[]; // "Section 301 – China: 7.5% to 100% on listed products"
  dealRates: number;
  preferences: string[];
  column2: boolean;
}

type Sort = "imports" | "name" | "forcedLabor";
type Filter = "all" | "forcedLabor" | "specific" | "agreements" | "none";

const FILTERS: { id: Filter; label: string; test: (r: HubRow) => boolean }[] = [
  { id: "all", label: "All countries", test: () => true },
  { id: "forcedLabor", label: "Forced-labor tariff", test: (r) => r.forcedLabor !== null },
  { id: "specific", label: "Country tariffs or Column 2", test: (r) => r.otherTariffs.length > 0 || r.column2 },
  { id: "agreements", label: "Trade agreement", test: (r) => r.preferences.length > 0 },
  { id: "none", label: "No added tariff", test: (r) => !r.forcedLabor && r.otherTariffs.length === 0 && !r.column2 },
];

const SORTS: Record<Sort, (a: HubRow, b: HubRow) => number> = {
  imports: (a, b) => (b.imports ?? -1) - (a.imports ?? -1),
  name: (a, b) => a.name.localeCompare(b.name),
  forcedLabor: (a, b) => (b.forcedLaborPct ?? -1) - (a.forcedLaborPct ?? -1) || a.name.localeCompare(b.name),
};

const th = `${ui.label} px-4 py-3 text-left align-bottom first:pl-5 last:pr-5`;
const td = "px-4 py-3 align-top first:pl-5 last:pr-5";

export function CountriesTable({ rows, asOf, asOfLabel }: { rows: HubRow[]; asOf: string; asOfLabel: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("imports");

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
      <div className="flex flex-col gap-3 border-b border-base-300 bg-base-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative w-full max-w-xs">
          <span className="sr-only">Find a country</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a country"
            className={`${ui.input} w-full pl-9`}
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Show">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-base-300 text-base-content/70 hover:border-primary/40 hover:text-primary"
              }`}
            >
              {f.label} <span className="text-base-content/50">{rows.filter(f.test).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <caption className={`${ui.caption} px-5 py-2 text-left`}>
            US tariffs by country of origin, for goods entered <time dateTime={asOf}>{asOfLabel}</time>. Imports: US Census
            Bureau, 2025.
          </caption>
          <thead>
            <tr className="border-b border-base-300">
              <SortHeader id="name" label="Country" />
              <SortHeader id="imports" label="US imports, 2025" className="text-right" />
              <SortHeader id="forcedLabor" label="Section 301 forced labor" />
              <th scope="col" className={th}>Other country tariffs</th>
              <th scope="col" className={th}>Trade agreements</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.code} id={r.code.toLowerCase()} className="scroll-mt-6 border-t border-base-300 hover:bg-base-200/60">
                <th scope="row" className={`${td} whitespace-nowrap text-left font-medium`}>
                  {/* A country with its own page links there; others open the calculator set to
                      that country, which canonicalizes to /duty-calculator, so nofollow */}
                  {r.slug ? (
                    <Link href={`/duty-calculator/${r.slug}`} className="text-base-content hover:text-primary hover:underline">
                      <span aria-hidden="true" className="mr-2">{r.flag}</span>
                      {r.name}
                    </Link>
                  ) : (
                    <Link href={`/duty-calculator?country=${r.code}`} rel="nofollow" className="text-base-content hover:text-primary hover:underline">
                      <span aria-hidden="true" className="mr-2">{r.flag}</span>
                      {r.name}
                    </Link>
                  )}
                </th>
                <td className={`${td} whitespace-nowrap text-right`}>
                  {r.importsLabel ? (
                    <>
                      <span className="text-base-content">{r.importsLabel}</span>
                      {r.rank && <span className="block text-xs text-base-content/60">#{r.rank}</span>}
                    </>
                  ) : (
                    <span className="text-base-content/50">–</span>
                  )}
                </td>
                <td className={`${td} text-base-content/80`}>{r.forcedLabor ?? <span className="text-base-content/50">None</span>}</td>
                <td className={`${td} text-base-content/80`}>
                  {r.otherTariffs.length === 0 && !r.column2 && r.dealRates === 0 ? (
                    <span className="text-base-content/50">None</span>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {r.otherTariffs.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                      {r.column2 && <li>Column 2 base rates</li>}
                      {r.dealRates > 0 && <li className="text-base-content/60">Own Section 232 rates ({r.dealRates})</li>}
                    </ul>
                  )}
                </td>
                <td className={`${td} text-base-content/80`}>
                  {r.preferences.length ? r.preferences.join(", ") : <span className="text-base-content/50">None</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <p className={`${ui.body} px-5 py-8 text-center`}>No country matches.</p>}
      </div>

      <p className={`${ui.cardFooter} ${ui.caption}`}>
        Showing {shown.length} of {rows.length}. Section 232 tariffs on metals, autos, wood, pharmaceuticals and other
        products apply to goods from every country; &ldquo;Own Section 232 rates&rdquo; counts a country&rsquo;s deal
        headings. Trade agreements apply only to goods that meet their rules of origin.
      </p>
    </div>
  );
}
