"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { CheckCircleIcon, CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TRIAL_DAYS, TRIAL_PAIRS } from "@/components/pricing-calculator/lib/pricing";
import { trialEndFrom } from "@/libs/tariff-tracker/plan";
import { formatDate } from "../../duty-calculator/lib/format";
import { PREMIUM_FEATURES, PREMIUM_INCLUDES, PremiumFeature } from "./features";

// The one step from a premium feature to the trial: what it is, what it includes and when it
// ends, then one click. No card, so nothing to fill in.
export const StartTrialDialog = ({
  open,
  feature,
  onClose,
  onStart,
}: {
  open: boolean;
  feature: PremiumFeature;
  onClose: () => void;
  // Resolves to whether it started
  onStart: () => Promise<boolean>;
}) => {
  const [state, setState] = useState<"idle" | "starting" | "started">("idle");
  const ends = formatDate(trialEndFrom(new Date()).toISOString().slice(0, 10));
  const { name, benefit } = PREMIUM_FEATURES[feature];

  const close = () => {
    onClose();
    // After the closing transition, so the dialog doesn't flash back to its first step
    setTimeout(() => setState("idle"), 200);
  };

  const start = async () => {
    setState("starting");
    setState((await onStart()) ? "started" : "idle");
  };

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${ui.card} hts-theme w-full max-w-lg`}>
          <div className={ui.cardHeader}>
            <div>
              <p className={ui.kicker}>{state === "started" ? "Trial started" : `Unlock ${name}`}</p>
              <Dialog.Title className="mt-1 text-xl font-semibold tracking-tight text-base-content">
                {state === "started" ? "Everything in the Tracker is yours" : `Try the full Tracker free for ${TRIAL_DAYS} days`}
              </Dialog.Title>
            </div>
            <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={close}>
              <XMarkIcon className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {state === "started" ? (
            <div className="flex flex-col items-start gap-4 px-5 py-5">
              <p className={`${ui.body} flex items-start gap-2`}>
                <CheckCircleIcon className="mt-1 h-5 w-5 shrink-0 text-success" aria-hidden />
                Your trial runs until {ends}. Up to {TRIAL_PAIRS} products are tracked, with rate history, savings and
                everything else unlocked.
              </p>
              <button type="button" className={ui.button({ variant: "primary" })} onClick={close}>
                See {name.toLowerCase() === "tariff tracker" ? "it" : name.toLowerCase()}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 px-5 py-5">
                <p className={ui.body}>{benefit}, plus everything else in the Tracker, for up to {TRIAL_PAIRS} products.</p>
                <ul className="flex flex-col gap-2">
                  {PREMIUM_INCLUDES.map((item) => (
                    <li key={item} className={`${ui.bodySm} flex gap-2.5`}>
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${ui.cardFooter} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
                <p className={ui.caption}>
                  No credit card. Ends {ends}, then you&apos;re back on the free plan. Nothing is deleted.
                </p>
                <button
                  type="button"
                  className={ui.button({ variant: "primary" })}
                  onClick={start}
                  disabled={state === "starting"}
                >
                  {state === "starting" ? "Starting…" : "Start my free trial"}
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
