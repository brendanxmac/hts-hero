import type { FilterFn, RowData } from "@tanstack/react-table";

// What our tables add to a TanStack column definition, under `meta`: how a column lines up, how
// wide it is, and, for a column people can filter by, how its values read in the filter menu.

export interface FacetOption {
  label: string;
  // A flag or other mark before the label
  icon?: string;
  // A second line, such as a chapter's description
  detail?: string;
}

export interface FacetMeta {
  // On the filter's button and its chips
  label: string;
  // How a value is shown; the value itself when left out
  describe?: (value: string) => FacetOption;
  // The order options are listed in; by label when left out
  compare?: (a: { value: string; option: FacetOption }, b: { value: string; option: FacetOption }) => number;
}

declare module "@tanstack/react-table" {
  // Picking values from a menu (FacetFilter): registered on every table by useDataTable
  interface FilterFns {
    facet: FilterFn<unknown>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: "left" | "right" | "center";
    // A Tailwind width for the column ("w-12", "w-[28%]")
    width?: string;
    // People can filter by it, with a menu of its values and how many rows have each
    facet?: FacetMeta;
    // Its cells are the row's heading (a <th scope="row">): the subject the row is about
    rowHeader?: boolean;
  }
}
