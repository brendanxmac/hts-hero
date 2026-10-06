"use client";

import { useMemo, useState } from "react";
import { ChevronUpDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { ChartCaption } from "@/components/duty-calculator/country-rate-charts/ChartCaption";
import * as ui from "@/components/ui/styles";
import { formatRate } from "../../formatRate";
import { BASE_PART, shortProgram } from "../../report";
import { OriginRate, partsOf, RateBasis, rateOf } from "./analysis";

// Every origin's rate, searchable and sortable: a bar on one scale (its tariffs stacked, like
// the other charts), the rate, the rate with a trade agreement, the difference from the
// product's own origin, and the tariffs behind it. Full height; the heading row stays in view.

type Sort = "rate" | "name" | "agreement";

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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("rate");
  const yours = rates.find((r) => r.isOrigin);
  const yourPct = yours ? rateOf(yours, basis) : 0;
  // One scale for both bases, so switching shows bars shrinking rather than a rescale
  const top = Math.max(...rates.map((r) => rateOf(r, "standard")), 1);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? rates.filter((r) => r.country.name.toLowerCase().includes(q) || r.country.code.toLowerCase() === q)
      : rates.slice();
    const by: Record<Sort, (a: OriginRate, b: OriginRate) => number> = {
      rate: (a, b) => rateOf(a, basis) - rateOf(b, basis) || a.country.name.localeCompare(b.country.name),
      name: (a, b) => a.country.name.localeCompare(b.country.name),
      agreement: (a, b) =>
        Number(Boolean(b.agreement)) - Number(Boolean(a.agreement)) || rateOf(a, basis) - rateOf(b, basis),
    };
    return list.sort(by[sort]);
  }, [rates, basis, query, sort]);

  const SortHeader = ({ id, label, className = "" }: { id: Sort; label: string; className?: string }) => (
    <th scope="col" className={`${ui.label} px-3 py-2 ${className}`} aria-sort={sort === id ? "ascending" : "none"}>
      <button type="button" className="inline-flex items-center gap-1 hover:text-base-content" onClick={() => setSort(id)}>
        {label}
        <ChevronUpDownIcon className={`h-3.5 w-3.5 ${sort === id ? "text-primary" : ""}`} aria-hidden />
      </button>
    </th>
  );

  return (
    // Visible overflow, so the heading row can stick to the page's scroll area
    <figure className={`${ui.cardOverflowVisible} m-0`}>
      <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <ChartCaption
          title="All origins"
          action={
            // The input style is full width; this sets the width
            <div className="w-60 shrink-0">
              <label className={`${ui.inputSm} flex items-center gap-2`}>
                <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" aria-hidden />
                <input
                  className="min-w-0 flex-1 bg-transparent outline-none"
                  placeholder="Find a country"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Find a country"
                />
              </label>
            </div>
          }
        >
          {rates.length} countries. Select one to compare it with yours.
        </ChartCaption>
      </div>
      <div className="border-t border-base-300">
        <table className="w-full text-sm tabular-nums">
          <thead className="sticky top-0 z-10 bg-base-200">
            <tr className="text-left">
              <SortHeader id="name" label="Country" className="pl-5 sm:pl-6" />
              <th scope="col" className="w-[30%] px-3 py-2">
                <span className="sr-only">Rate, as a bar</span>
              </th>
              <SortHeader id="rate" label="Rate" className="text-right" />
              <SortHeader id="agreement" label="Trade agreement" />
              <th scope="col" className={`${ui.label} px-3 py-2 text-right`}>
                Vs yours
              </th>
              <th scope="col" className={`${ui.label} px-3 py-2 pr-5 sm:pr-6`}>
                Tariffs
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const pct = rateOf(r, basis);
              const diff = pct - yourPct;
              return (
                <tr
                  key={r.country.code}
                  className={`cursor-pointer border-t border-base-300 transition-colors hover:bg-base-200 ${
                    r.isOrigin ? "bg-primary/5" : selected === r.country.code ? "bg-success/10" : ""
                  }`}
                  onClick={() => onSelect(r.country.code)}
                >
                  <th scope="row" className="whitespace-nowrap px-3 py-2 pl-5 text-left font-normal sm:pl-6">
                    <button type="button" className="inline-flex items-center gap-2 text-base-content hover:text-primary">
                      <span aria-hidden>{r.country.flag}</span>
                      {r.country.name}
                      {r.isOrigin && <span className={ui.badge("primary")}>Yours</span>}
                    </button>
                  </th>
                  <td className="px-3 py-2" aria-hidden>
                    <span className="flex h-2.5 w-full overflow-hidden rounded-r bg-transparent">
                      <span
                        className="flex h-full motion-safe:transition-[width] motion-safe:duration-500"
                        style={{ width: `${(pct / top) * 100}%` }}
                      >
                        {partsOf(r, basis).map((p) => (
                          <span
                            key={p.key}
                            className={`h-full ${r.isOrigin || selected === r.country.code ? "" : "opacity-80"}`}
                            style={{ width: `${pct ? (p.pct / pct) * 100 : 0}%`, background: colors[p.key] }}
                          />
                        ))}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">{formatRate(pct)}</td>
                  <td className="px-3 py-2 text-base-content/70">
                    {r.agreement ? (
                      <span className="text-success" title={r.agreement.name}>
                        {formatRate(r.agreement.pct)} · {r.agreement.symbol}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td
                    className={`px-3 py-2 text-right ${
                      r.isOrigin || Math.abs(diff) <= 0.005 ? "text-base-content/50" : diff < 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {r.isOrigin ? "—" : Math.abs(diff) <= 0.005 ? "Same" : `${diff < 0 ? "−" : "+"}${formatRate(Math.abs(diff))}`}
                  </td>
                  <td className="px-3 py-2 pr-5 sm:pr-6">
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
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className={`${ui.caption} px-6 py-4`}>
                  No country matches “{query}”
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </figure>
  );
};
