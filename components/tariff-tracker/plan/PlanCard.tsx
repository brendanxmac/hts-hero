"use client";

import Link from "next/link";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { formatPrice, LAUNCH_PRICING, launchPricingActive, LOWEST_PER_IMPORT, perImportPrice, TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { TRACKER_PLANS } from "@/libs/tariff-tracker/plan";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath, signupHref } from "../access/signup";
import { useTracker } from "../TrackerContext";
import { AUDITS_ENABLED, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";
import { REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { endDate, endsIn, keepPlan, trialDaysRemaining, trialState } from "./trial";
import { openImportTakeover } from "../onboarding/takeoverStore";

// The plan at the foot of the sidebar (dark in both modes): what it is, how much of the catalog
// has alerts, and, short of all of it, the next step up; all of it, a well done. Always in view, so
// more value is never more than a click away.

const BOX = "flex flex-col gap-3 rounded-2xl bg-tt-side-card p-4";

const Meter = ({ value, max, tone = "bg-warning" }: { value: number; max: number; tone?: string }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-base-content/15" aria-hidden>
    {/* Runtime width (DESIGN_SYSTEM §10) */}
    <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
  </div>
);

// The trial's countdown: a segment per day, lit for each day left, so it drains as the trial runs out
const DaysLeft = ({ left, ending }: { left: number; ending: boolean }) => (
  <div className="flex gap-0.5" aria-hidden>
    {Array.from({ length: REVERSE_TRIAL.days }, (_, day) => (
      <div key={day} className={`h-1.5 flex-1 rounded-full ${day < left ? (ending ? "bg-warning" : "bg-primary") : "bg-base-content/15"}`} />
    ))}
  </div>
);

// One allowance on the trial: how much of it is used
const Allowance = ({ label, used, max }: { label: string; used: number; max: number }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-base-content/70">{label}</span>
      <span className="font-semibold tabular-nums text-base-content">
        {Math.min(used, max)} / {max}
      </span>
    </div>
    <Meter value={used} max={max} />
  </div>
);

export const PlanCard = () => {
  const { loading, signedIn, access, openUpgrade } = useTrackerAccess();
  const { items, trackedKeys, moreToTrack, trackMore } = useTracker();
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

  // Signed in, free or paid: how much of the catalog has alerts. Short of all of it, the way to
  // cover the rest (spare room first, then the plan that covers everything, by its price per
  // import); all of it, a well done
  const n = (count: number) => count.toLocaleString("en-US");
  const paid = access.kind === "paid";
  const imports = items.length;
  const withAlerts = Math.min(trackedKeys.size, imports);
  const off = imports - withAlerts;
  const coverAll = TRACKER_PLANS.find((p) => imports <= p.maxPairs && p.maxPairs > access.pairLimit);
  const perImport = coverAll ? perImportPrice(coverAll) : null;
  const launch = launchPricingActive();
  // Room on the plan, even when the imports left out were turned off by the user
  const room = Math.max(0, access.pairLimit - trackedKeys.size);

  // The admin previewing a trial stage (?trialPreview=): say so, and the way out
  const previewNote = access.preview && (
    <a href="?trialPreview=off" className="-mt-1 text-xs font-semibold text-warning hover:underline">
      Previewing &ldquo;{access.preview}&rdquo; · Stop
    </a>
  );

  // On the 14-day trial: the countdown, and what its end takes away, in their own numbers. Before
  // the first imports, all 14 days are still waiting for them.
  const trial = trialState(access);
  if (trial.notStarted) {
    return (
      <div className={BOX}>
        {previewNote}
        <div className="flex items-center justify-between gap-2">
          <span className={tt.eyebrow("primary")}>Free Trial</span>
          <span className="text-xs font-semibold tabular-nums text-base-content/70">{REVERSE_TRIAL.days} days</span>
        </div>
        <DaysLeft left={REVERSE_TRIAL.days} ending={false} />
        <span className="text-sm leading-snug text-base-content/75">
          Your {REVERSE_TRIAL.days}-day trial starts when you add your imports. Every day of it is yours.
        </span>
        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openImportTakeover("plan-card")}>
          Add my imports
        </button>
      </div>
    );
  }
  if (trial.onTrial) {
    const plan = keepPlan(imports);
    return (
      <div className={BOX}>
        {previewNote}
        <div className="flex items-center justify-between gap-2">
          <span className={tt.eyebrow(trial.ending ? "warning" : "primary")}>Free Trial</span>
          <span className={`text-xs font-semibold tabular-nums ${trial.ending ? "text-warning" : "text-base-content/70"}`}>
            {trial.daysLeft !== null && trial.daysLeft <= 1 ? "Last day" : `${trial.daysLeft} of ${REVERSE_TRIAL.days} days left`}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <DaysLeft left={trialDaysRemaining(trial.daysLeft)} ending={trial.ending} />
          {endDate(access) && <span className="text-xs text-base-content/60">Trial ends {endDate(access)}</span>}
        </div>
        {imports > 0 && (
          <span className="text-sm leading-snug text-base-content/75">
            <span className="font-semibold text-warning">Upgrade to keep tariff alerts, savings detection, and audits for all your imports.
            </span>
          </span>
        )}
        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openUpgrade("plan")}>
          Keep everything{plan ? ` · ${formatPrice(plan.price)}/mo` : ""}
        </button>
        {/* The price per import: the easiest way to see what it's worth */}
        {plan && (
          <span className="-mt-1 text-center text-xs text-base-content/60">
            Just <span className="font-semibold text-success">{formatPrice(perImportPrice(plan))}</span> per import, per month
          </span>
        )}
        {/* {launch && <span className="text-center text-xs text-warning">Launch pricing ends {LAUNCH_PRICING.endsLabel}</span>} */}
      </div>
    );
  }

  return (
    <div className={BOX}>
      {previewNote}
      <span className={tt.eyebrow("success")}>{paid ? `Tracker ${n(access.pairLimit)}` : "Free plan"}</span>
      {trial.ended && <span className="-mt-2 text-xs text-base-content/60">Your free trial ended {endDate(access)}.</span>}
      {SAVINGS_ENABLED && !paid && <Allowance label="Savings checks" used={access.usage.savingsChecked.length} max={TRIAL_ALLOWANCE.savingsChecks} />}
      {AUDITS_ENABLED && !paid && <Allowance label="Audit checks" used={access.usage.auditsChecked.length} max={TRIAL_ALLOWANCE.auditChecks} />}

      {imports === 0 ? (
        <>
          <span className="text-sm leading-snug text-base-content/70">
            {paid
              ? `Add your imports and alerts cover up to ${n(access.pairLimit)}.`
              : "Alerts on your own imports come with a Tracker plan. Tariff News alerts stay free."}
          </span>
          {!paid && (
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openUpgrade("plan")}>
              See plans · from {formatPrice(LOWEST_PER_IMPORT)}/import
            </button>
          )}
        </>
      ) : off === 0 ? (
        // Every import covered: praise, and what's left on the plan
        <>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/70">Imports with alerts</span>
              <span className="font-semibold tabular-nums text-success">
                {n(withAlerts)} / {n(imports)}
              </span>
            </div>
            <Meter value={withAlerts} max={imports} tone="bg-success" />
          </div>
          <span className="flex items-start gap-2 text-sm leading-snug text-base-content">
            <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <span>
              <span className="font-semibold">All {n(imports)} imports covered.</span>{" "}
              <span className="text-base-content/70">You&apos;ll hear the day a tariff changes on any of them.</span>
            </span>
          </span>
          {access.pairLimit > imports && (
            <span className="text-xs text-base-content/60">
              Room for {n(access.pairLimit - imports)} more {paid ? "on your plan" : "free"}.
            </span>
          )}
        </>
      ) : (
        // Imports without alerts: what that means, and the way to cover them
        <>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-base-content/70">Imports with alerts</span>
              <span className="font-semibold tabular-nums text-base-content">
                {n(withAlerts)} / {n(imports)}
              </span>
            </div>
            <Meter value={withAlerts} max={imports} tone={withAlerts / imports >= 0.4 ? "bg-warning" : "bg-error"} />
          </div>
          <span className="text-sm leading-snug text-base-content/75">
            <span className="font-semibold text-error">
              {n(off)} {off === 1 ? "import has" : "imports have"} no alerts.
            </span>{" "}
            {room > 0 ? "Your plan has room for them." : "A tariff change on one could go unnoticed."}
          </span>
          {room > 0 ? (
            moreToTrack > 0 ? (
              <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={trackMore}>
                Turn on alerts for {n(moreToTrack)} more
              </button>
            ) : (
              <span className="text-xs text-base-content/60">You turned alerts off for these. Turn them back on in Your Imports.</span>
            )
          ) : moreToTrack > 0 ? (
            <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={trackMore}>
              Turn on alerts for {n(moreToTrack)} more
            </button>
          ) : (
            <>
              <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openUpgrade("tracking")}>
                {coverAll && perImport !== null ? `Cover all ${n(imports)} · ${formatPrice(perImport)}/import` : "Get alerts on more imports"}
              </button>
              {coverAll && launch && <span className="text-center text-xs text-warning">Launch pricing ends {LAUNCH_PRICING.endsLabel}</span>}
            </>
          )}
        </>
      )}
    </div>
  );
};
