"use client";

import { withArrival } from "@/components/tariff-tracker/onboarding/arrival";
import { useState } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { entryHref } from "@/libs/signup-onboarding";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { productUrl } from "@/components/tariff-tracker/sections";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";

// Duty Guard's box at the top of every /hts/[code] page's rail: one button makes the code a
// tracked import from `country` (China, the page's estimate default; it can be changed in the
// Duty Guard). It saves the import on this device and opens it in Duty Guard. Signed in, that's it;
// signed out, sign-up and the onboarding first, then back to the import, which Duty Guard brings
// into the account (catalogSync), so they land on it, set up, with no add-imports step.
export function WatchCodeBox({ htsno, country = "CN" }: { htsno: string; country?: string }) {
  const { user } = useUser();
  const [saving, setSaving] = useState(false);

  const watch = () => {
    setSaving(true);
    const product = { code: htsCodeDigitsOnly(htsno), country };
    const { added } = addToCatalog([product]);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, { added, duplicates: 1 - added, source: "hts-watch", hts_code: htsno });
    trackEvent(MixpanelEvent.HTS_CODE_WATCH_SUBMITTED, { hts_code: htsno, country_code: country, signed_in: !!user });
    const landing = withArrival(productUrl(itemKey(product)), "watch");
    if (!user) trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page: "hts", entry: "hts_page", section: "watch", label: "Track This Code", signed_in: false });
    window.location.href = user ? landing : entryHref("hts_page", landing);
  };

  return (
    <section aria-labelledby="watch-code" className={`${tt.panel} flex flex-col justify-center gap-4 p-6 ring-1 ring-primary/25 lg:p-7`}>
      <div className="flex flex-col gap-1.5">
        <h2 id="watch-code" className={`${tt.title} text-base leading-snug`}>
          Track <span className="inline font-bold text-primary">{htsno}</span> Free
        </h2>
        <p className="m-0 text-sm leading-relaxed text-base-content/70">
          Save it to your Duty Guard, and get tariff alerts and audits on it free for {REVERSE_TRIAL.days} days.
        </p>
      </div>

      <button type="button" onClick={watch} className={`${ui.button({ variant: "primary" })} w-full`} disabled={saving}>
        {saving ? "Opening Duty Guard…" : "Track This Code"}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </section>
  );
}
