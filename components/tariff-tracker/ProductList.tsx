"use client";

import { useMemo } from "react";
import { formatMoney } from "../duty-calculator/lib/format";
import * as ui from "@/components/ui/styles";
import { ProductRow, ROW_GRID } from "./ProductRow";
import { programColors } from "./programColors";
import { UNITS, VALUE, TrackedProduct } from "./report";
import { useTrackerAccess } from "./access/accessContext";
import { useInsights } from "./insights/InsightsContext";
import { useTracker } from "./TrackerContext";

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
  // Signed in, products past the alerts' limit are marked; signed out, nothing is tracked yet
  const { trackedKeys, pickedKeys, setCovered } = useTracker();
  const { signedIn, openUpgrade } = useTrackerAccess();
  const { unlocked, review } = useInsights();
  // Picking past the alerts' limit opens the way to a bigger plan
  const changeCoverage = (key: string, covered: boolean) => {
    if (!setCovered(key, covered)) openUpgrade("tracking");
  };
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
      <div className="hidden border-b border-base-300 bg-base-200 md:flex" aria-hidden>
        {signedIn && <span className={`${ui.label} w-12 shrink-0 py-2.5 text-center`}>Alerts</span>}
        <div className={`grid flex-1 ${ROW_GRID} px-5 py-2.5`}>
          {["Product", "Origin", "Tariffs", "Duty rate", ""].map((label, i) => (
            <span key={i} className={`${ui.label} ${i === 3 ? "text-right" : ""}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-base-300">
        {sorted.map((row) => (
          <ProductRow
            key={row.key}
            row={row}
            colors={colors}
            maxPct={maxPct}
            untracked={signedIn && !trackedKeys.has(row.key)}
            savingsLocked={signedIn && !unlocked.has(row.key)}
            savingsReviewed={review.get(row.key) === "reviewed"}
            coverage={
              signedIn
                ? { covered: trackedKeys.has(row.key), picked: pickedKeys.has(row.key), onChange: (on) => changeCoverage(row.key, on) }
                : undefined
            }
            onOpen={() => onOpen(row)}
          />
        ))}
      </ul>
    </div>
  );
};
