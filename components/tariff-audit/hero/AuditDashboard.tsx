"use client";

import { useEffect, useState } from "react";
import { mono } from "@/components/ui/font";
import { CountUp, Enter } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { DEMO_FLAGS, DemoFlag } from "../lib/demoFlags";

// The hero's audit result for an example account: totals that count up and flagged entries
// arriving one by one. Illustrative (see lib/demoFlags.ts).

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TONE: Record<DemoFlag["kind"], { label: string; text: string; ring: string }> = {
  overpaid: { label: "Overpaid", text: "text-emerald-600", ring: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  refundable: { label: "Refundable", text: "text-emerald-600", ring: "bg-teal-50 text-teal-700 ring-teal-200" },
  underpaid: { label: "Underpaid", text: "text-rose-600", ring: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const useFlagCycle = (visible = 4, everyMs = 2600) => {
  const [tick, setTick] = useState(visible);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setTick((t) => t + 1), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return Array.from({ length: visible }, (_, i) => {
    const serial = tick - i;
    return { ...DEMO_FLAGS[((serial % DEMO_FLAGS.length) + DEMO_FLAGS.length) % DEMO_FLAGS.length], serial };
  });
};

export const AuditDashboard = () => {
  const flags = useFlagCycle();
  return (
    <div className={mk.frame} aria-label="Example audit result">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Entry audit · example account</p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" /> Checking
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Entry lines checked", value: <CountUp to={1284} />, tone: "text-slate-900" },
          { label: "Overpaid found", value: <>$<CountUp to={86} />K</>, tone: "text-emerald-600" },
          { label: "Refundable", value: <>$<CountUp to={212} />K</>, tone: "text-teal-600" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{k.label}</p>
            <p className={`mt-1 text-3xl font-bold tabular-nums ${k.tone}`}>{k.value}</p>
          </div>
        ))}
      </div>
      <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Flagged lines</p>
      <ul className="flex flex-col gap-2">
        {flags.map((f, i) => {
          const tone = TONE[f.kind];
          return (
            <Enter key={f.serial}>
              <li className={`flex items-center justify-between gap-4 rounded-xl border bg-white px-4 py-3 ${i === 0 ? "border-teal-300 ring-2 ring-teal-100" : "border-slate-200"}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {f.product} <span className={`${mono.className} text-xs font-normal text-slate-400`}>{f.code}</span>
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {f.origin} · {f.date} · {f.reason}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 sm:inline ${tone.ring}`}>{tone.label}</span>
                  <span className={`text-base font-bold tabular-nums ${tone.text}`}>
                    {f.amount > 0 ? "+" : "−"}
                    {usd(Math.abs(f.amount))}
                  </span>
                </div>
              </li>
            </Enter>
          );
        })}
      </ul>
    </div>
  );
};
