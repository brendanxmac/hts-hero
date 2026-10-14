"use client";

import { LockClosedIcon, TrashIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatDate, formatMoney } from "../../duty-calculator/lib/format";
import { formatRate } from "../formatRate";
import { useEntries } from "./EntriesContext";
import { AuditRow } from "./useAuditRows";
import { AuditVerdict } from "./entries";

// The logged entries, newest first: when, what (unless it's one product's), the value, what was
// paid and owed, and the verdict. An entry saved without a check (the allowance ran out) can be
// checked from its row.

export const VERDICTS: Record<AuditVerdict, { label: string; tone: "success" | "error" | "neutral" }> = {
  overpaid: { label: "Possible overpayment", tone: "success" },
  underpaid: { label: "Possible underpayment", tone: "error" },
  correct: { label: "Paid as owed", tone: "neutral" },
};

export const money = (n: number) => formatMoney(Math.round(n * 100) / 100);

const Row = ({
  row: { entry, product, audit },
  showProduct,
  onRemove,
  onUnlock,
}: {
  row: AuditRow;
  showProduct: boolean;
  onRemove: () => void;
  onUnlock: () => void;
}) => {
  const verdict = audit ? VERDICTS[audit.verdict] : null;
  return (
    <tr className="border-t border-base-300">
      <th scope="row" className="px-5 py-3 text-left font-normal sm:px-6">
        <span className="block text-sm font-semibold text-base-content">{formatDate(entry.entryDate)}</span>
        {entry.entryNumber && <span className={`${mono.className} block text-xs text-base-content/60`}>{entry.entryNumber}</span>}
      </th>
      {showProduct && (
      <td className="px-4 py-3">
        {product ? (
          <>
            <span className={`${mono.className} block text-sm font-semibold text-base-content`}>{product.entry.element.htsno}</span>
            <span className="block text-xs text-base-content/60">
              {product.entry.country.flag} {product.entry.country.name}
            </span>
          </>
        ) : (
          <span className="text-xs text-base-content/60">
            {entry.htsCode} · {entry.country} (no longer in your imports)
          </span>
        )}
      </td>
      )}
      <td className="px-4 py-3 text-right">{money(entry.customsValue)}</td>
      <td className="px-4 py-3 text-right">
        {money(entry.dutyPaid)}
        <span className="block text-xs text-base-content/60">{formatRate((entry.dutyPaid / entry.customsValue) * 100)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        {audit ? (
          <>
            {money(audit.owed)}
            <span className="block text-xs text-base-content/60">{formatRate(audit.rateOwedPct)}</span>
          </>
        ) : (
          <span className="text-base-content/40">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {audit && verdict ? (
          <span className="flex flex-col items-end gap-1">
            <span className={ui.badge(verdict.tone)}>{verdict.label}</span>
            {audit.verdict !== "correct" && (
              <span className={`text-sm font-semibold ${audit.verdict === "overpaid" ? "text-success" : "text-error"}`}>
                {audit.verdict === "overpaid" ? "Up to " : ""}
                {money(Math.abs(audit.difference))}
              </span>
            )}
          </span>
        ) : product ? (
          <button type="button" className={ui.button({ size: "sm" })} onClick={onUnlock}>
            <LockClosedIcon className="h-3.5 w-3.5" aria-hidden />
            Check
          </button>
        ) : null}
      </td>
      <td className="px-5 py-3 text-right sm:px-6">
        <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onRemove}>
          <TrashIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Remove this entry</span>
        </button>
      </td>
    </tr>
  );
};

export const EntriesTable = ({ rows, showProduct = true }: { rows: AuditRow[]; showProduct?: boolean }) => {
  const { check, remove } = useEntries();
  const headings = ["Entry", ...(showProduct ? ["Product"] : []), "Value", "Paid", "Owed", "Result"];
  return (
    <div className={ui.card}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-base-200">
            <tr>
              {headings.map((label, i) => (
                <th
                  key={label}
                  scope="col"
                  className={`${ui.label} py-2.5 ${i === 0 ? "px-5 text-left sm:px-6" : label === "Product" ? "px-4 text-left" : "px-4 text-right"}`}
                >
                  {label}
                </th>
              ))}
              <th scope="col" className="px-5 py-2.5 sm:px-6">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <Row
                key={row.entry.id}
                row={row}
                showProduct={showProduct}
                onUnlock={() => check(row.entry)}
                onRemove={() => remove(row.entry.id).then((ok) => !ok && toast.error("Couldn't remove this entry."))}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
