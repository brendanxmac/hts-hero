"use client";

import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, BellAlertIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing";
import * as mk from "./styles";

// The promo bar above the marketing header on the HTS reference pages (/hts, /explore, /section,
// /chapter): the Tariff Tracker, for people looking up codes they import. Signed in, it opens
// the Tracker instead. Dark in both modes, like the Tracker's sidebar. The X hides it on this page
// only: it's back on the next page and on every reload.
export const TrackerBanner = () => {
  const { user } = useUser();
  const pathname = usePathname();
  // The page it was closed on: the layout stays mounted from one HTS page to the next, so it's
  // back as soon as the page changes
  const [closedOn, setClosedOn] = useState<string | null>(null);

  if (closedOn === pathname) return null;
  return (
    // The X sits at the bar's far right, outside the content column, apart from the button
    <div className="hts-tracker-on-dark relative bg-neutral pr-12 text-neutral-content scheme-dark sm:pr-14">
      <div className={`${mk.container} flex flex-col items-center justify-center gap-3 py-3.5 sm:flex-row sm:justify-between sm:gap-6`}>
        <p className="text-center text-base sm:text-left">
          <span className="font-semibold">Eliminate tariff overpayments and surprises.</span>{" "}
          <span className="text-neutral-content/70">
            We flag duty you may have overpaid and alert you when a tariff change hits your imports.
          </span>
        </p>
        <Link
          href={user ? "/tariff-tracker" : TRY_FREE_HREF}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-success px-5 text-sm font-semibold text-success-content transition-colors hover:bg-success/90"
        >
          {user ? "Open the Tariff Tracker" : TRY_IT_FREE}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <button
        type="button"
        onClick={() => setClosedOn(pathname)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-neutral-content/60 transition-colors hover:bg-neutral-content/10 hover:text-neutral-content sm:right-4"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden />
        <span className="sr-only">Dismiss</span>
      </button>
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
        No tariff surprises: get alerted the moment an update affects your imports, and catch duty you may have overpaid
      </p>
      <Link
        href="/tariff-tracker?tab=catalog&add=paste"
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-success px-3.5 text-xs font-semibold text-success-content transition-colors hover:bg-success/90"
      >
        {TRY_IT_FREE}
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  </div>
);
