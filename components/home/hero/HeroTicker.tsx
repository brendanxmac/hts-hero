"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { PROGRAM } from "@/components/ui/marketing";
import { DEMO_ALERTS } from "@/components/tariff-monitor/lib/demoAlerts";
import { LANES } from "@/components/tariff-monitor";
import { CommandCenter } from "../command/CommandCenter";
import { OFFER } from "../lib/offer";

// The homepage hero: a trading-floor ticker of real 2026 tariff changes runs across the top
// of a dark hero; below, the promise beside the example account (monitoring, savings, audit). One button.

const TAPE = [
  ...DEMO_ALERTS.map((a) => ({ key: a.id, program: a.program as string, color: PROGRAM[a.program], text: a.title, change: a.change, date: a.date, up: a.kind === "increase" })),
  ...LANES.map((l) => ({ key: `lane-${l.id}`, program: l.program, color: l.color, text: `${l.country} · ${l.detail}`, change: l.change, date: l.date, up: !l.change.startsWith("−") })),
];

const Tape = () => (
  <div className="group relative overflow-hidden border-b border-white/10 bg-black/30 py-3" aria-label="Recent US tariff changes">
    <div className="tariff-tape flex w-max gap-10">
      {[...TAPE, ...TAPE].map((t, i) => (
        <span key={`${t.key}-${i}`} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-sm">
          {/* Program color is data */}
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
          <span className="font-bold uppercase tracking-wide text-slate-300">{t.program}</span>
          <span className="text-slate-400">{t.text}</span>
          <span className={`font-bold tabular-nums ${t.up ? "text-rose-400" : "text-emerald-400"}`}>{t.change}</span>
          <span className="text-slate-500">{t.date}</span>
        </span>
      ))}
    </div>
    <style jsx>{`
      .tariff-tape {
        animation: tariff-tape 60s linear infinite;
      }
      .group:hover .tariff-tape {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .tariff-tape {
          animation: none;
        }
      }
      @keyframes tariff-tape {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }
    `}</style>
  </div>
);

export const HeroTicker = () => (
  <header className="relative overflow-hidden bg-[#070d1a] text-white">
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(50rem_26rem_at_80%_20%,rgba(45,212,191,0.18),transparent),radial-gradient(40rem_24rem_at_0%_100%,rgba(14,165,233,0.14),transparent)]" />
    <Tape />
    <div className="relative mx-auto grid max-w-screen-xl grid-cols-1 items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:px-8 lg:pt-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-300">US Tariff Intelligence</p>
        <h1 className="mt-4 text-5xl font-extrabold leading-[1.04] tracking-tight lg:text-[3.4rem]">
          Monitor &amp; Audit US Import Tariffs{" "}
          <span className="text-teal-300">on Autopilot</span>
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-slate-300">
          HTS Hero calculates every duty, alerts you the moment a change hits your products, and audits every entry for money
          back. Around the clock.
        </p>
        <Link
          href={OFFER.href}
          className="group mt-10 inline-flex h-16 items-center gap-3 rounded-2xl bg-teal-400 px-9 text-lg font-extrabold text-slate-950 shadow-[0_0_60px_-10px_rgba(45,212,191,0.9)] transition-colors hover:bg-teal-300"
        >
          {OFFER.cta}
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <p className="mt-4 max-w-md text-sm text-slate-400">{OFFER.note}</p>
      </div>
      <CommandCenter />
    </div>
  </header>
);
