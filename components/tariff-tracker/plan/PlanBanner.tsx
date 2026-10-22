"use client";

import { useState } from "react";
import { ClockIcon, SparklesIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useTrackerAccess } from "../access/accessContext";
import { AUDITS_ENABLED, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import { useUpgradeStats } from "../access/upgradeStats";
import { useTracker } from "../TrackerContext";
import { endsIn, trialState } from "./trial";

// One line across the top of the app when the plan needs attention: the 14-day trial ending or
// ended (what goes, in their numbers), or the free checks all used

const n = (count: number) => count.toLocaleString("en-US");

export const PlanBanner = () => {
  const { loading, signedIn, access, savingsLeft, auditsLeft, openUpgrade } = useTrackerAccess();
  const { items, trackedKeys } = useTracker();
  const stats = useUpgradeStats();
  // Closed for this visit
  const [hidden, setHidden] = useState(false);
  if (loading) return null;

  // Signed out: no banner. The sidebar's "Save your imports" card is the one standing ask, and each
  // locked feature asks where it pays off (DESIGN_SYSTEM.md §15 "Color")
  if (!signedIn) return null;

  // The trial's last days, and after it: what goes (or went), and the way to keep it
  const trial = trialState(access);
  const imports = stats?.imports ?? items.length;
  const lost = Math.max(0, imports - Math.min(trackedKeys.size, imports));
  if (!hidden && ((trial.ending && imports > 0) || (trial.ended && lost > 0))) {
    return (
      <div role="status" className={`${ui.notice(trial.ended ? "error" : "warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <ClockIcon className={`h-5 w-5 shrink-0 ${trial.ended ? "text-error" : "text-warning"}`} aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          {trial.ended ? (
            <>
              <span className="font-semibold text-base-content">Your free trial has ended.</span> Your {n(imports)} imports have no tariff alerts, impact checks or
              AD/CVD checks, and Insights is locked.
            </>
          ) : (
            <>
              <span className="font-semibold text-base-content">Your free trial ends {endsIn(access)}.</span>{" "}
              Your imports will lose their tariff alerts, impact checks and AD/CVD checks, and Insights will lock.
            </>
          )}
        </p>
        <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={() => openUpgrade("plan")}>
          {trial.ended ? "Get it all back" : "Keep everything"}
        </button>
        <button type="button" className="shrink-0 self-end rounded-full p-1 text-base-content/60 hover:text-base-content sm:self-center" onClick={() => setHidden(true)}>
          <XMarkIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Hide</span>
        </button>
      </div>
    );
  }

  // A paid plan that ended, with imports that lost their alerts: the way back
  if (!hidden && trial.lapsed && lost > 0) {
    return (
      <div role="status" className={`${ui.notice("error")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <ClockIcon className="h-5 w-5 shrink-0 text-error" aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          <span className="font-semibold text-base-content">Your Tariff Tracker plan has ended.</span> Your {n(imports)} imports have no tariff alerts, impact checks or
          AD/CVD checks, and Insights is locked.
        </p>
        <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={() => openUpgrade("plan")}>
          Resubscribe
        </button>
        <button type="button" className="shrink-0 self-end rounded-full p-1 text-base-content/60 hover:text-base-content sm:self-center" onClick={() => setHidden(true)}>
          <XMarkIcon className="h-4 w-4" aria-hidden />
          <span className="sr-only">Hide</span>
        </button>
      </div>
    );
  }

  // Both checks used up on the free plan: the one nudge to a plan
  if (SAVINGS_ENABLED && AUDITS_ENABLED && access.kind === "free" && savingsLeft === 0 && auditsLeft === 0) {
    return (
      <div role="status" className={`${ui.notice("warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <SparklesIcon className="h-5 w-5 shrink-0 text-warning" aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          <span className="font-semibold text-base-content">You&apos;ve used your free savings and audit checks.</span> Pick a plan to check savings and audit entries on
          every import it covers.
        </p>
        <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={() => openUpgrade("plan")}>
          See plans
        </button>
      </div>
    );
  }

  return null;
};
