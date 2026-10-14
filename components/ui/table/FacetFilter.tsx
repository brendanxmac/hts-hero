"use client";

import "./meta";
import { useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Column } from "@tanstack/react-table";
import * as ui from "@/components/ui/styles";
import { FacetOption } from "./meta";

// A filter by one column's values (its meta.facet): a menu of every value with how many rows have
// it, counted against the other filters and the search (TanStack's faceted values), checkboxes to
// pick some, and a search box when the list is long. Picking several shows rows with any of them.

const SEARCH_FROM = 8;

export const facetOptions = <T,>(column: Column<T, unknown>) => {
  const facet = column.columnDef.meta?.facet;
  const counts = column.getFacetedUniqueValues();
  const options = Array.from(counts.entries())
    .filter(([value]) => value !== undefined && value !== null && value !== "")
    .map(([value, count]) => {
      const v = String(value);
      return { value: v, count: count as number, option: facet?.describe?.(v) ?? ({ label: v } as FacetOption) };
    });
  return options.sort(facet?.compare ?? ((a, b) => a.option.label.localeCompare(b.option.label)));
};

export const FacetFilter = <T,>({ column }: { column: Column<T, unknown> }) => {
  const facet = column.columnDef.meta?.facet;
  const [query, setQuery] = useState("");
  const picked = (column.getFilterValue() as string[] | undefined) ?? [];
  const facetCounts = column.getFacetedUniqueValues();
  const options = useMemo(() => facetOptions(column), [column, facetCounts]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!facet) return null;
  const q = query.trim().toLowerCase();
  const shown = q ? options.filter((o) => `${o.option.label} ${o.value} ${o.option.detail ?? ""}`.toLowerCase().includes(q)) : options;
  const toggle = (value: string) => {
    const next = picked.includes(value) ? picked.filter((v) => v !== value) : [...picked, value];
    column.setFilterValue(next.length ? next : undefined);
  };

  return (
    <Popover className="relative">
      {/* Inside the Tracker: an outline pill, cobalt-tinted while it filters */}
      <Popover.Button
        className={`${ui.button({ size: "sm" })} tracker:h-9 tracker:rounded-full tracker:border-base-300 tracker:px-3.5 tracker:font-semibold tracker:shadow-none tracker:hover:bg-tt-soft ${
          picked.length ? "border-primary/40 text-primary tracker:border-primary/30 tracker:bg-primary/10 tracker:hover:bg-primary/15" : ""
        }`}
      >
        {facet.label}
        {picked.length > 0 && <span className="rounded bg-primary/10 px-1.5 text-xs font-semibold tabular-nums tracker:rounded-full tracker:bg-primary tracker:text-primary-content">{picked.length}</span>}
        <ChevronDownIcon className="-mr-1 h-4 w-4 text-base-content/60" aria-hidden />
      </Popover.Button>
      <Popover.Panel className={`${ui.popover} absolute left-0 z-30 mt-2 flex w-80 flex-col gap-1 tracker:rounded-2xl tracker:p-2`}>
        {options.length >= SEARCH_FROM && (
          <label className={`${ui.inputSm} mb-1 flex items-center gap-2 tracker:rounded-xl tracker:border-transparent tracker:bg-tt-soft tracker:shadow-none`}>
            <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" aria-hidden />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder={`Search ${facet.label.toLowerCase()}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${facet.label.toLowerCase()}`}
            />
          </label>
        )}
        <ul className="flex max-h-72 flex-col overflow-y-auto" role="group" aria-label={facet.label}>
          {shown.map((o) => (
            <li key={o.value}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-base-200 tracker:rounded-xl tracker:px-2.5 tracker:py-2 tracker:hover:bg-tt-soft">
                <input type="checkbox" className={ui.checkbox} checked={picked.includes(o.value)} onChange={() => toggle(o.value)} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-sm text-base-content">
                    {o.option.icon && <span aria-hidden>{o.option.icon}</span>}
                    <span className="truncate">{o.option.label}</span>
                  </span>
                  {o.option.detail && <span className="line-clamp-2 text-xs leading-snug text-base-content/60">{o.option.detail}</span>}
                </span>
                <span className="text-xs tabular-nums text-base-content/60">{o.count}</span>
              </label>
            </li>
          ))}
          {shown.length === 0 && <li className={`${ui.caption} px-2 py-1.5`}>Nothing matches “{query}”</li>}
        </ul>
        {picked.length > 0 && (
          <button type="button" className={`${ui.link} mt-1 self-start px-2 text-xs`} onClick={() => column.setFilterValue(undefined)}>
            Clear {facet.label.toLowerCase()}
          </button>
        )}
      </Popover.Panel>
    </Popover>
  );
};
