"use client";

import { ReactNode } from "react";
import { CalculationResult } from "../../tariffs/engine-v2/types";
import { formatMoney, formatPct } from "./format";
import { BASE_SLICE, FEES_SLICE, sliceForProgram } from "./Results";
import { TariffFinder } from "./useTariffFinder";
import styles from "./theme.module.css";

// "Where the money goes": duty and fees as a donut, one slice per program (Classic and Dashboard)

export const CHART = [
  "var(--dc-chart-1)",
  "var(--dc-chart-2)",
  "var(--dc-chart-3)",
  "var(--dc-chart-4)",
  "var(--dc-chart-5)",
];
export const FEES_COLOR = "var(--dc-chart-6)";

export interface Slice {
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
  fluid,
  highlight,
  onHighlight,
  children,
}: {
  data: Slice[];
  size: number;
  // Fill the card's width (up to a limit) instead of a fixed size
  fluid?: boolean;
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
      className={`relative shrink-0 ${fluid ? "w-full max-w-[300px] aspect-square mx-auto" : ""}`}
      style={fluid ? undefined : { width: size, height: size }}
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
  layout = "row",
  highlight,
  onHighlight,
}: {
  f: TariffFinder;
  result: CalculationResult;
  // row: donut beside the legend (on wider screens); stacked: legend below, for narrow columns;
  // large: a bigger donut on its own; chart: the donut alone, as wide as the card, with the
  // statement beside it acting as the legend
  layout?: "row" | "stacked" | "large" | "chart";
  highlight?: string | null;
  onHighlight?: (label: string | null) => void;
}) => {
  const large = layout === "large";
  const chartOnly = layout === "chart";
  const data = slices(result);
  const total = result.totalDuty + result.totalFees;
  const focused = data.find((s) => s.label === highlight && s.amount > 0);
  const pct = (amount: number, of: number) =>
    of > 0 ? `${Math.round((amount / of) * 1000) / 10}%` : "—";

  return (
    <div
      className={`${styles.card} h-full ${layout === "stacked" || chartOnly ? "p-5" : "p-5 sm:p-6"} flex flex-col gap-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Cost Breakdown</h3>
        <span className="text-[12.5px] text-[var(--dc-text-3)]">
          {f.country?.flag} {f.country?.name}
        </span>
      </div>
      <div
        className={`flex ${layout === "row" ? "flex-col sm:flex-row gap-6" : "flex-col gap-5"} items-center`}
      >
        <Donut
          data={data}
          size={
            chartOnly ? 200 : large ? 240 : layout === "stacked" ? 176 : 188
          }
          fluid={chartOnly}
          highlight={highlight}
          onHighlight={onHighlight}
        >
          {focused ? (
            // The hovered slice
            <>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold leading-tight text-[var(--dc-text-2)]">
                {focused.label}
              </span>
              <span
                className={`${styles.num} ${chartOnly ? "text-[26px]" : "text-[22px]"} mt-1.5 font-semibold tracking-tight leading-none`}
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
                className={`${styles.num} ${large || chartOnly ? "text-[28px]" : "text-[22px]"} mt-1 font-semibold tracking-tight leading-none`}
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
        {chartOnly ? (
          <p className="text-[12px] text-[var(--dc-text-3)] text-center">
            Hover a line in the statement, or the chart, to see its share
          </p>
        ) : (
          <ul className="w-full min-w-0 flex-1 flex flex-col gap-3">
            {data.map((s) => (
              <li
                key={s.label}
                className="flex items-start gap-2.5 text-[13.5px]"
              >
                <span
                  className="mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: s.color }}
                  aria-hidden
                />
                <span className="flex-1 min-w-0 leading-snug text-[var(--dc-text-2)]">
                  {s.label}
                </span>
                <span className="flex flex-col items-end">
                  <span className={`${styles.num} font-semibold`}>
                    {formatMoney(s.amount)}
                  </span>
                  <span
                    className={`${styles.num} text-[12px] text-[var(--dc-text-3)]`}
                  >
                    {total > 0
                      ? `${Math.round((s.amount / total) * 100)}%`
                      : "—"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
