"use client";

import { ReactNode, useState } from "react";
import { ArrowRightIcon, QuestionMarkCircleIcon, LifebuoyIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { delay, StepHeading } from "./parts";
import { TakeoverStep } from "./takeoverStore";
import { FindGuide } from "./FindGuide";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Countries } from "@/constants/countries";
import type { RecentLookup } from "@/libs/recent-lookups";

// The ways in: the imports they already looked up in the calculator (when there are any on this
// device), a spreadsheet, then a pasted list. Kept to a picture and a name each, so the
// choice is quick; the one-line descriptions are off for now (flip SHOW_DETAILS to bring them
// back). One is picked out as the obvious default for anyone unsure: their recent searches when
// they have some ("Fastest", one click), else the spreadsheet. Under them, two quiet links for
// anyone without the list to hand.

const SHOW_DETAILS = false;

const Way = ({
  title,
  text,
  visual,
  onClick,
  wait,
  pick = false,
  tag,
}: {
  title: string;
  text: string;
  visual: ReactNode;
  onClick: () => void;
  wait: number;
  // The default to steer the unsure toward: outlined, with an optional tag on top
  pick?: boolean;
  tag?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${tt.panel} tt-ob-rise group relative flex flex-col gap-5 p-6 text-left ${pick ? "ring-2 ring-primary/70 shadow-[0_16px_36px_-18px_var(--tt-ob-glow)]" : ""} transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_16px_36px_-18px_var(--tt-ob-glow)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
    style={delay(wait)}
  >
    {tag && (
      <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-content shadow-md">
        {tag}
      </span>
    )}
    <div
      className="flex h-32 items-center justify-center rounded-xl bg-tt-soft px-4"
      aria-hidden
    >
      {visual}
    </div>
    <div className="mt-auto flex flex-col gap-1">
      <span className={`${tt.display} flex items-center justify-between gap-2 text-xl font-semibold text-base-content`}>
        {title}
        <ArrowRightIcon
          className="h-5 w-5 shrink-0 text-base-content/30 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden
        />
      </span>
      {SHOW_DETAILS && (
        <span className="text-sm leading-relaxed text-base-content/70">
          {text}
        </span>
      )}
    </div>
  </button>
);

const helpLink =
  "inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-base-content/55 underline-offset-4 transition-colors hover:text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40";

const Lines = ({ lines }: { lines: string[] }) => (
  <span
    className={`${mono.className} flex flex-col gap-1 text-[0.7rem] font-semibold text-base-content`}
  >
    {lines.map((l) => (
      <span key={l}>{l}</span>
    ))}
  </span>
);

export const ChooseStep = ({
  lookups,
  onPick,
}: {
  lookups: RecentLookup[];
  onPick: (step: TakeoverStep) => void;
}) => {
  const recent = lookups.length;
  const [guide, setGuide] = useState(false);
  const flag = (code: string) =>
    Countries.find((c) => c.code === code)?.flag ?? code;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <StepHeading
        eyebrow={`Add your imports`}
        title="Choose a way to add your imports"
        lead="Pick whatever's easiest. You can always add more later."
        size="md"
        center
      />
      <FindGuide open={guide} onClose={() => setGuide(false)} onPick={onPick} />

      <div
        className={`grid gap-4 ${recent > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
      >
        {recent > 0 && (
          <Way
              title="Your recent searches"
            text={`You looked up ${recent} ${recent === 1 ? "import" : "imports"} in the duty calculator. Start with ${recent === 1 ? "it" : "those"} in one click.`}
            visual={
              <Lines
                lines={[
                  ...lookups
                    .slice(0, 2)
                    .map((l) => `${l.htsno} · ${flag(l.country)}`),
                  ...(recent > 2 ? [`+ ${recent - 2} more`] : []),
                ]}
              />
            }
            onClick={() => onPick("recent")}
            wait={150}
            pick
            tag="Fastest"
          />
        )}
        <Way
          title="Upload a spreadsheet"
          text="Excel or CSV, as it is. We'll find the HTS code and country columns, and skip the rest."
          visual={
            <span className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className={`h-3.5 w-8 rounded-sm ${i % 4 === 1 || i % 4 === 3 ? "bg-primary/40" : "bg-base-content/10"}`}
                />
              ))}
            </span>
          }
          onClick={() => onPick("file")}
          wait={220}
          pick={recent === 0}
        />
        <Way
          title="Paste a list"
          text="Copy the HTS code and country columns from any spreadsheet, email or document, and paste them in."
          visual={
            <Lines
              lines={[
                "8413.91.90.15   Brazil",
                "8409.99.91.90   Argentina",
                "8482.10.50.44   China",
              ]}
            />
          }
          onClick={() => onPick("paste")}
          wait={290}
        />
      </div>

      {/* For anyone not sure where the list is, or without it to hand: two quiet links */}
      <div
        className="tt-ob-rise flex flex-wrap items-center justify-center gap-x-8 gap-y-2"
        style={delay(380)}
      >
        <button
          type="button"
          onClick={() => {
            setGuide(true);
            trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
              help: "guide_open",
            });
          }}
          className={helpLink}
        >
          <QuestionMarkCircleIcon className="h-4 w-4" aria-hidden />
          Where do I find my HTS codes and countries?
        </button>
        <button
          type="button"
          onClick={() => onPick("handy")}
          className={helpLink}
        >
          <LifebuoyIcon className="h-4 w-4" aria-hidden />
          I don&apos;t have my list handy
        </button>
      </div>
    </div>
  );
};
