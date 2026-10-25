"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowLeftIcon, ArrowPathIcon, ArrowRightIcon, CheckIcon, PlayIcon, XMarkIcon } from "@heroicons/react/20/solid";
import logo from "@/app/logo.svg";
import { trackerSans } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { THEME } from "@/components/ui/theme";
import { useEscapeToClose } from "@/hooks";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { realItems } from "../../catalog";
import { useTrackerNav } from "../../shell/TrackerNav";
import { useTracker } from "../../TrackerContext";
import { openImportTakeover } from "../takeoverStore";
import { delay, HowTo } from "../parts";
import { closeFeatureTour, useFeatureTour } from "./tourStore";
import { TOUR_STEPS, TourStep } from "./steps";

// The feature tour: the whole screen, in the import takeover's look (DESIGN_SYSTEM §15), walking
// through what the Tracker does, one feature a step: what it's for, how to do it in a few short
// steps, and beside it a small Tracker playing it out. How to add imports is left out once there
// are some. Each step can carry a video walkthrough (steps.ts TOUR_VIDEOS); until there is one, a
// placeholder says it's coming. The arrow keys move between steps; Escape closes it.

// The rail across the top: every step, done ones ticked, any of them a click away
const Rail = ({ steps, at, onGo }: { steps: TourStep[]; at: number; onGo: (i: number) => void }) => (
  <ol className="m-0 hidden list-none items-center gap-1.5 p-0 lg:flex" aria-label="Tour steps">
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
            <span
              className={`whitespace-nowrap text-sm font-semibold ${current ? "text-base-content" : done ? "text-base-content/70 group-hover:text-base-content" : "text-base-content/50 group-hover:text-base-content"}`}
            >
              {s.rail}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

// A step's video: a placeholder until one is added (steps.ts TOUR_VIDEOS), then a button that plays it
const VideoSlot = ({ step, onPlay }: { step: TourStep; onPlay: () => void }) =>
  step.video ? (
    <button
      type="button"
      onClick={onPlay}
      className="group flex items-center gap-3 self-start rounded-2xl border border-base-300 bg-(--tt-ob-tile) py-2 pl-2 pr-4 text-left transition-colors hover:border-primary/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-content transition-transform group-hover:scale-105" aria-hidden>
        <PlayIcon className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-base-content">Watch the video</span>
        <span className="text-xs text-base-content/60">{step.videoLength ?? "A short walkthrough"}</span>
      </span>
    </button>
  ) : (
    <div className="flex items-center gap-3 self-start rounded-2xl border border-dashed border-base-300 py-2 pl-2 pr-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tt-soft text-base-content/40" aria-hidden>
        <PlayIcon className="h-5 w-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-base-content/70">Video walkthrough</span>
        <span className="text-xs text-base-content/50">Coming soon</span>
      </span>
    </div>
  );

// The video, over the tour: a file plays in a player, anything else (YouTube, Loom, Vimeo) embeds
const VideoDialog = ({ step, onClose }: { step: TourStep | null; onClose: () => void }) => {
  const src = step?.video ?? "";
  return (
    <Dialog open={!!step} onClose={onClose} className="relative z-[90]">
      <div className="fixed inset-0 bg-black/70" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-8">
        <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} relative w-full max-w-5xl`}>
          <Dialog.Title className="sr-only">{step?.title}: video</Dialog.Title>
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-11 right-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            Close
          </button>
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
            {/\.(mp4|webm|mov)(\?|$)/i.test(src) ? (
              <video src={src} controls autoPlay className="h-full w-full" />
            ) : (
              <iframe src={src} title={`${step?.title}: video`} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export const FeatureTour = () => {
  const { open, start, from } = useFeatureTour();
  const { items } = useTracker();
  const nav = useTrackerNav();
  const hasImports = realItems(items).length > 0;
  // How to add imports only while there are none (or when it's where the tour was opened)
  const steps = TOUR_STEPS.filter((s) => s.id !== "imports" || !hasImports || start === "imports");
  const [at, setAt] = useState(0);
  // Replay: the demo plays again
  const [run, setRun] = useState(0);
  const [playing, setPlaying] = useState<TourStep | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  // Opening starts at the step asked for. Until that step is on, the one left from the last time
  // isn't counted as seen
  const startingAt = useRef<number | null>(null);
  useEffect(() => {
    if (!open) return;
    startingAt.current = Math.max(0, steps.findIndex((s) => s.id === start));
    setAt(startingAt.current);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_TOUR_SHOWN, { from, start });
  }, [open]);

  const step = steps[Math.min(at, steps.length - 1)];
  const last = at >= steps.length - 1;

  // Each step starts at the top, its title focused for screen readers
  useEffect(() => {
    if (!open || !step) return;
    if (startingAt.current !== null && at !== startingAt.current) return;
    startingAt.current = null;
    scroller.current?.scrollTo({ top: 0 });
    const timer = setTimeout(() => document.getElementById("tt-tour-title")?.focus({ preventScroll: true }), 50);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_TOUR_STEP, { step: step.id, index: at + 1, of: steps.length });
    return () => clearTimeout(timer);
  }, [open, step?.id]);

  const close = (how: "closed" | "finished") => {
    trackEvent(how === "finished" ? MixpanelEvent.TARIFF_TRACKER_TOUR_COMPLETED : MixpanelEvent.TARIFF_TRACKER_TOUR_CLOSED, { step: step?.id, from });
    closeFeatureTour();
  };
  const go = (i: number) => setAt(Math.max(0, Math.min(steps.length - 1, i)));

  useEscapeToClose(open && !playing, () => close("closed"));
  // The arrow keys move between steps (not while typing, or with a video open)
  useEffect(() => {
    if (!open || playing) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest?.("input, textarea, select")) return;
      if (e.key === "ArrowRight") setAt((i) => Math.min(steps.length - 1, i + 1));
      else if (e.key === "ArrowLeft") setAt((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, playing, steps.length]);

  if (!open || !step) return null;

  // "Take me there": the tour closes onto the step's page (adding imports opens its own flow)
  const takeMeThere = () => {
    trackEvent(MixpanelEvent.TARIFF_TRACKER_TOUR_ACTION, { step: step.id, action: "take_me_there" });
    closeFeatureTour();
    if (step.id === "imports") openImportTakeover("tour", "choose");
    else nav.openTab(step.tab);
  };
  const Visual = step.Visual;

  return (
    <div
      ref={scroller}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tt-tour-title"
      className={`${THEME} hts-tracker ${trackerSans.className} fixed inset-0 z-[75] overflow-y-auto bg-(--tt-ob-ground) text-base-content`}
    >
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-6 pb-10 lg:px-10">
        <header className="sticky top-0 z-10 -mx-6 flex items-center justify-between gap-6 bg-(--tt-ob-ground) px-6 py-5 lg:-mx-10 lg:px-10">
          <span className="flex items-center gap-2.5">
            <span className="flex items-center rounded-full bg-base-content p-1">
              <Image src={logo} alt="" className="w-6" width={24} height={24} />
            </span>
            <span className={`${tt.display} whitespace-nowrap text-[0.95rem] font-semibold`}>Product Tour</span>
          </span>
          <Rail steps={steps} at={at} onGo={go} />
          <button
            type="button"
            onClick={() => close("closed")}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-base-content/55 hover:bg-base-300/60 hover:text-base-content"
          >
            <XMarkIcon className="h-4 w-4" aria-hidden />
            Close tour
          </button>
        </header>

        {/* The step: keyed, so everything rises in again as it changes */}
        <div key={step.id} className="grid flex-1 items-center gap-12 py-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <span className="tt-ob-rise flex items-center gap-2">
                <span className={tt.eyebrow("primary")}>
                  Step {at + 1} of {steps.length} · {step.rail}
                </span>
              </span>
              <h1
                id="tt-tour-title"
                tabIndex={-1}
                className={`${tt.display} tt-ob-rise m-0 text-[2.4rem] font-semibold leading-[1.08] tracking-tight text-base-content outline-hidden`}
                style={delay(60)}
              >
                {step.title}
              </h1>
              <p className="tt-ob-rise m-0 text-base leading-relaxed text-base-content/75" style={delay(120)}>
                {step.lead}
              </p>
            </div>

            <HowTo steps={step.how} start={200} />

            <div className="tt-ob-rise flex" style={delay(480)}>
              <VideoSlot step={step} onPlay={() => setPlaying(step)} />
            </div>

            <div className="tt-ob-rise flex flex-wrap items-center gap-3" style={delay(540)}>
              <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} px-6`} onClick={() => (last ? close("finished") : go(at + 1))} autoFocus>
                {last ? "Finish tour" : `Next: ${steps[at + 1].rail}`}
                {!last && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
              </button>
              {step.action && (
                <button type="button" className={ui.button({ variant: "secondary", size: "lg" })} onClick={takeMeThere}>
                  {step.action}
                </button>
              )}
              {at > 0 && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-2 text-sm font-semibold text-base-content/60 hover:text-base-content"
                  onClick={() => go(at - 1)}
                >
                  <ArrowLeftIcon className="h-4 w-4" aria-hidden />
                  Back
                </button>
              )}
            </div>
          </div>

          {/* The demo, playing it out */}
          <div className="tt-ob-pop relative hidden xl:block" style={delay(150)}>
            <Visual run={run} />
            <button
              type="button"
              onClick={() => {
                setRun((r) => r + 1);
                trackEvent(MixpanelEvent.TARIFF_TRACKER_TOUR_ACTION, { step: step.id, action: "replay" });
              }}
              className="absolute -bottom-10 right-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-base-content/55 hover:bg-base-300/60 hover:text-base-content"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" aria-hidden />
              Replay
            </button>
          </div>
        </div>
      </div>
      <VideoDialog step={playing} onClose={() => setPlaying(null)} />
    </div>
  );
};
