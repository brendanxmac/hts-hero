"use client";

import { BellAlertIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { delay, useCountUp } from "./parts";

// What the Tracker looks like once the imports are in: a made-up catalog, labeled EXAMPLE, coming
// to life piece by piece. Headline numbers count up, the duty rate's line draws in, then the
// alert that makes it worth it slides in: a tariff change hitting three of the imports. Rate
// changes are shown before → after and in % (never dollars), like every real alert.

const Metric = ({
  label,
  to,
  format,
  note,
  tone,
  wait,
}: {
  label: string;
  to: number;
  format: (n: number) => string;
  note: string;
  tone: string;
  wait: number;
}) => {
  const value = useCountUp(to, { wait });
  return (
    <div className="tt-ob-rise flex flex-col gap-1 rounded-xl bg-tt-soft p-3.5" style={delay(wait - 150)}>
      <span className="text-xs text-base-content/60">{label}</span>
      <span className={`${tt.display} text-2xl font-semibold leading-tight tabular-nums text-base-content`}>{format(value)}</span>
      <span className={`text-[0.7rem] font-semibold ${tone}`}>{note}</span>
    </div>
  );
};

// The average duty rate over 12 months: flat, then a step up when a new tariff lands
const LINE = "M0,70 L60,70 L100,68 L140,68 L170,40 L230,38 L270,38 L300,22";

const IMPORTS = [
  {
    code: "8413.91.90.15",
    flag: "🇧🇷",
    country: "Brazil",
    from: "10.0%",
    to: "50.0%",
    hit: true,
  },
  {
    code: "8409.99.91.90",
    flag: "🇦🇷",
    country: "Argentina",
    from: "12.5%",
    to: "12.5%",
    hit: false,
  },
  {
    code: "8483.30.80.89",
    flag: "🇦🇹",
    country: "Austria",
    from: "15.0%",
    to: "15.0%",
    hit: false,
  },
];

export const PreviewDashboard = () => (
  <div className="tt-ob-pop relative" style={delay(150)} aria-label="An example of a Tariff Tracker dashboard" role="img">
    <div className={`${tt.panel} flex flex-col gap-4 p-5`} aria-hidden>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={tt.chip("warning")}>Example</span>
          <span className={`${tt.display} text-sm font-semibold text-base-content`}>Your Tariff Dashboard</span>
        </div>
        <span className="text-[0.7rem] text-base-content/50">Updated today</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Metric label="Imports tracked" to={48} format={(n) => Math.round(n).toString()} note="Alerts on every one" tone="text-base-content/60" wait={400} />
        <Metric label="Average duty rate" to={23} format={(n) => `${n.toFixed(1)}%`} note="▲ 4.2% in 12 months" tone="text-error" wait={520} />
        <Metric label="Changes that hit you" to={6} format={(n) => Math.round(n).toString()} note="Last 12 months" tone="text-warning" wait={640} />
      </div>

      <div className="tt-ob-rise rounded-xl border border-base-300 p-3.5" style={delay(700)}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-base-content">Average duty rate, 12 months</span>
          <span className="font-semibold text-error">18.8% → 23.0%</span>
        </div>
        <svg viewBox="0 0 300 80" className="mt-2 h-20 w-full overflow-visible" preserveAspectRatio="none">
          {[20, 45, 70].map((y) => (
            <line key={y} x1="0" x2="300" y1={y} y2={y} className="stroke-base-300" strokeWidth="1" strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          <path
            d={LINE}
            fill="none"
            className="tt-ob-draw stroke-primary"
            strokeWidth="2.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={delay(900)}
          />
        </svg>
      </div>

      <ul className="m-0 flex list-none flex-col p-0">
        {IMPORTS.map((r, i) => (
          <li key={r.code} className="tt-ob-rise flex items-center gap-3 border-b border-base-300 py-2 text-xs last:border-b-0" style={delay(1000 + i * 90)}>
            <span className={`${mono.className} w-28 font-semibold text-base-content`}>{r.code}</span>
            <span className="flex-1 truncate text-base-content">
              {r.flag} {r.country}
            </span>
            {r.hit ? (
              <span className="font-semibold text-error">
                {r.from} → {r.to}
              </span>
            ) : (
              <span className="text-base-content/60">{r.to}</span>
            )}
          </li>
        ))}
      </ul>
    </div>

    {/* The alert, floating over the corner: the moment the Tracker is for */}
    <div
      className={`${tt.panel} tt-ob-from-right absolute -bottom-6 -left-8 flex w-[19rem] items-start gap-3 p-4 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.28)]`}
      style={delay(1700)}
      aria-hidden
    >
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
        <span className="tt-ob-ping absolute inset-0 rounded-full bg-error/30" style={delay(2100)} />
        <BellAlertIcon className="relative h-5 w-5" />
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-bold uppercase tracking-wider text-error">Tariff alert</span>
        <span className="text-sm font-semibold leading-snug text-base-content">A new tariff hits 3 of your imports</span>
        <span className="text-xs text-base-content/70">
          Pump parts from Brazil: 10.0% → 50.0% <span className="font-semibold text-error">(+40%)</span>
        </span>
      </span>
    </div>
  </div>
);
