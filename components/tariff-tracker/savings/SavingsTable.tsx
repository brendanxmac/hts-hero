"use client";

import { useMemo } from "react";
import type { TableColumnDef } from "@/components/ui/table/features";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { formatRate } from "../formatRate";
import { wholeDollars } from "../insights/teasers";
import { Saving, SavingKind } from "../insights/savings";
import { TrackedProduct } from "../report";
import { countryFacet, openColumn } from "../tableColumns";
import { ExcludesBase } from "@/components/duty-calculator/results/ExcludesBase";

// Every saving across the catalog, biggest first: the product, what to do, and what it's worth
// on one shipment, on the shared table (search, a filter by origin, sorting by the figures). A row
// opens the product, where the saving can be checked and applied.

const KIND_LABELS: Record<SavingKind, string> = {
  program: "Trade program",
  exemption: "Exemption",
  origin: "Sourcing",
};

export interface SavingRow {
  saving: Saving;
  product: TrackedProduct;
}

const COLUMNS: TableColumnDef<SavingRow, any>[] = [
  {
    id: "product",
    accessorFn: (r) => r.product.entry.element.htsno,
    header: "Product",
    meta: { rowHeader: true, width: "w-[22%]" },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col gap-0.5 text-left">
        <span className={`${mono.className} text-sm font-semibold text-base-content`}>{r.product.entry.element.htsno}</span>
        <span className="text-xs text-base-content">
          {r.product.entry.country.flag} {r.product.entry.country.name}
        </span>
      </span>
    ),
  },
  {
    id: "country",
    accessorFn: (r) => r.product.entry.country.code,
    header: "Origin",
    filterFn: "facet",
    meta: { facet: countryFacet() },
  },
  {
    id: "opportunity",
    accessorFn: (r) => r.saving.title,
    header: "Opportunity",
    enableSorting: false,
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className={tt.chip(r.saving.kind === "origin" ? "neutral" : "success")}>{KIND_LABELS[r.saving.kind]}</span>
          <span className="font-semibold text-base-content">
            {r.saving.country ? `${r.saving.country.flag} ` : ""}
            {r.saving.title}
          </span>
        </span>
        <span className="line-clamp-2 text-xs text-base-content/60" title={r.saving.detail}>
          {r.saving.detail}
        </span>
      </span>
    ),
  },
  {
    id: "rate",
    accessorFn: (r) => r.product.totalPct,
    header: "Rate now",
    sortDescFirst: true,
    meta: { align: "right", width: "w-28" },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col items-end">
        {formatRate(r.product.totalPct)}
        {r.product.baseNotCalculated && <ExcludesBase />}
      </span>
    ),
  },
  {
    id: "pts",
    accessorFn: (r) => r.saving.pts,
    header: "Could lower by",
    sortDescFirst: true,
    meta: { align: "right", width: "w-32" },
    cell: ({ getValue }) => <span className="font-semibold text-success">−{formatRate(getValue())}</span>,
  },
  {
    id: "usd",
    accessorFn: (r) => r.saving.usd,
    header: "Up to, per shipment",
    sortDescFirst: true,
    meta: { align: "right", width: "w-40" },
    cell: ({ row: { original: r } }) => (
      <span className="flex flex-col items-end">
        <span className={`${tt.display} text-base font-semibold text-base-content`}>{wholeDollars(r.saving.usd)}</span>
        {r.saving.kind === "exemption" && <span className="text-xs text-base-content/60">If it applies</span>}
      </span>
    ),
  },
  openColumn<SavingRow>(),
];

export const SavingsTable = ({ rows, onOpen }: { rows: SavingRow[]; onOpen: (key: string) => void }) => {
  const columns = useMemo(() => COLUMNS, []);
  const table = useDataTable<SavingRow>({
    data: rows,
    columns,
    getRowId: (r) => `${r.saving.productKey}|${r.saving.kind}|${r.saving.ref}`,
    searchText: (r) =>
      `${r.product.entry.element.htsno} ${r.product.description} ${r.product.entry.country.name} ${r.saving.title} ${r.saving.country?.name ?? ""}`,
    hidden: ["country"],
  });
  return (
    <DataTable
      table={table}
      label="Potential savings"
      onRowClick={(r) => onOpen(r.product.key)}
      toolbar={<TableToolbar table={table} placeholder="Search code, product or saving" facets={["country"]} noun={["saving", "savings"]} />}
      empty={<p className="text-sm text-base-content/70">No savings match.</p>}
    />
  );
};
