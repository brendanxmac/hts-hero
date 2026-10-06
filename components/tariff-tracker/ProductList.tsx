"use client";

import { useMemo } from "react";
import { formatMoney } from "../duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";
import { ProductRow, ROW_GRID } from "./ProductRow";
import { programColors } from "./programColors";
import { UNITS, VALUE, TrackedProduct } from "./report";

// Every product on the list, with a color key and column headings. Each row opens the
// product's own view.
export const ProductList = ({
  rows,
  sorted,
  onOpen,
}: {
  rows: TrackedProduct[];
  // The rows in display order
  sorted: TrackedProduct[];
  onOpen: (row: TrackedProduct) => void;
}) => {
  const colors = useMemo(() => programColors(rows), [rows]);
  const maxPct = Math.max(...rows.map((r) => r.totalPct), 1);
  // Per-unit duty on a product left at the default shipment
  const perUnit = rows.some((r) => r.result.requiresQuantity && !r.adjustments.customsValue && !r.adjustments.quantity);

  return (
    <div className={`${ui.card}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-base-300 px-5 py-3">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-base-content/70">
          {Object.keys(colors).map((key) => (
            <span key={key} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[key] }} aria-hidden />
              {key}
            </span>
          ))}
        </div>
        {perUnit && (
          <span className="text-xs text-base-content/60">
            Per-unit rates shown for {formatMoney(VALUE).replace(".00", "")} and {UNITS.toLocaleString("en-US")} units,
            unless adjusted
          </span>
        )}
      </div>
      <div className={`hidden md:grid ${ROW_GRID} border-b border-base-300 bg-base-200 px-5 py-2.5`} aria-hidden>
        {["Product", "Origin", "Tariffs", "Duty rate", ""].map((label, i) => (
          <span key={i} className={`${ui.label} ${i === 3 ? "text-right" : ""}`}>
            {label}
          </span>
        ))}
      </div>

      <ul className="divide-y divide-base-300">
        {sorted.map((row) => (
          <ProductRow
            key={row.key}
            row={row}
            colors={colors}
            maxPct={maxPct}
            onOpen={() => onOpen(row)}
          />
        ))}
      </ul>
    </div>
  );
};
