"use client";

import { withArrival } from "@/components/tariff-tracker/onboarding/arrival";
import { useState } from "react";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { REVERSE_TRIAL, TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import * as ui from "@/components/ui/styles";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { addToAccountCatalog } from "@/components/tariff-tracker/catalogSync";
import { ProductTab, productUrl } from "@/components/tariff-tracker/sections";
import { AccountPitch, ConversionDialog } from "../calculator/ConversionDialog";
import { TariffFinder } from "../lib/useTariffFinder";

// "Track this import": saves it to the Tariff Tracker catalog (kept on this device until they
// sign up) and opens it there, where alerts, impact checks and rate history live. The way from a quick
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
        Get Alerts, Insights &amp; News
      </a>
      {track.dialog}
    </>
  );
};

// The flow behind it, for anything that starts it (the calculator's "Stop Overpaying for This
// Import" and its insight cards): signed in, one click saves the import, with a note and a link to
// it in the Tracker (the calculator stays put);
// signed out, the free account's pitch, whose one button saves the import and opens it in the
// Tracker, which sends them to sign up (or in, proxy.ts) and back to it, set up, with no add-imports
// step. Null until there's an import.
export const useTrackImport = (f: TariffFinder, source = "track-import") => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  // Which of the import's tabs to land on (its Overview when left out)
  const [landOn, setLandOn] = useState<ProductTab | undefined>(undefined);
  // What the account's pitch leads with, when the host has its own (Get Insights)
  const [pitch, setPitch] = useState<AccountPitch | null>(null);
  if (!f.selectedElement || !f.country) return null;
  const product = { code: htsCodeDigitsOnly(f.selectedElement.htsno), country: f.country.code };
  const productWithAdjustments = () => ({
    ...product,
    adjustments: {
      customsValue: f.customsValue,
      transportMode: f.transportMode,
      ...(f.result?.requiresQuantity ? { quantity: f.quantity } : {}),
      ...(f.claimedPreference ? { claimedPreference: f.claimedPreference } : {}),
      ...(Object.keys(f.answers).length ? { answers: f.answers } : {}),
    },
  });
  const save = () => {
    const { added } = addToCatalog([productWithAdjustments()]);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_PRODUCTS_ADDED, { added, duplicates: 1 - added, source: "calculator", hts_code: f.selectedElement?.htsno });
  };
  const url = productUrl(itemKey(product));
  const start = (tab?: ProductTab, account?: AccountPitch) => {
    setLandOn(tab);
    setPitch(account ?? null);
    // Signed in: saved right here, with alerts on, and a way to it; the calculator stays their
    // tool and the Tracker is where saved imports live
    if (user) {
      save();
      // Into the account too, so alerts start without a Tracker visit
      addToAccountCatalog(user.id, [productWithAdjustments()]).catch((e) => console.error("Saving the import to the account:", e));
      toast.success(
        (t) => (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              <strong className="font-semibold">Saved to your Tracker</strong>, alerts on.
            </span>
            <a href={productUrl(itemKey(product), tab)} className="font-semibold text-primary underline-offset-4 hover:underline" onClick={() => toast.dismiss(t.id)}>
              Open it →
            </a>
          </span>
        ),
        { duration: 6000 },
      );
      trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: source, reason: "saved-in-place", page: "calculator" });
      return;
    }
    setOpen(true);
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: source, reason: "account", page: "calculator" });
  };
  const landing = withArrival(productUrl(itemKey(product), landOn), "track");
  const dialog = (
    <ConversionDialog
      open={open}
      view="account"
      account={pitch ?? { title: "Get audits and alerts for this import", highlight: "alerts", cta: "Create my free account" }}
      accountNote={`This import is saved to your Tracker, with alerts on ${TRIAL_ALLOWANCE.alertImports} imports free and the full Tracker free for ${REVERSE_TRIAL.days} days.`}
      onClose={() => setOpen(false)}
      onCreateAccount={() => {
        save();
        window.location.href = landing;
      }}
      page="calculator"
    />
  );
  return { url, start, dialog };
};
