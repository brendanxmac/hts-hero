"use client";

import Link from "next/link";
import { ArrowRightIcon, BellAlertIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "./styles";

// The promo bar above the marketing header on the HTS reference pages (/hts, /explore, /section,
// /chapter): the Tariff Tracker, for people looking up codes they import. Signed in, it opens
// the Tracker instead. Dark in both modes, like the Tracker's sidebar.
export const TrackerBanner = () => {
  const { user } = useUser();
  return (
    <div className="hts-tracker-on-dark bg-neutral text-neutral-content scheme-dark">
      <div className={`${mk.container} flex flex-col items-center justify-center gap-2 py-2.5 sm:flex-row sm:justify-between sm:gap-6`}>
        <p className="text-center text-sm sm:text-left">
          <span className="font-semibold">Know the moment tariffs change on your imports.</span>{" "}
          <span className="text-neutral-content/70">
            The Tariff Tracker watches your whole catalog. Try it free for {REVERSE_TRIAL.days} days, no credit card.
          </span>
        </p>
        <Link
          href={user ? "/tariff-tracker" : "/tariff-monitor"}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-success px-3.5 text-xs font-semibold text-success-content transition-colors hover:bg-success/90"
        >
          {user ? "Open the Tariff Tracker" : `Try it free for ${REVERSE_TRIAL.days} days`}
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
};

// The same bar on the tariff updates pages: alerts when an update affects the reader's imports.
// Above the header, so it doesn't compete with the page's own email sign-up. It opens straight on
// adding imports.
export const TariffAlertsBanner = () => (
  <div className="hts-tracker-on-dark bg-neutral text-neutral-content scheme-dark">
    <div className={`${mk.container} flex flex-col items-center justify-center gap-2 py-2.5 sm:flex-row sm:justify-between sm:gap-6`}>
      <p className="flex items-center gap-2 text-center text-sm font-semibold sm:text-left">
        <BellAlertIcon className="hidden h-4 w-4 shrink-0 text-success sm:block" aria-hidden />
        Get alerted the moment a new tariff update affects any of your imports
      </p>
      <Link
        href="/tariff-tracker?tab=catalog&add=paste"
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-success px-3.5 text-xs font-semibold text-success-content transition-colors hover:bg-success/90"
      >
        Get tariff alerts for your imports
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  </div>
);
