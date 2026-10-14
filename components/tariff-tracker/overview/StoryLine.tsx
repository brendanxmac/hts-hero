"use client";

import { ComponentType, KeyboardEvent, SVGProps, useEffect, useRef, useState } from "react";
import { ArrowRightIcon, PauseIcon, PlayIcon } from "@heroicons/react/20/solid";
import { BanknotesIcon, BoltIcon, CheckBadgeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { useTrackerAccess } from "../access/accessContext";
import { useTrackerNav } from "../shell/TrackerNav";
import { Story, StoryTone } from "./lib/story";

// The story at the top of the Overview: one true sentence about the user's catalog at a time,
// picked by tabs. The open tab's bar fills and moves on to the next when full (not with reduced
// motion, and not while pointed at, focused or paused). Every story is laid in the same cell, so
// the panel keeps the tallest one's height and nothing jumps as they change.

const ICONS: Record<Story["id"], ComponentType<SVGProps<SVGSVGElement>>> = {
  changed: BoltIcon,
  waiting: BanknotesIcon,
  joined: SparklesIcon,
  clear: CheckBadgeIcon,
};

const DOT: Record<StoryTone, string> = { primary: "bg-primary", success: "bg-success", error: "bg-error" };

export const StoryLine = ({ stories }: { stories: Story[] }) => {
  const nav = useTrackerNav();
  const { signedIn, unlock } = useTrackerAccess();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  const count = stories.length;
  const active = Math.min(index, Math.max(count - 1, 0));
  const current = stories[active];
  if (!current) return null;

  const auto = count > 1 && !reducedMotion && !stopped;
  const paused = hovered || focused;

  const actions: Record<Story["id"], { label: string; onClick: () => void }> = {
    changed: { label: "See what changed", onClick: () => nav.openTab("history") },
    waiting: { label: "See potential savings", onClick: () => (signedIn ? nav.openTab("savings") : unlock("savings")) },
    joined: { label: "See your imports", onClick: () => nav.openTab("catalog") },
    clear: { label: "See rate history", onClick: () => nav.openTab("history") },
  };

  const go = (i: number, by: "click" | "key" | "timer") => {
    const to = (i + count) % count;
    setIndex(to);
    if (by !== "timer") trackEvent(MixpanelEvent.TARIFF_TRACKER_STORY_ROTATED, { to: stories[to].id });
    if (by === "key") tabs.current[to]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    go(active + step, "key");
  };

  return (
    <div
      className="flex flex-col gap-5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
    >
      {count > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <div role="tablist" aria-label="Your catalog this week" className="flex flex-wrap gap-1.5" onKeyDown={onKeyDown}>
            {stories.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.id}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`tt-story-tab-${s.id}`}
                  aria-selected={on}
                  aria-controls="tt-story-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => go(i, "click")}
                  className={`relative inline-flex h-8 items-center gap-2 overflow-hidden rounded-full px-3.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    on ? "bg-tt-soft text-base-content" : "text-base-content/60 hover:bg-tt-soft hover:text-base-content"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${DOT[s.tone]}`} aria-hidden />
                  {s.kind}
                  {/* The time left on this story; filling up moves to the next one */}
                  {on && auto && (
                    <span
                      key={`${s.id}-${index}`}
                      aria-hidden
                      onAnimationEnd={() => go(active + 1, "timer")}
                      className={`absolute inset-x-0 bottom-0 h-0.5 origin-left animate-story-timer ${DOT[s.tone]}`}
                      // Runtime pause (DESIGN_SYSTEM §10)
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {!reducedMotion && (
            <button
              type="button"
              aria-label={stopped ? "Play the stories" : "Pause the stories"}
              title={stopped ? "Play" : "Pause"}
              onClick={() => setStopped((s) => !s)}
              className={`${tt.button("ghost", "sm")} ml-auto w-8 px-0`}
            >
              {stopped ? <PlayIcon className="h-4 w-4" aria-hidden /> : <PauseIcon className="h-4 w-4" aria-hidden />}
            </button>
          )}
        </div>
      ) : (
        <span className={`${tt.eyebrow(current.tone)} inline-flex items-center gap-2`}>
          <span className={`h-2 w-2 rounded-full ${DOT[current.tone]}`} aria-hidden />
          {current.kind}
        </span>
      )}

      <div id="tt-story-panel" role={count > 1 ? "tabpanel" : undefined} aria-labelledby={count > 1 ? `tt-story-tab-${current.id}` : undefined} className="grid">
        {stories.map((s, i) => {
          const Icon = ICONS[s.id];
          const on = i === active;
          return (
            <div
              key={s.id}
              aria-hidden={!on}
              className={`flex items-start gap-4 [grid-area:1/1] lg:gap-5 ${on ? "animate-story-in motion-reduce:animate-none" : "invisible"}`}
            >
              <span className={`${tt.chip(s.tone)} hidden h-12 w-12 shrink-0 justify-center rounded-2xl px-0 sm:inline-flex`}>
                <Icon className="h-6 w-6" aria-hidden />
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
                <p className={`${tt.display} m-0 max-w-4xl text-xl font-semibold leading-snug tracking-tight text-base-content lg:text-2xl lg:leading-snug`}>
                  {s.parts.map((part, j) =>
                    typeof part === "string" ? (
                      <span key={j}>{part}</span>
                    ) : (
                      <span key={j} className={`${tt.numberChip(part.tone)} box-decoration-clone py-0.5 tabular-nums`}>
                        {part.text}
                      </span>
                    )
                  )}
                </p>
                <button
                  type="button"
                  tabIndex={on ? 0 : -1}
                  onClick={actions[s.id].onClick}
                  className="group inline-flex items-center gap-1.5 rounded-full text-sm font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {actions[s.id].label}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
