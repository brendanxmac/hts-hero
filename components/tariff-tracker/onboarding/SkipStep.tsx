"use client";

import { useState } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { SAVINGS_AUDITS_LABEL } from "@/libs/tariff-tracker/features";
import { SKIP_REASONS, SkipReason } from "@/libs/tariff-tracker/onboarding";
import { delay } from "./parts";

// "Skip for now": not a door out but a last word. What the Tracker can't do without their
// imports, that the trial is waiting on them, and why they're skipping (one tap, needed to go on):
// it tells us what's in the way, and "not sure what an import is" goes back to the explainer.

const WITHOUT = [
  "Alert you the day a tariff change hits one of your products",
  "Show the duty you pay on each import today, every tariff stacked up",
  "Flag antidumping and countervailing duty cases on your imports",
  `Find savings and audit your entries (${SAVINGS_AUDITS_LABEL})`,
];

// Back (and the main button) returns them to the exact step they left, as they left it
export const SkipStep = ({
  backLabel,
  onBack,
  onExplain,
  onSkip,
}: {
  backLabel: string;
  onBack: () => void;
  onExplain: () => void;
  onSkip: (reason: SkipReason, note: string) => void;
}) => {
  const [reason, setReason] = useState<SkipReason | null>(null);
  const [note, setNote] = useState("");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-7">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-base-content/60 hover:text-base-content"
      >
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Back
      </button>
      <div className="flex flex-col gap-3">
        <span className={`${tt.eyebrow("warning")} tt-ob-rise`}>
          Before you go
        </span>
        <h1
          id="tt-onboarding-title"
          tabIndex={-1}
          className={`${tt.display} tt-ob-rise m-0 text-[2rem] font-semibold leading-tight tracking-tight text-base-content outline-hidden`}
          style={delay(60)}
        >
          Everything in the Tracker runs on your imports.
        </h1>
        <p
          className="tt-ob-rise m-0 text-base leading-relaxed text-base-content/75"
          style={delay(120)}
        >
          Without them there&apos;s nothing to watch. Until you add some, the
          Tracker can&apos;t:
        </p>
      </div>

      <ul
        className={`${tt.panel} tt-ob-rise m-0 flex list-none flex-col gap-3 p-5`}
        style={delay(180)}
      >
        {WITHOUT.map((w) => (
          <li
            key={w}
            className="flex items-start gap-3 text-sm text-base-content/80"
          >
            <XMarkIcon
              className="mt-0.5 h-4 w-4 shrink-0 text-error"
              aria-hidden
            />
            {w}
          </li>
        ))}
        <li className="mt-1 border-t border-base-300 pt-3 text-sm font-semibold text-base-content">
          Your {REVERSE_TRIAL.days}-day free trial is waiting too. It starts
          when you add your imports.
        </li>
      </ul>

      <fieldset
        className="tt-ob-rise m-0 flex flex-col gap-3 border-0 p-0"
        style={delay(260)}
      >
        <legend className="mb-3 text-sm font-semibold text-base-content">
          What&apos;s stopping you right now?
        </legend>
        <div className="flex flex-wrap gap-2">
          {SKIP_REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={reason === r.id}
              onClick={() =>
                r.id === "what_is_import" ? onExplain() : setReason(r.id)
              }
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
                reason === r.id
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-base-300 bg-base-100 text-base-content/80 hover:border-base-content/30"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {reason && reason !== "looking" && (
          <textarea
            className={`${ui.textarea} tt-enter min-h-20 text-sm`}
            placeholder={
              reason === "someone_else"
                ? "Who handles it? We can help you get the list from them."
                : "Anything we could make easier? (optional)"
            }
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        )}
      </fieldset>

      <div
        className="tt-ob-rise flex flex-wrap items-center gap-3"
        style={delay(320)}
      >
        <button
          type="button"
          className={`${ui.button({ variant: "primary", size: "lg" })} px-7`}
          onClick={onBack}
          autoFocus
        >
          {backLabel}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={ui.button({ variant: "secondary", size: "lg" })}
          disabled={!reason}
          onClick={() => reason && onSkip(reason, note)}
        >
          Skip for now
        </button>
        {!reason && (
          <span className="text-xs text-base-content/60">
            Pick a reason to skip
          </span>
        )}
      </div>
    </div>
  );
};
