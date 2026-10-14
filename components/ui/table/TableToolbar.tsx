"use client";

import "./meta";
import { ReactNode } from "react";
import { Table } from "@tanstack/react-table";
import { FacetFilter } from "./FacetFilter";
import { FilterChips } from "./FilterChips";
import { TableSearch } from "./TableSearch";

// The usual top of a table, for DataTable's `toolbar`: the search, a filter per facet column,
// how many rows are showing ("Showing 4 of 12" while filtered), then the picked filters as chips.
// `children` go after the chips (a SelectionBar).
export const TableToolbar = <T,>({
  table,
  placeholder,
  facets = [],
  noun,
  actions,
  children,
}: {
  table: Table<T>;
  // The search box's placeholder; no search box without one
  placeholder?: string;
  // Column ids to filter by, in order
  facets?: string[];
  // What a row is: ["import", "imports"]
  noun: [string, string];
  // Beside the count, at the right
  actions?: ReactNode;
  children?: ReactNode;
}) => {
  const total = table.getCoreRowModel().rows.length;
  const shown = table.getRowModel().rows.length;
  const count = (n: number) => n.toLocaleString("en-US");
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {placeholder && <TableSearch table={table} placeholder={placeholder} />}
        {facets.map((id) => {
          const column = table.getColumn(id);
          return column ? <FacetFilter key={id} column={column} /> : null;
        })}
        <span className="ml-auto text-sm font-semibold tabular-nums text-base-content/60" aria-live="polite">
          {shown < total ? `Showing ${count(shown)} of ${count(total)}` : `${count(total)} ${total === 1 ? noun[0] : noun[1]}`}
        </span>
        {actions}
      </div>
      <FilterChips table={table} />
      {children}
    </>
  );
};
