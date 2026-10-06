"use client";

import { useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { activeFilters, CATALOG_FILTERS, CatalogFilter, filterOptions } from "./filters";
import { TrackedProduct } from "./report";
import { useTracker } from "./TrackerContext";

// The catalog's filters: a menu for each, the picked values as chips, and how many products
// are showing. Driven entirely by CATALOG_FILTERS.

// Long lists get a search box
const SEARCH_FROM = 8;

const FilterMenu = ({ filter, products }: { filter: CatalogFilter; products: TrackedProduct[] }) => {
  const { filters, setFilter, filterContext } = useTracker();
  const [query, setQuery] = useState("");
  const picked = filters[filter.id] ?? [];
  const options = useMemo(
    () => filterOptions(filter, products, filters, filterContext),
    [filter, products, filters, filterContext]
  );
  const present = picked.filter((v) => options.some((o) => o.value === v));
  const q = query.trim().toLowerCase();
  const shown = q
    ? options.filter((o) => `${o.label} ${o.value} ${o.detail ?? ""}`.toLowerCase().includes(q))
    : options;

  const toggle = (value: string) =>
    setFilter(filter.id, picked.includes(value) ? picked.filter((v) => v !== value) : [...picked, value]);

  return (
    <Popover className="relative">
      <Popover.Button
        className={`${ui.button({ size: "sm" })} ${present.length ? "border-primary/40 text-primary" : ""}`}
      >
        {filter.label}
        {present.length > 0 && (
          <span className="rounded bg-primary/10 px-1.5 text-xs font-semibold tabular-nums">{present.length}</span>
        )}
        <ChevronDownIcon className="-mr-1 h-4 w-4 text-base-content/60" aria-hidden />
      </Popover.Button>
      <Popover.Panel className={`${ui.popover} absolute left-0 z-30 mt-2 flex w-80 flex-col gap-1`}>
        {options.length >= SEARCH_FROM && (
          <label className={`${ui.inputSm} mb-1 flex items-center gap-2`}>
            <MagnifyingGlassIcon className="h-4 w-4 text-base-content/60" aria-hidden />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              placeholder={`Search ${filter.label.toLowerCase()}`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={`Search ${filter.label.toLowerCase()}`}
            />
          </label>
        )}
        <ul className="flex max-h-72 flex-col overflow-y-auto" role="group" aria-label={filter.label}>
          {shown.map((o) => (
            <li key={o.value}>
              <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-base-200">
                <input
                  type="checkbox"
                  className={ui.checkbox}
                  checked={picked.includes(o.value)}
                  onChange={() => toggle(o.value)}
                />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-center gap-1.5 text-sm text-base-content">
                    {o.icon && <span aria-hidden>{o.icon}</span>}
                    <span className="truncate">{o.label}</span>
                  </span>
                  {o.detail && <span className="line-clamp-2 text-xs leading-snug text-base-content/60">{o.detail}</span>}
                </span>
                <span className="text-xs tabular-nums text-base-content/60">{o.count}</span>
              </label>
            </li>
          ))}
          {shown.length === 0 && <li className={`${ui.caption} px-2 py-1.5`}>Nothing matches “{query}”</li>}
        </ul>
        {present.length > 0 && (
          <button
            type="button"
            className={`${ui.link} mt-1 self-start px-2 text-xs`}
            onClick={() => setFilter(filter.id, [])}
          >
            Clear {filter.label.toLowerCase()}
          </button>
        )}
      </Popover.Panel>
    </Popover>
  );
};

export const FilterBar = ({ products, showing }: { products: TrackedProduct[]; showing: number }) => {
  const { filters, setFilter, clearFilters, filterContext } = useTracker();
  const active = activeFilters(products, filters);

  // A chip for every picked value, labeled the way its filter describes it
  const chips = active.flatMap(({ filter, picked }) => {
    const options = filterOptions(filter, products, filters, filterContext);
    return picked.map((value) => {
      const option = options.find((o) => o.value === value);
      return { filter, value, label: option ? `${option.icon ? `${option.icon} ` : ""}${option.label}` : value };
    });
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {CATALOG_FILTERS.map((filter) => (
          <FilterMenu key={filter.id} filter={filter} products={products} />
        ))}
        <span className="ml-auto text-sm text-base-content/70 tabular-nums" aria-live="polite">
          {chips.length > 0
            ? `Showing ${showing} of ${products.length} products`
            : `${products.length} ${products.length === 1 ? "product" : "products"}`}
        </span>
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map(({ filter, value, label }) => (
            <button
              key={`${filter.id}:${value}`}
              type="button"
              className={`${ui.badge("primary")} gap-1 hover:bg-primary/20`}
              onClick={() => setFilter(filter.id, (filters[filter.id] ?? []).filter((v) => v !== value))}
              aria-label={`Remove ${filter.label}: ${label}`}
            >
              {label}
              <XMarkIcon className="h-3 w-3" aria-hidden />
            </button>
          ))}
          <button type="button" className={`${ui.link} ml-1 text-xs`} onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};
