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
import { entryHref, TRACKER_WELCOME_PARAM } from "@/libs/signup-onboarding";
import { tourSeen } from "@/components/tariff-tracker/onboarding/tour/tourStore";
import { itemKey } from "@/components/tariff-tracker/catalog";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { addToAccountCatalog } from "@/components/tariff-tracker/catalogSync";
import { ProductTab, productUrl } from "@/components/tariff-tracker/sections";
import { AccountPitch, ConversionDialog } from "../calculator/ConversionDialog";
import { TariffFinder } from "../lib/useTariffFinder";

// "Track this import": saves it to Duty Guard catalog (kept on this device until they
// sign up) and opens it there, where alerts, impact checks and rate history live. The way from a quick
// answer into the product. Signed out, it opens the free account's pitch (ConversionDialog), not
// the trial's: the calculator's job is turning visitors into accounts; Duty Guard, its emails and
// its teasers sell the plans. The import is saved, and sign-up lands on it in Duty Guard.
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
        Track This Import
      </a>
      {track.dialog}
    </>
  );
};

// The pitch before an alert button's sign-up. subject: what the alerts cover
export const alertPitch = (title: string, subject: string, urgency?: string): AccountPitch => ({
  eyebrow: "Tariff Alerts",
  title,
  urgency,
  points: [
    { icon: "bell", title: "An email the moment it changes", body: `The rate before and after on ${subject}.` },
    { icon: "bolt", title: "Early warning", body: "Alerted when a change is proposed, and again when it's published." },
    { icon: "sparkles", title: `Free for ${REVERSE_TRIAL.days} days`, body: "Alerts and audits on your products." },
  ],
  hideNote: true,
  perk: `Free for ${REVERSE_TRIAL.days} days`,
  cta: "Create My Free Account",
});

// The flow behind it, for anything that starts it (the calculator's "Stop Overpaying for This
// Import" and its insight cards): signed in, one click saves the import, with a note and a link to
// it in Duty Guard (the calculator stays put);
// signed out, the free account's pitch, whose one button saves the import, then signs them up,
// through the onboarding, and lands them on it in Duty Guard, set up, with no add-imports step.
// Null until there's an import.
export const useTrackImport = (f: TariffFinder, source = "track-import") => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  // Which of the import's tabs to land on (its Overview when left out)
  const [landOn, setLandOn] = useState<ProductTab | undefined>(undefined);
  // What the account's pitch leads with, when the host has its own (Get Insights)
  const [pitch, setPitch] = useState<AccountPitch | null>(null);
  // Opened by alertMe: sign-up takes the alerts way
  const [forAlerts, setForAlerts] = useState(false);
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
    setForAlerts(false);
    // Signed in: saved right here, with a way to it; the calculator stays their
    // tool and Duty Guard is where saved imports live
    if (user) {
      save();
      // Into the account too, so it's there without a Duty Guard visit
      addToAccountCatalog(user.id, [productWithAdjustments()]).catch((e) => console.error("Saving the import to the account:", e));
      toast.success(
        (t) => (
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              <strong className="font-semibold">Saved to your Duty Guard.</strong>
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
  // The calculator's main button, one click: this import in Duty Guard. Signed out, sign-up and the
  // onboarding on the way; either way it ends on the import, where the next ask is the rest of them
  const goToAlerts = async () => {
    save();
    trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page: "calculator", entry: "calculator_track", section: "main_button", label: "Alert Me if This Rate Changes", signed_in: !!user });
    // A first time in Duty Guard opens the onboarding, the alerts variant, over the import; the panel
    // on the import (ArrivalPanel) follows
    const arrive = withArrival(productUrl(itemKey(product)), "track");
    const welcome = `${arrive}&${TRACKER_WELCOME_PARAM}=alerts`;
    if (!user) {
      window.location.href = entryHref("calculator_track", welcome);
      return;
    }
    await addToAccountCatalog(user.id, [productWithAdjustments()]).catch((e) => console.error("Saving the import to the account:", e));
    window.location.href = tourSeen(user.id, "first_visit") ? arrive : welcome;
  };
  // Signed out, the pitch comes first, and its button does the rest
  const alertMe = (account: AccountPitch) => {
    if (user) return goToAlerts();
    setPitch(account);
    setForAlerts(true);
    setOpen(true);
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "alert-me", reason: "account", page: "calculator" });
  };
  const dialog = (
    <ConversionDialog
      open={open}
      view="account"
      account={pitch ?? { title: "Track this import, free", highlight: "alerts", cta: "Create My Free Account" }}
      accountNote={`This import is saved to your Duty Guard, free, with alerts and audits free for ${REVERSE_TRIAL.days} days.`}
      onClose={() => setOpen(false)}
      onCreateAccount={() => {
        if (forAlerts) return void goToAlerts();
        save();
        trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page: "calculator", entry: "calculator_track", section: source, label: pitch?.cta ?? "Create My Free Account", signed_in: false });
        window.location.href = entryHref("calculator_track", landing);
      }}
      page="calculator"
    />
  );
  return { url, start, alertMe, dialog };
};
