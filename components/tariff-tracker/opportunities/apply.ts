"use client";

import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { Adjustments } from "../adjustments";
import { TrackedProduct } from "../report";
import { useTracker } from "../TrackerContext";
import { AppliedChange } from "./OpportunitiesContext";
import { SavingOption } from "./options";

// Applies a secured saving to the catalog, and says what changed, for the record:
// - a trade program: claimed on the product
// - an exemption: its condition answered yes on the product
// - a country of origin: the new origin added as its own product (with this one's shipment, and
//   its agreement claimed), and this one marked as moving there; its history and entries stay

const setupOf = (product: TrackedProduct) => ({
  country: product.entry.country.code,
  claimedPreference: product.adjustments.claimedPreference ?? null,
  answers: product.adjustments.answers ?? {},
});

export const useApplyOption = () => {
  const { setAdjustments, addProducts, setProductMeta, itemFor } = useTracker();

  return (option: SavingOption, product: TrackedProduct): AppliedChange => {
    const before = setupOf(product);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_SAVING_APPLIED, { kind: option.kind });

    if (option.kind === "origin") {
      const code = product.key.split("-")[0];
      const country = option.setup.country.code;
      const adjustments: Adjustments = {
        ...product.adjustments,
        claimedPreference: option.setup.claimedPreference,
      };
      addProducts([{ code, country, adjustments }], "savings");
      const addedProductKey = `${code}-${country}`;
      const perYear = itemFor(product.key)?.shipmentsPerYear;
      if (perYear) setProductMeta(addedProductKey, { shipmentsPerYear: perYear });
      setProductMeta(product.key, { movingTo: country });
      return {
        productKey: product.key,
        before,
        after: { country, claimedPreference: option.setup.claimedPreference ?? null, answers: option.setup.answers },
        addedProductKey,
      };
    }

    const patch: Adjustments =
      option.kind === "program" ? { claimedPreference: option.setup.claimedPreference } : { answers: option.setup.answers };
    setAdjustments(product.key, patch);
    return { productKey: product.key, before, after: { ...before, ...patch } };
  };
};
