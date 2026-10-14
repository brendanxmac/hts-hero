// The shared table (Oct 2026): TanStack Table for the logic (sorting, filters with counts, search,
// selection) and TanStack Virtual for long lists, drawn by our own components to the design
// system's Data table spec, so every table looks and behaves the same. Plain tables of a few
// fixed rows (a worked example, a blog table) don't need the engine.
//
// A table is useDataTable (data, columns, the row's id and search text, any state the host
// keeps) drawn by DataTable, with TableSearch, a FacetFilter per filterable column, FilterChips
// and, for bulk actions, selectColumn and SelectionBar around it.
export { DataTable } from "./DataTable";
export { FacetFilter, facetOptions } from "./FacetFilter";
export { FilterChips } from "./FilterChips";
export type { FacetMeta, FacetOption } from "./meta";
export { selectColumn, SelectionBar } from "./selection";
export { TableSearch } from "./TableSearch";
export { facetFilter, normalizeSearch, pruneColumnFilters, useDataTable } from "./useDataTable";
export type { DataTableOptions } from "./useDataTable";
