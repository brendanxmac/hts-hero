"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Crisp } from "crisp-sdk-web";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import config from "@/config";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import * as tt from "@/components/ui/styles/tracker";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { SKIP_REASONS, SkipReason } from "@/libs/tariff-tracker/onboarding";
import { delay } from "./parts";

// "Skip setup": not a door out but a last word. What the Tracker can't do without their imports and
// that the trial is waiting on them, a way to talk to us in the support chat, then the two choices
// side by side. Skipping opens a popup asking why, optionally (it tells us what's in the way;
// "something else" takes a note).

const WITHOUT = [
  "Alert you the day a tariff change hits one of your products",
  "Show the duty you pay on each import today, every tariff stacked up",
  "Flag antidumping and countervailing duty cases on your imports",
  "Find possible savings and audit your entries",
];

// Back (and the main button) returns them to the exact step they left, as they left it
export const SkipStep = ({
  onBack,
  onSkip,
}: {
  onBack: () => void;
  onSkip: (reason: SkipReason | null, note: string) => void;
}) => {
  const [asking, setAsking] = useState(false);

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

      <div className="tt-ob-rise" style={delay(240)}>
        <SupportBox />
      </div>

      <div
        className="tt-ob-rise grid grid-cols-1 gap-3 sm:grid-cols-2"
        style={delay(300)}
      >
        <button
          type="button"
          className={`${ui.button({ variant: "primary", size: "lg" })} w-full justify-center`}
          onClick={onBack}
          autoFocus
        >
          Add my imports
        </button>
        <button
          type="button"
          className={`${ui.button({ variant: "secondary", size: "lg" })} w-full justify-center`}
          onClick={() => setAsking(true)}
        >
          Skip setup
        </button>
      </div>

      <SkipReasonDialog
        open={asking}
        onClose={() => setAsking(false)}
        onSkip={onSkip}
      />
    </div>
  );
};

// Opens Crisp over the Tracker (it can be hidden on some routes, config.crisp)
const openSupportChat = () => {
  if (config.crisp?.id) {
    Crisp.chat.show();
    Crisp.chat.open();
  } else if (config.resend?.supportEmail) {
    window.open(`mailto:${config.resend.supportEmail}?subject=Help adding my imports`, "_blank");
  }
};

// Help instead of a skip: talk to us in the support chat
const SupportBox = () => (
  <div className="flex items-start gap-3 rounded-xl border border-base-300 bg-tt-soft p-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
      <ChatBubbleLeftRightIcon className="h-5 w-5" />
    </span>
    <div className="flex flex-1 flex-col gap-2">
      <p className="m-0 text-sm leading-relaxed text-base-content/80">
        <span className="font-semibold text-base-content">Stuck, or not sure where to start?</span> Talk to us. We&apos;ll help you get your imports in.
      </p>
      <button
        type="button"
        className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`}
        onClick={openSupportChat}
      >
        <ChatBubbleLeftRightIcon className="h-4 w-4" aria-hidden />
        Chat with support
      </button>
    </div>
  </div>
);

// Why they're skipping, if they'd like to say (never required). Above the
// takeover (z-[70]), so it sits at z-[80] and carries the Tracker's look itself.
const SkipReasonDialog = ({
  open,
  onClose,
  onSkip,
}: {
  open: boolean;
  onClose: () => void;
  onSkip: (reason: SkipReason | null, note: string) => void;
}) => {
  const [reason, setReason] = useState<SkipReason | null>(null);
  const [note, setNote] = useState("");

  return (
    <Dialog open={open} onClose={onClose} className="relative z-[80]">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[92vh] w-full max-w-2xl flex-col gap-5 overflow-y-auto p-6 shadow-2xl sm:p-8`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-2 pr-6">
            <Dialog.Title className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content`}>
              Anything in the way?
            </Dialog.Title>
            <p className="m-0 text-sm leading-relaxed text-base-content/70">
              Optional, but it helps us make this easier. Pick one if it fits, or just skip.
            </p>
          </div>

          {/* A list of choices (radio rows), not buttons: one or none */}
          <div role="radiogroup" aria-label="What's in the way" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {SKIP_REASONS.map((r) => {
              const picked = reason === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={picked}
                  onClick={() => setReason(picked ? null : r.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    picked
                      ? "border-primary bg-primary/10 font-semibold text-base-content"
                      : "border-base-300 bg-base-200/40 text-base-content/80 hover:border-base-content/30 hover:bg-base-200"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                      picked ? "border-primary" : "border-base-content/30"
                    }`}
                    aria-hidden
                  >
                    {picked && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>
          {reason === "other" && (
            <textarea
              className={`${ui.textarea} tt-enter min-h-20 text-sm`}
              placeholder="What's in the way? (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              autoFocus
            />
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              className={`${ui.button({ variant: "secondary", size: "md" })} w-full justify-center`}
              onClick={onClose}
            >
              Back to setup
            </button>
            <button
              type="button"
              className={`${ui.button({ variant: "primary", size: "md" })} w-full justify-center`}
              onClick={() => onSkip(reason, reason === "other" ? note : "")}
            >
              Skip setup
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
