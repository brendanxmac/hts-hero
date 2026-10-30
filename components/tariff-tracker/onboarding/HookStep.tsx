"use client";

import { ArrowRightIcon, BellAlertIcon, CheckIcon, CurrencyDollarIcon, DocumentMagnifyingGlassIcon, ScaleIcon, TableCellsIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { delay } from "./parts";

// The first screen of the import flow: a short hand-off that says where they are (adding their
// imports) and why it matters, now that the Tracker onboarding has done the welcoming. One scene:
// their imports on the left, and what they switch on lighting up one by one on the right. Then on
// to what an import is (ExplainStep).

const SceneStyles = () => (
  <style>{`
    @keyframes hk-in { from { opacity: 0; transform: translateX(-36px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
    @keyframes hk-row { from { opacity: 0; transform: scaleX(.2); } to { opacity: 1; transform: none; } }
    @keyframes hk-beam { from { transform: scaleX(0); } to { transform: scaleX(1); } }
    @keyframes hk-dot { 0% { left: 0; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { left: calc(100% - 8px); opacity: 0; } }
    @keyframes hk-card { from { opacity: .35; } to { opacity: 1; } }
    @keyframes hk-lit { from { border-color: var(--color-base-300); box-shadow: none; } to { border-color: var(--hk-tone); box-shadow: 0 14px 32px -18px var(--hk-tone); } }
    @keyframes hk-check { 0% { opacity: 0; transform: scale(.3); } 70% { opacity: 1; transform: scale(1.15); } 100% { opacity: 1; transform: none; } }
    .hk-in { animation: hk-in 650ms cubic-bezier(.2,.8,.2,1) var(--tt-delay, 0ms) both; }
    .hk-row { transform-origin: left; animation: hk-row 380ms cubic-bezier(.2,.8,.2,1) var(--tt-delay, 0ms) both; }
    .hk-beam { transform-origin: left; animation: hk-beam 500ms cubic-bezier(.2,.8,.2,1) var(--tt-delay, 0ms) both; }
    .hk-dot { animation: hk-dot 1.6s ease-in-out var(--tt-delay, 0ms) infinite; }
    .hk-card { animation: hk-card 300ms ease-out var(--tt-delay, 0ms) both, hk-lit 450ms ease-out var(--tt-delay, 0ms) both; }
    .hk-check { animation: hk-check 380ms cubic-bezier(.2,.9,.3,1.3) var(--tt-delay, 0ms) both; }
    @media (prefers-reduced-motion: reduce) { .hk-in, .hk-row, .hk-beam, .hk-card, .hk-check { animation: none; } .hk-dot { display: none; } }
  `}</style>
);

// What their imports switch on, in the order they light up
const UNLOCKS = [
  { Icon: ScaleIcon, title: "Live Duty Rates", text: "Every tariff on each import", tone: "var(--color-primary)", text_: "text-primary" },
  { Icon: BellAlertIcon, title: "Tariff Alerts", text: "Know the moment a rate changes", tone: "var(--color-error)", text_: "text-error" },
  { Icon: CurrencyDollarIcon, title: "Savings", text: "Programs you may qualify for", tone: "var(--color-success)", text_: "text-success" },
  { Icon: DocumentMagnifyingGlassIcon, title: "Duty Audits", text: "Duty you may have overpaid", tone: "var(--color-success)", text_: "text-success" },
];

const LIGHT_AT = 1150;
const LIGHT_EVERY = 260;

const Scene = () => (
  <div className="flex w-full justify-center" role="img" aria-label="Your imports switch on live duty rates, tariff alerts, savings and duty audits">
    <SceneStyles />
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-0" aria-hidden>
      {/* Their imports: a little sheet filling in */}
      <div className="hk-in flex w-52 flex-col gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-5 shadow-[0_18px_44px_-16px_var(--tt-ob-glow)]" style={delay(200)}>
        <span className="flex items-center gap-2 text-sm font-semibold text-base-content">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-content">
            <TableCellsIcon className="h-4 w-4" />
          </span>
          Your imports
        </span>
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="hk-row flex gap-2" style={delay(450 + i * 90)}>
              <span className="h-2 w-16 rounded-full bg-base-content/25" />
              <span className="h-2 flex-1 rounded-full bg-base-content/12" />
            </span>
          ))}
        </div>
      </div>

      {/* The beam across, a dot travelling it */}
      <div className="relative hidden h-0.5 w-20 sm:block">
        <span className="hk-beam absolute inset-0 rounded-full bg-primary/40" style={delay(850)} />
        <span className="hk-dot absolute -top-[3px] h-2 w-2 rounded-full bg-primary" style={delay(1100)} />
      </div>

      {/* What they switch on */}
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {UNLOCKS.map(({ Icon, title, text, tone, text_ }, i) => (
          <li
            key={title}
            className="hk-card flex w-72 items-center gap-3 rounded-xl border-2 border-base-300 bg-base-100 px-4 py-2.5 text-left"
            style={{ ...delay(LIGHT_AT + i * LIGHT_EVERY), "--hk-tone": tone } as React.CSSProperties}
          >
            <Icon className={`h-5 w-5 shrink-0 ${text_}`} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold text-base-content">{title}</span>
              <span className="truncate text-xs text-base-content/60">{text}</span>
            </span>
            <span className={`hk-check flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${text_}`} style={delay(LIGHT_AT + i * LIGHT_EVERY + 150)}>
              <CheckIcon className="h-4 w-4" />
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

export const HookStep = ({ onNext }: { onNext: () => void }) => (
  <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 text-center">
    <div className="flex flex-col items-center gap-4">
      <span className={`${tt.eyebrow("primary")} tt-ob-rise`}>Add your imports</span>
      <h1 id="tt-onboarding-title" tabIndex={-1} className={`${tt.display} tt-ob-rise m-0 text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-base-content outline-hidden sm:text-5xl`} style={delay(60)}>
        Let&apos;s add <span className="text-primary">your imports.</span>
      </h1>
      <p className="tt-ob-rise m-0 max-w-xl text-lg leading-relaxed text-base-content/70" style={delay(120)}>
        It&apos;s the one step that switches everything on. Once they&apos;re in, the Tracker gets to work on them right away.
      </p>
    </div>

    <Scene />

    <div className="tt-ob-rise flex w-full max-w-md flex-col gap-3" style={delay(300)}>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "lg" })} h-14 w-full text-lg shadow-[0_14px_30px_-14px_var(--tt-ob-glow)]`}
        onClick={onNext}
        autoFocus
      >
        Let&apos;s go
        <ArrowRightIcon className="h-5 w-5" aria-hidden />
      </button>
      <span className="text-xs text-base-content/60">Takes about 30 seconds</span>
    </div>
  </div>
);
