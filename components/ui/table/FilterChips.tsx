"use client";

import "./meta";
import { XMarkIcon } from "@heroicons/react/20/solid";
import type { DataTableInstance } from "./features";
import * as ui from "@/components/ui/styles";

// The picked filter values as chips (one click takes one off), the search as one more, and the
// way to clear them all. Nothing when no filter or search is on.
export const FilterChips = <T,>({ table }: { table: DataTableInstance<T> }) => {
  const search = (table.store.state.globalFilter as string) ?? "";
  const chips = table.store.state.columnFilters.flatMap((f) => {
    const column = table.getAllLeafColumns().find((c) => c.id === f.id);
    const facet = column?.columnDef.meta?.facet;
    if (!column || !facet || !Array.isArray(f.value)) return [];
    return (f.value as string[]).map((value) => {
      const option = facet.describe?.(value) ?? { label: value };
      return {
        key: `${f.id}:${value}`,
        label: `${option.icon ? `${option.icon} ` : ""}${option.label}`,
        title: `${facet.label}: ${option.label}`,
        remove: () => {
          const next = (f.value as string[]).filter((v) => v !== value);
          column.setFilterValue(next.length ? next : undefined);
        },
      };
    });
  });
  if (!chips.length && !search) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {search && (
        <button type="button" className={`${ui.badge("primary")} gap-1 hover:bg-primary/20 tracker:rounded-full tracker:px-2.5 tracker:py-1 tracker:font-semibold tracker:ring-0`} onClick={() => table.setGlobalFilter("")} aria-label={`Clear the search: ${search}`}>
          “{search}”
          <XMarkIcon className="h-3 w-3" aria-hidden />
        </button>
      )}
      {chips.map((c) => (
        <button key={c.key} type="button" className={`${ui.badge("primary")} gap-1 hover:bg-primary/20 tracker:rounded-full tracker:px-2.5 tracker:py-1 tracker:font-semibold tracker:ring-0`} onClick={c.remove} aria-label={`Remove ${c.title}`}>
          {c.label}
          <XMarkIcon className="h-3 w-3" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        className={`${ui.link} ml-1 text-xs`}
        onClick={() => {
          table.resetColumnFilters(true);
          table.setGlobalFilter("");
        }}
      >
        Clear all
      </button>
    </div>
  );
};
