"use client";

import { useState } from "react";
import { ArrowRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { FREE_TRACKED_PAIRS } from "@/components/pricing-calculator/lib/pricing";
import { signupHref } from "@/components/tariff-tracker/access/signup";
import * as tt from "@/components/ui/styles/tracker";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { productUrl } from "@/components/tariff-tracker/sections";
import { ConversionDialog } from "../calculator/ConversionDialog";
import { TariffFinder } from "../lib/useTariffFinder";

// "Track this import": saves it to the Tariff Tracker catalog (kept on this device until they
// sign up) and opens it there, where alerts, history and savings live. The way from a quick
// answer into the product. Signed out, it first opens the Tracker's pitch (ConversionDialog):
// the trial, or a step down to the free account; either way the import is saved and sign-up
// lands on it in the Tracker (`trial=start` opens the trial there).
export const TrackImportButton = ({ f, size = "md" }: { f: TariffFinder; size?: "sm" | "md" }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  if (!f.selectedElement || !f.country) return null;
  const product = { code: htsCodeDigitsOnly(f.selectedElement.htsno), country: f.country.code };
  const save = () => {
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
  };
  const url = productUrl(itemKey(product));
  return (
    <>
      <a
        href={url}
        className={tt.button("money", size, "rounded")}
        onClick={(e) => {
          if (user) return save();
          e.preventDefault();
          setOpen(true);
          trackEvent(MixpanelEvent.TARIFF_TRACKER_TRIAL_DIALOG_OPENED, { feature: "tracking", page: "calculator" });
        }}
      >
        <PlusIcon className="h-4 w-4" aria-hidden />
        Track this import
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </a>
      <ConversionDialog
        open={open}
        view="trial"
        accountNote={`This import is saved to your Tracker, free for up to ${FREE_TRACKED_PAIRS} imports.`}
        onClose={() => setOpen(false)}
        onStartTrial={() => {
          save();
          window.location.href = signupHref(`${url}&trial=start`);
        }}
        onCreateAccount={() => {
          save();
          window.location.href = signupHref(url);
        }}
        page="calculator"
      />
    </>
  );
};
