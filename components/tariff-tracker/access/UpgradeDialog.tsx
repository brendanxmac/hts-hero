"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import config from "@/config";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import {
  Billing,
  formatPrice,
  monthlyRate,
  TRACKER_MAX_LISTED_PAIRS,
  TRIAL_ALLOWANCE,
} from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TRACKER_PLANS, TrackerAccess, TrackerPlan } from "@/libs/tariff-tracker/plan";
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
  const [billing, setBilling] = useState<Billing>("annual");
  const [busy, setBusy] = useState<string | null>(null);
  const fits = TRACKER_PLANS.find((p) => items.length <= p.maxPairs);
  const { benefit } = PREMIUM_FEATURES[feature];
  const heading =
    access.kind === "paid"
      ? "Cover more imports"
      : feature === "savings" || feature === "qualify"
        ? "Check savings on every import"
        : feature === "entries" || feature === "refunds"
          ? "Audit every entry"
          : feature === "alerts" || feature === "tracking"
            ? "Get alerts on more imports"
            : "Unlock the full Tracker";
  const usedUp =
    access.kind !== "trial"
      ? null
      : feature === "savings" || feature === "qualify"
        ? `You've used your ${TRIAL_ALLOWANCE.savingsChecks} free savings checks.`
        : feature === "entries" || feature === "refunds"
          ? `You've used your ${TRIAL_ALLOWANCE.auditChecks} free audit checks.`
          : feature === "alerts" || feature === "tracking"
            ? `Your free alerts cover ${TRIAL_ALLOWANCE.alertImports} imports.`
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

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`${ui.card} hts-theme flex max-h-[90vh] w-full max-w-4xl flex-col`}>
          <div className={ui.cardHeader}>
            <div>
              <p className={ui.kicker}>Tariff Tracker plans</p>
              <Dialog.Title className="mt-1 text-xl font-semibold tracking-tight text-base-content">{heading}</Dialog.Title>
              <p className={`${ui.bodySm} mt-1`}>
                {usedUp ? `${usedUp} ` : ""}
                {benefit}. Priced by how many imports you cover, with unlimited audit checks.
              </p>
            </div>
            <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onClose}>
              <XMarkIcon className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className={ui.bodySm}>
                Your catalog has <span className="font-semibold text-base-content tabular-nums">{items.length}</span>{" "}
                {items.length === 1 ? "import" : "imports"}.
              </p>
              <SegmentedControl<Billing> label="Billing" options={BILLING} value={billing} onChange={setBilling} size="sm" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TRACKER_PLANS.map((plan) => {
                const recommended = plan === fits;
                const current = access.paidPlan === plan.plan;
                return (
                  <div
                    key={plan.plan}
                    className={`flex flex-col gap-4 rounded-lg border p-5 ${recommended ? "border-primary ring-1 ring-primary" : "border-base-300"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className={ui.cardTitle}>Up to {plan.maxPairs} imports</h3>
                      {recommended && <span className={ui.badge("primary")}>Fits your catalog</span>}
                    </div>
                    <p className="flex items-baseline gap-1">
                      <span className={ui.metric.primaryCompact}>{formatPrice(monthlyRate(plan.price, billing))}</span>
                      <span className={ui.caption}>/ month{billing === "annual" ? ", billed yearly" : ""}</span>
                    </p>
                    <button
                      type="button"
                      className={ui.button({ variant: recommended ? "primary" : "secondary" })}
                      disabled={current || busy !== null}
                      onClick={() => buy(plan)}
                    >
                      {current ? "Your plan" : busy === plan.plan ? "Opening checkout…" : "Choose plan"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <ul className="flex flex-col gap-2">
                {PREMIUM_INCLUDES.map((item) => (
                  <li key={item} className={`${ui.bodySm} flex gap-2.5`}>
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className={ui.bodySm}>
                More than {TRACKER_MAX_LISTED_PAIRS} imports?{" "}
                <a className={ui.link} href={`mailto:${config.resend.supportEmail}?subject=Tariff%20Tracker%20for%20a%20large%20catalog`}>
                  Let&apos;s talk
                </a>
                .
              </p>
            </div>
          </div>
          <div className={`${ui.cardFooter} ${ui.caption}`}>Cancel anytime. No contract, no sales call.</div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
