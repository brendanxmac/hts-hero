"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "./accessContext";

// The one way a free allowance shows (savings checks, audit checks), at the top of what it's for:
// how many are left and what one does, or, once they're used, what a plan does and "See plans".
// Signed out, the checks a free account comes with. Nothing on a plan. Every locked feature in the Tracker shows its own content under it.
const COPY = {
  savings: {
    total: TRIAL_ALLOWANCE.savingsChecks,
    noun: "savings checks",
    each: "Each one shows every way to save on one import: trade programs, lower-duty origins, exemptions and whether you could qualify. Checked imports stay unlocked.",
    plan: "A plan checks savings on every import it covers.",
  },
  audits: {
    total: TRIAL_ALLOWANCE.auditChecks,
    noun: "audit checks",
    each: "Each one checks one entry against the duty in force on its entry date.",
    plan: "A plan audits every entry, without limit.",
  },
} as const;

export const FreeChecksNotice = ({ kind }: { kind: keyof typeof COPY }) => {
  const { paid, signedIn, savingsLeft, auditsLeft, openUpgrade, unlockLabel } = useTrackerAccess();
  if (paid) return null;
  const copy = COPY[kind];
  const feature = kind === "savings" ? "savings" : "entries";
  if (!signedIn)
    return (
      <div role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <SparklesIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          <span className="font-semibold text-base-content">A free account includes {copy.total} {copy.noun}.</span> {copy.each}
        </p>
        <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openUpgrade(feature)}>
          {unlockLabel}
        </button>
      </div>
    );
  const left = kind === "savings" ? savingsLeft : auditsLeft;
  return (
    <div role="status" className={`${ui.notice(left > 0 ? "primary" : "warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <SparklesIcon className={`h-5 w-5 shrink-0 ${left > 0 ? "text-primary" : "text-warning"}`} aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">
          {left > 0 ? `${left} of ${copy.total} free ${copy.noun} left.` : `You've used your ${copy.total} free ${copy.noun}.`}
        </span>{" "}
        {left > 0 ? copy.each : copy.plan}
      </p>
      {left === 0 && (
        <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openUpgrade(feature)}>
          See plans
        </button>
      )}
    </div>
  );
};
