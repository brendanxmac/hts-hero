"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import config from "@/config";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import {
  Billing,
  formatPrice,
  monthlyRate,
  TRACKER_MAX_LISTED_PAIRS,
  TRIAL_ALLOWANCE,
} from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TRACKER_PLANS, TrackerAccess, TrackerPlan } from "@/libs/tariff-tracker/plan";
import { AUDITS_ENABLED, SAVINGS_AUDITS_SOON, SAVINGS_ENABLED, TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { useCatalog } from "../catalogStore";
import { PREMIUM_FEATURES, PREMIUM_INCLUDES, PremiumFeature } from "./features";

// The paid plans, sized by how many imports they cover. The one that fits the catalog is picked
// out; checkout is Stripe's, billed monthly or annually. Opened from a used-up trial allowance or
// a plan that's too small, and from "See plans" anywhere.

const BILLING: { id: Billing; label: string }[] = [
  { id: "monthly", label: "Monthly" },
  { id: "annual", label: "Annual · 15% off" },
];

const checkout = async (plan: TrackerPlan, billing: Billing) => {
  const res = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemId: plan.plan,
      billing,
      successEndpoint: "/tariff-tracker?checkout=success",
      cancelUrl: window.location.href,
    }),
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !body.url) throw new Error(body.error ?? "Checkout isn't available right now.");
  window.location.href = body.url;
};

export const UpgradeDialog = ({
  open,
  feature,
  access,
  onClose,
}: {
  open: boolean;
  feature: PremiumFeature;
  access: TrackerAccess;
  onClose: () => void;
}) => {
  const { items } = useCatalog();
  const [billing, setBilling] = useState<Billing>(TRACKER_ANNUAL_ENABLED ? "annual" : "monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const fits = TRACKER_PLANS.find((p) => items.length <= p.maxPairs);
  // Savings and audits are off for the Tracker MVP, so their upsells talk about tracking
  const shown: PremiumFeature =
    (!SAVINGS_ENABLED && (feature === "savings" || feature === "qualify")) || (!AUDITS_ENABLED && (feature === "entries" || feature === "refunds"))
      ? "plan"
      : feature;
  const { benefit } = PREMIUM_FEATURES[shown];
  const heading =
    access.kind === "paid"
      ? "Track more imports"
      : shown === "savings" || feature === "qualify"
        ? "Check savings on every import"
        : shown === "entries" || shown === "refunds"
          ? "Audit every entry"
          : shown === "alerts" || shown === "tracking"
            ? "Track more imports"
            : "Track all your imports";
  const usedUp =
    access.kind !== "trial"
      ? null
      : shown === "savings" || shown === "qualify"
        ? `You've used your ${TRIAL_ALLOWANCE.savingsChecks} free savings checks.`
        : shown === "entries" || shown === "refunds"
          ? `You've used your ${TRIAL_ALLOWANCE.auditChecks} free audit checks.`
          : shown === "alerts" || shown === "tracking"
            ? `Your free plan tracks ${TRIAL_ALLOWANCE.alertImports} imports.`
            : null;

  const buy = async (plan: TrackerPlan) => {
    setBusy(plan.plan);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_CHECKOUT_STARTED, { plan: plan.plan, billing, feature, catalog: items.length });
    try {
      await checkout(plan, billing);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  };

  const tracked = Math.min(items.length, TRIAL_ALLOWANCE.alertImports);
  const number = (n: number) => n.toLocaleString("en-US");

  // A dialog portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15)
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content"
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-2 px-6 pb-5 pt-6 sm:px-7">
            <span className={tt.eyebrow("primary")}>Tariff Tracker Plans</span>
            <Dialog.Title className={`${tt.display} m-0 pr-8 text-2xl font-semibold leading-tight text-base-content`}>{heading}</Dialog.Title>
            <p className={`${tt.subtitle} m-0 max-w-2xl`}>
              {usedUp ? `${usedUp} ` : ""}
              {benefit}. Priced by how many imports you track.{AUDITS_ENABLED ? " With unlimited audit checks." : ""}
            </p>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-6 sm:px-7">
            <div className={`${tt.tile} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
              <p className="m-0 text-sm text-base-content/70">
                You have <span className={`${tt.numberChip("primary")} font-semibold tabular-nums`}>{number(items.length)}</span>{" "}
                {items.length === 1 ? "import" : "imports"}
                {access.kind === "paid" ? (
                  <>
                    , and your plan tracks <span className={`${tt.numberChip("success")} font-semibold tabular-nums`}>{number(access.pairLimit)}</span>.
                  </>
                ) : (
                  <>
                    ; <span className={`${tt.numberChip("success")} font-semibold tabular-nums`}>{number(tracked)}</span> {tracked === 1 ? "is" : "are"} tracked
                    free.
                  </>
                )}
              </p>
              {TRACKER_ANNUAL_ENABLED && (
                <SegmentedControl<Billing> label="Billing" options={BILLING} value={billing} onChange={setBilling} size="sm" />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRACKER_PLANS.map((plan) => {
                const recommended = plan === fits;
                const current = access.paidPlan === plan.plan;
                const monthly = monthlyRate(plan.price, billing);
                return (
                  <div
                    key={plan.plan}
                    className={`flex flex-col gap-4 rounded-xl border p-5 ${recommended ? "border-primary bg-primary/[0.04] ring-1 ring-primary" : "border-base-300 bg-base-100"}`}
                  >
                    {/* Every card keeps the chip's row, so the prices line up */}
                    <div className="flex flex-col items-start gap-1.5">
                      <span className={tt.eyebrow(recommended ? "primary" : "neutral")}>Up to {number(plan.maxPairs)} imports</span>
                      {current ? (
                        <span className={tt.chip("success")}>Your plan</span>
                      ) : recommended ? (
                        <span className={tt.chip("primary")}>Fits your imports</span>
                      ) : (
                        <span className="h-5" aria-hidden />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex items-baseline gap-1">
                        <span className={tt.metric}>{formatPrice(monthly)}</span>
                        <span className="text-sm text-base-content/60">/mo{billing === "annual" ? ", billed yearly" : ""}</span>
                      </p>
                      <span className="text-xs text-base-content/60 tabular-nums">
                        {formatPrice(Math.round((monthly / plan.maxPairs) * 100) / 100)} per import
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`${ui.button({ variant: recommended ? "primary" : "secondary" })} w-full`}
                      disabled={current || busy !== null}
                      onClick={() => buy(plan)}
                    >
                      {current ? "Your plan" : busy === plan.plan ? "Opening checkout…" : "Choose plan"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:items-start">
              <div className="flex flex-col gap-3">
                <span className={tt.eyebrow()}>Every plan includes</span>
                <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
                  {PREMIUM_INCLUDES.map((item) => (
                    <li key={item} className="flex gap-2.5 text-sm text-base-content/80">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success" aria-hidden>
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`${tt.tile} flex flex-col gap-1 p-4`}>
                <span className="text-sm font-semibold text-base-content">More than {number(TRACKER_MAX_LISTED_PAIRS)} imports?</span>
                <span className="text-sm text-base-content/70">
                  We&apos;ll set up a plan that fits.{" "}
                  <a className={ui.link} href={`mailto:${config.resend.supportEmail}?subject=Tariff%20Tracker%20for%20many%20imports`}>
                    Let&apos;s talk
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-base-300 bg-tt-soft px-6 py-3 text-xs text-base-content/60 sm:px-7">
            {TRACKER_ANNUAL_ENABLED ? "" : "Billed monthly. "}Cancel anytime. No contract, no sales call.{SAVINGS_ENABLED && AUDITS_ENABLED ? "" : ` ${SAVINGS_AUDITS_SOON}`}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
