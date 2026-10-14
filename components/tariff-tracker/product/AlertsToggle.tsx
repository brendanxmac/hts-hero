"use client";

import { BellAlertIcon, BellSlashIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useTrackerAccess } from "../access/accessContext";
import { useTracker } from "../TrackerContext";

// Alerts on or off for one import, as one button. Past the plan's limit it opens the plans;
// signed out, sign-up.
export const AlertsToggle = ({ productKey }: { productKey: string }) => {
  const { trackedKeys, setCovered } = useTracker();
  const { signedIn, unlock, openUpgrade } = useTrackerAccess();
  const on = trackedKeys.has(productKey);
  const toggle = () => {
    if (!signedIn) return unlock("alerts");
    if (!setCovered(productKey, !on)) openUpgrade("tracking");
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      title={on ? "Alerts are on: turn them off for this import" : "Get an alert when a tariff change hits this import"}
      className={on ? `${ui.button({ variant: "secondary", size: "sm" })} border-success/40 text-success` : ui.button({ variant: "primary", size: "sm" })}
    >
      {on ? <BellAlertIcon className="h-4 w-4" aria-hidden /> : <BellSlashIcon className="h-4 w-4" aria-hidden />}
      {on ? "Alerts on" : "Turn on alerts"}
    </button>
  );
};
