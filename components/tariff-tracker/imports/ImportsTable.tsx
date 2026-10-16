"use client";

import { ReactNode, useMemo } from "react";
import {
  BellAlertIcon,
  BellSlashIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import { ColumnFiltersState, Row, Table, Updater } from "@tanstack/react-table";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import {
  DataTable,
  SelectionBar,
  TableToolbar,
  useDataTable,
} from "@/components/ui/table";
import { MixpanelEvent, trackEvent } from "../../../libs/mixpanel";
import { useTrackerAccess } from "../access/accessContext";
import { useInsights } from "../insights/InsightsContext";
import { programColors } from "../programColors";
import { TrackedProduct } from "../report";
import { useTracker } from "../TrackerContext";
import { importColumns } from "./importColumns";
import { SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";

// The user's imports as a table, on the shared table (components/ui/table): search by code,
// description or country; filter by origin, HTS chapter, tariff, savings and alerts, each with
// counts; sort by product, origin or rate (list order until a heading is clicked); pick rows to
// turn alerts on or off or remove them together. Past a few hundred imports only the rows in view
// are drawn. The filters live in the Tracker (TrackerContext), so they stay set between tabs.
// `header` and `summary` get the table, for what's shown above it from the same rows (export
// covers what's showing; the summary sums it up). The search, filters and bulk actions sit in the
// table's panel, over the rows they act on.

const FACETS = ["country", "chapter", "tariffs", ...(SAVINGS_ENABLED ? ["savings"] : []), "alerts"];

export const ImportsTable = ({
  rows,
  onOpen,
  header,
  summary,
}: {
  rows: TrackedProduct[];
  onOpen: (row: TrackedProduct) => void;
  // Above everything: the report's header and notices
  header?: (table: Table<TrackedProduct>) => ReactNode;
  // Between the header and the table
  summary?: (table: Table<TrackedProduct>) => ReactNode;
}) => {
  const {
    filters,
    replaceFilters,
    filterContext,
    trackedKeys,
    pickedKeys,
    setCovered,
    removeProducts,
    items,
  } = useTracker();
  const { signedIn, access, openUpgrade } = useTrackerAccess();
  const { unlocked, review } = useInsights();

  const columns = useMemo(
    () =>
      importColumns({
        signedIn,
        sections: filterContext.sections,
        colors: programColors(rows),
        maxPct: Math.max(...rows.map((r) => r.totalPct), 0),
        covered: (key) => trackedKeys.has(key),
        picked: (key) => pickedKeys.has(key),
        setCovered: (key, on) => {
          if (!setCovered(key, on)) openUpgrade("limit");
        },
        review: (key) => review.get(key) ?? "unchecked",
        unlocked: (key) => unlocked.has(key),
      }),
    [
      signedIn,
      filterContext.sections,
      rows,
      trackedKeys,
      pickedKeys,
      setCovered,
      openUpgrade,
      review,
      unlocked,
    ],
  );

  // The Tracker's filters, as the table's column filters (and back)
  const columnFilters = useMemo<ColumnFiltersState>(
    () =>
      Object.entries(filters)
        .filter(([, v]) => v.length)
        .map(([id, value]) => ({ id, value })),
    [filters],
  );
  const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
    const next =
      typeof updater === "function" ? updater(columnFilters) : updater;
    replaceFilters(
      Object.fromEntries(next.map((f) => [f.id, f.value as string[]])),
    );
    trackEvent(MixpanelEvent.TARIFF_TRACKER_FILTERED, { filters: next.length });
  };

  const table = useDataTable<TrackedProduct>({
    data: rows,
    columns,
    getRowId: (r) => r.key,
    searchText: (r) =>
      `${r.entry.element.htsno} ${r.description} ${r.entry.country.name} ${r.entry.country.code}`,
    columnFilters,
    onColumnFiltersChange,
    hidden: ["chapter", "savings"],
    enableRowSelection: signedIn,
  });

  const shown = table.getRowModel().rows.length;

  // Alerts on for the picked imports, as far as the plan allows
  const alertsOn = (picked: Row<TrackedProduct>[]) => {
    const full = picked.find(
      (r) => !trackedKeys.has(r.id) && !setCovered(r.id, true),
    );
    if (full) openUpgrade("limit");
  };
  const alertsOff = (picked: Row<TrackedProduct>[]) =>
    picked.forEach((r) => setCovered(r.id, false));
  const remove = (picked: Row<TrackedProduct>[]) => {
    if (
      !window.confirm(
        `Remove ${picked.length} ${picked.length === 1 ? "import" : "imports"}? Their adjustments are kept.`,
      )
    )
      return;
    removeProducts(picked.map((r) => r.id));
    table.resetRowSelection();
  };

  const toolbar = (
    <TableToolbar
      table={table}
      placeholder="Search code, product or country"
      facets={FACETS}
      noun={["import", "imports"]}
    >
      <SelectionBar table={table}>
        {(picked) => (
          <>
            <button
              type="button"
              className={ui.button({ variant: "secondary", size: "sm" })}
              onClick={() => alertsOn(picked)}
            >
              <BellAlertIcon className="h-4 w-4" aria-hidden />
              Track
            </button>
            <button
              type="button"
              className={ui.button({ variant: "secondary", size: "sm" })}
              onClick={() => alertsOff(picked)}
            >
              <BellSlashIcon className="h-4 w-4" aria-hidden />
              Stop tracking
            </button>
            <button
              type="button"
              className={`${ui.button({ variant: "secondary", size: "sm" })} hover:text-error`}
              onClick={() => remove(picked)}
            >
              <TrashIcon className="h-4 w-4" aria-hidden />
              Remove
            </button>
          </>
        )}
      </SelectionBar>
    </TableToolbar>
  );

  return (
    <div className="flex flex-col gap-5">
      {header?.(table)}
      {shown > 0 && summary?.(table)}
      {/* How many imports are tracked, when not all of them are: only those get alerts and impact checks */}
      {signedIn && items.length > trackedKeys.size && (
        <div className={`${tt.tile} flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center`}>
          <BellAlertIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <p className="m-0 flex-1 text-sm text-base-content/70">
            <span className="font-semibold text-base-content">
              Tracking {trackedKeys.size.toLocaleString("en-US")} of {items.length.toLocaleString("en-US")} imports.
            </span>{" "}
            Only tracked imports get alerts and impact checks. Choose which ones in the Tracking column
            {access.kind === "paid" ? ", or move up a plan to track more." : `: your free plan tracks ${access.pairLimit.toLocaleString("en-US")}.`}
          </p>
          <button type="button" className={`${ui.button({ variant: "secondary", size: "sm" })} shrink-0`} onClick={() => openUpgrade("tracking")}>
            Track more imports
          </button>
        </div>
      )}
      <DataTable
        table={table}
        label="Your imports"
        onRowClick={onOpen}
        estimateRowHeight={84}
        toolbar={toolbar}
        empty={
          <div className="flex flex-col items-start gap-3">
            <p className={ui.body}>
              No imports match{" "}
              {table.getState().globalFilter ? "this search" : "these filters"}.
            </p>
            <button
              type="button"
              className={ui.button({ variant: "secondary", size: "sm" })}
              onClick={() => {
                table.resetColumnFilters(true);
                table.setGlobalFilter("");
              }}
            >
              Clear the search and filters
            </button>
          </div>
        }
      />
    </div>
  );
};
