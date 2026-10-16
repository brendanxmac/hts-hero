"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import {
  ArrowDownTrayIcon,
  BellAlertIcon,
  BoltIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  NewspaperIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
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
  LAUNCH_PRICING,
  launchPricingActive,
  monthlyRate,
  TRACKER_MAX_LISTED_PAIRS,
  TRIAL_ALLOWANCE,
} from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TRACKER_PLANS, TrackerAccess, TrackerPlan } from "@/libs/tariff-tracker/plan";
import { TRACKER_PATH } from "../sections";
import { AUDITS_ENABLED, SAVINGS_AUDITS_SOON, SAVINGS_ENABLED, TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { useCatalog } from "../catalogStore";
import { useUpgradeStats } from "./upgradeStats";
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
  // The plan that fits the catalog; with no imports yet, the second tier as the place to start
  const noImports = items.length === 0;
  const fits = noImports ? TRACKER_PLANS[1] : TRACKER_PLANS.find((p) => items.length <= p.maxPairs);
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

  const stats = useUpgradeStats();
  const now = useNow();
  const launch = launchPricingActive(now);
  const number = (n: number) => n.toLocaleString("en-US");
  const imports = stats?.imports ?? items.length;
  const tracked = stats?.tracked ?? Math.min(items.length, access.pairLimit);
  const untracked = Math.max(0, imports - tracked);
  // The headline speaks to what's left out: imports nobody is watching
  // The headline is the outcome, on their own imports; what's at risk follows in red
  const title = untracked > 0 ? `Never miss a tariff change on any of your ${number(imports)} imports` : heading;
  const benefits = [
    ...BENEFITS,
    ...(SAVINGS_ENABLED ? [{ Icon: SparklesIcon, title: "Savings on every import", body: PREMIUM_INCLUDES[0] }] : []),
    ...(AUDITS_ENABLED ? [{ Icon: ClipboardDocumentCheckIcon, title: "Unlimited audit checks", body: PREMIUM_INCLUDES[1] }] : []),
  ];

  // A dialog portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15).
  // Built to convert: what's at stake for their own imports first, a real deadline, launch prices
  // anchored against the coming ones, the plan that fits picked out, outcomes over features, and
  // the risk taken away (cancel anytime, the catalog stays free).
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden shadow-2xl`}
        >
          {launch && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-warning/10 px-12 py-2.5 text-center text-sm text-base-content">
              <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
                <ClockIcon className="h-4 w-4" aria-hidden />
                Launch pricing ends {LAUNCH_PRICING.endsLabel} · {timeLeft(now)}
              </span>
              <span className="text-base-content/70">Subscribe now and your price is locked in for as long as you stay subscribed.</span>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-3 rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content ${launch ? "top-1.5" : "top-4"}`}
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-6 pt-6 sm:px-8">
            {/* What's at stake, in their own numbers */}
            <div className="flex flex-col gap-2">
              <span className={tt.eyebrow("primary")}>Tariff Tracker Plans</span>
              <Dialog.Title className={`${tt.display} m-0 pr-8 text-2xl font-semibold leading-tight text-base-content sm:text-[1.75rem]`}>{title}</Dialog.Title>
              <p className={`${tt.subtitle} m-0 max-w-3xl text-base`}>
                {untracked > 0 ? (
                  <span className="font-semibold text-error">
                    Right now, {number(untracked)} of them {untracked === 1 ? "has" : "have"} alerts off.{" "}
                  </span>
                ) : usedUp ? (
                  `${usedUp} `
                ) : (
                  ""
                )}
                Get an alert the day a tariff changes, with exactly how much each rate moves, so you can reprice, reorder or talk
                to your supplier before it reaches your invoices.
              </p>
            </div>

            {stats && stats.changes12m > 0 && (
              <div className={`${tt.tile} flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-3`}>
                <BoltIcon className="hidden h-5 w-5 shrink-0 text-error sm:block" aria-hidden />
                <p className="m-0 text-sm text-base-content/75">
                  In the last 12 months,{" "}
                  <span className={`${tt.numberChip("error")} font-semibold tabular-nums`}>{number(stats.changes12m)}</span>{" "}
                  tariff {stats.changes12m === 1 ? "change" : "changes"} hit{" "}
                  <span className={`${tt.numberChip("primary")} font-semibold tabular-nums`}>{number(stats.productsHit12m)}</span> of your imports.
                  {stats.biggestRise && (
                    <>
                      {" "}
                      The biggest: <span className={`${tt.numberChip("error")} font-semibold tabular-nums`}>+{stats.biggestRise.pct}%</span> on{" "}
                      <span className="font-semibold text-base-content">{stats.biggestRise.code}</span> from {stats.biggestRise.country}.
                    </>
                  )}{" "}
                  The next one could land any day.
                </p>
              </div>
            )}

            {/* The tiers, the one that fits picked out */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TRACKER_PLANS.map((plan) => {
                const recommended = plan === fits;
                const current = access.paidPlan === plan.plan;
                const monthly = monthlyRate(plan.price, billing);
                const next = LAUNCH_PRICING.nextPrices[plan.maxPairs];
                const anchored = launch && next > plan.price;
                return (
                  <div
                    key={plan.plan}
                    className={`relative flex flex-col gap-4 rounded-xl border p-5 ${recommended ? "border-primary bg-primary/[0.04] ring-1 ring-primary" : "border-base-300 bg-base-100"}`}
                  >
                    {recommended && !current && (
                      <span className="absolute -top-3 left-5 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-content">
                        {noImports ? "Recommended" : `Fits your ${number(items.length)} imports`}
                      </span>
                    )}
                    <div className="flex flex-col gap-1.5">
                      <span className={tt.eyebrow(recommended ? "primary" : "neutral")}>Track up to {number(plan.maxPairs)} imports</span>
                      {current ? (
                        <span className={`${tt.chip("success")} self-start`}>Your plan</span>
                      ) : launch ? (
                        <span className={`${tt.chip("success")} self-start`}>Launch price</span>
                      ) : (
                        <span className="h-5" aria-hidden />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        {anchored && (
                          <span className="text-lg font-semibold tabular-nums text-base-content/40 line-through" aria-label={`Was going to be ${formatPrice(next)} a month`}>
                            {formatPrice(next)}
                          </span>
                        )}
                        <span className={tt.metric}>{formatPrice(monthly)}</span>
                        <span className="text-sm text-base-content/60">/mo</span>
                      </p>
                      <span className="text-xs text-base-content/60 tabular-nums">
                        {formatPrice(Math.round((monthly / plan.maxPairs) * 100) / 100)} per import, per month
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`${ui.button({ variant: recommended ? "primary" : "secondary" })} w-full`}
                      disabled={current || busy !== null}
                      onClick={() => buy(plan)}
                    >
                      {current ? "Your plan" : busy === plan.plan ? "Opening checkout…" : launch ? `Lock in ${formatPrice(monthly)}/mo` : "Choose plan"}
                    </button>
                    {anchored && (
                      <span className="-mt-2 text-center text-[11px] leading-snug text-base-content/55">
                        New subscribers pay {formatPrice(next)}/mo from {LAUNCH_PRICING.endsDay}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Under the tiers: help picking one with no imports yet, and the way past the last tier */}
            <div className="-mt-1 flex flex-col gap-1.5 text-sm text-base-content/65 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              {noImports ? (
                <span>
                  Not sure how many you need?{" "}
                  <a className={ui.link} href={`${TRACKER_PATH}?tab=catalog&add=paste`}>
                    Add your imports
                  </a>{" "}
                  first, free, and we&apos;ll show you the plan that fits.
                </span>
              ) : (
                <span>
                  An import is one HTS code from one country of origin.
                </span>
              )}
              <span className="sm:text-right">
                More than {number(TRACKER_MAX_LISTED_PAIRS)} imports?{" "}
                <a className={ui.link} href={`mailto:${config.resend.supportEmail}?subject=Tariff%20Tracker%20for%20many%20imports`}>
                  Let&apos;s talk
                </a>{" "}
                about a plan built around your catalog.
              </span>
            </div>

            {/* Outcomes, not features */}
            <div className="flex flex-col gap-3">
              <span className={tt.eyebrow()}>What every plan does for you</span>
              <ul className={`m-0 grid list-none gap-4 p-0 sm:grid-cols-2 ${benefits.length === 5 ? "lg:grid-cols-5" : "lg:grid-cols-3"}`}>
                {benefits.map(({ Icon, title, body }) => (
                  <li key={title} className="flex gap-3 lg:flex-col lg:gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-semibold text-base-content">{title}</span>
                      <span className="text-sm leading-snug text-base-content/65">{body}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* The risk, taken away */}
            <div className="flex flex-col gap-3 border-t border-base-300 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-base-content/70">
                Trusted by hundreds of customs brokers, freight forwarders and manufacturers.
              </span>
              <ul className="m-0 flex list-none flex-wrap gap-x-4 gap-y-1 p-0 text-xs text-base-content/65">
                {REASSURANCE.map((item) => (
                  <li key={item} className="inline-flex items-center gap-1">
                    <CheckIcon className="h-3.5 w-3.5 text-success" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-base-300 bg-tt-soft px-6 py-3 text-xs text-base-content/60 sm:px-8">
            {TRACKER_ANNUAL_ENABLED ? "" : "Billed monthly. "}
            {SAVINGS_ENABLED && AUDITS_ENABLED
              ? "Cancel anytime."
              : launch
                ? `Savings and audits join the Tracker from ${LAUNCH_PRICING.endsDay}; launch subscribers keep their price and can add them when they arrive.`
                : SAVINGS_AUDITS_SOON}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// Outcomes of tracking (the Tracker MVP: libs/tariff-tracker/features.ts)
export const BENEFITS = [
  { Icon: BellAlertIcon, title: "Hear the day a tariff hits", body: "Alerts by email, Slack or Teams, with each rate before and after." },
  { Icon: BoltIcon, title: "Know exactly what changed", body: "Impact checks show how any tariff action moves each of your imports." },
  { Icon: NewspaperIcon, title: "Every official source, one feed", body: "CBP, the Federal Register, USTR, USITC and the White House, sorted for you." },
  { Icon: ClockIcon, title: "See how you've been hit", body: "Rate history for every import, with what changed and why." },
  { Icon: ArrowDownTrayIcon, title: "Export every tariff", body: "Every tariff on every import, to CSV or Excel, for your team or broker." },
];

const REASSURANCE = ["Cancel anytime", "No contract", "Your catalog stays free if you cancel", "Secure checkout with Stripe"];

// Now, every minute, for the countdown
const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
};

// "6 days left", then hours in the last two days
const timeLeft = (now: number) => {
  const ms = Math.max(0, Date.parse(LAUNCH_PRICING.endsAt) - now);
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 48) {
    const days = Math.floor(ms / 86_400_000);
    return `${days} days left`;
  }
  if (hours >= 1) return `${hours} ${hours === 1 ? "hour" : "hours"} left`;
  return "ends within the hour";
};
