"use client";

import { ReactNode, useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ArrowDownTrayIcon, BellAlertIcon, BoltIcon, ChartBarIcon, ClockIcon, NewspaperIcon, XMarkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import config from "@/config";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { bestPlanFor, DarkBillingSwitch, DemoRow, GuaranteeBox, PlanCards, type SalesPlan } from "@/components/ui/marketing/PlanPricing";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { ALERT_TIERS, AUDIT_TIERS, Billing, REVERSE_TRIAL, TRACKER_MAX_LISTED_PAIRS } from "@/components/pricing-calculator/lib/pricing";
import { alertsIncluded } from "@/components/tariff-alerts/pricing/AlertsPricing";
import { GUARANTEE, GUARANTEE_DETAIL } from "@/components/tariff-alerts/lib/copy";
import { auditsIncluded } from "@/components/tariff-audit/pricing/AuditPricing";
import { AUDIT_GUARANTEE, AUDIT_GUARANTEE_DETAIL } from "@/components/tariff-audit/lib/copy";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { ALERT_PLANS, AUDIT_PLANS, TrackerAccess, TrackerOffer, TrackerPlan, trackerPlanFor } from "@/libs/tariff-tracker/plan";
import { useAllImports } from "../catalogStore";
import { openBillingPortal, useTrackerSubscription } from "../plan/billing";
import { useUpgradeStats } from "./upgradeStats";
import { PremiumFeature } from "./features";

// The paid plans: Duty Guard, four plans each, on the sales pages' cards, with the
// plan that fits their products marked. Checkout is Stripe's, billed monthly or annually. Opened
// from anything the plan doesn't cover, and from "See plans" anywhere. On a paid plan it changes the
// plan instead: the pick opens Stripe's billing portal on that change (a second checkout would bill
// twice), and the dialog says how to finish it there.

const OFFERS: { id: TrackerOffer; label: string }[] = [
  { id: "alerts", label: "Duty Guard Essentials" },
  { id: "audits", label: "Duty Guard Pro" },
];

const offerOf = (access: TrackerAccess) => (access.paidPlan ? (trackerPlanFor(access.paidPlan) as { offer?: TrackerOffer } | undefined)?.offer : undefined);

// Which offer opens first: what they were looking at. Asked for plans in general, a paid account
// sees its own offer, and the trial the one that keeps everything it has
const startOffer = (feature: PremiumFeature, access: TrackerAccess): TrackerOffer => {
  const current = offerOf(access);
  if (current === "audits") return "audits";
  if (feature === "alerts" || feature === "tracking" || feature === "limit") return "alerts";
  return feature === "plan" && current === "alerts" ? "alerts" : "audits";
};

const checkout = async (plan: TrackerPlan, billing: Billing) => {
  const res = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId: plan.plan, billing, cancelUrl: window.location.href }),
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !body.url) throw new Error(body.error ?? "Checkout isn't available right now.");
  window.location.href = body.url;
};

export const UpgradeDialog = ({ open, feature, access, onClose }: { open: boolean; feature: PremiumFeature; access: TrackerAccess; onClose: () => void }) => {
  // Every list: the plan counts each import once
  const { items } = useAllImports();
  const changing = access.kind === "paid";
  const subscription = useTrackerSubscription(open && changing && !access.preview);
  const [billing, setBilling] = useState<Billing>("annual");
  const [offer, setOffer] = useState<TrackerOffer>(() => startOffer(feature, access));
  const [busy, setBusy] = useState<string | null>(null);
  const stats = useUpgradeStats();

  useEffect(() => {
    if (open) setOffer(startOffer(feature, access));
  }, [open, feature]); // eslint-disable-line react-hooks/exhaustive-deps
  // A plan change starts from how they're billed now
  useEffect(() => {
    if (subscription) setBilling(subscription.billing);
  }, [subscription]);

  const imports = stats?.imports ?? items.length;
  const tracked = stats?.tracked ?? Math.min(items.length, access.pairLimit);
  const untracked = Math.max(0, imports - tracked);
  const needsAudits = feature === "savings" || feature === "qualify" || feature === "entries" || feature === "refunds";
  const usedUp =
    access.kind === "trial"
      ? feature === "alerts" || feature === "tracking"
        ? `Your free trial tracks up to ${REVERSE_TRIAL.imports} products.`
        : null
      : needsAudits
        ? feature === "savings" || feature === "qualify"
          ? "Savings detection comes with Duty Guard Pro."
          : "Entry audits come with Duty Guard Pro."
        : null;
  // One line about their own products, when there's something to say
  const atStake = usedUp ?? (untracked > 0 ? `${formatCount(untracked)} of your products ${untracked === 1 ? "has" : "have"} tariff alerts off right now.` : null);

  const plans: readonly TrackerPlan[] = offer === "alerts" ? ALERT_PLANS : AUDIT_PLANS;
  const best = imports > 0 ? bestPlanFor(plans, imports) : null;
  // Closed without buying (busy: on the way to Stripe)
  const dismiss = () => {
    if (!busy) trackEvent(MixpanelEvent.DUTY_GUARD_UPGRADE_DISMISSED, { feature, offer, billing, change: changing, plan_kind: access.kind });
    onClose();
  };

  const buy = async (plan: TrackerPlan) => {
    setBusy(plan.plan);
    trackEvent(MixpanelEvent.DUTY_GUARD_CHECKOUT_STARTED, {
      plan: plan.plan,
      offer: plan.offer,
      billing,
      feature,
      max_pairs: plan.maxPairs,
      // The tier's monthly list price
      price_usd: plan.price,
      recommended: best === plan.maxPairs,
      catalog: items.length,
      change: changing,
      plan_kind: access.kind,
    });
    if (changing) {
      if (!(await openBillingPortal(plan.plan, billing))) setBusy(null);
      return;
    }
    try {
      await checkout(plan, billing);
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  };

  const isCurrent = (plan: TrackerPlan) => access.paidPlan === plan.plan && (!subscription || subscription.billing === billing);
  const cta = (tier: SalesPlan) => {
    const plan = plans.find((p) => p.maxPairs === tier.maxPairs)!;
    if (isCurrent(plan)) return "Your Plan";
    if (busy === plan.plan) return changing ? "Opening Stripe…" : "Opening checkout…";
    if (access.paidPlan === plan.plan) return `Switch to ${billing === "annual" ? "Annual" : "Monthly"}`;
    return `${changing ? "Switch to" : "Get"} ${tier.name}`;
  };
  const choose = (tier: SalesPlan) => {
    const plan = plans.find((p) => p.maxPairs === tier.maxPairs)!;
    if (!isCurrent(plan)) void buy(plan);
  };
  const over = imports > TRACKER_MAX_LISTED_PAIRS;

  // A dialog portals out of Duty Guard, so it carries Duty Guard's look itself (DESIGN_SYSTEM §15)
  return (
    <Dialog open={open} onClose={dismiss} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[94vh] w-full max-w-[100rem] flex-col overflow-hidden shadow-2xl`}
        >
          <button type="button" onClick={dismiss} className="absolute right-3 top-4 z-10 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content">
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-6 overflow-y-auto px-6 py-7 sm:px-10">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Dialog.Title className={`${tt.display} m-0 px-8 text-2xl font-semibold leading-tight text-base-content sm:text-[1.75rem]`}>
                {changing ? "Change Your Plan" : offer === "alerts" ? "Know When New Tariffs Hit Your Products" : "Stop Overpaying on US Imports"}
              </Dialog.Title>
              <p className={`${tt.subtitle} m-0 max-w-2xl text-base`}>
                {atStake && <span className="font-semibold text-error">{atStake} </span>}
                {changing
                  ? `You're on ${access.paidPlan}. Pick a plan, then confirm the change in Stripe.`
                  : "Plans are priced by products: one HTS code from one country of origin."}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <SegmentedControl<TrackerOffer> label="Offer" options={OFFERS} value={offer} onChange={setOffer} />
              <DarkBillingSwitch billing={billing} onChange={setBilling} />
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

            <div className="pt-3">
              {offer === "alerts" ? (
                <PlanCards
                  product="Duty Guard Essentials"
                  plans={ALERT_TIERS}
                  billing={billing}
                  features={alertsIncluded}
                  lead={(p) => `Alerts on up to ${p.maxPairs} products`}
                  best={best}
                  products={imports}
                  onChoose={choose}
                  cta={cta}
                  busy={busy !== null}
                />
              ) : (
                <PlanCards
                  product="Duty Guard Pro"
                  plans={AUDIT_TIERS}
                  billing={billing}
                  features={auditsIncluded}
                  lead={(p) => `Audits and alerts on up to ${p.maxPairs} products`}
                  best={best}
                  products={imports}
                  onChoose={choose}
                  cta={cta}
                  busy={busy !== null}
                />
              )}
            </div>

            {over && (
              <DemoRow
                title={`More Than ${formatCount(TRACKER_MAX_LISTED_PAIRS)} Products?`}
                text="We'll build a plan around your catalog."
                href={`mailto:${config.resend.supportEmail}?subject=HTS%20Hero%20for%20${imports}%20products`}
                label="Talk to Us"
                best
              />
            )}

            <GuaranteeBox title={offer === "alerts" ? GUARANTEE : AUDIT_GUARANTEE} text={offer === "alerts" ? GUARANTEE_DETAIL : AUDIT_GUARANTEE_DETAIL} />
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const formatCount = (n: number) => n.toLocaleString("en-US");

// Outcomes of tracking (savings detection and auditing follow them in VALUE_STACK)
export const BENEFITS = [
  { Icon: BellAlertIcon, title: "Hear the day a tariff hits", body: "Alerts by email, Slack or Teams, with each rate before and after." },
  { Icon: BoltIcon, title: "Know exactly what changed", body: "Impact checks show how any tariff action moves each of your imports." },
  { Icon: ChartBarIcon, title: "See what drives your duty", body: "Insights across your whole catalog: where the duty comes from and what moved it." },
  { Icon: NewspaperIcon, title: "Every official source, one feed", body: "CBP, the Federal Register, USTR, USITC and the White House, sorted for you." },
  { Icon: ClockIcon, title: "See how you've been hit", body: "Rate history for every import, with what changed and why." },
  { Icon: ArrowDownTrayIcon, title: "Export every tariff", body: "Every tariff on every import, to CSV or Excel, for your team or broker." },
];

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
