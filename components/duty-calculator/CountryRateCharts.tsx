"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import styles from "./theme.module.css";

// The rates-by-country charts and table on /duty-calculator: the products' total duty for up to
// five chosen countries side by side, every country's average, and every rate. Choosing a country
// anywhere picks it everywhere; it keeps its color while it's chosen. Countries show as colored
// markers, or as their flags.

export interface CountryRates {
  code: string;
  name: string;
  flag: string;
  // Total duty per product as a number, when it is one ("Free" is 0; per-unit rates are null)
  values: (number | null)[];
  // The same totals as written, and the lower total from a trade preference when there is one
  labels: string[];
  preferences: (string | undefined)[];
}

type Markers = "colors" | "flags";
const MARKERS_STORAGE_KEY = "hts-hero-rates-markers";

const SERIES = [
  "var(--dc-series-1)",
  "var(--dc-series-2)",
  "var(--dc-series-3)",
  "var(--dc-series-4)",
  "var(--dc-series-5)",
];
const DEFAULT_COUNTRIES = ["CN", "MX", "VN", "DE", "JP"];
// Bars for countries that aren't chosen
const MUTED_BAR = "color-mix(in srgb, var(--dc-text-3) 30%, transparent)";

const cardClass =
  "m-0 rounded-[8px] border border-[var(--dc-border)] bg-[var(--dc-surface)] p-5 sm:p-6 shadow-[var(--dc-shadow)]";

// A round axis maximum, with four or five gridlines
const axis = (max: number) => {
  const step = [5, 10, 20, 25, 50, 100].find((s) => max / s <= 5) ?? 100;
  const top = Math.max(step * Math.ceil(max / step), step);
  return { top, ticks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
};

const average = (values: (number | null)[]) => {
  const numbers = values.filter((v): v is number => v !== null);
  return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : null;
};

const pct = (v: number) => `${Math.round(v * 10) / 10}%`;

const Caption = ({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) => (
  <figcaption className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
    <div className="min-w-0">
      <h3 className="text-[16px] font-semibold text-[var(--dc-text)]">{title}</h3>
      <p className="mt-0.5 text-[12.5px] text-[var(--dc-text-3)]">{children}</p>
    </div>
    {action}
  </figcaption>
);

export const CountryRateCharts = ({
  products,
  rows,
  footnote,
}: {
  products: { code: string; label: string }[];
  rows: CountryRates[];
  // Under the table: what the rates include
  footnote?: ReactNode;
}) => {
  // Each slot holds a country; the slot sets its color, so others leaving don't repaint it.
  // `added` is the order they were chosen in: with every slot taken, a new choice replaces the
  // earliest one.
  const [{ slots }, setChoice] = useState(() => {
    const preferred = DEFAULT_COUNTRIES.filter((c) => rows.some((r) => r.code === c));
    const rest = rows.map((r) => r.code).filter((c) => !preferred.includes(c));
    const initial = [...preferred, ...rest].slice(0, SERIES.length);
    return { slots: initial as (string | null)[], added: initial };
  });
  const [hover, setHover] = useState<{ product: number; code: string } | null>(null);
  const [markers, setMarkersState] = useState<Markers>("colors");

  // Remembered on this device
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(MARKERS_STORAGE_KEY);
      if (saved === "colors" || saved === "flags") setMarkersState(saved);
    } catch {
      // Storage can be unavailable (private mode); colors stay
    }
  }, []);
  const setMarkers = (next: Markers) => {
    setMarkersState(next);
    try {
      window.localStorage.setItem(MARKERS_STORAGE_KEY, next);
    } catch {
      // Not critical
    }
  };
  const flags = markers === "flags";

  const colorOf = (code: string) => {
    const i = slots.indexOf(code);
    return i >= 0 ? SERIES[i] : undefined;
  };
  // A chosen country's bars: its own color, or with flags marking it, the accent
  const barOf = (code: string) => (colorOf(code) ? (flags ? "var(--dc-accent)" : colorOf(code)) : MUTED_BAR);
  const toggle = (code: string) =>
    setChoice((current) => {
      const i = current.slots.indexOf(code);
      if (i >= 0) {
        return {
          slots: current.slots.map((c, j) => (j === i ? null : c)),
          added: current.added.filter((c) => c !== code),
        };
      }
      const free = current.slots.indexOf(null);
      const slot = free >= 0 ? free : current.slots.indexOf(current.added[0]);
      const replaced = current.slots[slot];
      return {
        slots: current.slots.map((c, j) => (j === slot ? code : c)),
        added: [...current.added.filter((c) => c !== replaced), code],
      };
    });

  const chosen = slots
    .map((code, slot) => ({ slot, row: rows.find((r) => r.code === code) }))
    .filter((c): c is { slot: number; row: CountryRates } => Boolean(c.row));
  // The same scale for every choice and for the table, so marks only move when the data does
  const { top, ticks } = axis(
    Math.max(...rows.flatMap((r) => r.values.filter((v): v is number => v !== null)), 1),
  );
  const x = (v: number) => `${(v / top) * 100}%`;

  const averages = rows
    .map((r) => ({ row: r, average: average(r.values) }))
    .filter((r): r is { row: CountryRates; average: number } => r.average !== null)
    .sort((a, b) => b.average - a.average);
  const maxAverage = Math.max(...averages.map((a) => a.average), 1);

  // The marker for a chosen country: a colored dot, or its flag
  const marker = (row: CountryRates, size: "chip" | "plot") =>
    flags ? (
      <span aria-hidden className={size === "plot" ? "text-[17px] leading-none" : "leading-none"}>
        {row.flag}
      </span>
    ) : (
      <span
        aria-hidden
        className={`block rounded-full ${size === "plot" ? "h-3 w-3" : "h-2.5 w-2.5"}`}
        style={{ background: colorOf(row.code), boxShadow: size === "plot" ? "0 0 0 2px var(--dc-surface)" : undefined }}
      />
    );

  const markerSwitch = (
    <div className={`${styles.segmented} !h-8 shrink-0`} role="radiogroup" aria-label="Show countries as">
      {(
        [
          ["colors", "Colors"],
          ["flags", "Flags"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={markers === id}
          onClick={() => setMarkers(id)}
          className={`${styles.segment} !text-[13px] px-2.5 ${markers === id ? styles.segmentActive : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const chip = (row: CountryRates) => {
    const color = colorOf(row.code);
    return (
      <button
        key={row.code}
        type="button"
        onClick={() => toggle(row.code)}
        aria-pressed={Boolean(color)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12.5px] transition-colors ${
          color
            ? "border-[var(--dc-border-strong)] bg-[var(--dc-surface)] font-semibold text-[var(--dc-text)]"
            : "border-[var(--dc-border)] bg-[var(--dc-bg)] text-[var(--dc-text-3)] hover:border-[var(--dc-border-strong)] hover:text-[var(--dc-text)]"
        }`}
      >
        {color ? marker(row, "chip") : <span aria-hidden>{row.flag}</span>}
        {row.name}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Products, side by side for the chosen countries */}
        <figure className={cardClass}>
          <Caption title="Compare countries, product by product" action={markerSwitch}>
            Total duty for each product, for up to {SERIES.length} countries. Choosing another
            replaces the earliest.
          </Caption>
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Countries to compare">
            {rows.map(chip)}
          </div>

          <div className={`${styles.num} mt-5 flex flex-col`}>
            {products.map((product, p) => (
              <div
                key={product.code}
                className="grid grid-cols-1 gap-x-4 gap-y-1 border-t border-[var(--dc-border)] py-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center"
              >
                <div className="min-w-0 truncate text-[13px] font-medium text-[var(--dc-text)]" title={product.label}>
                  {product.label}
                </div>
                <div className="relative mx-2 h-12">
                  {ticks.map((t) => (
                    <span
                      key={t}
                      className="absolute top-0 bottom-0 w-px"
                      style={{ left: x(t), background: t === 0 ? "var(--dc-border-strong)" : "var(--dc-border)" }}
                      aria-hidden
                    />
                  ))}
                  {chosen.map(({ row }) => {
                    const value = row.values[p];
                    if (value === null) return null;
                    const active = hover?.product === p && hover.code === row.code;
                    // Countries on the same rate fan out vertically, so none hides behind another
                    const same = chosen.filter((c) => c.row.values[p] === value);
                    const offset =
                      (same.findIndex((c) => c.row.code === row.code) - (same.length - 1) / 2) * (flags ? 9 : 7);
                    return (
                      <button
                        key={row.code}
                        type="button"
                        className="absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]"
                        style={{ left: x(value), marginTop: offset, zIndex: active ? 20 : 10 }}
                        onMouseEnter={() => setHover({ product: p, code: row.code })}
                        onMouseLeave={() => setHover(null)}
                        onFocus={() => setHover({ product: p, code: row.code })}
                        onBlur={() => setHover(null)}
                        aria-label={`${row.name}, ${product.label}: ${row.labels[p]}`}
                      >
                        <span className="transition-transform" style={{ transform: active ? "scale(1.35)" : undefined }}>
                          {marker(row, "plot")}
                        </span>
                        {active && (
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-[5px] border border-[var(--dc-border)] bg-[var(--dc-surface)] px-2 py-1 text-[12px] text-[var(--dc-text)]"
                            style={{ boxShadow: "var(--dc-shadow-pop)" }}
                          >
                            {row.flag} {row.name} · <span className="font-semibold">{row.labels[p]}</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* The scale */}
            <div className="grid grid-cols-1 gap-x-4 border-t border-[var(--dc-border)] pt-1.5 sm:grid-cols-[150px_minmax(0,1fr)]">
              <span className="hidden sm:block" />
              <div className="relative mx-2 h-4">
                {ticks.map((t) => (
                  <span key={t} className="absolute -translate-x-1/2 text-[11px] text-[var(--dc-text-3)]" style={{ left: x(t) }}>
                    {t}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        </figure>

        {/* Every country's average */}
        <figure className={cardClass}>
          <Caption title="Average total duty by country">
            Across the {products.length} products. Select a country to compare it.
          </Caption>
          <ol className={`${styles.num} mt-4 flex flex-col`}>
            {averages.map(({ row, average }) => {
              const chosenRow = Boolean(colorOf(row.code));
              return (
                <li key={row.code}>
                  <button
                    type="button"
                    onClick={() => toggle(row.code)}
                    aria-pressed={chosenRow}
                    className="grid w-full grid-cols-[112px_minmax(0,1fr)_48px] items-center gap-3 rounded-[5px] px-1.5 py-[3px] text-left hover:bg-[var(--dc-surface-2)]"
                    aria-label={`${row.name}: ${pct(average)} average`}
                  >
                    <span className={`truncate text-[12.5px] ${chosenRow ? "font-semibold text-[var(--dc-text)]" : "text-[var(--dc-text-2)]"}`}>
                      <span aria-hidden className="mr-1.5">{row.flag}</span>
                      {row.name}
                    </span>
                    <span className="relative h-2.5">
                      <span
                        className="absolute inset-y-0 left-0 rounded-r-[4px]"
                        style={{ width: `${(average / maxAverage) * 100}%`, background: barOf(row.code) }}
                      />
                    </span>
                    <span className={`text-right text-[12.5px] ${chosenRow ? "font-semibold text-[var(--dc-text)]" : "text-[var(--dc-text-2)]"}`}>
                      {pct(average)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </figure>
      </div>

      {/* Every rate, in the same style: the total and a bar on the charts' scale */}
      <figure className={`${cardClass} !p-0 overflow-hidden`}>
        <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-3">
          <Caption title="All rates">
            Total duty by country and product, on the same scale as the chart above. Select a
            country to compare it.
          </Caption>
        </div>
        <div className="overflow-x-auto">
          <table className={`w-full text-[13px] ${styles.num}`}>
            <thead>
              <tr className="border-b border-[var(--dc-border)] text-left">
                <th
                  scope="col"
                  className="sticky left-0 z-10 bg-[var(--dc-surface)] px-5 sm:px-6 py-2 align-bottom text-[11.5px] font-semibold uppercase tracking-wider text-[var(--dc-text-3)]"
                >
                  Country
                </th>
                {products.map((p) => (
                  <th key={p.code} scope="col" className="min-w-[132px] px-3 py-2 align-bottom font-normal">
                    <Link
                      href={`/hts/${p.code}`}
                      className="block text-[12.5px] font-medium leading-tight text-[var(--dc-text)] hover:text-[var(--dc-accent)] hover:underline"
                    >
                      {p.label}
                    </Link>
                    <span className="block font-mono text-[10.5px] text-[var(--dc-text-3)]">{p.code}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const chosenRow = Boolean(colorOf(row.code));
                return (
                  <tr key={row.code} className="group border-t border-[var(--dc-border)] first:border-t-0">
                    {/* Pinned so the country stays in view while the products scroll on small screens */}
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-[var(--dc-surface)] group-hover:bg-[var(--dc-surface-2)] px-5 sm:px-6 py-2 text-left font-normal whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(row.code)}
                        aria-pressed={chosenRow}
                        className={`inline-flex items-center gap-2 text-[13px] hover:text-[var(--dc-accent)] ${
                          chosenRow ? "font-semibold text-[var(--dc-text)]" : "text-[var(--dc-text-2)]"
                        }`}
                      >
                        <span aria-hidden>{row.flag}</span>
                        {row.name}
                        {chosenRow && !flags && marker(row, "chip")}
                      </button>
                    </th>
                    {row.labels.map((label, i) => {
                      const value = row.values[i];
                      return (
                        <td key={products[i].code} className="px-3 py-2 align-top group-hover:bg-[var(--dc-surface-2)]">
                          {/* The total, with any trade preference beside it, then its bar */}
                          <span className="flex items-baseline justify-between gap-2">
                            <span className={`whitespace-nowrap text-[var(--dc-text)] ${chosenRow ? "font-semibold" : ""}`}>
                              {label}
                            </span>
                            {row.preferences[i] && (
                              <span
                                className="min-w-0 truncate text-[11px] text-[var(--dc-positive)]"
                                title={row.preferences[i]}
                              >
                                {row.preferences[i]}
                              </span>
                            )}
                          </span>
                          {value !== null && (
                            <span className="mt-1 block h-1.5 rounded-full bg-[var(--dc-surface-3)]" aria-hidden>
                              <span className="block h-full rounded-full" style={{ width: x(value), background: barOf(row.code) }} />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {footnote && (
          <div className="px-5 sm:px-6 py-4 border-t border-[var(--dc-border)] text-[12.5px] leading-relaxed text-[var(--dc-text-3)]">
            {footnote}
          </div>
        )}
      </figure>
    </div>
  );
};
