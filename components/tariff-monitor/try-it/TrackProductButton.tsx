"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import type { TariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { NewProduct, addToCatalog, itemKey, productUrl } from "@/components/tariff-tracker";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import * as ui from "@/components/ui/styles";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";

// Saves the demo's product to the Tariff Tracker catalog, then sends the visitor to sign up
// (or in) and on to that product in the Tracker
export const TrackProductButton = ({ f }: { f: TariffFinder }) => {
  const product: NewProduct | null =
    f.selectedElement && f.country
      ? { code: htsCodeDigitsOnly(f.selectedElement.htsno), country: f.country.code }
      : null;
  const href = product
    ? `${config.auth.loginUrl}?redirect=${encodeURIComponent(productUrl(itemKey(product)))}`
    : config.auth.loginUrl;

  return (
    <a
      href={href}
      aria-disabled={!product}
      className={`${ui.button({ variant: "primary" })} shrink-0 ${product ? "" : "pointer-events-none opacity-50"}`}
      onClick={() => {
        if (!product) return;
        const { added } = addToCatalog([product]);
        trackEvent(MixpanelEvent.TARIFF_MONITOR_TRACK_CLICKED, {
          hts_code: f.selectedElement?.htsno,
          country_code: f.country?.code,
        });
        if (added) {
          trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, {
            added,
            duplicates: 0,
            source: "monitor_page",
            with_adjustments: false,
            hts_code: f.selectedElement?.htsno,
            country_code: f.country?.code,
          });
        }
      }}
    >
      Track it free for {REVERSE_TRIAL.days} days
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </a>
  );
};
