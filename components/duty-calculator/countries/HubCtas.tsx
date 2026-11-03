"use client";

import { TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing";
import { EntryCta } from "@/components/onboarding/EntryCta";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as mk from "@/components/ui/marketing/styles";

// The hub's two next steps: check one product in the calculator (the main one), or put a whole
// product list in Duty Guard. Clicks are tracked by placement, to see which offer works.

export const CALCULATOR_HREF = "/duty-calculator";

const track = (cta: "calculator" | "tracker" | "csv", placement: string) =>
  trackEvent(MixpanelEvent.COUNTRIES_HUB_CTA_CLICKED, { cta, placement });

// A pair of buttons, for the top of the page
export function HubButtons({ placement }: { placement: string }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={CALCULATOR_HREF} onClick={() => track("calculator", placement)} className={mk.buttonPrimary}>
        Check your product&rsquo;s duty
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
      <EntryCta page="countries" entry="country_hub" section={placement} label="Track All Your Products" className={mk.buttonSecondary} onClick={() => track("tracker", placement)}>
        Track All Your Products
      </EntryCta>
    </div>
  );
}

// Two cards side by side, after the table: one product (light), or the whole catalog (dark)
export function HubCtaCards({ placement }: { placement: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${mk.card} flex flex-col gap-4 p-8 sm:p-10`}>
        <span className={mk.eyebrow}>One product · Free</span>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Check what your product pays</h2>
        <p className={mk.body}>
          The table shows what a country&rsquo;s goods face. Your duty depends on the HTS code too. Enter it with the
          country of origin and value, and the calculator stacks the base rate with every tariff above, line by line,
          with the legal source for each.
        </p>
        <div className="mt-auto pt-4">
          <Link href={CALCULATOR_HREF} onClick={() => track("calculator", placement)} className={mk.buttonPrimary}>
            Check your product&rsquo;s duty
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-[#0b1220] p-8 text-white shadow-xs sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_16rem_at_90%_0%,rgba(45,212,191,0.22),transparent)]"
        />
        <span className={`${mk.eyebrowDark} relative`}>Your whole catalog · Free</span>
        <h2 className="relative text-3xl font-bold tracking-tight text-white">Track every product you import</h2>
        <p className="relative text-base leading-relaxed text-slate-300">
          Paste your HTS codes and countries once. Duty Guard works out today&rsquo;s duty for each product,
          shows which tariffs drive it, and compares every product across countries of origin.
        </p>
        <div className="relative mt-auto pt-4">
          <EntryCta page="countries" entry="country_hub" section={placement} label={TRY_IT_FREE} className={mk.buttonOnDark} onClick={() => track("tracker", placement)}>
            {TRY_IT_FREE}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </EntryCta>
        </div>
      </div>
    </div>
  );
}

// The table's download link
export function CsvLink({ href }: { href: string }) {
  return (
    <a href={href} download onClick={() => track("csv", "table")} className={mk.link}>
      Download the table (CSV)
    </a>
  );
}
