"use client";

import { ReactNode, useState } from "react";
import {
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
  LifebuoyIcon,
  TableCellsIcon,
} from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { ADD_STEP, delay, StepHeading } from "./parts";
import { TakeoverStep } from "./takeoverStore";
import { FindGuide } from "./FindGuide";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Countries } from "@/constants/countries";
import type { RecentLookup } from "@/libs/recent-lookups";

// The ways in, biggest first: the imports they already looked up in the calculator (when there are
// any on this device), a spreadsheet, or a pasted list. Below them, for anyone without the list
// to hand, the way to get it.

const Way = ({
  Icon,
  title,
  text,
  badge,
  visual,
  onClick,
  wait,
}: {
  Icon: typeof TableCellsIcon;
  title: string;
  text: string;
  badge?: string;
  visual: ReactNode;
  onClick: () => void;
  wait: number;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${tt.panel} tt-ob-rise group flex flex-col gap-4 p-5 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_16px_36px_-18px_var(--tt-ob-glow)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
    style={delay(wait)}
  >
    <div className="flex items-center justify-between gap-2">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"
        aria-hidden
      >
        <Icon className="h-5 w-5" />
      </span>
      {badge && <span className={tt.chip("success")}>{badge}</span>}
    </div>
    <div
      className="flex h-24 items-center justify-center rounded-xl bg-tt-soft px-4"
      aria-hidden
    >
      {visual}
    </div>
    <div className="flex flex-col gap-1">
      <span className={tt.title}>{title}</span>
      <span className="text-sm leading-relaxed text-base-content/70">
        {text}
      </span>
    </div>
    <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary">
      Choose
      <ArrowRightIcon
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </span>
  </button>
);

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
        eyebrow={`Step ${ADD_STEP} · Add your imports`}
        title="Choose a way to add your imports"
        lead="Pick whatever's easiest. Start with a handful if that's what you have; you can add the rest any time."
        size="md"
      />
      <FindGuide open={guide} onClose={() => setGuide(false)} onPick={onPick} />

      <div
        className={`grid gap-4 ${recent > 0 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
      >
        {recent > 0 && (
          <Way
            Icon={ClockIcon}
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
          />
        )}
        <Way
          Icon={TableCellsIcon}
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
        />
        <Way
          Icon={ClipboardDocumentListIcon}
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

      {/* For anyone not sure where the list is, or without it to hand */}
      <div className="grid gap-4 lg:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setGuide(true);
            trackEvent(MixpanelEvent.TARIFF_TRACKER_ONBOARDING_HELP_USED, {
              help: "guide_open",
            });
          }}
          className="tt-ob-rise group flex items-center gap-4 rounded-2xl border-2 border-dashed border-base-300 bg-base-100/50 p-5 text-left transition-colors hover:border-primary/40 hover:bg-base-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
          style={delay(380)}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-base font-semibold text-base-content">
              Where do I find my HTS codes and countries of origin?
            </span>
            <span className="text-sm text-base-content/70">
              A step-by-step guide: your spreadsheets, entry summaries, your
              broker, invoices and more.
            </span>
          </span>
          <ArrowRightIcon
            className="h-5 w-5 shrink-0 text-base-content/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden
          />
        </button>
        <button
          type="button"
          onClick={() => onPick("handy")}
          className="tt-ob-rise group flex items-center gap-4 rounded-2xl border-2 border-dashed border-base-300 bg-base-100/50 p-5 text-left transition-colors hover:border-primary/40 hover:bg-base-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
          style={delay(430)}
        >
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning"
            aria-hidden
          >
            <LifebuoyIcon className="h-5 w-5" />
          </span>
          <span className="flex flex-1 flex-col gap-0.5">
            <span className="text-base font-semibold text-base-content">
              I don&apos;t have my list handy
            </span>
            <span className="text-sm text-base-content/70">
              No problem. Here&apos;s where it usually is, and how to get it
              from your customs broker in one email.
            </span>
          </span>
          <ArrowRightIcon
            className="h-5 w-5 shrink-0 text-base-content/40 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
};
