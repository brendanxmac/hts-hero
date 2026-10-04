"use client";

import { CalculationResult } from "../../tariffs/engine-v2/types";
import { formatMoney } from "./format";
import { BASE_SLICE, FEES_SLICE, sliceForProgram } from "./Results";
import styles from "./theme.module.css";

// Where the money goes: duty and fees as one stacked bar, one slice per program

export const CHART = [
  "var(--dc-chart-1)",
  "var(--dc-chart-2)",
  "var(--dc-chart-3)",
  "var(--dc-chart-4)",
  "var(--dc-chart-5)",
];
const FEES_COLOR = "var(--dc-chart-6)";

interface Slice {
  label: string;
  amount: number;
  color: string;
}

// Base duty, then one slice per program, then fees
export const slices = (result: CalculationResult): Slice[] => {
  const byProgram = new Map<string, number>();
  result.lines
    .filter((l) => l.status === "applies" && l.amount > 0)
    .forEach((l) =>
      byProgram.set(
        sliceForProgram(l.program),
        (byProgram.get(sliceForProgram(l.program)) ?? 0) + l.amount,
      ),
    );
  return [
    { label: BASE_SLICE, amount: result.base.amount, color: CHART[0] },
    ...Array.from(byProgram).map(([label, amount], i) => ({
      label,
      amount,
      color: CHART[(i + 1) % CHART.length],
    })),
    { label: FEES_SLICE, amount: result.totalFees, color: FEES_COLOR },
  ];
};

// The slices as one stacked bar, with a legend of each one's amount and share
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
}) => {
  const shown = slices(result).filter((s) => s.amount > 0);
  const total = shown.reduce((sum, s) => sum + s.amount, 0);
  if (total <= 0) return null;
  const share = (amount: number) =>
    `${Math.round((amount / total) * 1000) / 10}%`;
  const style = (label: string) => ({
    opacity: highlight && highlight !== label ? 0.22 : 1,
    transition: "opacity 150ms ease",
    cursor: onHighlight ? "pointer" : undefined,
  });
  return (
    <div
      className={`flex flex-col gap-2.5 ${className}`}
      onMouseLeave={() => onHighlight?.(null)}
    >
      <div
        className="flex h-5 w-full gap-0.5 overflow-hidden rounded-[5px] bg-[var(--dc-surface-3)]"
        aria-hidden
      >
        {shown.map((s) => (
          <div
            key={s.label}
            className="h-full min-w-[3px]"
            style={{
              width: `${(s.amount / total) * 100}%`,
              background: s.color,
              ...style(s.label),
            }}
            onMouseEnter={() => onHighlight?.(s.label)}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px]">
        {shown.map((s) => (
          <li
            key={s.label}
            className="flex items-center gap-1.5"
            style={style(s.label)}
            onMouseEnter={() => onHighlight?.(s.label)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: s.color }}
              aria-hidden
            />
            <span className="text-[var(--dc-text-2)]">{s.label}</span>
            <span className={`${styles.num} font-semibold`}>
              {formatMoney(s.amount)}
            </span>
            <span className={`${styles.num} text-[var(--dc-text-3)]`}>
              {share(s.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
