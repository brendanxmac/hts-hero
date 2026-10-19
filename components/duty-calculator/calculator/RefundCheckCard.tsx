"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { addDays, HistorySegment } from "@/tariffs/engine-v2/history";
import { formatMoney, formatPct } from "../lib/format";
import { shortDate } from "../rate-history/format";

// Under Recent Changes' list on /duty-calculator: the Tracker's refund check (audit checks), sold by
// showing it work. An entry owes the duty in force on its entry date, and entries filed just
// after a rate change often still pay the old rate. So the card audits a few example entries of
// this import, built from its real changes: each filed a few days after a change at the rate
// before it, against what it owed; the bars grow in turn, each row gets its verdict, and the
// total counts up. It plays once scrolled into view (instantly with reduced motion) and can be
// replayed. Examples are labeled as such; refunds are only ever "may" (DESIGN_SYSTEM.md §15).
// A section of the results card: the pitch on the left, the audit playing on the right.

const pct = (n: number) => formatPct(Math.round(n * 10) / 10);

interface Example {
  date: string;
  paid: number;
  owed: number;
  paidRate: number;
  owedRate: number;
}

// Up to three example entries: one filed at the old rate after each of the latest changes, then
// a recent one that paid the right amount
const examplesFrom = (history: HistorySegment[], customsValue: number, today: string): Example[] => {
  const value = customsValue > 0 ? customsValue : 1;
  const rate = (s: HistorySegment) => (s.result.totalDuty / value) * 100;
  const past = history.filter((s) => s.from <= today);
  if (!past.length) return [];
  const late: Example[] = [];
  past.forEach((s, i) => {
    const before = past[i - 1];
    if (!before || Math.abs(s.result.totalDuty - before.result.totalDuty) < 0.5) return;
    const date = addDays(s.from, 6);
    if (date >= s.to || date > today) return;
    late.push({ date, paid: before.result.totalDuty, owed: s.result.totalDuty, paidRate: rate(before), owedRate: rate(s) });
  });
  const latest = past[past.length - 1];
  const recent = addDays(today, -12);
  const right = {
    date: recent > latest.from ? recent : latest.from,
    paid: latest.result.totalDuty,
    owed: latest.result.totalDuty,
    paidRate: rate(latest),
    owedRate: rate(latest),
  };
  return [...late.slice(-2), right].sort((a, b) => a.date.localeCompare(b.date));
};

// The animation's timing: each row starts this long after the one before
const ROW_MS = 450;

export const RefundCheckCard = ({
  history,
  customsValue,
  onCheck,
}: {
  history: HistorySegment[];
  customsValue: number;
  onCheck: () => void;
}) => {
  const played = usePlayOnView();
  const today = new Date().toISOString().slice(0, 10);
  const past = history.filter((s) => s.from <= today);
  if (!past.length) return null;
  const changes = past.filter((s) => s.changes.length > 0).length;
  const examples = examplesFrom(history, customsValue, today);

  const overpaid = examples.reduce((sum, e) => sum + Math.max(0, e.paid - e.owed), 0);
  const underpaid = examples.reduce((sum, e) => sum + Math.max(0, e.owed - e.paid), 0);
  const max = Math.max(...examples.flatMap((e) => [e.paid, e.owed]), 1);
  const summaryDelay = examples.length * ROW_MS + 700;

  return (
    <section
      aria-labelledby="refund-check-title"
      className="grid grid-cols-1 gap-8 p-5 text-base-content sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center"
    >
      {/* The pitch */}
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className={tt.eyebrow("success")}>Refund check · Tariff Tracker</span>
          <h4 id="refund-check-title" className={`${tt.display} text-3xl font-semibold leading-tight tracking-tight text-base-content`}>
            Paid the old rate after a change?
          </h4>
          <p className={tt.subtitle}>
            {changes > 0
              ? `This import's duty changed ${changes} ${changes === 1 ? "time" : "times"} since ${shortDate(past[0].from, true)}. `
              : ""}
            Entries filed around a change often pay the rate from before it. We check every past entry against the duty
            owed on its entry date.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
          {[
            "Every entry, for every product in your catalog",
            "Checked against the duty in force on its entry date",
            "Refunds you may claim, and underpayments to fix",
          ].map((text) => (
            <li key={text} className="flex items-start gap-2.5 text-sm text-base-content/80">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckIcon className="h-3.5 w-3.5" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3">
          <button type="button" className={ui.button({ variant: "primary" })} onClick={onCheck}>
            Check my entries
          </button>
          <span className="text-xs text-base-content/60">{TRIAL_ALLOWANCE.auditChecks} free audit checks</span>
        </div>
      </div>

      {/* The audit, playing */}
      <div ref={played.ref} className="flex min-w-0 flex-col rounded-xl border border-base-300 bg-base-100 text-base-content">
        <div className="flex items-center justify-between gap-3 border-b border-base-300 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full transition-colors ${played.on ? "bg-success" : "bg-base-content/20"}`} aria-hidden />
            <span className="text-sm font-semibold text-base-content">Entry audit</span>
            <span className={tt.chip("neutral")}>Example</span>
          </div>
          <button
            type="button"
            onClick={played.replay}
            className="inline-flex items-center gap-1 rounded-sm text-xs font-medium text-base-content/60 hover:text-base-content focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <ArrowPathIcon className="h-3.5 w-3.5" aria-hidden />
            Replay
          </button>
        </div>

        <ul className="flex flex-col divide-y divide-base-300">
          {examples.map((e, i) => (
            <AuditRow key={e.date} example={e} max={max} on={played.on} delay={i * ROW_MS} />
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-2xl border-t border-base-300 bg-tt-soft/60 px-4 py-3 text-sm">
          <span className="text-base-content/60">On these {examples.length} entries</span>
          <span className="flex flex-wrap items-center gap-2">
            {overpaid > 0.5 && (
              <span className={`${tt.chip("success")} gap-1`}>
                May be owed <CountUp to={overpaid} on={played.on} delay={summaryDelay} />
              </span>
            )}
            {underpaid > 0.5 && (
              <span className={`${tt.chip("warning")} gap-1`}>
                <CountUp to={underpaid} on={played.on} delay={summaryDelay} /> to correct
              </span>
            )}
            {overpaid <= 0.5 && underpaid <= 0.5 && <span className={tt.chip("neutral")}>All paid right</span>}
          </span>
        </div>
      </div>
    </section>
  );
};

// One entry: what was paid against what was owed, as two bars that grow, then the verdict
const AuditRow = ({ example: e, max, on, delay }: { example: Example; max: number; on: boolean; delay: number }) => {
  const diff = e.paid - e.owed;
  const verdict =
    diff > 0.5
      ? { text: `May be owed ${formatMoney(diff)}`, tone: "success" as const }
      : diff < -0.5
        ? { text: `Underpaid ${formatMoney(-diff)}`, tone: "warning" as const }
        : { text: "Paid right", tone: "neutral" as const };
  const bar = (amount: number, extra: number): React.CSSProperties => ({
    width: on ? `${Math.max(2, (amount / max) * 100)}%` : "0%",
    transitionDelay: on ? `${delay + extra}ms` : "0ms",
  });
  return (
    <li className="flex flex-col gap-2.5 px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-base-content">Entry · {shortDate(e.date, true)}</span>
        <span
          className={`${tt.chip(verdict.tone)} ${on ? "scale-100 opacity-100 transition-all duration-300 motion-reduce:transition-none" : "scale-90 opacity-0"}`}
          style={{ transitionDelay: on ? `${delay + 750}ms` : "0ms" }}
        >
          {verdict.text}
        </span>
      </div>
      <Bar label="Paid" rate={e.paidRate} amount={e.paid} style={bar(e.paid, 0)} fill="bg-base-content/30" animate={on} />
      <Bar label="Owed" rate={e.owedRate} amount={e.owed} style={bar(e.owed, 180)} fill="bg-primary" animate={on} />
    </li>
  );
};

// Grows when `animate` turns on; resets at once (for a replay)
const Bar = ({
  label,
  rate,
  amount,
  style,
  fill,
  animate,
}: {
  label: string;
  rate: number;
  amount: number;
  style: React.CSSProperties;
  fill: string;
  animate: boolean;
}) => (
  <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_7rem] items-center gap-2 text-xs">
    <span className="text-base-content/60">{label}</span>
    <span className="h-2.5 overflow-hidden rounded-full bg-tt-soft">
      <span
        className={`block h-full rounded-full ${animate ? "transition-[width] duration-700 ease-out motion-reduce:transition-none" : ""} ${fill}`}
        style={style}
      />
    </span>
    <span className="text-right tabular-nums text-base-content/70">
      {formatMoney(amount)} <span className="text-base-content/60">· {pct(rate)}</span>
    </span>
  </div>
);

// A dollar figure counting up from zero once `on`, after `delay`
const CountUp = ({ to, on, delay }: { to: number; on: boolean; delay: number }) => {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!on) {
      setShown(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(to);
      return;
    }
    let frame = 0;
    const timer = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 700);
        setShown(to * (1 - Math.pow(1 - t, 3)));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    // Lands on the total even where frames don't run (a background tab)
    const done = setTimeout(() => setShown(to), delay + 800);
    return () => {
      clearTimeout(timer);
      clearTimeout(done);
      cancelAnimationFrame(frame);
    };
  }, [to, on, delay]);
  return <span className="tabular-nums">{formatMoney(shown)}</span>;
};

// Plays once the element is mostly in view; replay runs it again from the start. A callback ref,
// so it watches the element whenever it appears (the card renders nothing until there's history)
const usePlayOnView = () => {
  const [on, setOn] = useState(false);
  const [el, ref] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setOn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el]);
  const replay = () => {
    setOn(false);
    // A beat later, so the reset paints before it plays again
    setTimeout(() => setOn(true), 60);
  };
  return { on, replay, ref };
};
