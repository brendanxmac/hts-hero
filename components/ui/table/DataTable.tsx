"use client";

import "./meta";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { flexRender, Header, Row, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as ui from "@/components/ui/styles";
import * as s from "./styles";

// Every data table, drawn the same way (DESIGN_SYSTEM.md "Data table"): a real <table> in a card,
// headers in small caps on the soft background, sortable ones as buttons with the direction shown
// (and aria-sort), rows ruled and lit on hover, numbers right-aligned, the row's subject as its
// heading. A row can open something (onRowClick); a modified click on a link inside it still
// opens a tab. Past `virtualizeFrom` rows only the rows in view are drawn (TanStack Virtual), so a
// catalog of thousands scrolls smoothly; the scroller is the nearest scrolling parent. A `toolbar`
// (search, filters, a count) sits in the card above the headers. Inside the Tracker (`tracker:`,
// DESIGN_SYSTEM §15) the card is a round panel and the headers sit on its soft fill, so they
// stand apart from the ground.


const SortIcon = ({ dir }: { dir: false | "asc" | "desc" }) =>
  dir === "asc" ? (
    <ChevronUpIcon className="h-3.5 w-3.5" aria-hidden />
  ) : dir === "desc" ? (
    <ChevronDownIcon className="h-3.5 w-3.5" aria-hidden />
  ) : (
    <ChevronUpDownIcon className="h-3.5 w-3.5 opacity-40" aria-hidden />
  );

const HeaderCell = <T,>({ header, first, last, top }: { header: Header<T, unknown>; first: boolean; last: boolean; top: boolean }) => {
  const meta = header.column.columnDef.meta;
  const align = s.ALIGN[meta?.align ?? "left"];
  const dir = header.column.getIsSorted();
  const content = header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext());
  return (
    <th
      scope="col"
      // The card can't clip (that would stop the header sticking), so the corner cells round themselves
      // Under a toolbar the header row is a band across the card, ruled above
      className={`${s.headCell} ${s.pad} sticky top-0 z-10 ${align} ${meta?.width ?? ""} ${
        top ? `${first ? "rounded-tl-lg tracker:rounded-tl-3xl" : ""} ${last ? "rounded-tr-lg tracker:rounded-tr-3xl" : ""}` : "border-t border-base-300"
      }`}
      aria-sort={dir === "asc" ? "ascending" : dir === "desc" ? "descending" : header.column.getCanSort() ? "none" : undefined}
    >
      {header.column.getCanSort() ? (
        <button
          type="button"
          onClick={header.column.getToggleSortingHandler()}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded uppercase tracking-wider hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            meta?.align === "right" ? "flex-row-reverse" : ""
          } ${dir ? "text-base-content" : ""}`}
        >
          {content}
          <SortIcon dir={dir} />
        </button>
      ) : (
        content
      )}
    </th>
  );
};

const BodyRow = <T,>({
  row,
  onRowClick,
  rowClassName,
  measure,
  index,
}: {
  row: Row<T>;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  // Virtualized: the virtualizer measures each drawn row's real height
  measure?: (el: HTMLTableRowElement | null) => void;
  index?: number;
}) => {
  const cells = row.getVisibleCells();
  return (
    <tr
      ref={measure}
      data-index={index}
      className={`${s.rowHover} ${onRowClick ? "cursor-pointer" : ""} ${row.getIsSelected() ? s.rowSelected : ""} ${rowClassName?.(row.original) ?? ""}`}
      onClick={(e) => {
        if (!onRowClick) return;
        // Controls in the row, and modified clicks on links, do their own thing
        const target = e.target as HTMLElement;
        if (target.closest("button, input, label, select, textarea, [data-row-ignore]")) return;
        if (target.closest("a") && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
        e.preventDefault();
        onRowClick(row.original);
      }}
    >
      {cells.map((cell) => {
        const meta = cell.column.columnDef.meta;
        const className = `${s.bodyCell} ${s.pad} ${s.ALIGN[meta?.align ?? "left"]} ${meta?.width ?? ""}`;
        const content = flexRender(cell.column.columnDef.cell, cell.getContext());
        return meta?.rowHeader ? (
          <th key={cell.id} scope="row" className={`${className} font-normal`}>
            {content}
          </th>
        ) : (
          <td key={cell.id} className={className}>
            {content}
          </td>
        );
      })}
    </tr>
  );
};

// The nearest parent that scrolls, for the virtualizer
const scrollParent = (el: HTMLElement | null): HTMLElement | null => {
  for (let p = el?.parentElement; p; p = p.parentElement) {
    const { overflowY } = getComputedStyle(p);
    if (overflowY === "auto" || overflowY === "scroll") return p;
  }
  return null;
};

export const DataTable = <T,>({
  table,
  label,
  onRowClick,
  rowClassName,
  empty,
  toolbar,
  virtualizeFrom = 300,
  estimateRowHeight = 72,
}: {
  table: Table<T>;
  // What the table is, for screen readers
  label: string;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  // Shown in place of the rows when none match
  empty?: ReactNode;
  // Above the headers, inside the card: search, filters, a count
  toolbar?: ReactNode;
  // Rows from which only those in view are drawn
  virtualizeFrom?: number;
  estimateRowHeight?: number;
}) => {
  const rows = table.getRowModel().rows;
  const tableRef = useRef<HTMLTableElement>(null);
  const [scroller, setScroller] = useState<HTMLElement | null>(null);
  useEffect(() => setScroller(scrollParent(tableRef.current)), []);
  const virtual = rows.length >= virtualizeFrom;
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scroller,
    estimateSize: () => estimateRowHeight,
    overscan: 12,
    // Rows are offset by where the table starts inside the scroller
    scrollMargin: tableRef.current && scroller ? tableRef.current.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop : 0,
  });
  const items = virtual ? virtualizer.getVirtualItems() : [];
  const columns = table.getVisibleLeafColumns().length;
  const before = items.length ? items[0].start - virtualizer.options.scrollMargin : 0;
  const after = items.length ? virtualizer.getTotalSize() - (items[items.length - 1].end - virtualizer.options.scrollMargin) : 0;

  return (
    <div className={s.frameOpen}>
      {toolbar && <div className="flex flex-col gap-3 px-5 py-4 sm:px-6">{toolbar}</div>}
      <div>
        {/* The last row's corner cells round with the card, so a hover never paints past it */}
        <table
          ref={tableRef}
          className={`${s.table} [&_tbody>tr:last-child>*:first-child]:rounded-bl-lg [&_tbody>tr:last-child>*:last-child]:rounded-br-lg tracker:[&_tbody>tr:last-child>*:first-child]:rounded-bl-3xl tracker:[&_tbody>tr:last-child>*:last-child]:rounded-br-3xl`}
          aria-label={label}
          aria-rowcount={rows.length + 1}
        >
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header, i) => (
                  <HeaderCell key={header.id} header={header} first={i === 0} last={i === group.headers.length - 1} top={!toolbar} />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns} className="border-t border-base-300 px-5 py-8 sm:px-6">
                  {empty ?? <p className={ui.bodySm}>Nothing matches.</p>}
                </td>
              </tr>
            ) : virtual ? (
              <>
                {/* Spacers keep the scrollbar the full height while only the rows in view are drawn */}
                {before > 0 && <tr aria-hidden style={{ height: before }} />}
                {items.map((item) => (
                  <BodyRow
                    key={rows[item.index].id}
                    row={rows[item.index]}
                    onRowClick={onRowClick}
                    rowClassName={rowClassName}
                    measure={virtualizer.measureElement}
                    index={item.index}
                  />
                ))}
                {after > 0 && <tr aria-hidden style={{ height: after }} />}
              </>
            ) : (
              rows.map((row) => <BodyRow key={row.id} row={row} onRowClick={onRowClick} rowClassName={rowClassName} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
