"use client";

import { useEffect, useRef, useState } from "react";
import { GlobeAmericasIcon, ShieldCheckIcon, SparklesIcon, TicketIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { CountUp } from "@/components/ui/marketing";
import type { SavingsExample, SavingsKind } from "@/libs/tariff-savings-example";

// Savings discovery, one find at a time: a missed exemption, a missed trade program, then a cheaper
// origin. Each plays out once the card scrolls into view (what you pay today, then what you'd pay
// instead, then the saving), holds, and hands over to the next. Tabs jump straight to one. The card
// keeps one height for every find. The server renders the first find finished, so its numbers read
// without script.

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const STEP_MS = 650;
const HOLD_MS = 4200;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const KIND: Record<SavingsKind, { tab: string; Icon: typeof SparklesIcon }> = {
  exemption: { tab: "Missed exemption", Icon: ShieldCheckIcon },
  program: { tab: "Missed program", Icon: TicketIcon },
  origin: { tab: "Better origin", Icon: GlobeAmericasIcon },
};

export const SavingsFinder = ({ examples }: { examples: SavingsExample[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  // Steps shown so far, for the find they belong to (so a new find starts hidden)
  const [prog, setProg] = useState({ idx: 0, n: 99 });
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !ref.current) return;
    setProg({ idx: 0, n: 0 });
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setRunning(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const steps = examples[idx].options.length + 1;
  useEffect(() => {
    if (!running) return;
    let n = 0;
    setProg({ idx, n });
    let hold: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      n += 1;
      setProg({ idx, n });
      if (n >= steps) {
        clearInterval(timer);
        hold = setTimeout(() => setIdx((i) => (i + 1) % examples.length), HOLD_MS);
      }
    }, STEP_MS);
    return () => {
      clearInterval(timer);
      clearTimeout(hold);
    };
  }, [running, idx, steps, examples.length]);

  const e = examples[idx];
  const shown = prog.idx === idx ? prog.n : 0;
  const done = shown >= steps;
  const current = e.options[0];
  const best = e.options.reduce((a, b) => (b.duty < a.duty ? b : a));
  const saving = current.duty - best.duty;
  const max = Math.max(...e.options.map((o) => o.duty), 1);
  const asOf = new Date(`${e.asOf}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div ref={ref} className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-base-content">
      {/* One tab per kind of find */}
      <div className="grid grid-cols-3 gap-1 border-b border-base-300 bg-tt-soft p-1.5" role="tablist" aria-label="Kinds of savings">
        {examples.map((x, i) => {
          const { tab, Icon } = KIND[x.kind];
          const active = i === idx;
          return (
            <button
              key={x.kind}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setIdx(i)}
              className={`relative flex flex-col items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight transition-colors duration-300 sm:flex-row sm:gap-1.5 sm:text-sm sm:leading-5 ${active ? "bg-base-100 text-base-content shadow-xs" : "text-base-content/60 hover:text-base-content"}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-base-content/60"}`} aria-hidden />
              <span>{tab}</span>
              {active && running && (
                <span key={idx} className="sf-progress absolute inset-x-0 bottom-0 h-0.5 bg-primary" style={{ animationDuration: `${steps * STEP_MS + HOLD_MS}ms` }} />
              )}
            </button>
          );
        })}
      </div>

      {/* One fixed height for every find */}
      <div className="flex h-92 flex-col p-4 sm:p-5">
        <p className="text-base font-semibold">
          {e.product}, from {e.countryName}
          <span className={`${mono.className} ml-2 text-xs font-normal text-base-content/60`}>{e.htsno}</span>
        </p>

        <ul className="mt-4 flex flex-col gap-4">
          {e.options.map((o, i) => {
            const on = i < shown;
            const save = current.duty - o.duty;
            return (
              <li key={`${e.kind}-${o.label}`} className={`transition-all duration-700 ${EASE} ${on ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}>
                <div className="flex items-end justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-semibold">{o.label}</span>
                    {o.detail && <span className="block truncate text-xs text-base-content/60">{o.detail}</span>}
                  </span>
                  <span className="shrink-0 text-right tabular-nums">
                    <span className={`block text-lg font-bold leading-tight ${o.current ? "text-error" : "text-success"}`}>{usd(o.duty)}</span>
                    {!o.current && save > 0 && <span className="block text-xs font-semibold text-success">save {usd(save)}</span>}
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-tt-soft">
                  <div
                    className={`h-full origin-left rounded-full transition-transform duration-1000 ${EASE} ${o.current ? "bg-error" : "bg-success"}`}
                    style={{ transform: `scaleX(${on ? o.duty / max : 0})` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div
          className={`mt-auto flex items-center justify-between gap-3 hts-tracker-on-dark rounded-2xl bg-tt-side px-4 py-3.5 text-base-content transition-all duration-700 ${EASE} ${done ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
        >
          <span className="flex min-w-0 items-center gap-2.5 font-semibold">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-success-content">
              <SparklesIcon className="h-4 w-4" aria-hidden />
            </span>
            {e.action}
          </span>
          <span className="shrink-0 text-right">
            <span className="block text-2xl font-semibold [font-family:var(--font-tracker-display)] leading-tight tabular-nums text-success">
              {done && running ? (
                <>
                  $<CountUp key={idx} to={Math.round(saving)} ms={1100} />
                </>
              ) : (
                usd(saving)
              )}
            </span>
            <span className="text-xs text-base-content/60">saved a year</span>
          </span>
        </div>
      </div>

      <p className="border-t border-base-300 px-5 py-3 text-xs text-base-content/60">
        Duty a year on {usd(e.yearlyValue)} of imports, from the HTS Hero engine, {asOf}.
      </p>

      <style jsx>{`
        .sf-progress {
          transform-origin: left;
          animation-name: sf-progress;
          animation-timing-function: linear;
          animation-fill-mode: both;
        }
        @keyframes sf-progress {
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
