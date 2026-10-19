"use client";

import { useMemo, useRef, useState } from "react";
import {
  ColumnFiltersState,
  FilterFn,
  OnChangeFn,
  RowData,
  RowSelectionState,
  SortingState,
  useTable,
  ColumnVisibilityState,
} from "@tanstack/react-table";
import { facetFilter, features, type Features, type TableColumnDef } from "./features";

export { facetFilter };

// Every table's engine: TanStack Table (sorting, column and global filters, facets with counts,
// row selection, column visibility), set up the same way everywhere. Our components draw it
// (DataTable, TableSearch, FacetFilter, FilterChips, SelectionBar). Any part of the state can be
// owned by the host (to keep filters while moving between tabs, say); the rest lives here.

// A filter's picked values that no row has any more are dropped (a value whose last row was
// removed while the filter stayed set), so a stale pick never hides every row
export const pruneColumnFilters = <T extends RowData>(filters: ColumnFiltersState, columns: TableColumnDef<T>[], data: T[]): ColumnFiltersState =>
  filters
    .map((f) => {
      if (!Array.isArray(f.value)) return f;
      const def = columns.find((c) => c.id === f.id) as (TableColumnDef<T> & { accessorFn?: (row: T, i: number) => unknown; getUniqueValues?: (row: T, i: number) => unknown[] }) | undefined;
      const read = def?.getUniqueValues ?? def?.accessorFn;
      if (!read) return f;
      const present = new Set(data.flatMap((row, i) => {
        const v = read(row, i);
        return (Array.isArray(v) ? v : [v]).map(String);
      }));
      return { ...f, value: (f.value as string[]).filter((v) => present.has(v)) };
    })
    .filter((f) => !Array.isArray(f.value) || (f.value as string[]).length > 0);

// "6110.20.20" and "6110 20 20" find 61102020; any case
export const normalizeSearch = (text: string) => text.toLowerCase().replace(/[.\s-]+/g, "");

export interface DataTableOptions<T extends RowData> {
  data: T[];
  columns: TableColumnDef<T>[];
  getRowId: (row: T) => string;
  // The text the search box looks through, per row (code, description, country…)
  searchText?: (row: T) => string;
  // The order before anyone clicks a heading (the data's own order when left out)
  initialSorting?: SortingState;
  // Host-owned state, when it should outlive the table
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  globalFilter?: string;
  onGlobalFilterChange?: OnChangeFn<string>;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  // Columns kept out of sight (still filterable: a facet with no column of its own)
  hidden?: string[];
  enableRowSelection?: boolean;
}

export const useDataTable = <T extends RowData>({
  data,
  columns,
  getRowId,
  searchText,
  hidden = [],
  enableRowSelection = false,
  initialSorting = [],
  ...controlled
}: DataTableOptions<T>) => {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columnVisibility = useMemo<ColumnVisibilityState>(() => Object.fromEntries(hidden.map((id) => [id, false])), [hidden]);

  // The one column the search runs on (TanStack searches per column, and only columns with a
  // value): the first such column, so it runs once per row
  const searchColumn = useRef<string>(undefined);
  // Each row's search text, worked out once per row object
  const searchCache = useMemo(() => new WeakMap<object, string>(), []);
  const matchesSearch: FilterFn<Features, T> = (row, _columnId, query: string) => {
    if (!searchText || !query) return true;
    const original = row.original as object;
    let text = searchCache.get(original);
    if (text === undefined) {
      text = normalizeSearch(searchText(row.original));
      searchCache.set(original, text);
    }
    // Each typed word on its own (normalizing first would run them together)
    return query
      .split(/\s+/)
      .map(normalizeSearch)
      .every((word) => text!.includes(word));
  };

  const ownedFilters = controlled.columnFilters ?? columnFilters;
  const effectiveFilters = useMemo(() => pruneColumnFilters(ownedFilters, columns, data), [ownedFilters, columns, data]);

  return useTable<Features, T>({
    features,
    data,
    columns,
    getRowId,
    state: {
      sorting: controlled.sorting ?? sorting,
      columnFilters: effectiveFilters,
      globalFilter: controlled.globalFilter ?? globalFilter,
      rowSelection: controlled.rowSelection ?? rowSelection,
      columnVisibility,
    },
    onSortingChange: controlled.onSortingChange ?? setSorting,
    onColumnFiltersChange: controlled.onColumnFiltersChange ?? setColumnFilters,
    onGlobalFilterChange: controlled.onGlobalFilterChange ?? setGlobalFilter,
    onRowSelectionChange: controlled.onRowSelectionChange ?? setRowSelection,
    enableRowSelection,
    globalFilterFn: matchesSearch,
    getColumnCanGlobalFilter: (column) => {
      if (!column.accessorFn) return false;
      searchColumn.current ??= column.id;
      return column.id === searchColumn.current;
    },
    // Sorting starts from the most first for numbers, A to Z for text
    sortDescFirst: false,
  });
};
