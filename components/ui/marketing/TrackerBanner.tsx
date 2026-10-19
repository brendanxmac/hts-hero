"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
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
