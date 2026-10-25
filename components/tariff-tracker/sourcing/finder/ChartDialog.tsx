"use client";

import { ReactNode, useState } from "react";
import { ArrowDownTrayIcon, ArrowsPointingOutIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { ChartFrame, Crosshair, HitArea, Legend, linearScale, nearestIndex, niceMax, Tooltip, TooltipRow, useHovered } from "@/components/ui/charts/kit";
import { Dialog } from "@/components/ui/Dialog";
import { trackerSans } from "@/components/ui/font";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as tt from "@/components/ui/styles/tracker";
import { THEME } from "@/components/ui/theme";

// Any chart or headline number on the Sourcing page, opened full size: the chart, or the table of
// every figure behind it (Chart · Table), with where the figures come from and a CSV of the table.
// Seeing the rows is how odd results explain themselves (a supplier with zeros since 2023).

export interface DataTable {
  columns: string[];
  // Cells as shown; numbers right-aligned
  rows: (string | number)[][];
}

// A line per series over the same labels (months or years)
export interface LineSeries {
  name: string;
  color: string;
  values: number[];
}

// Something that happened at one label (an AD/CVD order), drawn as a dashed line with its name
export interface ChartMarker {
  index: number;
  label: string;
}

export const LineChart = ({
  labels,
  series,
  format,
  height = 360,
  label,
  markers = [],
}: {
  labels: string[];
  series: LineSeries[];
  format: (v: number) => string;
  height?: number;
  label: string;
  markers?: ChartMarker[];
}) => {
  const hovered = useHovered();
  const max = niceMax(Math.max(...series.flatMap((s) => s.values), 0));
  const margin = { top: markers.length ? 28 : 12, right: 16, bottom: 28, left: 64 };
  return (
    <div className="flex flex-col gap-3">
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.name, color: s.color, shape: "line" as const }))} />}
      <ChartFrame
        height={height}
        margin={margin}
        label={label}
        onLeave={hovered.clear}
        overlay={({ innerWidth, innerHeight }) => {
          if (hovered.index === null) return null;
          const x = linearScale([0, Math.max(1, labels.length - 1)], [0, innerWidth])(hovered.index);
          return (
            <Tooltip x={x} y={innerHeight / 3}>
              <div className="mb-1 font-semibold text-base-content">{labels[hovered.index]}</div>
              {series.map((s) => (
                <TooltipRow key={s.name} color={s.color} label={s.name} value={format(s.values[hovered.index!] ?? 0)} />
              ))}
            </Tooltip>
          );
        }}
      >
        {({ innerWidth, innerHeight }) => {
          const x = linearScale([0, Math.max(1, labels.length - 1)], [0, innerWidth]);
          const y = linearScale([0, max], [innerHeight, 0]);
          const every = Math.max(1, Math.ceil(labels.length / 8));
          const xs = labels.map((_, i) => x(i));
          return (
            <>
              {y.ticks(4).map((t) => (
                <g key={t} transform={`translate(0,${y(t)})`}>
                  <line x1={0} x2={innerWidth} stroke="color-mix(in oklab, var(--color-base-content) 8%, transparent)" />
                  <text x={-10} dy="0.32em" textAnchor="end" className="fill-base-content/60 text-[11px] tabular-nums">
                    {format(t)}
                  </text>
                </g>
              ))}
              {labels.map((l, i) =>
                i % every === 0 || i === labels.length - 1 ? (
                  <text key={l} x={x(i)} y={innerHeight + 18} textAnchor="middle" className="fill-base-content/60 text-[11px] tabular-nums">
                    {l}
                  </text>
                ) : null
              )}
              {markers.map((m) => (
                <g key={`${m.index}-${m.label}`} transform={`translate(${x(m.index)},0)`}>
                  <line y1={-6} y2={innerHeight} stroke="var(--color-error)" strokeWidth={1.5} strokeDasharray="4 3" />
                  <text y={-12} textAnchor={x(m.index) > innerWidth * 0.7 ? "end" : "start"} dx={x(m.index) > innerWidth * 0.7 ? -4 : 4} className="fill-error text-[11px] font-semibold">
                    {m.label}
                  </text>
                </g>
              ))}
              {series.map((s) => (
                <path
                  key={s.name}
                  d={s.values.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join("")}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              {labels.length === 1 &&
                series.map((s) => <circle key={s.name} cx={x(0)} cy={y(s.values[0] ?? 0)} r={4} fill={s.color} />)}
              {hovered.index !== null && <Crosshair x={x(hovered.index)} />}
              <HitArea onMove={(px) => hovered.set(nearestIndex(xs, px))} />
            </>
          );
        }}
      </ChartFrame>
    </div>
  );
};

// Two bars per row (this period and the one before), largest first: who supplies it, and how that
// moved
export const PairedBars = ({
  rows,
  names,
  format,
}: {
  rows: { label: ReactNode; key: string; now: number; before: number; note?: string }[];
  names: [string, string];
  format: (v: number) => string;
}) => {
  const max = Math.max(...rows.flatMap((r) => [r.now, r.before]), 1);
  return (
    <div className="flex flex-col gap-3">
      <Legend
        items={[
          { label: names[0], color: "var(--color-primary)" },
          { label: names[1], color: "color-mix(in oklab, var(--color-base-content) 25%, transparent)" },
        ]}
      />
      <ol className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((r) => (
          <li key={r.key} className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)_7rem] items-center gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="flex flex-col gap-1">
              <span className="h-2.5 rounded-full bg-primary" style={{ width: `${Math.max(r.now > 0 ? 1 : 0, (r.now / max) * 100)}%` }} />
              <span className="h-2.5 rounded-full bg-base-content/25" style={{ width: `${Math.max(r.before > 0 ? 1 : 0, (r.before / max) * 100)}%` }} />
            </span>
            <span className="flex flex-col items-end text-xs tabular-nums">
              <span className="font-semibold text-base-content">{format(r.now)}</span>
              <span className="text-base-content/60">{r.note ?? format(r.before)}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
};

const csvCell = (v: string | number) => {
  const text = String(v);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const downloadCsv = (table: DataTable, name: string) => {
  const csv = [table.columns, ...table.rows].map((r) => r.map(csvCell).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^\w-]+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const TableView = ({ table }: { table: DataTable }) => (
  <div className="max-h-[60vh] overflow-auto rounded-xl border border-base-300">
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 bg-base-100">
        <tr className="border-b-2 border-base-300">
          {table.columns.map((c, i) => (
            <th key={c} scope="col" className={`whitespace-nowrap px-3 py-2 text-xs font-semibold uppercase tracking-wide text-base-content/70 ${i ? "text-right" : "text-left"}`}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((r, ri) => (
          <tr key={ri} className="border-b border-base-300 last:border-0 hover:bg-tt-soft">
            {r.map((cell, i) => (
              <td key={i} className={`whitespace-nowrap px-3 py-2 tabular-nums ${i ? "text-right" : "text-left font-medium text-base-content"}`}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

type View = "chart" | "table";
const VIEWS: { id: View; label: string }[] = [
  { id: "chart", label: "Chart" },
  { id: "table", label: "Table" },
];

// The button that opens one: on a stat or a module's header
export const ExpandButton = ({ onClick, label = "Chart & data" }: { onClick: () => void; label?: string }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
    <ArrowsPointingOutIcon className="h-3.5 w-3.5" aria-hidden />
    {label}
  </button>
);

export const ChartDialog = ({
  open,
  onClose,
  title,
  subtitle,
  source,
  chart,
  table,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: ReactNode;
  source: ReactNode;
  chart: ReactNode;
  table: DataTable;
}) => {
  const [view, setView] = useState<View>("chart");
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* It portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15) */}
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden shadow-2xl`}>
          {/* The title and its controls stay on one row: the title gives way (wraps) first */}
          <div className="flex flex-nowrap items-start justify-between gap-4 px-6 pb-4 pt-6">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Dialog.Title className={`${tt.display} m-0 text-xl font-semibold text-base-content`}>{title}</Dialog.Title>
              {subtitle && <p className={`${tt.subtitle} m-0`}>{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <SegmentedControl<View> label="Show as" options={VIEWS} value={view} onChange={setView} size="sm" />
              <button
                type="button"
                onClick={() => downloadCsv(table, title)}
                className="inline-flex items-center gap-1 rounded-full border border-base-300 px-3 py-1.5 text-xs font-medium hover:bg-tt-soft"
              >
                <ArrowDownTrayIcon className="h-3.5 w-3.5" aria-hidden />
                CSV
              </button>
              <button type="button" className="rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content" onClick={onClose}>
                <XMarkIcon className="h-5 w-5" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-6 pb-4">{view === "chart" ? chart : <TableView table={table} />}</div>
          <p className="m-0 border-t border-base-300 px-6 py-3 text-xs text-base-content/60">
            <span className="font-semibold text-base-content/70">Source: </span>
            {source}
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
