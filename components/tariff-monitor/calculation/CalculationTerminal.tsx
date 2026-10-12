"use client";

import { useEffect, useRef, useState } from "react";
import { mono } from "@/components/ui/font";
import type { WorkedExample } from "@/libs/duty-calculator-content";

// The worked example, assembling line by line once it scrolls into view: each duty with its legal
// source, then the total. The server renders every line, so the numbers are readable without
// script; the animation only fades them in.

const FEE_CITATION: [RegExp, string][] = [
  [/merchandise/i, "19 CFR 24.23"],
  [/harbor/i, "19 CFR 24.24"],
];
const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const pct = (n: number) => `${Number(n.toFixed(4))}%`;

export const CalculationTerminal = ({ example, revision }: { example: WorkedExample; revision: string }) => {
  const rows = [
    { label: "Base rate", code: example.htsno, rate: example.baseRate, amount: example.baseAmount, tone: "text-sky-300" },
    ...example.lines.map((l) => ({ label: l.program, code: l.code, rate: pct(l.ratePct), amount: l.amount, tone: "text-amber-300" })),
    ...example.fees.map((f) => ({
      label: f.name,
      code: FEE_CITATION.find(([re]) => re.test(f.name))?.[1] ?? "",
      rate: pct(f.ratePct),
      amount: f.amount,
      tone: "text-slate-400",
    })),
  ];
  const total = example.totalDuty + example.totalFees;
  const steps = rows.length + 2;

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
      }, 420);
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, [steps]);

  const fade = (i: number) => `transition-opacity duration-500 ${i < shown ? "opacity-100" : "opacity-0"}`;

  return (
    <div ref={ref} className={`${mono.className} overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e14] text-sm shadow-2xl`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-5 py-3 text-xs text-slate-500">
        <span>
          duty {example.htsno} · {example.countryName} · {usd(example.customsValue)} · ocean
        </span>
        <span className="flex items-center gap-1.5 text-teal-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-300" /> {revision}
        </span>
      </div>
      <div className="overflow-x-auto px-5 py-4">
        <div className="min-w-[30rem]">
          {rows.map((r, i) => (
            <div key={`${r.code}-${r.label}`} className={`grid grid-cols-[minmax(0,1fr)_7.5rem_5rem_6.5rem] gap-3 py-1.5 ${fade(i)}`}>
              <span className="truncate text-slate-200">{r.label}</span>
              <span className="text-slate-500">{r.code}</span>
              <span className={`text-right ${r.tone}`}>{r.rate}</span>
              <span className="text-right text-slate-200">{usd(r.amount)}</span>
            </div>
          ))}
          <div className={`mt-2 grid grid-cols-[minmax(0,1fr)_8rem] border-t border-white/10 pt-3 ${fade(rows.length)}`}>
            <span className="font-semibold text-white">Total duty and fees</span>
            <span className="text-right text-lg font-semibold text-white">{usd(total)}</span>
          </div>
          <p className={`mt-3 text-xs text-teal-300 ${fade(rows.length + 1)}`}>
            ✓ Watching {example.htsno} from {example.countryName}: every HTS revision and announcement checked
          </p>
        </div>
      </div>
    </div>
  );
};
