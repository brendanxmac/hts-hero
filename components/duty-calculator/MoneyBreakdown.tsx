"use client";

import { ReactNode } from "react";
import { CalculationResult } from "../../tariffs/engine-v2/types";
import { formatMoney, formatPct } from "./format";
import { programName } from "./Results";
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
        programName(l.program),
        (byProgram.get(programName(l.program)) ?? 0) + l.amount,
      ),
    );
  return [
    { label: "Base duty", amount: result.base.amount, color: CHART[0] },
    ...Array.from(byProgram).map(([label, amount], i) => ({
      label,
      amount,
      color: CHART[(i + 1) % CHART.length],
    })),
    { label: "Customs fees", amount: result.totalFees, color: FEES_COLOR },
  ];
};

const Donut = ({
  data,
  size,
  children,
}: {
  data: Slice[];
  size: number;
  children: ReactNode;
}) => {
  const stroke = size * 0.13;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((sum, s) => sum + s.amount, 0);
  const gap = data.filter((s) => s.amount > 0).length > 1 ? 2 : 0;
  let offset = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
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
              const el = (
                <circle
                  key={s.label}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={stroke}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return el;
            })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
};

export const BreakdownCard = ({
  f,
  result,
  layout = "row",
}: {
  f: TariffFinder;
  result: CalculationResult;
  // row: donut beside the legend (on wider screens); stacked: legend below, for narrow columns;
  // large: a bigger donut on its own
  layout?: "row" | "stacked" | "large";
}) => {
  const large = layout === "large";
  const data = slices(result);
  const total = result.totalDuty + result.totalFees;
  return (
    <div
      className={`${styles.card} h-full ${layout === "stacked" ? "p-5" : "p-5 sm:p-6"} flex flex-col gap-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Where the money goes</h3>
        <span className="text-[12.5px] text-[var(--dc-text-3)]">
          {f.country?.flag} {f.country?.name}
        </span>
      </div>
      <div
        className={`flex ${layout === "row" ? "flex-col sm:flex-row gap-6" : "flex-col gap-5"} items-center`}
      >
        <Donut
          data={data}
          size={large ? 240 : layout === "stacked" ? 176 : 188}
        >
          <span className={styles.eyebrow}>Duty + fees</span>
          <span
            className={`${styles.num} ${large ? "text-[30px]" : "text-[22px]"} mt-1 font-semibold tracking-tight leading-none`}
          >
            {formatMoney(total)}
          </span>
          <span
            className={`${styles.num} mt-1 text-[12px] text-[var(--dc-text-3)]`}
          >
            {formatPct(
              Math.round(
                (f.customsValue > 0 ? (total / f.customsValue) * 100 : 0) * 100,
              ) / 100,
            )}{" "}
            of value
          </span>
        </Donut>
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
                  {total > 0 ? `${Math.round((s.amount / total) * 100)}%` : "—"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
