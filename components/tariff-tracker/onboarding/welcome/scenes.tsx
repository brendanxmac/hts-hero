"use client";

import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpTrayIcon, BellAlertIcon, CheckIcon, EyeIcon, LockClosedIcon, LockOpenIcon, PlusIcon, ScaleIcon, SparklesIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { delay, prefersReducedMotion, useCountUp } from "../parts";

// The Tracker onboarding's scenes (TrackerOnboarding): one moment each, big and simple, played as
// the screen opens. The examples follow the Tracker's rules: rate changes before → after and in %,
// savings and overpaid duty are what could be or may have been.

const SceneStyles = () => (
  <style>{`
    @keyframes sc-orbit { from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg); } to { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg); } }
    .sc-orbit { animation: sc-orbit 18s linear infinite; }
    @keyframes sc-ring { 0% { opacity: .5; transform: scale(.8); } 100% { opacity: 0; transform: scale(2.2); } }
    .sc-ring { animation: sc-ring 3s cubic-bezier(.2,.7,.3,1) infinite; }
    @keyframes sc-slide { 0% { opacity: 0; transform: translateY(-28px) scale(.96); } 70% { opacity: 1; transform: translateY(4px) scale(1.01); } 100% { opacity: 1; transform: none; } }
    .sc-slide { animation: sc-slide 800ms cubic-bezier(.2,.9,.3,1) var(--tt-delay, 0ms) both; }
    @keyframes sc-pop { 0% { opacity: 0; transform: scale(.6); } 70% { opacity: 1; transform: scale(1.08); } 100% { transform: scale(1); } }
    .sc-pop { animation: sc-pop 600ms cubic-bezier(.2,.9,.3,1.3) var(--tt-delay, 0ms) both; }
    @keyframes sc-drop { 0% { opacity: 0; transform: translate(-90px, -70px) rotate(-12deg); } 100% { opacity: 1; transform: none; } }
    .sc-drop { animation: sc-drop 900ms cubic-bezier(.2,.9,.3,1) var(--tt-delay, 0ms) both; }
    @keyframes sc-fill { from { width: 0; } to { width: 100%; } }
    .sc-fill { animation: sc-fill 1400ms cubic-bezier(.4,0,.2,1) var(--tt-delay, 0ms) both; }
    @keyframes sc-strike { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    .sc-strike { transform-origin: left; animation: sc-strike 500ms ease-out var(--tt-delay, 0ms) both; }
    @media (prefers-reduced-motion: reduce) { .sc-orbit, .sc-ring, .sc-slide, .sc-pop, .sc-drop, .sc-fill, .sc-strike { animation: none; } }
  `}</style>
);

const Panel = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`${tt.panel} relative w-full overflow-hidden text-left shadow-[0_30px_80px_-30px_var(--tt-ob-glow)] ${className}`}>{children}</div>
);

// 1. Welcome: the Tracker at the center, its three jobs orbiting it
export const WelcomeScene = () => {
  const jobs = [
    { icon: BellAlertIcon, label: "Tariff Alerts", tone: "text-error", start: "0s" },
    { icon: ScaleIcon, label: "Duty Audits", tone: "text-warning", start: "-6s" },
    { icon: SparklesIcon, label: "Duty Savings", tone: "text-success", start: "-12s" },
  ];
  return (
    <div className="relative flex h-72 w-72 items-center justify-center max-sm:scale-[0.8]" aria-hidden>
      <SceneStyles />
      <span className="sc-ring absolute h-28 w-28 rounded-full border-2 border-primary/40" />
      <span className="sc-ring absolute h-28 w-28 rounded-full border-2 border-primary/40" style={{ animationDelay: "1.5s" }} />
      <span className="absolute h-64 w-64 rounded-full border border-dashed border-base-content/15" />
      <span className="sc-pop relative flex h-28 w-28 items-center justify-center rounded-full bg-base-content shadow-2xl shadow-primary/30">
        <Image src={logo} alt="" width={64} height={64} />
      </span>
      {jobs.map((j) => (
        <span key={j.label} className="sc-orbit absolute flex items-center gap-1.5 rounded-full bg-base-100 px-3.5 py-2 text-sm font-semibold shadow-lg ring-1 ring-base-300" style={{ ["--r" as string]: "128px", animationDelay: j.start }}>
          <j.icon className={`h-4 w-4 ${j.tone}`} /> {j.label}
        </span>
      ))}
    </div>
  );
};

// 2. Alerts: the alert, arriving
export const AlertScene = () => (
  <div className="w-full max-w-md" aria-hidden>
    <SceneStyles />
    <Panel className="sc-slide p-5" >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-content">
          <BellAlertIcon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-base-content">Tariff Alert</span>
        <span className="ml-auto text-xs text-base-content/50">just now</span>
      </div>
      <p className={`${tt.display} m-0 mt-4 text-xl font-semibold leading-snug text-base-content`}>A new tariff affects 3 of your products</p>
      <div className="mt-4 flex flex-col gap-2">
        {[
          ["Wooden chairs", "🇻🇳", "25% → 35%"],
          ["Oak tables", "🇻🇳", "25% → 35%"],
          ["Bed frames", "🇻🇳", "20% → 30%"],
        ].map(([name, flag, rate], i) => (
          <div key={name} className="sc-slide flex items-center justify-between rounded-xl bg-tt-soft px-3.5 py-2.5 text-sm" style={delay(500 + i * 160)}>
            <span className="font-semibold text-base-content">
              {flag} {name}
            </span>
            <span className={`${mono.className} font-semibold text-error`}>{rate}</span>
          </div>
        ))}
      </div>
    </Panel>
  </div>
);

// 3. Impact: what it does to one product, before and after
export const ImpactScene = () => {
  const after = useCountUp(35, { duration: 600, wait: 300 });
  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-5" aria-hidden>
      <SceneStyles />
      <span className="rounded-full bg-base-100 px-4 py-2 text-sm font-semibold shadow ring-1 ring-base-300">🇻🇳 Wooden chairs · 9401.61.40</span>
      <div className="flex items-center gap-6">
        <span className="relative">
          <span className={`${tt.display} text-6xl font-semibold tabular-nums text-base-content/50 sm:text-7xl`}>25%</span>
          <span className="sc-strike absolute left-0 top-1/2 h-1 w-full rounded-full bg-base-content/40" style={delay(200)} />
        </span>
        <span className="text-4xl text-base-content/40">→</span>
        <span className={`${tt.display} text-6xl font-semibold tabular-nums text-error sm:text-7xl`}>{Math.round(after)}%</span>
      </div>
      <span className="sc-pop rounded-full bg-error px-4 py-1.5 text-base font-bold text-error-content shadow-lg shadow-error/30" style={delay(950)}>
        +10% duty, starting Jul 22
      </span>
    </div>
  );
};

// 4. Audits: one entry, and what may have been overpaid on it
export const AuditScene = () => {
  const found = useCountUp(4000, { duration: 700, wait: 300 });
  return (
    <div className="w-full max-w-md" aria-hidden>
      <SceneStyles />
      <Panel className="p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-base-content">Entry · Steel wire 🇨🇳</span>
          <span className={`${mono.className} text-base-content/50`}>Mar 12, 2026</span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-tt-soft p-3">
            <p className="m-0 text-base-content/55">You paid</p>
            <p className={`${tt.display} m-0 mt-1 text-2xl font-semibold`}>$34,189</p>
          </div>
          <div className="sc-pop rounded-xl bg-tt-soft p-3" style={delay(400)}>
            <p className="m-0 text-base-content/55">You owed</p>
            <p className={`${tt.display} m-0 mt-1 text-2xl font-semibold`}>$30,189</p>
          </div>
        </div>
        <div className="sc-pop mt-4 rounded-2xl bg-success/12 p-4 text-center ring-1 ring-success/30" style={delay(500)}>
          <p className="m-0 text-sm font-semibold text-success">You may have overpaid</p>
          <p className={`${tt.display} m-0 mt-1 text-5xl font-semibold tabular-nums text-success`}>${Math.round(found).toLocaleString("en-US")}</p>
          <p className="m-0 mt-2 text-xs text-base-content/60">You keep 100% of any refund</p>
        </div>
      </Panel>
    </div>
  );
};

// 5. Savings: the same product, for less
export const SavingsScene = () => (
  <div className="flex w-full max-w-lg flex-col gap-3" aria-hidden>
    <SceneStyles />
    {[
      { name: "Steel screws 🇨🇳", note: "Exemption you may qualify for", save: "Could save 7.5%" },
      { name: "Cotton t-shirts 🇧🇩", note: "Trade program not claimed", save: "Could save 12%" },
      { name: "LED lamps 🇨🇳", note: "Same product from Vietnam", save: "Could save 25%" },
    ].map((s, i) => (
      <div key={s.name} className="sc-slide" style={delay(200 + i * 220)}>
        <Panel className="flex items-center justify-between gap-4 px-5 py-4">
          <span className="flex flex-col">
            <span className="text-base font-semibold text-base-content">{s.name}</span>
            <span className="text-sm text-base-content/60">{s.note}</span>
          </span>
          <span className="shrink-0 rounded-full bg-success/15 px-3 py-1.5 text-sm font-bold text-success">{s.save}</span>
        </Panel>
      </div>
    ))}
  </div>
);

// 6. Setup: exactly what they'll do. Their spreadsheet (a product, its HTS code, its country on each
// row) is dragged onto "Drop your imports here", the zone lights up as it lands, the products go
// in, and it's done, well inside 30 seconds
const SHEET = [
  { name: "Office chairs", code: "9401.61.40", flag: "🇻🇳" },
  { name: "LED lamps", code: "9405.42.84", flag: "🇨🇳" },
  { name: "Cotton t-shirts", code: "6109.10.00", flag: "🇧🇩" },
];

const SetupTake = () => (
  <div className="w-full max-w-lg" aria-hidden>
    <SceneStyles />
    <style>{`
      @keyframes sc-drag { 0% { opacity: 0; transform: translate(-150px, -70px) rotate(-7deg); } 15% { opacity: 1; } 100% { opacity: 1; transform: translate(0, -18px) rotate(-2deg); } }
      .sc-drag { animation: sc-drag 1100ms cubic-bezier(.3,.7,.2,1) 300ms both; }
      @keyframes sc-sink { to { opacity: 0; transform: translate(0, 10px) scale(.55); } }
      .sc-sink { animation: sc-sink 320ms ease-in 1600ms forwards; }
      @keyframes sc-hot { from { border-color: color-mix(in oklab, var(--color-base-content) 22%, transparent); } to { border-color: var(--color-primary); } }
      @keyframes sc-done { from { border-color: var(--color-primary); } to { border-color: var(--color-success); border-style: solid; } }
      .sc-hot { animation: sc-hot 250ms ease-out 1250ms both, sc-done 350ms ease-out 3050ms forwards; }
      @keyframes sc-gone { to { opacity: 0; } }
      .sc-gone { animation: sc-gone 200ms ease-in var(--tt-delay, 0ms) forwards; }
      @media (prefers-reduced-motion: reduce) { .sc-drag, .sc-sink, .sc-hot, .sc-gone { animation: none; } .sc-sink, .sc-gone { opacity: 0; } }
    `}</style>

    {/* The drop zone, as it looks in the Tracker */}
    <div className="sc-hot relative flex h-80 w-full flex-col items-center justify-end rounded-3xl border-2 border-dashed bg-(--tt-ob-ground) pb-7">
      {/* Their spreadsheet, dragged in by the cursor, then sinking into the zone */}
      <div className="absolute inset-x-0 top-6 flex justify-center">
        <div className="sc-drag">
          <div className="sc-sink relative w-80 overflow-hidden rounded-xl bg-base-100 text-left shadow-2xl ring-1 ring-base-300">
            <div className="flex items-center gap-2 bg-success px-3 py-2 text-success-content">
              <TableCellsIcon className="h-4 w-4" />
              <span className="text-xs font-bold">my-imports.xlsx</span>
            </div>
            <div className={`${mono.className} grid grid-cols-[1fr_auto_auto] gap-x-4 px-3 py-2 text-[0.7rem]`}>
              <span className="font-sans font-bold text-base-content/50">Product</span>
              <span className="font-sans font-bold text-base-content/50">HTS code</span>
              <span className="font-sans font-bold text-base-content/50">Country</span>
              {SHEET.map((r) => (
                <Fragment key={r.code}>
                  <span className="truncate border-t border-base-300 py-1.5 font-sans text-base-content/85">{r.name}</span>
                  <span className="border-t border-base-300 py-1.5 text-base-content/85">{r.code}</span>
                  <span className="border-t border-base-300 py-1.5 text-center">{r.flag}</span>
                </Fragment>
              ))}
            </div>
            {/* The cursor holding it */}
            <svg viewBox="0 0 24 24" className="absolute -bottom-1 right-6 h-7 w-7 drop-shadow-lg">
              <path d="M5 3l14 7-6 2-2 6z" className="fill-base-content stroke-base-100" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Under it: what to do */}
      <div className="relative flex h-14 w-full items-center justify-center px-8">
        <span className="sc-gone absolute flex flex-col items-center gap-1" style={delay(1500)}>
          <ArrowUpTrayIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold text-base-content">Drop your imports here</span>
        </span>
      </div>

      {/* Once it lands, in the middle of the zone: it working, then done */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="sc-pop absolute flex w-64 flex-col items-center gap-2" style={delay(1650)}>
          <span className="sc-gone flex w-full flex-col items-center gap-2" style={delay(3000)}>
            <span className="text-sm font-semibold text-base-content/70">Adding your products…</span>
            <span className="h-2 w-full overflow-hidden rounded-full bg-base-300">
              <span className="sc-fill block h-full rounded-full bg-primary" style={delay(1700)} />
            </span>
          </span>
        </span>
        <span className="sc-pop absolute flex flex-col items-center gap-3" style={delay(3100)}>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-content shadow-xl shadow-success/30">
            <CheckIcon className="h-9 w-9" />
          </span>
          <span className="text-2xl font-semibold text-success">48 products added</span>
          {/* <span className="text-sm text-base-content/60">Alerts activated, checking for savings...</span> */}
        </span>
      </div>
    </div>
  </div>
);

// Played on a loop: once it's done and held a moment, it starts again (not with reduced motion)
const SETUP_LOOP_MS = 5200;
export const SetupScene = () => {
  const [take, setTake] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = setInterval(() => setTake((t) => t + 1), SETUP_LOOP_MS);
    return () => clearInterval(timer);
  }, []);
  return <SetupTake key={take} />;
};

// The alerts switch, flipped on as the card lands: the track turns green, the knob slides over
const AlertsToggle = () => (
  <span className="flex items-center gap-3">
    <style>{`
      @keyframes sc-track { from { background-color: var(--color-base-300); } to { background-color: var(--color-success); } }
      .sc-track { animation: sc-track 300ms ease-out var(--tt-delay, 0ms) both; }
      @keyframes sc-knob { from { transform: translateX(0); } to { transform: translateX(1.25rem); } }
      .sc-knob { animation: sc-knob 300ms cubic-bezier(.3,1.4,.5,1) var(--tt-delay, 0ms) both; }
      @media (prefers-reduced-motion: reduce) { .sc-track, .sc-knob { animation-duration: 1ms; animation-delay: 0ms; } }
    `}</style>
    <span className="sc-track relative inline-flex h-7 w-12 items-center rounded-full p-1" style={delay(1600)}>
      <span className="sc-knob h-5 w-5 rounded-full bg-white shadow" style={delay(1600)} />
    </span>
    <span className="sc-pop" style={delay(1700)}>On</span>
  </span>
);

// The digits of a number nobody knows yet, flickering: what the Tracker may find in their imports
const useScramble = (pattern: string, wait: number) => {
  const [text, setText] = useState(pattern.replace(/#/g, "0"));
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      // No leading zero: the first digit is 1-9
      const digit = (i: number) => String(i === 0 ? 1 + Math.floor(Math.random() * 9) : Math.floor(Math.random() * 10));
      timer = setInterval(() => {
        let n = 0;
        setText(pattern.replace(/#/g, () => digit(n++)));
      }, 90);
    }, wait);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [pattern, wait]);
  return text;
};

// 7. Start: their own Tracker, a moment before it's theirs. The window opens on "Your Tariff
// Tracker", alerts switch on, and the refunds and savings it may find are already flickering
// behind frosted glass, while a scan sweeps over products waiting to be filled in. One line says
// what unlocks it: their imports. Then what it costs today: nothing.
export const RewardScene = ({ imports }: { imports: number }) => {
  const refund = useScramble("$##,###", 900);
  const saving = useScramble("2#%", 1000);
  const stats = [
    { icon: BellAlertIcon, label: "Tariff Alerts", value: <AlertsToggle />, blur: false },
    { icon: ScaleIcon, label: "Possible Refunds", value: refund, blur: true },
    { icon: SparklesIcon, label: "Possible Savings", value: `Up to ${saving}`, blur: true },
  ];
  return (
    <div className="flex w-full max-w-xl flex-col items-center" aria-hidden>
      <SceneStyles />
      <style>{`
        @keyframes sc-scan { 0% { top: -20%; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
        .sc-scan { animation: sc-scan 2.6s ease-in-out 1.2s infinite; }
        @keyframes sc-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .sc-shimmer { background: linear-gradient(90deg, var(--color-base-300) 0%, color-mix(in oklab, var(--color-base-content) 22%, transparent) 50%, var(--color-base-300) 100%); background-size: 200% 100%; animation: sc-shimmer 1.8s linear infinite; }
        @keyframes sc-up { 0% { opacity: 0; transform: translateY(12px); } 100% { opacity: 1; transform: none; } }
        .sc-up { animation: sc-up 500ms cubic-bezier(.2,.8,.3,1) var(--tt-delay, 0ms) both; }
        @media (prefers-reduced-motion: reduce) { .sc-scan, .sc-shimmer, .sc-up { animation: none; } .sc-scan { display: none; } }
      `}</style>

      <Panel className="p-0">
        {/* The window: their Tracker, the free week in the corner */}
        <div className="flex items-center justify-between border-b border-base-300 px-5 py-3">
          <span className="flex items-center gap-2.5">
            <span className="flex items-center rounded-full bg-base-content p-0.5">
              <Image src={logo} alt="" width={16} height={16} />
            </span>
            <span className={`${tt.display} text-sm font-semibold`}>Your Tariff Tracker</span>
          </span>
          <span className="sc-pop rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary" style={delay(400)}>
            Free for 7 days
          </span>
        </div>

        {/* What's waiting: alerts switching on, the money behind glass */}
        <div className="grid grid-cols-3 divide-x divide-base-300">
          {stats.map((s, i) => (
            <div key={s.label} className="sc-up px-5 py-4" style={delay(500 + i * 120)}>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content/60">
                <s.icon className="h-3.5 w-3.5 text-success" /> {s.label}
              </span>
              <div className={`${tt.display} mt-2 text-xl font-semibold tabular-nums text-success ${s.blur ? "blur-[3px]" : ""}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Their products, still to come, with a scan sweeping over them */}
        <div className="relative flex flex-col gap-2 overflow-hidden border-t border-base-300 bg-tt-soft/40 px-5 py-4">
          {[0.62, 0.48, 0.55].map((w, i) => (
            <div key={i} className="sc-up flex items-center gap-3 rounded-xl bg-base-100/70 px-3 py-2.5" style={delay(850 + i * 110)}>
              <span className="sc-shimmer h-6 w-6 shrink-0 rounded-full" />
              <span className="flex flex-1 flex-col gap-1.5">
                <span className="sc-shimmer h-2.5 rounded-full" style={{ width: `${w * 100}%` }} />
                <span className="sc-shimmer h-2 w-1/4 rounded-full" />
              </span>
              <span className="sc-shimmer h-5 w-16 rounded-full" />
            </div>
          ))}
          <span className="sc-scan pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-primary/25 to-transparent" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-base-100 to-transparent" />
          <span className="sc-pop absolute inset-x-0 bottom-5 mx-auto flex w-max items-center gap-2 rounded-full bg-base-content px-4 py-2 text-sm font-semibold text-base-100 shadow-xl" style={delay(1300)}>
            <LockClosedIcon className="h-4 w-4" /> Add your imports to unlock tariff alerts & discover savings!
          </span>
        </div>
      </Panel>

      {/* <p className="sc-up m-0 mt-5 text-sm text-base-content/65" style={delay(1500)}>
        <b className="text-base-content">$0 today</b> · Everything unlocked on up to {imports} products
      </p> */}
    </div>
  );
};
