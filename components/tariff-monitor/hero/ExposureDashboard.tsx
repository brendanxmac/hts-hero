"use client";

import { ReactNode } from "react";
import { mono } from "@/components/ui/font";
import { CountUp, Enter, PROGRAM, heat } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { useAlertCycle } from "../lib/useAlertCycle";

// The hero's live dashboard for an example account: KPIs, each product's duty by month as a heat
// map, and alerts arriving. The steel hardware row is real engine output (47.9%, then 37.9% from
// Feb 24, 2026, then 77.9% from Apr 6, 2026); the other rows and the KPIs are illustrative.

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

const ROWS: { name: string; origin: string; rates: number[] }[] = [
  { name: "Steel hardware", origin: "CN", rates: [47.9, 47.9, 47.9, 47.9, 37.9, 77.9, 77.9, 77.9, 77.9, 77.9, 77.9, 77.9] },
  { name: "Lager beer", origin: "CA", rates: [0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 50, 50] },
  { name: "Drones, 2–7 kg", origin: "CN", rates: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 50, 50] },
  { name: "Leather shoes", origin: "BR", rates: [18, 18, 18, 18, 18, 18, 18, 18, 43, 43, 43, 43] },
  { name: "Cotton T-shirts", origin: "VN", rates: [36.5, 36.5, 36.5, 36.5, 26.5, 26.5, 26.5, 26.5, 26.5, 26.5, 26.5, 26.5] },
  { name: "Wood chairs", origin: "MX", rates: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
];

const Kpi = ({ label, tone, children }: { label: string; tone: string; children: ReactNode }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className={`mt-1 text-3xl font-bold tabular-nums ${tone}`}>{children}</p>
  </div>
);

const HeatMap = () => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Duty by month · Nov 2025 to Oct 2026</p>
    <table className="w-full table-fixed border-separate border-spacing-[3px] text-xs">
      <thead>
        <tr>
          <th className="w-32" />
          {MONTHS.map((m) => (
            <th key={m} className="text-[10px] font-medium text-slate-400">
              {m}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map((r) => (
          <tr key={r.name}>
            <th scope="row" className="truncate pr-2 text-left font-medium text-slate-700">
              {r.name} <span className={`${mono.className} text-slate-400`}>{r.origin}</span>
            </th>
            {r.rates.map((p, i) => (
              // The heat color is a runtime value
              <td key={i} title={`${MONTHS[i]}: ${p}%`} className="h-6 rounded" style={{ backgroundColor: heat(p) }} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
      <span>0%</span>
      {/* The heat scale's two ends, as a gradient */}
      <span className="h-2 w-24 rounded-full" style={{ background: `linear-gradient(to right, ${heat(0)}, ${heat(80)})` }} />
      <span>80%+</span>
    </div>
  </div>
);

const Feed = () => {
  const alerts = useAlertCycle(3, 3000);
  return (
    <div className="flex flex-col gap-2">
      {alerts.map((a, i) => (
        <Enter key={a.serial}>
          <div className={`rounded-lg border bg-white px-3 py-2.5 transition-colors ${i === 0 ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200"}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {/* Program color is data */}
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: PROGRAM[a.program] }} />
                <span className="truncate">{a.program}</span>
              </span>
              <span className={`shrink-0 text-sm font-bold tabular-nums ${a.kind === "increase" ? "text-rose-600" : "text-emerald-600"}`}>
                {a.change}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-semibold text-slate-900">{a.title}</p>
            <p className="text-xs text-slate-500">{a.products} products · {a.date}</p>
          </div>
        </Enter>
      ))}
    </div>
  );
};

export const ExposureDashboard = () => (
  <div className={mk.frame} aria-label="Example Tariff Tracker dashboard">
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm font-semibold text-slate-900">Tariff exposure · example account</p>
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
        <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" /> Live
      </span>
    </div>
    <div className="grid grid-cols-3 gap-3">
      <Kpi label="Products watched" tone="text-slate-900">
        <CountUp to={248} />
      </Kpi>
      <Kpi label="Hit this quarter" tone="text-rose-600">
        <CountUp to={31} />
      </Kpi>
      <Kpi label="Refundable found" tone="text-emerald-600">
        $<CountUp to={212} />K
      </Kpi>
    </div>
    <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_13rem]">
      <HeatMap />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Alerts</p>
        <Feed />
      </div>
    </div>
  </div>
);
