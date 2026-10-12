"use client";

import Link from "next/link";
import { ClockIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath, signupHref } from "../access/signup";

// One line across the top of the app when the plan needs attention: signed out (the catalog is
// only on this device), or a trial about to end
const ENDING_SOON_DAYS = 3;

export const PlanBanner = () => {
  const { loading, signedIn, access, daysLeft, openUpgrade } = useTrackerAccess();
  if (loading) return null;

  if (!signedIn) {
    return (
      <div role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <InformationCircleIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          <span className="font-semibold text-base-content">You&apos;re not signed in.</span> Products you add are kept on this
          device only. A free account saves them and unlocks Analysis.
        </p>
        <Link href={signupHref(currentPath())} className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}>
          Create free account
        </Link>
      </div>
    );
  }

  if (access.kind === "trial" && daysLeft <= ENDING_SOON_DAYS) {
    return (
      <div role="status" className={`${ui.notice("warning")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
        <ClockIcon className="h-5 w-5 shrink-0 text-warning" aria-hidden />
        <p className={`${ui.bodySm} flex-1`}>
          <span className="font-semibold text-base-content">
            Your trial ends {daysLeft <= 1 ? "today" : `in ${daysLeft} days`}.
          </span>{" "}
          Pick a plan to keep rate history, savings and tracking for your whole catalog.
        </p>
        <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={() => openUpgrade("plan")}>
          See plans
        </button>
      </div>
    );
  }

  return null;
};
