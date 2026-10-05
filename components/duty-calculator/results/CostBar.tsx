"use client";

// Where the money goes in a full calculation: its slices as one stacked bar, linked to the
// statement through highlight
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { StackedBar } from "@/components/ui/charts/StackedBar";
import { formatMoney } from "../lib/format";
import { slices } from "./slices";

export const CostBar = ({
  result,
  highlight,
  onHighlight,
  className = "",
}: {
  result: CalculationResult;
  // The slice to bring forward, here or in the statement; the others fade
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
  className?: string;
}) => (
  <StackedBar
    parts={slices(result)}
    formatValue={formatMoney}
    highlight={highlight}
    onHighlight={onHighlight}
    className={className}
  />
);
