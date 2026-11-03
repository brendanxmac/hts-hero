"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { mono } from "@/components/ui/font";
import type { AlertExample } from "@/libs/tariff-alerts-example";

// The hero's picture: alerts from HTS Hero landing like push notifications, one at a time. Each
// slides in from the side and pops, the bell rings, the duty before → after pops in; it rests and
// slowly fades away before the next slides in, on a loop: the imports the action hit, with a tariff
// cut second. Rates are the engine's (libs/tariff-alerts-example.ts), in %. Still, on the first one,
// for people who turn motion off.

const CYCLE_MS = 7000;

// How many of your imports each alert in the loop says it affects (one is shown), so they don't all
// read the same. Example catalogs, like the rest of the picture.
const AFFECTS = [3, 1, 5, 2, 4];

const fmt = (n: number) => `${n % 1 === 0 ? n.toFixed(0) : n.toFixed(1)}%`;


export const AlertCard = ({ example }: { example: AlertExample }) => {
  // Each loop remounts the alert with the next import, so its arrival plays from the start
  const [loop, setLoop] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setLoop((n) => n + 1), CYCLE_MS);
    return () => clearInterval(t);
  }, []);

  // The imports the action hit, with a tariff cut second, so the loop shows duty can go down too
  const hits = example.rows.filter((r) => r.afterPct > r.beforePct);
  const cut = example.relief.find((r) => r.afterPct < r.beforePct);
  const alerts = cut ? [...hits.slice(0, 1), cut, ...hits.slice(1)] : hits;
  if (!alerts.length) return null;
  const imp = alerts[loop % alerts.length];
  const change = Math.round((imp.afterPct - imp.beforePct) * 10) / 10;
  const up = change > 0;
  const affects = AFFECTS[(loop % alerts.length) % AFFECTS.length];
  const headline = `${up ? "A new tariff" : "A tariff cut"} affects ${affects} of your products`;

  return (
    <figure className="flex flex-col items-center" aria-label="A tariff alert from HTS Hero arriving like a notification">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .ta-float { animation: ta-float 6s ease-in-out infinite; }
          .ta-life { animation: ta-life ${CYCLE_MS}ms linear both; }
          .ta-ring { animation: ta-ring 900ms ease-in-out 500ms both; transform-origin: 50% 0; }
          .ta-ping { animation: ta-ping 1200ms ease-out 450ms both; }
          .ta-rate { animation: ta-pop 500ms cubic-bezier(.2,1.6,.4,1) 900ms both; }
          .ta-badge { animation: ta-pop 500ms cubic-bezier(.2,1.6,.4,1) 1100ms both; }
        }
        @keyframes ta-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        /* Slide in from the side and pop, like a push notification, rest, then slowly fade away */
        @keyframes ta-life {
          0% { opacity: 0; transform: translateX(72px) scale(.9); animation-timing-function: cubic-bezier(.2,.9,.3,1); }
          6% { opacity: 1; transform: translateX(-6px) scale(1.02); animation-timing-function: ease-out; }
          9% { transform: translateX(0) scale(1); }
          76% { opacity: 1; transform: translateX(0) scale(1); animation-timing-function: ease-in-out; }
          92% { opacity: 0; transform: translateX(0) scale(.97); }
          100% { opacity: 0; transform: translateX(0) scale(.97); }
        }
        @keyframes ta-ring { 0%, 100% { transform: rotate(0); } 15% { transform: rotate(18deg); } 30% { transform: rotate(-16deg); } 45% { transform: rotate(12deg); } 60% { transform: rotate(-8deg); } 75% { transform: rotate(4deg); } }
        @keyframes ta-ping { 0% { opacity: .7; transform: scale(1); } 100% { opacity: 0; transform: scale(2.2); } }
        @keyframes ta-pop { 0% { opacity: 0; transform: scale(.6); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="ta-float relative w-full max-w-lg">
        {/* The alert */}
        <div
          key={loop}
          className="ta-life hts-tracker-inverse relative overflow-hidden rounded-[28px] bg-base-100 text-base-content shadow-2xl shadow-base-content/15 ring-1 ring-base-300"
        >
          {/* Who it's from */}
          <div className="flex items-center gap-3 border-b border-base-300 px-6 py-4">
            <span className="relative shrink-0">
              <span className="ta-ping absolute inset-0 rounded-full bg-error/40 opacity-0" aria-hidden />
              <Image src={logo} alt="HTS Hero" width={36} height={36} className="relative" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-base-content">HTS Hero</span>
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
                  <BellAlertIcon className="ta-ring h-3 w-3" aria-hidden /> Tariff Alert
                </span>
              </p>
              <p className="text-xs text-base-content/55">to you@yourcompany.com</p>
            </div>
            <span className="text-xs text-base-content/50">just now</span>
          </div>

          {/* What happened, to which product */}
          <div className="px-6 pb-6 pt-6">
            <p className="text-xl font-semibold leading-snug text-base-content [font-family:var(--font-tracker-display)]">
              {headline}
            </p>

            <div className="mt-5 rounded-2xl bg-tt-soft p-5 ring-1 ring-base-300">
              <p className="font-semibold text-base-content">{imp.name}</p>
              <p className={`${mono.className} text-xs text-base-content/55`}>
                {imp.htsno} · from {imp.country}
              </p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="flex items-center gap-3 tabular-nums [font-family:var(--font-tracker-display)]">
                  <span className="text-3xl font-semibold text-base-content/45 line-through decoration-base-content/25">{fmt(imp.beforePct)}</span>
                  <ArrowRightIcon className={`h-6 w-6 ${up ? "text-error" : "text-success"}`} aria-hidden />
                  <span className={`ta-rate inline-block text-5xl font-bold ${up ? "text-error" : "text-success"}`}>{fmt(imp.afterPct)}</span>
                </p>
                <span className={`ta-badge rounded-full px-3 py-1 text-sm font-bold ${up ? "bg-error text-error-content" : "bg-success text-success-content"}`}>
                  {up ? "+" : "−"}
                  {fmt(Math.abs(change))}
                </span>
              </div>
              <p className="mt-2 text-xs text-base-content/55">Total duty on this product, before and after</p>
            </div>
            {affects > 1 && (
              <p className="mt-3 text-center text-sm font-semibold text-base-content/60">
                + {affects - 1} more of your products affected
              </p>
            )}
          </div>
        </div>
      </div>
    </figure>
  );
};
