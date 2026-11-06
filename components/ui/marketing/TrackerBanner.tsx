"use client";

import { sectionUrl, TRACKER_PATH } from "@/components/tariff-tracker/sections";
import { entryHref, TRACKER_WELCOME_PARAM, type EntryPoint } from "@/libs/signup-onboarding";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import * as mk from "./styles";

// The promo bar above the marketing header on the HTS reference pages (/hts, /explore, /section,
// /chapter, /tariffs): Duty Guard's tariff alerts, for people looking up codes they import. Signed
// out: sign-up, the onboarding (?from=hts_page), then Duty Guard's alerts welcome (its tour opened
// on Alerts, into adding imports). Signed in, it opens their alert settings instead.
// Also on /duty-calculator and its country pages, and the /tariff-updates pages; `only` limits it to those paths in a layout
// that covers more (the calculator's changelog, FAQ and countries hub go without). Dark in both modes, like Duty Guard's sidebar. The X hides it on this page
// only: it's back on the next page and on every reload.
const ALERTS_WELCOME = `${TRACKER_PATH}?${TRACKER_WELCOME_PARAM}=alerts`;

export const TrackerBanner = ({ only }: { only?: string[] } = {}) => {
  const { user } = useUser();
  const pathname = usePathname();
  // The page it was closed on: the layout stays mounted from one HTS page to the next, so it's
  // back as soon as the page changes
  const [closedOn, setClosedOn] = useState<string | null>(null);

  if (closedOn === pathname || (only && !only.includes(pathname))) return null;
  // Sign-ups from it count for the calculator on the calculator's pages, the tariff updates on
  // theirs, else the HTS pages
  const calculator = pathname.startsWith("/duty-calculator");
  const updates = pathname.startsWith("/tariff-updates");
  const entry: EntryPoint = calculator ? "calculator_track" : updates ? "update_page" : "hts_page";
  const page = calculator ? "calculator" : updates ? "tariff-updates" : "hts";
  return (
    // The X sits at the bar's far right, outside the content column, apart from the button
    <div className="hts-tracker-on-dark relative bg-neutral pr-12 text-neutral-content scheme-dark sm:pr-14">
      <div className={`${mk.container} flex flex-col items-center justify-center gap-3 py-3.5 sm:flex-row sm:justify-between sm:gap-6`}>
        <p className="text-center text-base sm:text-left">
          <span className="font-semibold">Want alerts when tariffs change on you or your clients' imports?</span>
        </p>
        <Link
          href={user ? sectionUrl("alerts") : entryHref(entry, ALERTS_WELCOME)}
          onClick={() => trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page, entry, section: "banner", label: "Get Tariff Alerts", signed_in: !!user })}
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-success px-5 text-sm font-semibold text-success-content transition-colors hover:bg-success/90"
        >
          {user ? "Open Tariff Alerts" : "Get Tariff Alerts"}
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
