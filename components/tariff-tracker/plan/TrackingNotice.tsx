"use client";

import { EyeSlashIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TRIAL_PAIRS } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "../access/accessContext";
import { useTracker } from "../TrackerContext";

// When the catalog holds more products than the plan tracks: which ones are, and the way to
// track the rest. Nothing is deleted; products past the limit still show their duty.
export const TrackingNotice = () => {
  const { signedIn, access, loading, canStartTrial, openTrial, openUpgrade } = useTrackerAccess();
  const { items, untrackedCount } = useTracker();
  if (loading || !signedIn || untrackedCount === 0) return null;
  const upTo = canStartTrial ? Math.min(items.length, TRIAL_PAIRS) : items.length;
  return (
    <div role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <EyeSlashIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">
          Tracking {access.pairLimit.toLocaleString("en-US")} of {items.length.toLocaleString("en-US")} products.
        </span>{" "}
        Your plan tracks the first {access.pairLimit.toLocaleString("en-US")} you added: the other {untrackedCount.toLocaleString("en-US")} still
        show their duty, but get no history, savings or alerts.
      </p>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}
        onClick={() => (canStartTrial ? openTrial("tracking") : openUpgrade("tracking"))}
      >
        {canStartTrial ? `Track ${upTo.toLocaleString("en-US")} free for 14 days` : "Track them all"}
      </button>
    </div>
  );
};
