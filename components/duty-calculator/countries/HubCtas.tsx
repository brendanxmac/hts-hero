"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";

// The hub's two next steps: check one product in the calculator (the main one), or put a whole
// product list in the Tariff Tracker. Clicks are tracked by placement, to see which offer works.

export const CALCULATOR_HREF = "/duty-calculator";
export const TRACKER_HREF = "/tariff-tracker?add=paste";

const track = (cta: "calculator" | "tracker" | "csv", placement: string) =>
  trackEvent(MixpanelEvent.COUNTRIES_HUB_CTA_CLICKED, { cta, placement });

// A pair of buttons, for the top of the page
export function HubButtons({ placement }: { placement: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={CALCULATOR_HREF} onClick={() => track("calculator", placement)} className={ui.button({ variant: "primary" })}>
        Check your product&rsquo;s duty
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
      <Link href={TRACKER_HREF} onClick={() => track("tracker", placement)} className={ui.button({})}>
        Track all your products
      </Link>
    </div>
  );
}

// Two cards side by side, after the table: one product, or the whole catalog
export function HubCtaCards({ placement }: { placement: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className={`${ui.card} flex flex-col gap-3 p-6`}>
        <span className={ui.kicker}>One product · Free</span>
        <h2 className="text-2xl font-semibold tracking-tight text-base-content">Check what your product pays</h2>
        <p className={ui.body}>
          The table shows what a country&rsquo;s goods face. Your duty depends on the HTS code too. Enter it with the
          country of origin and value, and the calculator stacks the base rate with every tariff above, line by line,
          with the legal source for each.
        </p>
        <div className="mt-auto pt-2">
          <Link href={CALCULATOR_HREF} onClick={() => track("calculator", placement)} className={ui.button({ variant: "primary" })}>
            Check your product&rsquo;s duty
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
      <div className={`${ui.card} flex flex-col gap-3 p-6`}>
        <span className={ui.kicker}>Your whole catalog · No sign-up</span>
        <h2 className="text-2xl font-semibold tracking-tight text-base-content">Track every product you import</h2>
        <p className={ui.body}>
          Paste your HTS codes and countries once. The Tariff Tracker works out today&rsquo;s duty for each product,
          shows which tariffs drive it, and compares every product across countries of origin.
        </p>
        <div className="mt-auto pt-2">
          <Link href={TRACKER_HREF} onClick={() => track("tracker", placement)} className={ui.button({})}>
            Track your products
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}

// The table's download link
export function CsvLink({ href }: { href: string }) {
  return (
    <a href={href} download onClick={() => track("csv", "table")} className={ui.link}>
      Download the table (CSV)
    </a>
  );
}
