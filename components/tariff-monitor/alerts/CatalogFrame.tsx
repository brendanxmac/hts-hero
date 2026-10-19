"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ChatBubbleLeftRightIcon, EnvelopeIcon, UsersIcon } from "@heroicons/react/24/outline";
import { mono } from "@/components/ui/font";
import { PROGRAM, ProgramName } from "@/components/ui/marketing";

// A framed view of the Tracker's catalog. One change lands at a time: its row's rate rolls from the
// old duty to the new one, and the alert for it slides in on top. The catalog is an example built on
// real 2026 changes: Section 338 on Canadian beer (Aug 22), Section 232 on drones (Sep 3) and
// Section 301 on Brazil (Jul 22). Rates and costs are illustrative.

type Alert = { program: ProgramName; cost: string; channel: string; to: string };
type Row = { name: string; code: string; origin: string; was: string; now: string; alert: Alert | null };

const ROWS: Row[] = [
  { name: "Lager beer", code: "2203.00", origin: "Canada", was: "0.0%", now: "50.0%", alert: { program: "Section 338", cost: "+$228,500", channel: "Slack", to: "#imports" } },
  { name: "Drone, 2–7 kg", code: "8806.22", origin: "China", was: "25.0%", now: "50.0%", alert: { program: "Section 232", cost: "+$61,000", channel: "Email", to: "you@company.com" } },
  { name: "Leather shoes", code: "6403.99", origin: "Brazil", was: "18.0%", now: "43.0%", alert: { program: "Section 301", cost: "+$94,200", channel: "Teams", to: "Trade Compliance" } },
  { name: "Cotton T-shirts", code: "6109.10", origin: "Vietnam", was: "26.5%", now: "26.5%", alert: null },
  { name: "Wood chairs", code: "9401.61", origin: "Mexico", was: "0.0%", now: "0.0%", alert: null },
];
const CHANGED = ROWS.filter((r) => r.alert).length;

const CHANNEL_STYLE: Record<string, { Icon: typeof EnvelopeIcon; tint: string }> = {
  Slack: { Icon: ChatBubbleLeftRightIcon, tint: "bg-warning/10 text-warning" },
  Email: { Icon: EnvelopeIcon, tint: "bg-error/10 text-error" },
  Teams: { Icon: UsersIcon, tint: "bg-warning/10 text-warning" },
};

const STEP_MS = 3600;
// Step 0 is a quiet catalog; steps 1..CHANGED each land one change. Then it starts over.
const STEPS = CHANGED + 1;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

// Two stacked values that roll from one to the other, like a departure board
const Roll = ({ from, to, on }: { from: string; to: string; on: boolean }) => (
  <span className="relative inline-grid overflow-hidden align-bottom">
    <span className={`col-start-1 row-start-1 transition-all duration-700 ${EASE} ${on ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"}`}>{from}</span>
    <span className={`col-start-1 row-start-1 text-error transition-all duration-700 ${EASE} ${on ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>{to}</span>
  </span>
);

const Toast = ({ row, state, progressKey }: { row: Row; state: "in" | "past" | "next"; progressKey: number }) => {
  const a = row.alert!;
  const { Icon, tint } = CHANNEL_STYLE[a.channel];
  const pos = {
    in: "translate-y-0 scale-100 opacity-100",
    past: "-translate-y-4 scale-95 opacity-0",
    next: "translate-y-8 scale-[0.97] opacity-0",
  }[state];
  return (
    <div
      aria-hidden={state !== "in"}
      className={`absolute inset-x-0 bottom-0 transition-all duration-700 will-change-transform ${EASE} ${pos} ${state === "in" ? "z-10" : "pointer-events-none"}`}
    >
      <div className="overflow-hidden rounded-2xl bg-base-100 ring-1 ring-base-300">
        <div className="flex items-center gap-2.5 px-4 pt-3.5">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${tint}`}>
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <p className="min-w-0 flex-1 truncate text-xs font-medium text-base-content/60">
            <span className="font-semibold text-base-content/70">{a.channel}</span> · {a.to}
          </p>
          <span className="text-xs text-base-content/60">now</span>
        </div>
        <div className="px-4 pb-4 pt-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-error">
            {/* Program color is data */}
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PROGRAM[a.program] }} />
            Tariff alert · {a.program}
          </p>
          <p className="mt-1 text-base font-bold text-base-content">
            {row.name} from {row.origin}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-error/10 px-3.5 py-2.5 ring-1 ring-error/20">
            <span className="flex items-center gap-2 text-lg font-bold tabular-nums">
              <span className="text-base-content/60 line-through decoration-base-content/30">{row.was}</span>
              <ArrowRightIcon className="h-4 w-4 text-error" aria-hidden />
              <span className="text-error">{row.now}</span>
            </span>
            <span className="text-right text-sm font-semibold leading-tight text-error">
              {a.cost}
              <span className="block text-xs font-medium text-error">a year</span>
            </span>
          </div>
        </div>
        {/* Time until the next alert */}
        <div className="h-1 bg-tt-soft">
          {state === "in" && <div key={progressKey} className="cf-progress h-full bg-primary" style={{ animationDuration: `${STEP_MS}ms` }} />}
        </div>
      </div>
    </div>
  );
};

export const CatalogFrame = () => {
  const [step, setStep] = useState(CHANGED);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % STEPS;
        if (next === 0) setCycle((c) => c + 1);
        return next;
      });
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  // Rows with an alert, in order; the first `step` of them have changed
  const changedRows = ROWS.filter((r) => r.alert);
  const landed = (r: Row) => r.alert !== null && changedRows.indexOf(r) < step;
  const latest = step > 0 ? changedRows[step - 1] : null;

  return (
    <div className="relative pb-32">
      <div className="overflow-hidden rounded-2xl bg-base-100 ring-1 ring-base-300">
        <div className="flex items-center gap-2 border-b border-base-300 bg-tt-soft px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-error" />
          <span className="h-3 w-3 rounded-full bg-warning" />
          <span className="h-3 w-3 rounded-full bg-success" />
          <span className="ml-3 rounded-md bg-base-100 px-3 py-1 text-xs text-base-content/60 ring-1 ring-base-300">htshero.com/tariff-tracker</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-base font-semibold text-base-content">Your catalog</p>
            <p className="text-sm text-base-content/60">{ROWS.length} products · example</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ring-1 transition-colors duration-500 ${step > 0 ? "bg-error/10 text-error ring-error/20" : "bg-success/10 text-success ring-success"}`}
          >
            {step > 0 ? `${step} changed` : "All quiet"}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-120 text-left text-sm">
            <thead className="bg-tt-soft text-xs uppercase tracking-wider text-base-content/60">
              <tr>
                <th className="px-5 py-2 font-semibold">Product</th>
                <th className="px-3 py-2 font-semibold">Change</th>
                <th className="px-3 py-2 text-right font-semibold">Was</th>
                <th className="px-5 py-2 text-right font-semibold">Now</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const on = landed(r);
                const active = r === latest;
                return (
                  <tr key={r.code} className={`border-t border-base-300 transition-colors duration-700 ${active ? "bg-error/10/80" : "bg-base-100"}`}>
                    <td className="relative px-5 py-3">
                      <span className={`absolute inset-y-0 left-0 w-1 bg-error transition-opacity duration-700 ${active ? "opacity-100" : "opacity-0"}`} />
                      <span className="font-medium text-base-content">{r.name}</span>
                      <span className={`${mono.className} ml-2 text-xs text-base-content/60`}>{r.code}</span>
                      <span className="block text-xs text-base-content/60">{r.origin}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="relative inline-grid">
                        <span className={`col-start-1 row-start-1 text-xs text-base-content/60 transition-opacity duration-500 ${on ? "opacity-0" : "opacity-100"}`}>No change</span>
                        {r.alert && (
                          <span
                            className={`col-start-1 row-start-1 inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-base-content/70 transition-all duration-700 ${EASE} ${on ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"}`}
                          >
                            {/* Program color is data */}
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PROGRAM[r.alert.program] }} />
                            {r.alert.program}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-base-content/60">{r.was}</td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-base-content">
                      {r.alert ? <Roll from={r.was} to={r.now} on={on} /> : r.now}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="absolute bottom-0 right-4 w-92 max-w-[calc(100%-2rem)] sm:-right-6" aria-live="polite">
        {/* Keeps the stack's height while every toast is absolutely positioned */}
        <div className="invisible h-46" />
        {changedRows.map((r, i) => {
          const state = latest === r ? "in" : i < step ? "past" : "next";
          return <Toast key={r.code} row={r} state={state} progressKey={cycle * STEPS + step} />;
        })}
      </div>

      <style jsx global>{`
        .cf-progress {
          animation-name: cf-progress;
          animation-timing-function: linear;
          animation-fill-mode: both;
          transform-origin: left;
        }
        @keyframes cf-progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
};
