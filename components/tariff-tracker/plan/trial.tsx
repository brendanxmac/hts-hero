"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  ArrowRightIcon,
  BellSlashIcon,
  BoltIcon,
  ChartBarIcon,
  CheckIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ScaleIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import { formatPrice, LAUNCH_PRICING, launchPricingActive, perImportPrice, REVERSE_TRIAL } from "@/components/pricing-calculator/lib/pricing";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { TRACKER_PLANS, TrackerAccess, trialDaysLeft, trialNotStarted } from "@/libs/tariff-tracker/plan";
import { useTrackerAccess } from "../access/accessContext";
import { UpgradeStats, useUpgradeStats } from "../access/upgradeStats";
import { useTracker } from "../TrackerContext";

// The 14-day reverse trial (PRICING.md): everything, on up to REVERSE_TRIAL.imports imports, then
// the free plan (no alerts on the user's own imports). As it ends, and once it has, the Tracker
// shows what the account loses (alerts, AD/CVD alerts included, and impact checks on all its imports,
// Insights, auditing and savings detection), next to what stays free (the
// AD/CVD check itself is free with any account, so only its alerts and updates are lost). Loss
// sells harder than gain: the plan card counts down, a banner and this dialog say what goes.

// The days before the end when the trial starts saying so
export const TRIAL_ENDING_DAYS = 3;

const n = (count: number) => count.toLocaleString("en-US");

export const trialState = (access: TrackerAccess, now = Date.now()) => {
  const daysLeft = trialDaysLeft(access, now);
  return {
    onTrial: access.kind === "trial",
    // Signed in with no imports yet: the 14 days start with the first ones
    notStarted: trialNotStarted(access),
    daysLeft,
    ending: access.kind === "trial" && daysLeft !== null && daysLeft <= TRIAL_ENDING_DAYS,
    // A free account whose trial has a date (the fallback when access fails to load has none), and
    // that never paid (a plan that ended says so instead: lapsed)
    ended: access.kind === "free" && access.trialEndsAt !== null && !access.pastPlan,
    // Was on a paid plan, and isn't any more
    lapsed: access.kind === "free" && Boolean(access.pastPlan),
  };
};

// When the trial ends, by the calendar: "today", "tomorrow", "in 3 days"
export const endsIn = (access: Pick<TrackerAccess, "trialEndsAt">, now = new Date()) => {
  if (!access.trialEndsAt) return "soon";
  const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((day(new Date(access.trialEndsAt)) - day(now)) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
};

export const endDate = (access: TrackerAccess) =>
  access.trialEndsAt ? new Date(access.trialEndsAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;

// The plan that would keep everything on the catalog
export const keepPlan = (imports: number) => TRACKER_PLANS.find((p) => imports <= p.maxPairs) ?? null;

// What the free plan takes away (the trial emails list the same five, TrialEmail.tsx), plus
// Insights, which locks in the app.
export const trialLosses = (stats: UpgradeStats | null) => {
  const flagged = stats?.adcvdFlagged ?? 0;
  return [
    {
      Icon: BellSlashIcon,
      title: "Tariff alerts on all your imports",
      body: "The day a new tariff hits one, with the rate before → after. Without them, a change could go unnoticed until it's on your customs bill.",
    },
    { Icon: BoltIcon, title: "Tariff impact checks on all your imports", body: "Exactly how each new tariff action hits each of your imports." },
    {
      Icon: ScaleIcon,
      title: "AD/CVD alerts and updates on all your imports",
      body:
        flagged > 0
          ? `An antidumping or countervailing case may cover ${n(flagged)} of your imports. You'd lose the heads-up when a case or its rates change. Checking an import for cases stays free.`
          : "A heads-up when an antidumping or countervailing case or new petition may cover one of your imports, or its rates change. Checking an import for cases stays free.",
    },
    { Icon: ChartBarIcon, title: "Insights across your catalog", body: "Where your duty comes from, what moved it, and your most exposed imports and countries." },
    {
      Icon: ClipboardDocumentCheckIcon,
      title: "Automatic auditing on your imports",
      body: "Every entry checked against the duty in force on its date, flagging possible over and underpayments.",
    },
    {
      Icon: SparklesIcon,
      title: "Automatic savings detection on all your imports",
      body: "Trade programs, exemptions and lower-duty origins your imports may qualify for.",
    },
  ];
};

// What every account keeps after the trial
export const FREE_FOREVER = [
  "Tariff News alerts on every new US tariff action",
  "Sourcing intelligence: insights, the globe, table and chart",
  "Your whole catalog, rate history and exports",
  "The Tariff Calculator, unlimited",
];

// The trial's loss, as a list
export const LossList = ({ stats }: { stats: UpgradeStats | null }) => (
  <ul className="m-0 flex list-none flex-col gap-3 p-0">
    {trialLosses(stats).map(({ Icon, title, body }) => (
      <li key={title} className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10 text-error" aria-hidden>
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-base-content">
            {title}
          </span>
          <span className="text-sm leading-snug text-base-content/65">{body}</span>
        </span>
      </li>
    ))}
  </ul>
);

const seen = (key: string) => {
  try {
    return window.localStorage.getItem(key) !== null;
  } catch {
    return false;
  }
};
const markSeen = (key: string) => {
  try {
    window.localStorage.setItem(key, "1");
  } catch {
    // Private mode: it shows again next time
  }
};

// Opens by itself once a day in the trial's last days, and once when it has ended (with imports
// to lose); "Keep everything" opens the plans
export const TrialDialog = () => {
  const { loading, signedIn, access, openUpgrade } = useTrackerAccess();
  const { items, loading: catalogLoading } = useTracker();
  const stats = useUpgradeStats();
  const [open, setOpen] = useState(false);
  const { ending, ended, daysLeft } = trialState(access);
  const imports = stats?.imports ?? items.length;
  const key = ended ? `tracker-trial-ended-${access.trialEndsAt}` : `tracker-trial-ending-${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    // A preview (access.preview) opens it every time
    if (loading || catalogLoading || !signedIn || !(ending || ended) || items.length === 0 || (seen(key) && !access.preview)) return;
    // After the page settles, not over its first paint
    const timer = setTimeout(() => {
      markSeen(key);
      setOpen(true);
      // Opened by the Tracker, not the user (trigger), so "Keep everything" counted after it isn't a second ask
      trackEvent(MixpanelEvent.TARIFF_TRACKER_UPGRADE_OPENED, { feature: "plan", from: ended ? "trial-ended" : "trial-ending", plan: access.kind, daysLeft, trigger: "auto" });
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading, catalogLoading, signedIn, ending, ended, items.length, key, access.preview]); // eslint-disable-line react-hooks/exhaustive-deps

  const plan = keepPlan(imports);
  const launch = launchPricingActive();
  const close = () => setOpen(false);
  const keep = () => {
    close();
    openUpgrade("plan");
  };

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel
          className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-y-auto p-6 shadow-2xl sm:p-7`}
        >
          <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content">
            <XMarkIcon className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <span className={`${tt.eyebrow(ended ? "error" : "warning")} inline-flex items-center gap-1.5`}>
                <ClockIcon className="h-4 w-4" aria-hidden />
                {ended ? `Free trial ended ${endDate(access) ?? ""}` : `Free trial ends ${endsIn(access)}`}
              </span>
              <Dialog.Title className={`${tt.display} m-0 pr-6 text-2xl font-semibold leading-tight text-base-content`}>
                {ended ? "Here's what your imports lost" : "Here's what you'll lose when your trial ends"}
              </Dialog.Title>
              {stats && stats.changes12m > 0 && (
                <p className="m-0 text-sm leading-relaxed text-base-content/70">
                  <span className="font-semibold text-error">
                    {n(stats.changes12m)} tariff {stats.changes12m === 1 ? "change" : "changes"} hit {n(stats.productsHit12m)} of your imports
                  </span>{" "}
                  in the last 12 months. {ended ? "None of them are watched now." : "After your trial, none of them will be watched."}
                </p>
              )}
            </div>

            <LossList stats={stats} />

            <div className={`${tt.tile} flex flex-col gap-2 p-4`}>
              <span className={tt.eyebrow("success")}>Free, forever</span>
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {FREE_FOREVER.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-base-content/75">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <button type="button" className={`${ui.button({ variant: "primary" })} w-full`} onClick={keep}>
                {ended ? "Get it all back" : "Keep everything"}
                {plan ? ` · ${formatPrice(plan.price)}/mo` : ""}
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </button>
              {plan && (
                <span className="text-center text-xs text-base-content/60">
                  Just <span className="font-semibold text-success">{formatPrice(perImportPrice(plan))}</span> per import, per month. Tracker {n(plan.maxPairs)}: up to{" "}
                  {n(plan.maxPairs)} imports, with auditing and savings detection included
                  {launch ? `. Launch price, locked in for good if you subscribe by ${LAUNCH_PRICING.endsDay}; prices go up after that` : ""}.
                </span>
              )}
              <button type="button" className="text-sm font-semibold text-base-content/60 hover:text-base-content" onClick={close}>
                {ended ? "Continue on the free plan" : "Remind me later"}
              </button>
            </div>
            <p className="m-0 text-center text-xs text-base-content/50">Cancel anytime. No contract. Your catalog stays free.</p>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

// For the plan card: the days left on the trial, within 0 and its length
export const trialDaysRemaining = (daysLeft: number | null) => Math.min(REVERSE_TRIAL.days, Math.max(0, daysLeft ?? 0));
