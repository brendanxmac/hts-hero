"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/20/solid";
import type { DataTableInstance } from "./features";
import * as ui from "@/components/ui/styles";

// The table's search box: every word typed must appear in a row's search text (useDataTable's
// searchText), ignoring case, dots and spaces, so "6110.20" and "611020" both find 6110.20.20
export const TableSearch = <T,>({ table, placeholder }: { table: DataTableInstance<T>; placeholder: string }) => {
  const value = (table.store.state.globalFilter as string) ?? "";
  return (
    // Inside the Tracker: a soft pill on the panel
    <label className={`${ui.inputSm} flex w-full items-center gap-2 sm:w-72 tracker:h-9 tracker:rounded-full tracker:border-transparent tracker:bg-tt-soft tracker:px-3.5 tracker:shadow-none tracker:hover:border-base-300`}>
      <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-base-content/60" aria-hidden />
      <input
        type="search"
        className="min-w-0 flex-1 bg-transparent outline-hidden [&::-webkit-search-cancel-button]:hidden"
        placeholder={placeholder}
        aria-label={placeholder}
        value={value}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
      />
      {value && (
        <button type="button" className="rounded-sm text-base-content/60 hover:text-base-content" onClick={() => table.setGlobalFilter("")}>
          <XMarkIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Clear the search</span>
        </button>
      )}
    </label>
  );
};
