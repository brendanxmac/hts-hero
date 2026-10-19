"use client";

import { useEffect, useRef, useState } from "react";
import { mono } from "@/components/ui/font";
import type { AuditExample } from "@/libs/tariff-audit-example";

// One past entry recalculated line by line once it scrolls into view: what was paid, what was owed,
// and the difference. Every line is server-rendered; the animation only fades them in.

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export const RecalcTerminal = ({ example }: { example: AuditExample }) => {
  const steps = example.lines.length + 2;
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(steps);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    setShown(0);
    let timer: ReturnType<typeof setInterval>;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let n = 0;
      timer = setInterval(() => {
        n += 1;
        setShown(n);
        if (n >= steps) clearInterval(timer);
      }, 450);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [steps]);

  const fade = (i: number) => `transition-opacity duration-500 ${i < shown ? "opacity-100" : "opacity-0"}`;
  const diff = example.paidTotal - example.owedTotal;

  return (
    <div ref={ref} className={`${mono.className} overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] text-sm shadow-2xl`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3 text-xs text-slate-500">
        <span>
          audit {example.htsno} · {example.countryName} · {usd(example.customsValue)} · entered {longDate(example.entryDate)}
        </span>
        <span className="text-teal-300">rules in force that day</span>
      </div>
      <div className="overflow-x-auto px-5 py-4">
        <div className="min-w-136">
          <div className="grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_6.5rem] gap-3 pb-2 text-xs uppercase tracking-wider text-slate-500">
            <span>Line</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Owed</span>
            <span className="text-right">Difference</span>
          </div>
          {example.lines.map((l, i) => {
            const d = l.paid - l.owed;
            return (
              <div key={`${l.code}-${l.name}`} className={`grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_6.5rem] gap-3 py-1.5 ${fade(i)} ${d ? "rounded-sm bg-rose-500/10" : ""}`}>
                <span className="truncate text-slate-200">
                  {l.name} {l.code && <span className="text-slate-500">{l.code}</span>}
                </span>
                <span className={`text-right ${d ? "text-rose-300 line-through decoration-rose-400/70" : "text-slate-300"}`}>{usd(l.paid)}</span>
                <span className="text-right text-slate-200">{usd(l.owed)}</span>
                <span className={`text-right ${d ? "font-semibold text-emerald-300" : "text-slate-600"}`}>{d ? `+${usd(d)}` : "—"}</span>
              </div>
            );
          })}
          <div className={`mt-2 grid grid-cols-[minmax(0,1fr)_6.5rem_6.5rem_6.5rem] gap-3 border-t border-white/10 pt-3 ${fade(example.lines.length)}`}>
            <span className="font-semibold text-white">Total duty and fees</span>
            <span className="text-right text-slate-300">{usd(example.paidTotal)}</span>
            <span className="text-right font-semibold text-white">{usd(example.owedTotal)}</span>
            <span className="text-right text-lg font-semibold text-emerald-300">+{usd(diff)}</span>
          </div>
          <p className={`mt-3 text-xs text-emerald-300 ${fade(example.lines.length + 1)}`}>
            ✓ Overpaid {usd(diff)}: Section 122 exempts Section 232 articles (9903.03.06). Recoverable by post-summary
            correction or protest.
          </p>
        </div>
      </div>
    </div>
  );
};
