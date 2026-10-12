"use client";

import { useState } from "react";
import { CheckIcon, LockClosedIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { currentPath, signupHref } from "@/components/tariff-tracker/access/signup";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { accountPitch } from "../lib/summary";
import { TariffFinder } from "../lib/useTariffFinder";
import { useCanSeeWhy } from "./WhyGate";

// Above the totals, signed out: everything a free account adds (PRICING.md), led by what it
// explains about this import. Dismissible for this import only: it comes back for the next HTS code
// or country of origin. The locked lines further down still offer the account.

// What every free account gets, whatever the import
const EVERY_ACCOUNT = [
  "This import's duty from every country of origin",
  "Alerts when tariffs change on up to 3 imports",
  "A PDF of any result, to share or file",
];

export const AccountCta = ({ f, result, bestSaving, page }: { f: TariffFinder; result: CalculationResult; bestSaving: number; page: string }) => {
  const { canSee, loading } = useCanSeeWhy();
  // The import it was dismissed for: a new code or origin brings it back
  const importKey = `${result.htsCode}|${f.country?.code ?? ""}`;
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);
  if (loading || canSee || dismissedFor === importKey) return null;

  const { headline, thisImport } = accountPitch(f, result, bestSaving);
  const dismiss = () => {
    setDismissedFor(importKey);
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "account-cta", reason: "dismissed", page });
  };
  const signUp = () => {
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "account-cta", reason: "account", page });
    window.location.href = signupHref(currentPath());
  };

  return (
    <section className="relative rounded-xl border border-primary/30 bg-primary/5 px-5 py-5 sm:px-6" aria-labelledby="account-cta-title">
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-md p-1 text-base-content/50 hover:bg-base-content/5 hover:text-base-content"
        aria-label="Dismiss"
      >
        <XMarkIcon className="h-4 w-4" aria-hidden />
      </button>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="pr-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Free account</p>
            <h3 id="account-cta-title" className="mt-1 text-lg font-semibold leading-snug text-base-content">
              {headline}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-x-8 gap-y-1.5 md:grid-cols-2">
            <Benefits title="For this import" items={thisImport} icon="lock" />
            <Benefits title="For every import" items={EVERY_ACCOUNT} icon="check" />
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-1.5 lg:w-64 lg:items-stretch">
          <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} w-full`} onClick={signUp}>
            Explain my duty, free
          </button>
          <span className={`${ui.caption} lg:text-center`}>Free forever. Less than 30 seconds, no credit card. You come right back here.</span>
        </div>
      </div>
    </section>
  );
};

const Benefits = ({ title, items, icon }: { title: string; items: string[]; icon: "lock" | "check" }) => {
  const Icon = icon === "lock" ? LockClosedIcon : CheckIcon;
  return (
    <div className="flex flex-col gap-1.5">
      <p className={ui.caption}>{title}</p>
      <ul className="flex flex-col gap-1.5">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2 text-sm text-base-content">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
};
