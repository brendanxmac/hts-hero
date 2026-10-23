"use client";

import { ReactNode } from "react";
import Link from "next/link";
import config from "@/config";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { formatPrice, LAUNCH_PRICING, launchPricingActive, perImportPrice, REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { TRACKER_PLANS, trackerPlanFor } from "@/libs/tariff-tracker/plan";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath, signupHref } from "../access/signup";
import { useTracker } from "../TrackerContext";
import { endDate, keepPlan, trialDaysRemaining, trialState } from "./trial";
import { openBillingPortal, shortDate, useTrackerSubscription } from "./billing";
import { openImportTakeover } from "../onboarding/takeoverStore";

// The plan at the foot of the sidebar (dark in both modes), one stage at a time:
// - signed out: save the imports with a free account
// - signed in, no imports yet: add them to try it free (the trial isn't mentioned until it runs)
// - on the trial: the days left, as a ring that drains, and the plan that keeps everything
// - paid: the plan and how full it is; full, the way to a bigger one (Stripe's billing portal);
//   cancelled or a payment failed, what happens and the way to fix it
// - a plan or trial that ended: what the imports lost, and the way back

const BOX = "flex flex-col gap-3 rounded-2xl bg-tt-side-card p-4";
const TEXT_BUTTON = "self-center text-xs font-semibold text-base-content/60 hover:text-base-content hover:underline";

const n = (count: number) => count.toLocaleString("en-US");

const Meter = ({ value, max, tone = "bg-warning" }: { value: number; max: number; tone?: string }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-base-content/15" aria-hidden>
    {/* Runtime width (DESIGN_SYSTEM §10) */}
    <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
  </div>
);

// A labelled count over its meter
const Usage = ({ label, value, max, tone, valueTone = "text-base-content" }: { label: string; value: number; max: number; tone: string; valueTone?: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-base-content/70">{label}</span>
      <span className={`font-semibold tabular-nums ${valueTone}`}>
        {n(Math.min(value, max))} / {n(max)}
      </span>
    </div>
    <Meter value={value} max={max} tone={tone} />
  </div>
);

// The trial's days left, as a ring that drains with the number inside (the heading beside it says
// "days left", so the ring holds just the number, clear of the stroke)
const DaysRing = ({ left, tone }: { left: number; tone: "primary" | "warning" | "error" }) => {
  const r = 24;
  const circumference = 2 * Math.PI * r;
  const stroke = { primary: "stroke-primary", warning: "stroke-warning", error: "stroke-error" }[tone];
  return (
    <div className="relative h-14 w-14 shrink-0" aria-hidden>
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4" className="stroke-base-content/15" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - left / REVERSE_TRIAL.days)}
        />
      </svg>
      <span className={`${tt.display} absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums leading-none text-base-content`}>{left}</span>
    </div>
  );
};

export const PlanCard = () => {
  const { loading, signedIn, access, openUpgrade } = useTrackerAccess();
  const { items, trackedKeys, moreToTrack, trackMore } = useTracker();
  const paid = access.kind === "paid";
  // Renewal, cancellation and failed payments live in Stripe; a preview has no subscription
  const subscription = useTrackerSubscription(paid && !access.preview);
  if (loading) return <div className={`${ui.skeleton} h-32 w-full`} />;

  if (!signedIn) {
    return (
      <div className={BOX}>
        <span className={tt.eyebrow("primary")}>Save your imports</span>
        <span className={`${tt.display} text-base font-semibold leading-snug`}>Keep your products and unlock Analysis</span>
        <Link href={signupHref(currentPath())} className={ui.button({ variant: "primary", size: "sm" })}>
          Create free account
        </Link>
      </div>
    );
  }

  const imports = items.length;
  const withAlerts = Math.min(trackedKeys.size, imports);
  const off = imports - withAlerts;
  const launch = launchPricingActive();
  const trial = trialState(access);

  // The admin previewing a plan stage (?trialPreview=): say so, and the way out
  const previewNote = access.preview && (
    <a href="?trialPreview=off" className="-mt-1 text-xs font-semibold text-warning hover:underline">
      Previewing &ldquo;{access.preview}&rdquo; · Stop
    </a>
  );
  const box = (children: ReactNode) => (
    <div className={BOX}>
      {previewNote}
      {children}
    </div>
  );

  // No imports yet: the trial waits for them, so the ask is just to add them
  if (trial.notStarted) {
    return box(
      <>
        <span className={tt.eyebrow("primary")}>Try It Free</span>
        <span className={`${tt.display} -mt-1 text-base font-semibold leading-snug text-base-content`}>Add your imports to try the Tracker free</span>
        <span className="text-sm leading-snug text-base-content/70">
          Tariff alerts, impact checks and Insights on up to {n(REVERSE_TRIAL.imports)} of your imports.
        </span>
        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openImportTakeover("plan-card")}>
          Add my imports
        </button>
        <button type="button" className={TEXT_BUTTON} onClick={() => openUpgrade("plan")}>
          See pricing
        </button>
      </>
    );
  }

  // On the trial: the ring of days left, when it ends, and the plan that keeps everything
  if (trial.onTrial) {
    const plan = keepPlan(imports);
    const left = trialDaysRemaining(trial.daysLeft);
    const lastDay = left <= 1;
    const tone = lastDay ? "error" : trial.ending ? "warning" : "primary";
    return box(
      <>
        <div className="flex items-center gap-3">
          <DaysRing left={left} tone={tone} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className={tt.eyebrow(tone)}>Free Trial</span>
            <span className={`${tt.display} text-base font-semibold leading-tight text-base-content`}>
              {lastDay ? "Last day" : `${left} days left`}
            </span>
            {endDate(access) && <span className="text-xs text-base-content/60">Ends {endDate(access)}</span>}
          </div>
        </div>
        <span className="text-sm leading-snug text-base-content/75">
          {trial.ending ? (
            <>
              <span className="font-semibold text-warning">When it ends, your imports lose their tariff alerts.</span> Pick a plan to keep them.
            </>
          ) : imports > 0 ? (
            `Keep tariff alerts and Insights on all ${n(imports)} imports after your trial.`
          ) : (
            "Keep tariff alerts and Insights on your imports after your trial."
          )}
        </span>
        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openUpgrade("plan")}>
          Keep everything{plan ? ` · ${formatPrice(plan.price)}/mo` : ""}
        </button>
        {/* The price per import: the easiest way to see what it's worth */}
        {plan && (
          <span className="-mt-1 text-center text-xs text-base-content/60">
            Just <span className="font-semibold text-success">{formatPrice(perImportPrice(plan))}</span> per import, per month
          </span>
        )}
      </>
    );
  }

  if (paid) {
    const plan = trackerPlanFor(access.paidPlan!);
    // Every alert slot in use: the next plan up that fits the catalog (or just the next one up)
    const full = trackedKeys.size >= access.pairLimit;
    const room = Math.max(0, access.pairLimit - trackedKeys.size);
    const bigger = TRACKER_PLANS.filter((p) => p.maxPairs > access.pairLimit);
    const next = bigger.find((p) => imports <= p.maxPairs) ?? bigger[0];
    const cancelsAt = shortDate(subscription?.cancelsAt);
    const unpaid = subscription?.status === "past_due" || subscription?.status === "unpaid";
    const renews = !cancelsAt && !unpaid && shortDate(subscription?.periodEnd);

    return box(
      <>
        <div className="flex items-center justify-between gap-2">
          <span className={tt.eyebrow("success")}>Your Plan</span>
          {unpaid ? (
            <span className={tt.chip("error")}>Payment due</span>
          ) : cancelsAt ? (
            <span className={tt.chip("warning")}>Ends {cancelsAt}</span>
          ) : (
            <span className={tt.chip("success")}>Active</span>
          )}
        </div>
        <div className="-mt-1 flex flex-col">
          <span className={`${tt.display} text-lg font-semibold leading-tight text-base-content`}>Tracker {n(access.pairLimit)}</span>
          <span className="text-xs text-base-content/60">
            Alerts on up to {n(plan?.maxPairs ?? access.pairLimit)} imports{renews ? ` · Renews ${renews}` : ""}
          </span>
        </div>
        {imports > 0 && (
          <Usage
            label="Imports with alerts"
            value={withAlerts}
            max={access.pairLimit}
            tone={full ? "bg-warning" : "bg-success"}
            valueTone={full ? "text-warning" : "text-base-content"}
          />
        )}

        {unpaid ? (
          // Stripe is retrying a failed payment; the plan ends if none goes through
          <>
            <span className="text-sm leading-snug text-base-content/75">
              <span className="font-semibold text-error">Your last payment didn&apos;t go through.</span> Update your card to keep your alerts on.
            </span>
            <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openBillingPortal()}>
              Update payment
            </button>
          </>
        ) : cancelsAt ? (
          // Cancelled, still running: when the alerts stop, and the way to stay
          <>
            <span className="text-sm leading-snug text-base-content/75">
              Your plan is cancelled. {imports > 0 ? `Your ${n(imports)} imports lose their tariff alerts on ${cancelsAt}.` : `It ends ${cancelsAt}.`}
            </span>
            <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openBillingPortal()}>
              Keep my plan
            </button>
          </>
        ) : imports === 0 ? (
          <span className="text-sm leading-snug text-base-content/70">Add your imports and alerts cover up to {n(access.pairLimit)}.</span>
        ) : full ? (
          // At the plan's limit: what that's costing, and a bigger plan (or a talk, past the last)
          <>
            <span className="text-sm leading-snug text-base-content/75">
              {off > 0 ? (
                <>
                  <span className="font-semibold text-error">
                    {n(off)} {off === 1 ? "import has" : "imports have"} no alerts.
                  </span>{" "}
                  Your plan is full.
                </>
              ) : (
                "Your plan is full. A bigger one has room for new imports."
              )}
            </span>
            {next ? (
              <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openUpgrade("tracking")}>
                Increase my plan
              </button>
            ) : (
              <a
                className={ui.button({ variant: "secondary", size: "sm" })}
                href={`mailto:${config.resend.supportEmail}?subject=Tariff%20Tracker%20for%20many%20imports`}
              >
                Need more? Let&apos;s talk
              </a>
            )}
          </>
        ) : off > 0 && moreToTrack > 0 ? (
          // Room on the plan for imports without alerts
          <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={trackMore}>
            Turn on alerts for {n(moreToTrack)} more
          </button>
        ) : (
          <span className="flex items-start gap-2 text-sm leading-snug text-base-content">
            <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <span>
              <span className="font-semibold">{off === 0 ? `All ${n(imports)} imports covered.` : "Alerts are on where you want them."}</span>{" "}
              <span className="text-base-content/70">Room for {n(room)} more.</span>
            </span>
          </span>
        )}
        <button type="button" className={TEXT_BUTTON} onClick={() => openBillingPortal()}>
          Manage billing
        </button>
      </>
    );
  }

  // The free plan: after the trial, or after a paid plan. What the imports lost, and the way back.
  const coverAll = TRACKER_PLANS.find((p) => imports <= p.maxPairs);
  const pastPlan = access.pastPlan ? trackerPlanFor(access.pastPlan.plan) : null;
  return box(
    <>
      <div className="flex flex-col gap-0.5">
        <span className={tt.eyebrow("neutral")}>Free Plan</span>
        {trial.lapsed && access.pastPlan ? (
          <span className="text-xs text-base-content/60">
            Your Tracker {pastPlan ? n(pastPlan.maxPairs) : ""} plan ended {shortDate(access.pastPlan.endedAt)}.
          </span>
        ) : (
          trial.ended && <span className="text-xs text-base-content/60">Your free trial ended {endDate(access)}.</span>
        )}
      </div>

      {imports === 0 ? (
        <>
          <span className="text-sm leading-snug text-base-content/70">Alerts on your own imports come with a Tracker plan. Tariff News alerts stay free.</span>
          <button type="button" className={ui.button({ variant: trial.lapsed ? "primary" : "secondary", size: "sm" })} onClick={() => openUpgrade("plan")}>
            {trial.lapsed ? "Resubscribe" : "See plans"}
          </button>
        </>
      ) : (
        <>
          <Usage label="Imports with alerts" value={withAlerts} max={imports} tone={withAlerts / imports >= 0.4 ? "bg-warning" : "bg-error"} />
          {off > 0 && (
            <span className="text-sm leading-snug text-base-content/75">
              <span className="font-semibold text-error">
                {n(off)} {off === 1 ? "import has" : "imports have"} no tariff alerts.
              </span>{" "}
              A tariff change on one could go unnoticed.
            </span>
          )}
          <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openUpgrade("tracking")}>
            {trial.lapsed ? "Resubscribe" : coverAll ? `Cover all ${n(imports)} · ${formatPrice(perImportPrice(coverAll))}/import` : "See plans"}
          </button>
          {!trial.lapsed && coverAll && launch && <span className="text-center text-xs text-warning">Launch pricing ends {LAUNCH_PRICING.endsLabel}</span>}
        </>
      )}
    </>
  );
};
