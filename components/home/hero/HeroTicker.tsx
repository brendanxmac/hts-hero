"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { PROGRAM } from "@/components/ui/marketing";
import { DEMO_ALERTS } from "@/components/tariff-monitor/lib/demoAlerts";
import { LANES } from "@/components/tariff-monitor";
import { CommandCenter } from "../command/CommandCenter";
import { ComingChip } from "@/components/ui/marketing/ComingChip";
import { AUDITS_ENABLED, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import { OFFER } from "../lib/offer";
import { darkBand, display, followPage, glow, moneyButton } from "../lib/theme";

// The homepage hero: a trading-floor ticker of real 2026 tariff changes runs across the top
// of a dark hero; below, the promise beside the example account (monitoring, savings, audit). One button.
// Savings and audits show ahead of the Tracker (MARKET_SAVINGS / MARKET_AUDITS), labeled while off.

const TAPE = [
  ...DEMO_ALERTS.map((a) => ({ key: a.id, program: a.program as string, color: PROGRAM[a.program], text: a.title, change: a.change, date: a.date, up: a.kind === "increase" })),
  ...LANES.map((l) => ({ key: `lane-${l.id}`, program: l.program, color: l.color, text: `${l.country} · ${l.detail}`, change: l.change, date: l.date, up: !l.change.startsWith("−") })),
];

const Tape = () => (
  <div className="group relative overflow-hidden border-b border-base-300 bg-base-200/60 py-2.5" aria-label="Recent US tariff changes">
    <div className="tariff-tape flex w-max gap-3">
      {[...TAPE, ...TAPE].map((t, i) => (
        <span key={`${t.key}-${i}`} className="flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-full bg-tt-side-card px-3.5 py-1 text-sm">
          {/* Program color is data */}
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
          <span className="font-bold uppercase tracking-wide text-base-content/80">{t.program}</span>
          <span className="text-base-content/70">{t.text}</span>
          <span className={`font-bold tabular-nums ${t.up ? "text-error" : "text-success"}`}>{t.change}</span>
          <span className="text-base-content/60">{t.date}</span>
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
  <header className={`relative overflow-hidden ${darkBand}`}>
    <div aria-hidden className={glow} />
    <Tape />
    <div className="relative mx-auto grid max-w-(--breakpoint-xl) grid-cols-1 items-center gap-14 px-6 pb-24 pt-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:px-8 lg:pt-10">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">US Tariff Intelligence</p>
        <h1 className={`${display} mt-4 text-5xl font-semibold leading-[1.04] tracking-tight lg:text-[3.4rem]`}>
          Monitor &amp; Audit your US Tariffs{" "}
          <span className="text-primary">on Autopilot</span>
        </h1>
        <p className="mt-5 text-xl leading-relaxed text-base-content/70">
          HTS Hero calculates every duty, alerts you the moment a change hits your products, uncovers possible savings, and audits every
          import for duty you may get back, 24/7.
        </p>
        <Link
          href={OFFER.href}
          className={`${moneyButton} mt-10`}
        >
          {OFFER.cta}
          <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
        <p className="mt-4 max-w-md text-sm text-base-content/60">{OFFER.note}</p>
        {(!SAVINGS_ENABLED || !AUDITS_ENABLED) && (
          <p className="mt-3 flex max-w-md flex-wrap items-center gap-2 text-sm text-base-content/60">
            <ComingChip /> Automatic savings detection and auditing, included in the trial and every plan
          </p>
        )}
      </div>
      <div className={followPage}>
        <CommandCenter />
      </div>
    </div>
  </header>
);
