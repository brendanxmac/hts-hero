"use client";

import { ArrowRightIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { delay } from "./parts";

// What counts as an import, right before asking for them, as plainly as it can be put: a product
// (its HTS code) and where it's made (its country of origin). The two pieces slide in apart, then
// snap together into one card that reads as one row of their spreadsheet, and it's labelled
// "1 import". Under it, the one mistake that matters: a 6-digit HS code isn't enough to find a US
// duty rate.

const SceneStyles = () => (
  <style>{`
    @keyframes wi-l {
      0% { opacity: 0; transform: translateX(-150px); filter: blur(6px); border-top-right-radius: 16px; border-bottom-right-radius: 16px; animation-timing-function: cubic-bezier(.2,.8,.2,1); }
      35% { opacity: 1; transform: translateX(-64px); filter: none; border-top-right-radius: 16px; border-bottom-right-radius: 16px; }
      62% { transform: translateX(-64px); border-top-right-radius: 16px; border-bottom-right-radius: 16px; animation-timing-function: cubic-bezier(.5,0,.2,1); }
      100% { opacity: 1; transform: none; border-top-right-radius: 0; border-bottom-right-radius: 0; }
    }
    @keyframes wi-r {
      0% { opacity: 0; transform: translateX(150px); filter: blur(6px); border-top-left-radius: 16px; border-bottom-left-radius: 16px; animation-timing-function: cubic-bezier(.2,.8,.2,1); }
      35% { opacity: 1; transform: translateX(64px); filter: none; border-top-left-radius: 16px; border-bottom-left-radius: 16px; }
      62% { transform: translateX(64px); border-top-left-radius: 16px; border-bottom-left-radius: 16px; animation-timing-function: cubic-bezier(.5,0,.2,1); }
      100% { opacity: 1; transform: none; border-top-left-radius: 0; border-bottom-left-radius: 0; }
    }
    @keyframes wi-plus { 0% { opacity: 0; transform: translate(-50%, -50%) scale(.4); } 30% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 75% { opacity: 1; transform: translate(-50%, -50%) scale(1); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(.4); } }
    @keyframes wi-frame { 0% { opacity: 0; transform: scale(1.06); } 100% { opacity: 1; transform: none; } }
    @keyframes wi-badge { 0% { opacity: 0; transform: translate(-50%, 8px) scale(.6); } 70% { opacity: 1; transform: translate(-50%, 0) scale(1.08); } 100% { opacity: 1; transform: translate(-50%, 0); } }
    @keyframes wi-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
    @keyframes wi-fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .wi-l { animation: wi-l 1500ms var(--tt-delay, 0ms) both; }
    .wi-r { animation: wi-r 1500ms var(--tt-delay, 0ms) both; }
    .wi-plus { animation: wi-plus 1300ms ease-out var(--tt-delay, 0ms) both; }
    .wi-frame { animation: wi-frame 450ms cubic-bezier(.2,.8,.2,1) var(--tt-delay, 0ms) both; }
    .wi-badge { animation: wi-badge 450ms cubic-bezier(.2,.9,.3,1.2) var(--tt-delay, 0ms) both; }
    .wi-float { animation: wi-float 4.5s ease-in-out var(--tt-delay, 0ms) infinite; }
    .wi-fade { animation: wi-fade 400ms ease-out var(--tt-delay, 0ms) both; }
    @media (prefers-reduced-motion: reduce) { .wi-l, .wi-r, .wi-frame, .wi-badge, .wi-fade, .wi-float { animation: none; } .wi-plus { display: none; } }
  `}</style>
);

const CODE = "6109.10.00.12";
// A short beat after the headline before the answer plays: long enough to read the question,
// short enough to feel like one build
const READ = 400;
const JOINED = READ + 1650;

// One half of the import: what it asks for on top, the example under it
const Half = ({ className, label, children }: { className: string; label: string; children: React.ReactNode }) => (
  <div className={`${className} flex w-96 flex-col items-start gap-4 border-2 border-base-300 bg-base-100 px-10 py-9 text-left shadow-[0_24px_60px_-24px_var(--tt-ob-glow)]`} style={delay(READ + 150)}>
    <span className="text-sm font-bold uppercase tracking-wider text-base-content/50">{label}</span>
    {children}
  </div>
);

const Scene = () => (
  <div className="flex w-full flex-col items-center gap-6" role="img" aria-label="A product's HTS code and the country it's made in together make one import">
    <SceneStyles />
    {/* Joined, it floats gently up and down */}
    <div className="wi-float relative mt-4 flex" style={delay(JOINED + 300)} aria-hidden>
      <Half className="wi-l rounded-l-2xl" label="HTS Code">
        <span className={`${mono.className} text-4xl font-bold tracking-tight text-base-content`}>{CODE}</span>
      </Half>
      <Half className="wi-r -ml-0.5 rounded-r-2xl" label="Country of Origin">
        <span className="text-4xl font-semibold text-base-content">China</span>
      </Half>

      {/* Between them while they're apart */}
      <span className={`${tt.display} wi-plus absolute left-1/2 top-1/2 text-6xl font-semibold text-base-content/35`} style={delay(READ + 450)}>
        +
      </span>

      {/* Joined: one import */}
      <span className="wi-frame pointer-events-none absolute -inset-2 rounded-[22px] border-2 border-primary shadow-[0_18px_44px_-16px_var(--tt-ob-glow)]" style={delay(JOINED)} />
      <span className="wi-badge absolute -top-7 left-1/2 whitespace-nowrap rounded-full bg-primary px-5 py-1.5 text-base font-bold text-primary-content shadow-lg" style={delay(JOINED + 120)}>
        This is an Import
      </span>
    </div>
  </div>
);

export const ExplainStep = ({ onNext }: { onNext: () => void }) => (
  <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 text-center">
    <div className="flex flex-col items-center gap-4">
      {/* <span className={`${tt.eyebrow("primary")} tt-ob-rise`}>What&apos;s an import?</span> */}
      <h1 id="tt-onboarding-title" tabIndex={-1} className={`${tt.display} tt-ob-rise m-0 text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-base-content outline-hidden sm:text-5xl`} style={delay(60)}>
        What&apos;s an import?
      </h1>
      <p className="tt-ob-rise m-0 max-w-xl text-lg leading-relaxed text-base-content/70" style={delay(120)}>
        A product&apos;s HTS code and its country of origin, that&apos;s all!
      </p>
    </div>

    <Scene />

    {/* The one thing people get wrong: the code needs its US digits */}
    <p className="wi-fade m-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-base-content/65" style={delay(JOINED + 800)}>
      <span>Use 8 or 10-digit codes:</span>
      <span className={`${mono.className} inline-flex items-center gap-1 font-semibold text-error`}>
        <XMarkIcon className="h-4 w-4" aria-hidden /> 6109.10
      </span>
      <span className={`${mono.className} inline-flex items-center gap-1 font-semibold text-success`}>
        <CheckIcon className="h-4 w-4" aria-hidden /> {CODE}
      </span>
    </p>

    <div className="tt-ob-rise w-full max-w-md" style={delay(READ + 300)}>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "lg" })} h-14 w-full text-lg shadow-[0_14px_30px_-14px_var(--tt-ob-glow)]`}
        onClick={onNext}
        autoFocus
      >
        Got it, add my imports
        <ArrowRightIcon className="h-5 w-5" aria-hidden />
      </button>
    </div>
  </div>
);
