"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { THEME } from "@/components/ui/theme";
import { delay } from "@/components/tariff-tracker/onboarding/parts";

// The one look every product tour and product onboarding shares (the Tariff Tracker's tour and
// onboarding, the Classification Assistant's tour): the whole screen, the product's name top left,
// a numbered chip for every step across the top (done ones ticked, any a click away), the way out
// top right; then each step with its words on the left (Back on the left, Next on the right) and
// its demo on the right. Each tour brings its own steps and demos (DESIGN_SYSTEM §15).

export type ShellStep = { id: string; rail: string };

// The chips across the top
const Rail = ({ steps, at, onGo }: { steps: ShellStep[]; at: number; onGo: (i: number) => void }) => (
  <ol className="m-0 hidden list-none items-center gap-1.5 p-0 lg:flex" aria-label="Steps">
    {steps.map((s, i) => {
      const done = i < at;
      const current = i === at;
      return (
        <li key={s.id} className="flex items-center gap-1.5">
          {i > 0 && <span className={`h-px w-5 ${done || current ? "bg-primary/50" : "bg-base-300"}`} aria-hidden />}
          <button
            type="button"
            onClick={() => onGo(i)}
            disabled={current}
            aria-current={current ? "step" : undefined}
            className="group flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors enabled:hover:bg-base-300/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                done ? "bg-primary text-primary-content" : current ? "border-2 border-primary text-primary" : "border-2 border-base-300 text-base-content/40"
              }`}
              aria-hidden
            >
              {done ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`whitespace-nowrap text-sm font-semibold ${current ? "text-base-content" : done ? "text-base-content/70 group-hover:text-base-content" : "text-base-content/50 group-hover:text-base-content"}`}>
              {s.rail}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

export const TourShell = ({
  product,
  steps,
  at,
  onGo,
  exitLabel,
  onExit,
  labelledBy,
  scrollerRef,
  children,
}: {
  product: string;
  steps: ShellStep[];
  at: number;
  onGo: (i: number) => void;
  exitLabel: string;
  onExit: () => void;
  labelledBy: string;
  scrollerRef?: React.Ref<HTMLDivElement>;
  children: ReactNode;
}) => (
  <div
    ref={scrollerRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby={labelledBy}
    className={`${THEME} hts-tracker ${trackerSans.className} fixed inset-0 z-[75] overflow-y-auto overflow-x-hidden bg-(--tt-ob-ground) text-base-content`}
  >
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-6 pb-10 lg:px-10">
      <header className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-3 bg-(--tt-ob-ground) sm:gap-6 px-6 py-5 lg:-mx-10 lg:px-10">
        <span className="flex items-center gap-2.5">
          <span className="flex items-center rounded-full bg-base-content p-1">
            <Image src={logo} alt="" className="w-6" width={24} height={24} />
          </span>
          <span className={`${tt.display} whitespace-nowrap text-[0.95rem] font-semibold`}>{product}</span>
        </span>
        <Rail steps={steps} at={at} onGo={onGo} />
        <span className="whitespace-nowrap text-sm font-semibold text-base-content/55 lg:hidden">
          {at + 1} of {steps.length}
        </span>
        <button
          type="button"
          onClick={onExit}
          className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-base-content/55 hover:bg-base-300/60 hover:text-base-content"
        >
          <XMarkIcon className="h-4 w-4" aria-hidden />
          {exitLabel}
        </button>
      </header>
      {children}
    </div>
  </div>
);

// One step: the words and buttons on the left, the demo on the right. Keyed by the caller, so it
// rises in again as it changes.
export const TourStep = ({
  titleId,
  eyebrow,
  title,
  lead,
  body,
  extra,
  onBack,
  next,
  secondary,
  visual,
  visualFooter,
}: {
  titleId: string;
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  body?: ReactNode;
  extra?: ReactNode;
  onBack?: () => void;
  next: { label: string; onClick: () => void; arrow?: boolean };
  secondary?: { label: string; onClick: () => void };
  visual: ReactNode;
  visualFooter?: ReactNode;
}) => (
  <div className="grid flex-1 items-center gap-12 py-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <span className="tt-ob-rise flex items-center gap-2">
          <span className={tt.eyebrow("primary")}>{eyebrow}</span>
        </span>
        <h1 id={titleId} tabIndex={-1} className={`${tt.display} tt-ob-rise m-0 text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-base-content outline-hidden`} style={delay(60)}>
          {title}
        </h1>
        <p className="tt-ob-rise m-0 text-base leading-relaxed text-base-content/75" style={delay(120)}>
          {lead}
        </p>
      </div>
      {body}
      {extra && (
        <div className="tt-ob-rise flex" style={delay(480)}>
          {extra}
        </div>
      )}
      {/* Back on the left, Next on the right */}
      <div className="tt-ob-rise flex flex-wrap items-center gap-3" style={delay(540)}>
        {onBack && (
          <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back
          </button>
        )}
        <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} px-6`} onClick={next.onClick} autoFocus>
          {next.label}
          {next.arrow !== false && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
        </button>
        {secondary && (
          <button type="button" className={ui.button({ variant: "secondary", size: "lg" })} onClick={secondary.onClick}>
            {secondary.label}
          </button>
        )}
      </div>
    </div>
    <div className="tt-ob-pop relative" style={delay(150)}>
      {visual}
      {visualFooter}
    </div>
  </div>
);

// One idea per screen, centered and cinematic (the Tracker onboarding): a small eyebrow, a big
// headline, one line under it, then a single animated scene, and Back / Next under that. The eyebrow
// takes the step's color (accent). Keyed by the caller, so it all plays again as it changes.
export const TourStage = ({
  titleId,
  eyebrow,
  title,
  lead,
  scene,
  accent = "text-primary",
  onBack,
  next,
  footnote,
}: {
  titleId: string;
  eyebrow: ReactNode;
  title: ReactNode;
  lead: ReactNode;
  scene: ReactNode;
  accent?: string;
  onBack?: () => void;
  next: { label: string; onClick: () => void; arrow?: boolean };
  footnote?: ReactNode;
}) => (
  <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
    <style>{`
      @keyframes ts-in { from { opacity: 0; transform: translateY(18px) scale(.985); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
      .ts-in { animation: ts-in 700ms cubic-bezier(.2,.8,.2,1) var(--tt-delay, 0ms) both; }
      @media (prefers-reduced-motion: reduce) { .ts-in { animation: none; } }
    `}</style>
    <div className="relative flex w-full max-w-3xl flex-col items-center">
      <span className={`ts-in text-xs font-bold uppercase tracking-[0.22em] ${accent}`}>{eyebrow}</span>
      <h1
        id={titleId}
        tabIndex={-1}
        className={`${tt.display} ts-in m-0 mt-5 text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-base-content outline-hidden sm:text-6xl`}
        style={delay(90)}
      >
        {title}
      </h1>
      <p className="ts-in m-0 mt-5 max-w-xl text-lg leading-relaxed text-base-content/70" style={delay(200)}>
        {lead}
      </p>
    </div>
    <div className="ts-in relative mt-12 flex w-full max-w-2xl justify-center" style={delay(320)}>
      {scene}
    </div>
    {/* Back on the left, Next on the right */}
    <div className="ts-in relative mt-12 flex items-center gap-3" style={delay(480)}>
      {onBack && (
        <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Back
        </button>
      )}
      <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} h-14 px-8 text-lg`} onClick={next.onClick} autoFocus>
        {next.label}
        {next.arrow !== false && <ArrowRightIcon className="h-5 w-5" aria-hidden />}
      </button>
    </div>
    {footnote && (
      <p className="ts-in relative m-0 mt-5 text-sm text-base-content/55" style={delay(560)}>
        {footnote}
      </p>
    )}
  </div>
);
