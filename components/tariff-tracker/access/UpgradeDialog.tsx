"use client";

import { ReactNode, useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowDownTrayIcon,
  BellAlertIcon,
  BoltIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  NewspaperIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { BuildingOffice2Icon, CubeIcon, GlobeAmericasIcon, Square3Stack3DIcon, TruckIcon } from "@heroicons/react/24/solid";
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
  perImportPrice,
  REVERSE_TRIAL,
  TRACKER_MAX_LISTED_PAIRS
} from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TRACKER_PLANS, TrackerAccess, TrackerPlan } from "@/libs/tariff-tracker/plan";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { useCatalog } from "../catalogStore";
import { openBillingPortal } from "../plan/billing";
import { useUpgradeStats } from "./upgradeStats";
import { PremiumFeature } from "./features";

// The paid plans, sized by how many imports they cover. One price shows at a time: for the number
// of imports picked (their catalog's, to start), the smallest plan that holds them. Checkout is
// Stripe's, billed monthly or annually. Opened from a used-up trial allowance or a plan that's too
// small, and from "See plans" anywhere. On a paid plan it changes the plan instead: the pick opens
// Stripe's billing portal on that change (a second checkout would bill twice), and the dialog says
// how to finish it there.

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

export const UpgradeDialog = ({ open, feature, access, onClose }: { open: boolean; feature: PremiumFeature; access: TrackerAccess; onClose: () => void }) => {
  const { items } = useCatalog();
  const [billing, setBilling] = useState<Billing>(TRACKER_ANNUAL_ENABLED ? "annual" : "monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const changing = access.kind === "paid";
  const usedUp =
    access.kind === "trial"
      ? feature === "alerts" || feature === "tracking"
        ? `Your free trial tracks up to ${REVERSE_TRIAL.imports} imports.`
        : null
      : access.kind !== "free"
        ? null
        : feature === "savings" || feature === "qualify"
          ? "Savings checks come with a Tracker plan."
          : feature === "entries" || feature === "refunds"
            ? "Audit checks come with a Tracker plan."
            : feature === "alerts" || feature === "tracking"
              ? "Alerts on your own imports come with a Tracker plan."
              : null;

  const buy = async (plan: TrackerPlan, chosen: number) => {
    setBusy(plan.plan);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_CHECKOUT_STARTED, { plan: plan.plan, billing, feature, catalog: items.length, chosen, change: changing });
    if (changing) {
      if (!(await openBillingPortal(plan.plan))) setBusy(null);
      return;
    }
    try {
      await checkout(plan, billing);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  };

  const stats = useUpgradeStats();
  const now = useNow();
  // A plan change isn't a new subscription: no launch countdown on it
  const launch = launchPricingActive(now) && !changing;
  const imports = stats?.imports ?? items.length;
  const tracked = stats?.tracked ?? Math.min(items.length, access.pairLimit);
  const untracked = Math.max(0, imports - tracked);
  // One line about their own imports, when there's something to say
  const atStake =
    untracked > 0 ? `${formatCount(untracked)} of your imports ${untracked === 1 ? "has" : "have"} tariff alerts off right now.` : usedUp;
  // Where the picker starts: their catalog (on a paid plan, at least the next plan up), else a
  // common starting point
  const start = changing ? Math.max(imports, access.pairLimit + 1) : imports > 0 ? imports : DEFAULT_IMPORTS;

  // A dialog portals out of the Tracker, so it carries the Tracker's look itself (DESIGN_SYSTEM §15).
  // Kept to the choice: a deadline on top, a short headline, then side by side how many imports
  // (picked) and the one price for them, with what's included inside it.
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden shadow-2xl`}
        >
          {launch && (
            <div className="flex items-center justify-center gap-2 bg-warning/10 px-12 py-2.5 text-center text-sm font-semibold text-warning">
              <ClockIcon className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                Launch pricing ends {LAUNCH_PRICING.endsDay} · <span className="tabular-nums">{timeLeft(now)}</span>
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`absolute right-3 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content ${launch ? "top-1.5" : "top-4"}`}
          >
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-6 overflow-y-auto px-6 py-7 sm:px-8">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Dialog.Title className={`${tt.display} m-0 px-8 text-2xl font-semibold leading-tight text-base-content sm:text-[1.75rem]`}>
                {changing ? "Change Your Plan" : "Tariff Alerts, Savings, & Audits on Autopilot"}
              </Dialog.Title>
              <p className={`${tt.subtitle} m-0 max-w-2xl text-base`}>
                {atStake && <span className="font-semibold text-error">{atStake} </span>}
                {changing
                  ? `You're on Tracker ${formatCount(access.pairLimit)}. Pick how many imports you need, then confirm the change in Stripe.`
                  : "Pick how many imports you track. Your plan and price follow."}
              </p>
            </div>

            {/* How the change finishes in Stripe's billing portal */}
            {changing && (
              <ol className="m-0 grid list-none gap-2 p-0 sm:grid-cols-3">
                {CHANGE_STEPS.map((step, i) => (
                  <li key={i} className={`${tt.tile} flex items-start gap-3 p-3`}>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content" aria-hidden>
                      {i + 1}
                    </span>
                    <span className="text-sm leading-snug text-base-content/75">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <PlanPicker
              key={start}
              start={start}
              detected={!changing && imports > 0}
              access={access}
              billing={billing}
              launch={launch}
              busy={busy}
              onBuy={buy}
            />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// Side by side: how many imports (picked from the ranges, or their exact count), and the one price
// for them, the smallest plan that holds them; past the last one, we talk
const PlanPicker = ({
  start,
  detected,
  access,
  billing,
  launch,
  busy,
  onBuy,
}: {
  start: number;
  detected: boolean;
  access: TrackerAccess;
  billing: Billing;
  launch: boolean;
  busy: string | null;
  onBuy: (plan: TrackerPlan, chosen: number) => void;
}) => {
  const [chosen, setChosen] = useState(start);
  const plan = TRACKER_PLANS.find((p) => chosen <= p.maxPairs) ?? null;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* How many imports */}
      <div className="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-100 p-5">
        <span className="flex items-center gap-2.5 text-sm font-semibold text-base-content">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-content" aria-hidden>
            1
          </span>
          How many imports / products do you have?
        </span>
        {/* The ranges, as big tiles that fill the column; the picked one turns the card's blue */}
        <div className="flex flex-1 flex-col gap-2" role="radiogroup" aria-label="Number of imports">
          {RANGES.map(({ from, to }, i) => {
            const tier = TRACKER_PLANS.find((p) => p.maxPairs === to);
            const on = tier ? plan === tier : plan === null;
            const yours = detected && (tier ? tier === TRACKER_PLANS.find((p) => start <= p.maxPairs) : start > TRACKER_MAX_LISTED_PAIRS);
            return (
              <button
                key={from}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setChosen(to ?? from)}
                className={`flex min-h-14 flex-1 items-center gap-4 rounded-xl border-2 px-4 text-left transition-all duration-150 ${on
                  ? "scale-[1.02] border-primary bg-primary text-primary-content shadow-lg"
                  : "border-base-300 text-base-content hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                  }`}
              >
                <SizeBadge index={i} on={on} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className={`${tt.display} flex items-center gap-2 text-lg font-bold leading-tight tabular-nums`}>
                    {to === null ? `${formatCount(from - 1)}+` : `${formatCount(from)} – ${formatCount(to)}`}
                    {yours && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${on ? "bg-primary-content/20" : "bg-primary/10 text-primary"}`}>
                        Your catalog
                      </span>
                    )}
                  </span>
                  <span className={`text-xs ${on ? "text-primary-content/75" : "text-base-content/55"}`}>imports</span>
                </span>
                <span className="flex flex-col items-end">
                  <span className={`${tt.display} text-base font-bold tabular-nums`}>{tier ? formatPrice(monthlyRate(tier.price, billing)) : "Custom"}</span>
                  <span className={`text-[11px] ${on ? "text-primary-content/75" : "text-base-content/50"}`}>{tier ? "per month" : "let's talk"}</span>
                </span>
              </button>
            );
          })}
        </div>
        {/* What counts as one import, with the example that settles it */}
        <div className="flex flex-col gap-2 rounded-xl bg-tt-soft p-3.5">
          <span className="text-xs font-semibold text-base-content">What counts as an import?</span>
          <span className="text-xs leading-snug text-base-content/65">
            One HTS code from one country of origin. The same product from two countries is two imports.
          </span>
          <span className="flex flex-wrap items-center gap-1.5 text-[11px] tabular-nums text-base-content/75">
            {IMPORT_EXAMPLE.map((country) => (
              <span key={country} className="rounded-md border border-base-300 bg-base-100 px-2 py-0.5">
                {IMPORT_EXAMPLE_CODE} · {country}
              </span>
            ))}
            <span className="font-semibold text-primary">= {IMPORT_EXAMPLE.length} imports</span>
          </span>
        </div>
      </div>

      <PricingCard plan={plan} chosen={chosen} access={access} billing={billing} launch={launch} busy={busy} onBuy={onBuy} />
    </div>
  );
};

// The price for the imports picked, in one card: the blue band carries the monthly price (the big
// number) and the cost per import; under it, what's included, the button and its deadline
const PricingCard = ({
  plan,
  chosen,
  access,
  billing,
  launch,
  busy,
  onBuy,
}: {
  plan: TrackerPlan | null;
  chosen: number;
  access: TrackerAccess;
  billing: Billing;
  launch: boolean;
  busy: string | null;
  onBuy: (plan: TrackerPlan, chosen: number) => void;
}) => {
  const changing = access.kind === "paid";
  const current = plan !== null && access.paidPlan === plan.plan;
  const monthly = plan ? monthlyRate(plan.price, billing) : 0;
  const next = plan ? LAUNCH_PRICING.nextPrices[plan.maxPairs] : 0;
  const anchored = plan !== null && launch && next > plan.price;
  const label = !plan
    ? "Talk to us"
    : current
      ? "Your plan"
      : busy === plan.plan
        ? changing
          ? "Opening Stripe…"
          : "Opening checkout…"
        : changing
          ? `${plan.maxPairs > access.pairLimit ? "Upgrade" : "Switch"} to Tracker ${formatCount(plan.maxPairs)}`
          : launch
            ? `Lock in ${formatPrice(monthly)}/month`
            : "Start tracking";
  const button = `${ui.button({ variant: "primary", size: "lg" })} w-full`;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-primary bg-base-100 shadow-xl">
      {/* The price */}
      <div className="flex flex-col gap-2 bg-primary px-6 py-5 text-primary-content">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-content/75">{plan ? `Tracker ${formatCount(plan.maxPairs)}` : "Custom plan"}</span>
          {plan && (current || anchored) && (
            <span className="rounded-full bg-primary-content/15 px-2.5 py-0.5 text-xs font-bold">
              {current ? "Your plan" : `Launch price · Save ${Math.round((1 - plan.price / next) * 100)}%`}
            </span>
          )}
        </div>
        {plan ? (
          <p className="m-0 flex items-baseline gap-2">
            <span className={`${tt.display} text-6xl font-semibold leading-none tracking-tight tabular-nums`}>{formatPrice(monthly)}</span>
            <span className="text-base font-medium text-primary-content/75">/month</span>
            {anchored && (
              <span className="ml-auto text-xl font-semibold tabular-nums text-primary-content/50 line-through" aria-label={`Goes to ${formatPrice(next)} a month`}>
                {formatPrice(next)}
              </span>
            )}
          </p>
        ) : (
          <span className={`${tt.display} text-5xl font-semibold leading-none tracking-tight`}>Let&apos;s talk</span>
        )}
        <span className="text-sm text-primary-content/85">
          {plan ? (
            <>
              Just <span className="font-bold tabular-nums text-primary-content">{formatPrice(perImportPrice({ price: monthly, maxPairs: plan.maxPairs }))} per import</span> a
              month, on up to {formatCount(plan.maxPairs)} imports
            </>
          ) : (
            `A plan built around catalogs over ${formatCount(TRACKER_MAX_LISTED_PAIRS)} imports`
          )}
        </span>
      </div>

      <div className="flex flex-col gap-5 p-6">
        {/* What's included */}
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {VALUE_STACK.map(({ Icon, title }) => (
            <li key={title} className="flex items-center gap-2.5 text-sm text-base-content/85">
              <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="flex-1">{title}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2">
          {plan ? (
            <button type="button" className={button} disabled={current || busy !== null} onClick={() => onBuy(plan, chosen)}>
              {label}
            </button>
          ) : (
            <a className={button} href={`mailto:${config.resend.supportEmail}?subject=Tariff%20Tracker%20for%20${chosen}%20imports`}>
              {label}
            </a>
          )}
          {anchored && !current && (
            <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-error">
              <ClockIcon className="h-3.5 w-3.5" aria-hidden />
              {formatPrice(next)}/month after {LAUNCH_PRICING.endsDay}.
            </span>
          )}
          <span className="text-center text-xs text-base-content/55">{(changing ? CHANGE_REASSURANCE : REASSURANCE).join(" · ")}</span>
        </div>
      </div>
    </div>
  );
};

// A range's size, as something an importer would ship: a parcel, a stack, a truckload, a
// warehouse, the world (past the last plan)
const SIZE_ICONS = [CubeIcon, Square3Stack3DIcon, TruckIcon, BuildingOffice2Icon, GlobeAmericasIcon];

const SizeBadge = ({ index, on }: { index: number; on: boolean }) => {
  const Icon = SIZE_ICONS[Math.min(index, SIZE_ICONS.length - 1)];
  return (
    <span
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${on ? "bg-primary-content text-primary" : "bg-primary/10 text-primary"}`}
      aria-hidden
    >
      <Icon className="h-5 w-5" />
    </span>
  );
};

// The example under the picker: one code, two origins
const IMPORT_EXAMPLE_CODE = "8471.30.01";
const IMPORT_EXAMPLE = ["China", "Vietnam"];

const formatCount = (n: number) => n.toLocaleString("en-US");

// Where the picker starts with no imports yet (the smallest plan), and the ranges to pick from:
// each plan's (from one past the plan below), then past the last (no end)
const DEFAULT_IMPORTS: number = TRACKER_PLANS[0].maxPairs;
const RANGES: { from: number; to: number | null }[] = [
  ...TRACKER_PLANS.map((p, i) => ({ from: i === 0 ? 1 : TRACKER_PLANS[i - 1].maxPairs + 1, to: p.maxPairs as number })),
  { from: TRACKER_MAX_LISTED_PAIRS + 1, to: null },
];

// Outcomes of tracking (savings detection and auditing follow them in VALUE_STACK)
export const BENEFITS = [
  { Icon: BellAlertIcon, title: "Hear the day a tariff hits", body: "Alerts by email, Slack or Teams, with each rate before and after." },
  { Icon: BoltIcon, title: "Know exactly what changed", body: "Impact checks show how any tariff action moves each of your imports." },
  { Icon: ChartBarIcon, title: "See what drives your duty", body: "Insights across your whole catalog: where the duty comes from and what moved it." },
  { Icon: NewspaperIcon, title: "Every official source, one feed", body: "CBP, the Federal Register, USTR, USITC and the White House, sorted for you." },
  { Icon: ClockIcon, title: "See how you've been hit", body: "Rate history for every import, with what changed and why." },
  { Icon: ArrowDownTrayIcon, title: "Export every tariff", body: "Every tariff on every import, to CSV or Excel, for your team or broker." },
];

// What every plan includes, as the pricing card lists it: every outcome of tracking, then savings
// detection and auditing
const VALUE_STACK: { Icon: typeof BellAlertIcon; title: string }[] = [
  ...BENEFITS.map(({ Icon, title }) => ({ Icon, title })),
  { Icon: SparklesIcon, title: "Automatic savings detection" },
  { Icon: ClipboardDocumentCheckIcon, title: "Automatic auditing" },
];

const REASSURANCE = ["Cancel anytime", "No contract", "Secure checkout with Stripe"];
const CHANGE_REASSURANCE = ["Nothing changes until you confirm", "Same card, same billing date", "Change or cancel anytime"];

// Changing a paid plan, in Stripe's billing portal
const CHANGE_STEPS: ReactNode[] = [
  <>Pick a plan. Stripe&apos;s billing page opens with the change ready.</>,
  <>
    Check the new price and what&apos;s due today, then click <span className="font-semibold text-base-content">Confirm</span>.
  </>,
  <>
    If Stripe shows your current plan instead, click <span className="font-semibold text-base-content">Update subscription</span>, pick the plan, then{" "}
    <span className="font-semibold text-base-content">Continue</span> and <span className="font-semibold text-base-content">Confirm</span>.
  </>,
];

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
