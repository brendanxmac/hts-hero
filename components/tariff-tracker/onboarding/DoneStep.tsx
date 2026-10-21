"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { mono } from "@/components/ui/font";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { DONE_STEP, prefersReducedMotion, delay, useCountUp } from "./parts";
import { useTracker } from "../TrackerContext";

// The imports are in: the Tracker works through them in front of the user (a checklist that ticks
// off in turn), the trial's 14 days start, and the first real numbers show before they've even
// opened the dashboard: the average duty on what they just added, and the highest.

const DAY = 86_400_000;

// A rate counting up, from when it first shows
const CountUpPct = ({ value }: { value: number }) => {
  const shown = useCountUp(value, { wait: 150, duration: 900 });
  return <span className={tt.metric}>{shown.toFixed(1)}%</span>;
};

export const DoneStep = ({ keys, trialEndsAt, onOpen }: { keys: string[]; trialEndsAt: string | null; onOpen: () => void }) => {
  const { products } = useTracker();
  const added = useMemo(() => products.filter((p) => keys.includes(p.key)), [products, keys]);
  const count = keys.length;
  const countries = new Set(added.map((p) => p.entry.country.code)).size;
  const average = added.length ? added.reduce((sum, p) => sum + p.totalPct, 0) / added.length : null;
  const top = added.reduce<(typeof added)[number] | null>((best, p) => (!best || p.totalPct > best.totalPct ? p : best), null);

  const steps = [
    `Matched ${count.toLocaleString("en-US")} ${count === 1 ? "code" : "codes"} to the current HTS`,
    `Worked out today's duty on each, from ${countries || 1} ${countries === 1 ? "country" : "countries"}`,
    "Lined up their rate history and this year's tariff changes",
    "Turned on alerts for every new change",
  ];
  const [ticked, setTicked] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setTicked(steps.length);
      return;
    }
    const timers = steps.map((_, i) => setTimeout(() => setTicked(i + 1), 450 + i * 450));
    return () => timers.forEach(clearTimeout);
  }, [steps.length]);
  const finished = ticked >= steps.length;
  const ends = new Date(trialEndsAt ? Date.parse(trialEndsAt) : Date.now() + REVERSE_TRIAL.days * DAY).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
      <span
        className="tt-ob-pop flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-content shadow-[0_14px_30px_-12px_var(--tt-ob-glow-success)]"
        aria-hidden
      >
        <CheckIcon className="h-8 w-8" />
      </span>
      <div className="flex flex-col gap-3">
        <span className={`${tt.eyebrow("success")} tt-ob-rise`}>Step {DONE_STEP} · Get Started!</span>
        <h1
          id="tt-onboarding-title"
          tabIndex={-1}
          className={`${tt.display} tt-ob-rise m-0 text-[2.4rem] font-semibold leading-tight tracking-tight text-base-content outline-hidden`}
          style={delay(60)}
        >
          You&apos;re tracking {count.toLocaleString("en-US")} {count === 1 ? "import" : "imports"}.
        </h1>
        <p className="tt-ob-rise m-0 text-base text-base-content/75" style={delay(120)}>
          Your {REVERSE_TRIAL.days}-day free trial has started: everything the Tracker does, until <strong className="text-base-content">{ends}</strong>.
        </p>
      </div>

      <ul className={`${tt.panel} m-0 flex w-full list-none flex-col gap-3 p-5 text-left`} aria-live="polite">
        {steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 text-sm transition-opacity ${i < ticked ? "opacity-100" : "opacity-40"}`}>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${i < ticked ? "bg-success text-success-content" : "border-2 border-base-300"}`}
              aria-hidden
            >
              {i < ticked && <CheckIcon className="h-4 w-4" />}
            </span>
            <span className={i < ticked ? "font-semibold text-base-content" : "text-base-content/70"}>{s}</span>
          </li>
        ))}
      </ul>

      {finished && average !== null && top && (
        <div className="tt-ob-rise grid w-full gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 rounded-xl bg-(--tt-ob-tile) p-4 text-left ring-1 ring-(--tt-ob-tile-edge)">
            <span className="text-xs text-base-content/60">Average duty on what you added</span>
            <CountUpPct value={average} />
          </div>
          <div className="flex flex-col gap-1 rounded-xl bg-(--tt-ob-tile) p-4 text-left ring-1 ring-(--tt-ob-tile-edge)">
            <span className="text-xs text-base-content/60">Highest rate</span>
            <span className={tt.metric}>{top.totalPct.toFixed(1)}%</span>
            <span className="truncate text-xs text-base-content">
              <span className={`${mono.className} font-semibold`}>{top.entry.element.htsno}</span> · {top.entry.country.flag} {top.entry.country.name}
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "lg" })} px-8 ${finished ? "tt-ob-rise" : "invisible"}`}
        onClick={onOpen}
        autoFocus={finished}
      >
        Open my dashboard
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};
