"use client";

import { useMemo, useState } from "react";
import { Country } from "../../constants/countries";
import { HtsElement } from "../../interfaces/hts";
import { formatMoney } from "../duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";
import { ProductRow, ROW_GRID } from "./ProductRow";
import { programColors } from "./programColors";
import { UNITS, VALUE, WatchRow } from "./report";

// Every product on the list, with a color key and column headings. Rows open to show
// their charges.
export const ProductList = ({
  rows,
  sorted,
  onOpenInCalculator,
}: {
  rows: WatchRow[];
  // The rows in display order
  sorted: WatchRow[];
  onOpenInCalculator: (element: HtsElement, country: Country) => void;
}) => {
  const [open, setOpen] = useState<Record<number, boolean>>({});
  const colors = useMemo(() => programColors(rows), [rows]);
  const maxPct = Math.max(...rows.map((r) => r.totalPct), 1);
  const perUnit = rows.some((r) => r.result.requiresQuantity);

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
            Per-unit rates shown for {formatMoney(VALUE).replace(".00", "")} and {UNITS.toLocaleString("en-US")} units
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
            key={`${row.entry.line}-${row.entry.text}`}
            row={row}
            colors={colors}
            maxPct={maxPct}
            open={Boolean(open[row.entry.line])}
            onToggle={() => setOpen((prev) => ({ ...prev, [row.entry.line]: !prev[row.entry.line] }))}
            onOpenInCalculator={() => onOpenInCalculator(row.entry.element, row.entry.country)}
          />
        ))}
      </ul>
    </div>
  );
};
