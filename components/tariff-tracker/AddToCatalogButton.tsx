"use client";

import { MouseEvent } from "react";
import { CheckIcon, PlusIcon } from "@heroicons/react/20/solid";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import type { TariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import * as ui from "@/components/ui/styles";
import { Adjustments, DEFAULT_UNITS, DEFAULT_VALUE } from "./adjustments";
import { itemKey, NewProduct } from "./catalog";
import { addToCatalog, useCatalog } from "./catalogStore";
import { productUrl } from "./sections";
import type { AddSource } from "./TrackerContext";

// "Add to catalog" for the calculator's results: one click saves the product on screen (its code
// and origin) to the Tariff Tracker catalog, with what's been set for it (value, quantity,
// transport, trade program, conditions answered) as its adjustments. Once it's in the catalog,
// the button opens it there.

// What's set in the calculator, as adjustments: anything left at its default isn't one
const adjustmentsFrom = (f: TariffFinder): Adjustments => ({
  ...(f.customsValue !== DEFAULT_VALUE ? { customsValue: f.customsValue } : {}),
  ...(f.result?.requiresQuantity && f.quantity !== DEFAULT_UNITS ? { quantity: f.quantity } : {}),
  transportMode: f.transportMode,
  ...(f.claimedPreference ? { claimedPreference: f.claimedPreference } : {}),
  ...(Object.keys(f.answers).length ? { answers: f.answers } : {}),
});

export const AddToCatalogButton = ({
  f,
  source,
  onOpen,
}: {
  f: TariffFinder;
  source: Extract<AddSource, "calculator" | "tracker_calculator">;
  // Opens the product in place (inside the tracker); otherwise its link is followed
  onOpen?: (key: string) => void;
}) => {
  const { items } = useCatalog();
  if (!f.selectedElement || !f.country) return null;

  const product: NewProduct = {
    code: htsCodeDigitsOnly(f.selectedElement.htsno),
    country: f.country.code,
    adjustments: adjustmentsFrom(f),
  };
  const key = itemKey(product);
  const inCatalog = items.some((item) => itemKey(item) === key);

  if (inCatalog) {
    return (
      <a
        href={productUrl(key)}
        className={`${ui.button({ size: "sm" })} text-success`}
        title="Open it in the Tariff Tracker"
        onClick={(e: MouseEvent<HTMLAnchorElement>) => {
          trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCT_OPENED, { from: source });
          if (!onOpen || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen(key);
        }}
      >
        <CheckIcon className="h-4 w-4" aria-hidden />
        In catalog
      </a>
    );
  }

  return (
    <button
      type="button"
      className={ui.button({ size: "sm" })}
      title="Save this product to your Tariff Tracker catalog"
      onClick={() => {
        const { added, withAdjustments } = addToCatalog([product]);
        trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, {
          added,
          duplicates: 1 - added,
          source,
          with_adjustments: withAdjustments,
          hts_code: f.selectedElement?.htsno,
          country_code: f.country?.code,
        });
      }}
    >
      <PlusIcon className="h-4 w-4" aria-hidden />
      Add to catalog
    </button>
  );
};
