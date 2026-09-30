"use client";

import { ReactNode } from "react";
import { CalculationResult } from "../../tariffs/engine-v2/types";
import { formatMoney, formatPct } from "./format";
import { BASE_SLICE, FEES_SLICE, sliceForProgram } from "./Results";
import { TariffFinder } from "./useTariffFinder";
import styles from "./theme.module.css";

// "Cost Breakdown": duty and fees as a donut, one slice per program

const CHART = [
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

const Donut = ({
  data,
  size,
  highlight,
  onHighlight,
  children,
}: {
  data: Slice[];
  size: number;
  // The slice to bring forward; the others fade
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
  children: ReactNode;
}) => {
  const stroke = size * 0.13;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((sum, s) => sum + s.amount, 0);
  const gap = data.filter((s) => s.amount > 0).length > 1 ? 2 : 0;
  let offset = 0;
  return (
    <div
      // As wide as the card, up to a limit; size only sets the drawing's proportions
      className="relative shrink-0 w-full max-w-[300px] aspect-square mx-auto"
      onMouseLeave={() => onHighlight?.(null)}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 overflow-visible"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--dc-surface-3)"
          strokeWidth={stroke}
        />
        {total > 0 &&
          data
            .filter((s) => s.amount > 0)
            .map((s) => {
              const length = (s.amount / total) * circumference;
              const dash = Math.max(length - gap, 0.5);
              const active = highlight === s.label;
              const faded = Boolean(highlight) && !active;
              const el = (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={active ? stroke * 1.22 : stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  style={{
                    opacity: faded ? 0.22 : 1,
                    transition: "opacity 150ms ease, stroke-width 150ms ease",
                    cursor: onHighlight ? "pointer" : undefined,
                  }}
                  onMouseEnter={() => onHighlight?.(s.label)}
                />
              );
              offset += length;
              return el;
            })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-[18%]">
        {children}
      </div>
    </div>
  );
};

export const BreakdownCard = ({
  f,
  result,
  highlight,
  onHighlight,
}: {
  f: TariffFinder;
  result: CalculationResult;
  // The slice being hovered, here or in the statement (which acts as the legend)
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
}) => {
  const data = slices(result);
  const total = result.totalDuty + result.totalFees;
  const focused = data.find((s) => s.label === highlight && s.amount > 0);
  const pct = (amount: number, of: number) =>
    of > 0 ? `${Math.round((amount / of) * 1000) / 10}%` : "—";

  return (
    <div className={`${styles.card} h-full p-5 flex flex-col gap-5`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Cost Breakdown</h3>
        <span className="text-[12.5px] text-[var(--dc-text-3)]">
          {f.country?.flag} {f.country?.name}
        </span>
      </div>
      <div className="flex flex-col gap-5 items-center">
        <Donut
          data={data}
          size={200}
          highlight={highlight}
          onHighlight={onHighlight}
        >
          {focused ? (
            // The hovered slice
            <>
              <span className="text-[12px] font-semibold leading-tight text-[var(--dc-text-2)]">
                {focused.label}
              </span>
              <span
                className={`${styles.num} text-[26px] mt-1.5 font-semibold tracking-tight leading-none`}
              >
                {formatMoney(focused.amount)}
              </span>
              <span
                className={`${styles.num} mt-1.5 text-[12px] text-[var(--dc-text-3)]`}
              >
                {pct(focused.amount, total)} of duty + fees
              </span>
            </>
          ) : (
            <>
              <span className={styles.eyebrow}>Duty + fees</span>
              <span
                className={`${styles.num} text-[28px] mt-1 font-semibold tracking-tight leading-none`}
              >
                {formatMoney(total)}
              </span>
              <span
                className={`${styles.num} mt-1 text-[12px] text-[var(--dc-text-3)]`}
              >
                {formatPct(
                  Math.round(
                    (f.customsValue > 0 ? (total / f.customsValue) * 100 : 0) *
                      100,
                  ) / 100,
                )}{" "}
                of value
              </span>
            </>
          )}
        </Donut>
        <p className="text-[12px] text-[var(--dc-text-3)] text-center">
          Hover a line in the statement, or the chart, to see its share
        </p>
      </div>
    </div>
  );
};
