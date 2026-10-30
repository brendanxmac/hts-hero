"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowPathIcon, PlayIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { useEscapeToClose } from "@/hooks";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { realItems } from "../../catalog";
import { useTrackerNav } from "../../shell/TrackerNav";
import { useTracker } from "../../TrackerContext";
import { openImportTakeover } from "../takeoverStore";
import { HowTo } from "../parts";
import { closeFeatureTour, useFeatureTour } from "./tourStore";
import { TourShell, TourStep as ShellStepView } from "@/components/product-tour/TourShell";
import { TOUR_STEPS, TourStep } from "./steps";

// The feature tour: the whole screen, in the import takeover's look (DESIGN_SYSTEM §15), walking
// through what the Tracker does, one feature a step: what it's for, how to do it in a few short
// steps, and beside it a small Tracker playing it out. How to add imports is left out once there
// are some. Each step can carry a video walkthrough (steps.ts TOUR_VIDEOS); until there is one, a
// placeholder says it's coming. It always opens on the Welcome step, with the step it was opened for
// right after. The arrow keys move between steps; Escape closes it. The layout is the shared
// TourShell. New accounts from the sign-up onboarding get the Tracker onboarding instead
// (TrackerOnboarding); this tour is always a button away (the sidebar's Product Tour).

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
  // How to add imports only while there are none (or when it's where the tour was opened). The
  // welcome always comes first; the step it was opened for (its focus, like Alerts for someone who
  // came for alerts) comes right after it, then the rest in order
  const shown = TOUR_STEPS.filter((s) => s.id !== "imports" || !hasImports || start === "imports");
  const focus = shown.find((s) => s.id === start && s.id !== "welcome");
  const steps = focus ? [shown[0], focus, ...shown.slice(1).filter((s) => s !== focus)] : shown;
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
    // Every tour opens on the welcome
    startingAt.current = 0;
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
    <>
      <TourShell product="Tariff Tracker" steps={steps} at={at} onGo={go} exitLabel="Close tour" onExit={() => close("closed")} labelledBy="tt-tour-title" scrollerRef={scroller}>
        <ShellStepView
          key={step.id}
          titleId="tt-tour-title"
          eyebrow={`Step ${at + 1} of ${steps.length} · ${step.rail}`}
          title={step.title}
          lead={step.lead}
          body={<HowTo steps={step.how} start={200} />}
          extra={<VideoSlot step={step} onPlay={() => setPlaying(step)} />}
          onBack={at > 0 ? () => go(at - 1) : undefined}
          next={last ? { label: "Finish tour", onClick: () => close("finished"), arrow: false } : { label: `Next: ${steps[at + 1].rail}`, onClick: () => go(at + 1) }}
          secondary={step.action ? { label: step.action, onClick: takeMeThere } : undefined}
          visual={<div className="hidden xl:block"><Visual run={run} /></div>}
          visualFooter={
            <button
              type="button"
              onClick={() => {
                setRun((r) => r + 1);
                trackEvent(MixpanelEvent.TARIFF_TRACKER_TOUR_ACTION, { step: step.id, action: "replay" });
              }}
              className="absolute -bottom-10 right-0 hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-base-content/55 hover:bg-base-300/60 hover:text-base-content xl:inline-flex"
            >
              <ArrowPathIcon className="h-3.5 w-3.5" aria-hidden />
              Replay
            </button>
          }
        />
      </TourShell>
      <VideoDialog step={playing} onClose={() => setPlaying(null)} />
    </>
  );
};
