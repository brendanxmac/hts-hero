"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { entryHref } from "@/libs/signup-onboarding";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { chooseList } from "@/components/tariff-tracker/lists/chooseList";
import type { MouseEvent } from "react";
import { productUrl } from "@/components/tariff-tracker/sections";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";

const LABEL = "See all AD/CVD cases";

// Under the AD/CVD Cases box on /hts/[code]: the code, from `country`, as an import in Duty Guard,
// open on its AD/CVD Cases tab. Like the Watch box, it saves the import on this device first;
// signed out, sign-up and the onboarding come first (?from=hts_page, its `next` this import), then
// Duty Guard brings the import into the account (catalogSync) and opens it there.
export function AdcvdCasesCta({ htsno, country }: { htsno: string; country: string }) {
  const { user } = useUser();
  const product = { code: htsCodeDigitsOnly(htsno), country };
  const landing = productUrl(itemKey(product), "adcvd");

  const open = async (e: MouseEvent<HTMLAnchorElement>) => {
    // Signed in with several lists, which one (chooseList asks), then on to it
    let target = {};
    if (user) {
      e.preventDefault();
      const picked = await chooseList();
      if (!picked) return;
      target = picked;
    }
    const { added } = addToCatalog([product], target);
    trackEvent(MixpanelEvent.DUTY_GUARD_PRODUCTS_ADDED, { added, duplicates: 1 - added, source: "hts-adcvd", hts_code: htsno });
    trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page: "hts", entry: "hts_page", section: "adcvd_cases", label: LABEL, signed_in: !!user });
    if (user) window.location.href = landing;
  };

  return (
    <a
      href={user ? landing : entryHref("hts_page", landing, "adcvd")}
      onClick={open}
      className={`${ui.button({ variant: "primary" })} w-full`}
    >
      {LABEL}
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </a>
  );
}
