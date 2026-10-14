"use client";

import { useState } from "react";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { signupHref } from "@/components/tariff-tracker/access/signup";
import * as ui from "@/components/ui/styles";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { ProductTab, productUrl } from "@/components/tariff-tracker/sections";
import { ConversionDialog } from "../calculator/ConversionDialog";
import { TariffFinder } from "../lib/useTariffFinder";

// "Track this import": saves it to the Tariff Tracker catalog (kept on this device until they
// sign up) and opens it there, where alerts, history and savings live. The way from a quick
// answer into the product. Signed out, it opens the free account's pitch (ConversionDialog), not
// the trial's: the calculator's job is turning visitors into accounts; the Tracker, its emails and
// its teasers sell the plans. The import is saved, and sign-up lands on it in the Tracker.
export const TrackImportButton = ({ f, size = "md" }: { f: TariffFinder; size?: "sm" | "md" }) => {
  const track = useTrackImport(f);
  if (!track) return null;
  return (
    <>
      <a
        href={track.url}
        className={ui.button({ variant: "primary", size: size })}
        onClick={(e) => {
          e.preventDefault();
          track.start();
        }}
      >
        <PlusIcon className="h-4 w-4" aria-hidden />
        Track this import
      </a>
      {track.dialog}
    </>
  );
};

// The flow behind it, for anything that starts it (the calculator's insight cards too): signed in,
// saves the import and opens it in the Tracker; signed out, the free account's pitch first.
// Null until there's an import to track.
export const useTrackImport = (f: TariffFinder, source = "track-import") => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  // Which of the import's tabs to land on (its Summary when left out)
  const [landOn, setLandOn] = useState<ProductTab | undefined>(undefined);
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
  const start = (tab?: ProductTab) => {
    setLandOn(tab);
    if (user) {
      save();
      window.location.href = productUrl(itemKey(product), tab);
      return;
    }
    setOpen(true);
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: source, reason: "account", page: "calculator" });
  };
  const dialog = (
    <ConversionDialog
      open={open}
      view="account"
      account={{ title: "Track this import, free", highlight: "savings", cta: "Create my free account" }}
      accountNote={`This import is saved to your Tracker, with ${TRIAL_ALLOWANCE.savingsChecks} free savings checks and ${TRIAL_ALLOWANCE.auditChecks} free entry audits.`}
      onClose={() => setOpen(false)}
      onCreateAccount={() => {
        save();
        window.location.href = signupHref(productUrl(itemKey(product), landOn));
      }}
      page="calculator"
    />
  );
  return { url, start, dialog };
};
