"use client";

import { useEffect, useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Story } from "./lib/story";

// The rotating line at the top of the Overview: one true sentence about the user's catalog at a
// time, moving on every few seconds (not with reduced motion, and not while pointed at), with
// dots and an arrow to move by hand
const ROTATE_MS = 9000;

export const StoryLine = ({ stories }: { stories: Story[] }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = stories.length;
  const current = stories[index % Math.max(count, 1)];

  useEffect(() => {
    if (count < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  if (!current) return null;
  const go = (i: number) => {
    setIndex(i % count);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_STORY_ROTATED, { to: stories[i % count].id });
  };

  return (
    <div className="flex items-start gap-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex min-h-28 flex-1 flex-col gap-2" aria-live="polite">
        <span className={tt.eyebrow(current.tone)}>{current.kind}</span>
        <p className={`${tt.display} m-0 text-2xl font-semibold leading-snug tracking-tight text-base-content lg:text-[1.65rem]`}>
          {current.parts.map((part, i) =>
            typeof part === "string" ? (
              <span key={i}>{part}</span>
            ) : (
              <span key={i} className={tt.numberChip(part.tone)}>
                {part.text}
              </span>
            )
          )}
        </p>
      </div>
      {count > 1 && (
        <div className="flex shrink-0 items-center gap-1.5 pt-1">
          {stories.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.kind}
              aria-current={i === index % count}
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${i === index % count ? "w-6 bg-base-content" : "w-2 bg-base-300 hover:bg-base-content/40"}`}
            />
          ))}
          <button type="button" aria-label="Next update" onClick={() => go(index + 1)} className={`${tt.button("secondary", "sm")} ml-1 w-8 px-0`}>
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
};
