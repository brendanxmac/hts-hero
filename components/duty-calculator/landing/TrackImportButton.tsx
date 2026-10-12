"use client";

import { ArrowRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { productUrl } from "@/components/tariff-tracker/sections";
import { TariffFinder } from "../lib/useTariffFinder";

// "Track this import": saves it to the Tariff Tracker catalog (kept on this device until they
// sign up) and opens it there, where alerts, history and savings live. The way from a quick
// answer into the product.
export const TrackImportButton = ({ f, size = "md" }: { f: TariffFinder; size?: "sm" | "md" }) => {
  if (!f.selectedElement || !f.country) return null;
  const product = { code: htsCodeDigitsOnly(f.selectedElement.htsno), country: f.country.code };
  return (
    <a
      href={productUrl(itemKey(product))}
      className={tt.button("money", size)}
      onClick={() => {
        const { added } = addToCatalog([
          {
            ...product,
            adjustments: {
              customsValue: f.customsValue,
              transportMode: f.transportMode,
              ...(f.result?.requiresQuantity ? { quantity: f.quantity } : {}),
              ...(f.claimedPreference ? { claimedPreference: f.claimedPreference } : {}),
              ...(Object.keys(f.answers).length ? { answers: f.answers } : {}),
            },
          },
        ]);
        trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, { added, duplicates: 1 - added, source: "calculator", hts_code: f.selectedElement?.htsno });
      }}
    >
      <PlusIcon className="h-4 w-4" aria-hidden />
      Track this import
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </a>
  );
};
