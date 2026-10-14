"use client";

import { SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { formatMoney } from "@/components/duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { useInsights } from "../insights/InsightsContext";
import { useTracker } from "../TrackerContext";

// When the catalog holds more imports than get alerts (the trial's TRIAL_ALLOWANCE.alertImports,
// or the plan's size): which ones do (the user's picks, then the highest-duty others), and the way
// to cover the rest. The whole catalog can always be added; nothing is deleted, and every product
// shows its duty, rate history and sourcing.
export const TrackingNotice = () => {
  const { signedIn, access, loading, paid, openUpgrade } = useTrackerAccess();
  const { items, untrackedCount, pickedKeys } = useTracker();
  const { beyond } = useInsights();
  if (loading || !signedIn || untrackedCount === 0) return null;
  const limit = access.pairLimit.toLocaleString("en-US");
  // On a plan, the savings on the imports it doesn't cover are worked out for this teaser
  const teaser =
    paid && beyond.productsWithSavings > 0
      ? `Potential savings found on ${beyond.productsWithSavings.toLocaleString("en-US")} of the imports your plan doesn't cover${
          beyond.anyUsd > 0.005 ? `: up to ${formatMoney(beyond.anyUsd)} per shipment` : ""
        }.`
      : null;
  return (
    <div role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <SparklesIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">
          {paid ? "Your plan covers" : "Free alerts cover"} {limit} of {items.length.toLocaleString("en-US")} imports.
        </span>{" "}
        {teaser ?? (
          <>
            The other {untrackedCount.toLocaleString("en-US")} show their duty, rate history and sourcing, but get no alerts.
          </>
        )}{" "}
        {pickedKeys.size === 0
          ? "Alerts go to your highest-duty imports until you pick your own: check the ones you want in the Alerts column."
          : "Pick which ones in the Alerts column."}
      </p>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}
        onClick={() => openUpgrade("tracking")}
      >
        Get alerts on all of them
      </button>
    </div>
  );
};
