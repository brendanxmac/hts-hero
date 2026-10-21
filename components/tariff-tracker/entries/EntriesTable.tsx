"use client";

import { useMemo } from "react";
import { LockClosedIcon, TrashIcon } from "@heroicons/react/20/solid";
import type { TableColumnDef } from "@/components/ui/table/features";
import toast from "react-hot-toast";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { DataTable, TableToolbar, useDataTable } from "@/components/ui/table";
import { formatDate, formatMoney } from "../../duty-calculator/lib/format";
import { formatRate } from "../formatRate";
import { useEntries } from "./EntriesContext";
import { AuditRow } from "./useAuditRows";
import { AuditVerdict } from "./entries";

// The logged entries, newest first: when, what (unless it's one product's), the value, what was
// paid and owed, and the verdict, on the shared table (sorting by any figure; a longer list gets a
// search and a filter by result). An entry saved without a check (the allowance ran out) can be
// checked from its row.

export const VERDICTS: Record<AuditVerdict, { label: string; tone: "success" | "error" | "neutral" }> = {
  overpaid: { label: "Possible overpayment", tone: "success" },
  underpaid: { label: "Possible underpayment", tone: "error" },
  correct: { label: "Paid as owed", tone: "neutral" },
};

export const money = (n: number) => formatMoney(Math.round(n * 100) / 100);

type Result = AuditVerdict | "unchecked";

const RESULT_LABELS: Record<Result, string> = {
  overpaid: VERDICTS.overpaid.label,
  underpaid: VERDICTS.underpaid.label,
  correct: VERDICTS.correct.label,
  unchecked: "Not checked",
};
const RESULT_ORDER: Result[] = ["overpaid", "underpaid", "correct", "unchecked"];

const resultOf = (row: AuditRow): Result => row.audit?.verdict ?? "unchecked";

const columnsFor = ({
  showProduct,
  onRemove,
  onUnlock,
}: {
  showProduct: boolean;
  onRemove: (row: AuditRow) => void;
  onUnlock: (row: AuditRow) => void;
}): TableColumnDef<AuditRow, any>[] => [
  {
    id: "entry",
    accessorFn: (r) => r.entry.entryDate,
    header: "Entry",
    sortDescFirst: true,
    meta: { rowHeader: true },
    cell: ({ row: { original: { entry } } }) => (
      <span className="flex flex-col text-left">
        <span className="text-sm font-semibold text-base-content">{formatDate(entry.entryDate)}</span>
        {entry.entryNumber && <span className={`${mono.className} text-xs text-base-content/60`}>{entry.entryNumber}</span>}
      </span>
    ),
  },
  ...(showProduct
    ? [
        {
          id: "product",
          accessorFn: (r: AuditRow) => r.entry.htsCode,
          header: "Product",
          cell: ({ row: { original: { entry, product } } }: { row: { original: AuditRow } }) =>
            product ? (
              <span className="flex flex-col">
                <span className={`${mono.className} text-sm font-semibold text-base-content`}>{product.entry.element.htsno}</span>
                <span className="text-xs text-base-content">
                  {product.entry.country.flag} {product.entry.country.name}
                </span>
              </span>
            ) : (
              <span className="text-xs text-base-content/60">
                {entry.htsCode} · {entry.country} (no longer in your imports)
              </span>
            ),
        } satisfies TableColumnDef<AuditRow, any>,
      ]
    : []),
  {
    id: "value",
    accessorFn: (r) => r.entry.customsValue,
    header: "Value",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ getValue }) => money(getValue()),
  },
  {
    id: "paid",
    accessorFn: (r) => r.entry.dutyPaid,
    header: "Paid",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ row: { original: { entry } } }) => (
      <span className="flex flex-col items-end">
        {money(entry.dutyPaid)}
        <span className="text-xs text-base-content/60">{formatRate((entry.dutyPaid / entry.customsValue) * 100)}</span>
      </span>
    ),
  },
  {
    id: "owed",
    accessorFn: (r) => r.audit?.owed ?? -1,
    header: "Owed",
    sortDescFirst: true,
    meta: { align: "right" },
    cell: ({ row: { original: { audit } } }) =>
      audit ? (
        <span className="flex flex-col items-end">
          {money(audit.owed)}
          <span className="text-xs text-base-content/60">{formatRate(audit.rateOwedPct)}</span>
        </span>
      ) : (
        <span className="text-base-content/50">—</span>
      ),
  },
  {
    id: "result",
    accessorFn: resultOf,
    header: "Result",
    filterFn: "facet",
    // Biggest difference first
    sortFn: (a, b) => Math.abs(a.original.audit?.difference ?? 0) - Math.abs(b.original.audit?.difference ?? 0),
    sortDescFirst: true,
    meta: {
      align: "right",
      facet: {
        label: "Result",
        describe: (value) => ({ label: RESULT_LABELS[value as Result] ?? value }),
        compare: (a, b) => RESULT_ORDER.indexOf(a.value as Result) - RESULT_ORDER.indexOf(b.value as Result),
      },
    },
    cell: ({ row: { original: row } }) => {
      const { audit, product } = row;
      const verdict = audit ? VERDICTS[audit.verdict] : null;
      return audit && verdict ? (
        <span className="flex flex-col items-end gap-1">
          <span className={tt.chip(verdict.tone)}>{verdict.label}</span>
          {audit.verdict !== "correct" && (
            <span className={`${tt.display} text-sm font-semibold ${audit.verdict === "overpaid" ? "text-success" : "text-error"}`}>
              {audit.verdict === "overpaid" ? "Up to " : ""}
              {money(Math.abs(audit.difference))}
            </span>
          )}
        </span>
      ) : product ? (
        <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => onUnlock(row)}>
          <LockClosedIcon className="h-3.5 w-3.5" aria-hidden />
          Check
        </button>
      ) : null;
    },
  },
  {
    id: "remove",
    header: () => <span className="sr-only">Remove</span>,
    enableSorting: false,
    meta: { align: "right", width: "w-12" },
    cell: ({ row: { original: row } }) => (
      <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={() => onRemove(row)}>
        <TrashIcon className="h-4 w-4" aria-hidden />
        <span className="sr-only">Remove this entry</span>
      </button>
    ),
  },
];

// A short list (one product's entries) is just the rows; a longer one gets a search and filter
const TOOLBAR_FROM = 6;

export const EntriesTable = ({ rows, showProduct = true }: { rows: AuditRow[]; showProduct?: boolean }) => {
  const { check, remove } = useEntries();
  const columns = useMemo(
    () =>
      columnsFor({
        showProduct,
        onUnlock: (row) => check(row.entry),
        onRemove: (row) => remove(row.entry.id).then((ok) => !ok && toast.error("Couldn't remove this entry.")),
      }),
    [showProduct, check, remove]
  );
  const table = useDataTable<AuditRow>({
    data: rows,
    columns,
    getRowId: (r) => r.entry.id,
    searchText: (r) => `${r.entry.entryNumber ?? ""} ${r.entry.htsCode} ${r.product?.description ?? ""} ${r.product?.entry.country.name ?? r.entry.country}`,
    initialSorting: [{ id: "entry", desc: true }],
  });
  return (
    <DataTable
      table={table}
      label="Logged entries"
      toolbar={
        rows.length >= TOOLBAR_FROM ? (
          <TableToolbar
            table={table}
            placeholder={showProduct ? "Search entry number, code or product" : undefined}
            facets={["result"]}
            noun={["entry", "entries"]}
          />
        ) : undefined
      }
      empty={<p className="text-sm text-base-content/70">No entries match.</p>}
    />
  );
};
