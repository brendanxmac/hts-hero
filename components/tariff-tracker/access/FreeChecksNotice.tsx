"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { hasFullAccess } from "@/libs/tariff-tracker/plan";
import { useTrackerAccess } from "./accessContext";

// Savings and audit checks come with the 14-day trial and the paid plans, not the free plan
// (TRIAL_ALLOWANCE is 0 for both). At the top of what they're for: signed out, that a new account
// gets them free for 14 days; on the free plan, that the trial has ended and a plan brings them
// back. Nothing during the trial or on a plan.
const COPY = {
  savings: {
    noun: "Savings checks",
    each: "Every way to save on each import: trade programs, lower-duty origins, exemptions and whether you could qualify.",
    plan: "A plan checks savings on every import it covers.",
  },
  audits: {
    noun: "Audit checks",
    each: "Each entry checked against the duty in force on its entry date.",
    plan: "A plan audits every entry, without limit.",
  },
} as const;

export const FreeChecksNotice = ({ kind }: { kind: keyof typeof COPY }) => {
  const { access, signedIn, openUpgrade, unlockLabel } = useTrackerAccess();
  if (hasFullAccess(access)) return null;
  const copy = COPY[kind];
  const feature = kind === "savings" ? "savings" : "entries";
  if (!signedIn)
    return (
      <div role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <SparklesIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          <span className="font-semibold text-base-content">
            {copy.noun} are free for {REVERSE_TRIAL.days} days with a new account.
          </span>{" "}
          {copy.each}
        </p>
        <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openUpgrade(feature)}>
          {unlockLabel}
        </button>
      </div>
    );
  return (
    <div role="status" className={`${ui.notice("warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <SparklesIcon className="h-5 w-5 shrink-0 text-warning" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">Your free trial has ended.</span> {copy.plan}
      </p>
      <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openUpgrade(feature)}>
        See plans
      </button>
    </div>
  );
};
