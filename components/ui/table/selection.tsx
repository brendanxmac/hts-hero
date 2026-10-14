"use client";

import { ReactNode, useEffect, useRef } from "react";
import { ColumnDef, Row, Table } from "@tanstack/react-table";
import * as ui from "@/components/ui/styles";

// Picking rows for a bulk action: a checkbox column (the header picks every row the filters
// let through) and the bar that says how many are picked and holds the actions for them.

const Checkbox = ({ checked, indeterminate = false, onChange, label }: { checked: boolean; indeterminate?: boolean; onChange: () => void; label: string }) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" className={ui.checkbox} checked={checked} onChange={onChange} aria-label={label} />;
};

export const selectColumn = <T,>(rowLabel: (row: T) => string): ColumnDef<T, unknown> => ({
  id: "select",
  enableSorting: false,
  meta: { width: "w-10" },
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllRowsSelected()}
      indeterminate={table.getIsSomeRowsSelected()}
      onChange={() => table.toggleAllRowsSelected()}
      label="Select every row shown"
    />
  ),
  cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onChange={() => row.toggleSelected()} label={`Select ${rowLabel(row.original)}`} />,
});

export const SelectionBar = <T,>({ table, children }: { table: Table<T>; children: (rows: Row<T>[]) => ReactNode }) => {
  // Only the picked rows still showing: a search or filter that hides one takes it out of the action
  const rows = table.getFilteredSelectedRowModel().rows;
  if (!rows.length) return null;
  return (
    <div role="region" aria-label="Selected rows" className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2.5">
      <span className="text-sm font-semibold text-base-content">
        {rows.length.toLocaleString("en-US")} selected
      </span>
      <div className="flex flex-wrap items-center gap-2">{children(rows)}</div>
      <button type="button" className={`${ui.link} ml-auto text-xs`} onClick={() => table.resetRowSelection()}>
        Clear selection
      </button>
    </div>
  );
};
