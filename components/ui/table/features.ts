import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  metaHelper,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type Cell,
  type Column,
  type ColumnDef,
  type FilterFn,
  type Header,
  type Row,
  type RowData,
  type Table,
} from "@tanstack/react-table";
import type { TableColumnMeta } from "./meta";

// A column filtered by picking values: a row matches when it has any picked value (a column's
// value can be one string or a list, such as every tariff on an import)
export const facetFilter: FilterFn<any, any> = (row, columnId, picked: string[]) => {
  if (!picked?.length) return true;
  const value = row.getValue<string | string[]>(columnId);
  return (Array.isArray(value) ? value : [value]).some((v) => picked.includes(v));
};
facetFilter.autoRemove = (picked: string[] | undefined) => !picked?.length;

// What every table can do (TanStack Table registers only what's listed): sorting, column and
// global filters, facets with counts, row selection and column visibility. The sort functions are
// the ones a column's sorting picks by itself from its values.
export const features = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  columnFacetingFeature,
  rowSelectionFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime, basic: sortFn_basic },
  // Picking values from a menu (FacetFilter)
  filterFns: { facet: facetFilter },
  columnMeta: metaHelper<TableColumnMeta>(),
});

export type Features = typeof features;

// The TanStack types for our tables, with their features filled in
export type TableColumnDef<T extends RowData, V = any> = ColumnDef<Features, T, V>;
export type DataTableInstance<T extends RowData> = Table<Features, T>;
export type TableRow<T extends RowData> = Row<Features, T>;
export type TableColumn<T extends RowData, V = unknown> = Column<Features, T, V>;
export type TableHeader<T extends RowData, V = unknown> = Header<Features, T, V>;
export type TableCell<T extends RowData, V = unknown> = Cell<Features, T, V>;
