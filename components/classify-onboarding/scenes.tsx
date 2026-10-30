"use client";

import { useEffect, useState } from "react";
import { CheckIcon, DocumentTextIcon, ScaleIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { PRODUCTS } from "@/components/classify-landing/lib/howItWorks";
import { delay, prefersReducedMotion } from "@/components/tariff-tracker/onboarding/parts";
import { Panel, SceneStyles, WelcomeScene } from "@/components/tariff-tracker/onboarding/welcome/scenes";

// The Classification onboarding's scenes (ClassifyOnboarding): one moment each, played as the screen
// opens, all on one real example (the /classify demo's water bottle), in the Tracker onboarding's
// scene style.

const EXAMPLE = PRODUCTS[1];
const FINAL = ["9617", ".00", ".10", ".00"];

// 1. Welcome: the assistant at the center, what backs every code orbiting it
export const ClassifyWelcomeScene = () => (
  <WelcomeScene
    jobs={[
      { icon: DocumentTextIcon, label: "Legal Notes", tone: "text-primary", start: "0s" },
      { icon: ScaleIcon, label: "CROSS Rulings", tone: "text-warning", start: "-6s" },
      { icon: ShieldCheckIcon, label: "Audit-Ready Reports", tone: "text-success", start: "-12s" },
    ]}
  />
);

// The description typing itself out, a character at a time
const useTyped = (text: string, wait: number, perChar = 22) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(text.length);
      return;
    }
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => setCount((c) => (c >= text.length ? c : c + 1)), perChar);
    }, wait);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [text, wait, perChar]);
  return text.slice(0, count);
};

// 2. Describe: plain words in, nothing else to fill in (no caret or button: it's a picture, not a field)
export const DescribeScene = () => {
  const typed = useTyped(EXAMPLE.description, 400);
  return (
    <div className="w-full max-w-lg" aria-hidden>
      <SceneStyles />
      <Panel className="p-6">
        <p className="m-0 text-sm font-semibold text-base-content/60">Describe your product</p>
        <p className="m-0 mt-3 min-h-[5.5rem] rounded-xl border border-primary/40 bg-primary/[0.04] p-4 text-lg leading-relaxed text-base-content ring-2 ring-primary/15">
          {typed}
        </p>
      </Panel>
    </div>
  );
};

// 3. Candidates: the likely headings, the best one lit, the law behind it under it
export const CandidatesScene = () => (
  <div className="w-full max-w-lg" aria-hidden>
    <SceneStyles />
    <style>{`
      @keyframes sc-lit { to { border-color: var(--color-primary); background-color: color-mix(in oklab, var(--color-primary) 8%, transparent); } }
      .sc-lit { animation: sc-lit 300ms ease-out var(--tt-delay, 0ms) forwards; }
      @media (prefers-reduced-motion: reduce) { .sc-lit { animation-duration: 1ms; animation-delay: 0ms; } }
    `}</style>
    <div className="flex flex-col gap-2.5">
      {EXAMPLE.candidates.slice(0, 3).map((c, i) => {
        const best = i === EXAMPLE.selectedIndex;
        return (
          <div key={c.code} className="sc-slide" style={delay(200 + i * 160)}>
            <div className={`${best ? "sc-lit" : ""} rounded-2xl border-2 border-base-300 bg-base-100 px-4 py-3 text-left shadow-lg`} style={best ? delay(1000) : undefined}>
              <div className="flex items-center gap-3">
                <span className={`${mono.className} text-base font-bold text-base-content`}>{c.code}</span>
                <span className="truncate text-sm text-base-content/70">{c.title}</span>
              </div>
              {best && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...EXAMPLE.legalNotes.map((n) => ({ key: n.source, icon: DocumentTextIcon, tone: "bg-primary/10 text-primary" })), ...EXAMPLE.crossRulings.map((r) => ({ key: r.id, icon: ScaleIcon, tone: "bg-base-content/10 text-base-content/80" }))].map((e, j) => (
                    <span key={e.key} className={`sc-pop inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${e.tone}`} style={delay(1200 + j * 110)}>
                      <e.icon className="h-3.5 w-3.5" /> {e.key}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// 4. Select: their call. The cursor picks the option that looks best to them, it's marked as their
// pick, and their own reasoning goes in under it; nothing is chosen for them
export const SelectScene = () => {
  const note = useTyped("Most CROSS rulings point toward double-walled vacuum vessels being classified under 9617", 1700, 18);
  return (
    <div className="relative w-full max-w-lg" aria-hidden>
      <SceneStyles />
      <style>{`
        @keyframes sc-point { 0% { opacity: 0; transform: translate(140px, 170px); } 20% { opacity: 1; } 100% { opacity: 1; transform: none; } }
        .sc-point { animation: sc-point 800ms cubic-bezier(.3,.7,.2,1) 300ms both; }
        @keyframes sc-press { 0%, 100% { transform: scale(1); } 50% { transform: scale(.85); } }
        .sc-press { animation: sc-press 200ms ease-in-out 1150ms both; }
        @keyframes sc-pick { to { border-color: var(--color-primary); background-color: color-mix(in oklab, var(--color-primary) 8%, transparent); } }
        .sc-pick { animation: sc-pick 250ms ease-out 1250ms forwards; }
        @media (prefers-reduced-motion: reduce) { .sc-point, .sc-press { animation: none; } .sc-pick { animation-duration: 1ms; animation-delay: 0ms; } }
      `}</style>
      <div className="flex flex-col gap-2.5">
        {EXAMPLE.candidates.slice(0, 3).map((c, i) => {
          const pick = i === EXAMPLE.selectedIndex;
          return (
            <div key={c.code} className={`${pick ? "sc-pick" : ""} relative flex items-center gap-3 rounded-2xl border-2 border-base-300 bg-base-100 px-4 py-3 text-left shadow-lg`}>
              <span className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-base-300">
                {pick && <span className="sc-pop absolute inset-[-2px] flex items-center justify-center rounded-full bg-primary text-primary-content" style={delay(1250)}><CheckIcon className="h-3.5 w-3.5" /></span>}
              </span>
              <span className={`${mono.className} text-base font-bold text-base-content`}>{c.code}</span>
              <span className="truncate text-sm text-base-content/70">{c.title}</span>
              {pick && (
                <span className="sc-pop ml-auto shrink-0 rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-content" style={delay(1350)}>
                  Your pick
                </span>
              )}
              {pick && (
                <span className="sc-point absolute left-1/2 top-5">
                  <svg viewBox="0 0 24 24" className="sc-press h-7 w-7 drop-shadow-lg">
                    <path d="M5 3l14 7-6 2-2 6z" className="fill-base-content stroke-base-100" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div className="sc-slide mt-4 rounded-2xl bg-base-100 p-4 text-left shadow-lg ring-1 ring-base-300" style={delay(1550)}>
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-base-content/50">Your reasoning (optional)</p>
        <p className="m-0 mt-2 min-h-[2.75rem] text-sm leading-relaxed text-base-content/80">{note}</p>
      </div>
    </div>
  );
};

// 5. Ten digits: the code builds a level at a time, then it's final
export const DigitsScene = () => (
  <div className="flex w-full max-w-lg flex-col items-center gap-6" aria-hidden>
    <SceneStyles />
    <span className="rounded-full bg-base-100 px-4 py-2 text-sm font-semibold shadow ring-1 ring-base-300">Stainless steel vacuum bottle, 32oz</span>
    <p className={`${mono.className} m-0 flex text-5xl font-bold tracking-tight sm:text-6xl`}>
      {FINAL.map((part, i) => (
        <span key={part + i} className={`sc-pop ${i === FINAL.length - 1 ? "text-success" : "text-base-content"}`} style={delay(250 + i * 420)}>
          {part}
        </span>
      ))}
    </p>
    {/* <span className="sc-pop inline-flex items-center gap-2 rounded-full bg-success px-4 py-1.5 text-base font-bold text-success-content shadow-lg shadow-success/30" style={delay(250 + FINAL.length * 420)}>
      <CheckIcon className="h-5 w-5" /> Final code 🎉
    </span> */}
  </div>
);

// 6. Report: every step documented, stamped audit-ready
export const ReportScene = () => (
  <div className="w-full max-w-md" aria-hidden>
    <SceneStyles />
    <style>{`
      @keyframes sc-stamp { 0% { opacity: 0; transform: rotate(-14deg) scale(1.8); } 60% { opacity: 1; transform: rotate(-10deg) scale(.92); } 100% { opacity: 1; transform: rotate(-10deg) scale(1); } }
      .sc-stamp { animation: sc-stamp 450ms cubic-bezier(.2,.9,.3,1) var(--tt-delay, 0ms) both; }
      @media (prefers-reduced-motion: reduce) { .sc-stamp { animation: none; transform: rotate(-10deg); } }
    `}</style>
    <div className="sc-slide relative">
      <Panel className="p-6">
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-base-content/50">Classification report</p>
        <p className="m-0 mt-2 text-sm font-semibold leading-snug text-base-content">{EXAMPLE.description}</p>
        <div className="sc-pop mt-4 flex items-center justify-between rounded-xl bg-success/10 px-4 py-3 ring-1 ring-success/30" style={delay(300)}>
          <span className="text-sm font-semibold text-base-content/70">HTS code</span>
          <span className={`${mono.className} text-xl font-bold text-success`}>{FINAL.join("")}</span>
        </div>
        <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0 text-sm text-base-content/75">
          {["Every candidate considered", "The notes and rulings that decide it", "Your reasoning, in your words"].map((t, i) => (
            <li key={t} className="sc-slide flex items-center gap-2" style={delay(500 + i * 140)}>
              <CheckIcon className="h-4 w-4 text-success" /> {t}
            </li>
          ))}
        </ul>
      </Panel>
      <span className={`${tt.display} sc-stamp absolute -right-4 -top-4 rounded-xl border-[3px] border-success bg-base-100 px-3 py-1.5 text-base font-bold uppercase tracking-wider text-success shadow-xl`} style={delay(1150)}>
        Audit-ready
      </span>
    </div>
  </div>
);

// 7. Start: their free classifications, lighting up one by one
export const FreeScene = ({ count }: { count: number }) => (
  <div className="flex w-full max-w-lg flex-col items-center" aria-hidden>
    <SceneStyles />
    <div className="flex gap-3">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="sc-pop flex h-16 w-16 flex-col items-center justify-center rounded-2xl bg-base-100 shadow-xl ring-2 ring-primary/40" style={delay(200 + i * 140)}>
          <CheckIcon className="h-6 w-6 text-primary" />
          <span className="text-[0.65rem] font-bold uppercase tracking-wider text-base-content/55">Free</span>
        </span>
      ))}
    </div>
    <p className="sc-pop m-0 mt-6 text-sm text-base-content/65" style={delay(300 + count * 140)}>
      <b className="text-base-content">{count} classifications on us</b> · Full reports included
    </p>
  </div>
);
