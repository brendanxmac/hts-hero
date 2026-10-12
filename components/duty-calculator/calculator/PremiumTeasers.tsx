"use client";

import { ReactNode } from "react";
import { LockClosedIcon, SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { TRIAL_DAYS } from "@/components/pricing-calculator/lib/pricing";
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext";
import { PremiumFeature } from "@/components/tariff-tracker/access/features";
import { currentPath, signupHref } from "@/components/tariff-tracker/access/signup";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { HistorySegment } from "@/tariffs/engine-v2/history";
import { formatDate, formatMoney } from "../lib/format";

// Premium offers teased in the calculator, which every Tariff Tracker plan (and the trial)
// includes: checking whether the goods qualify for an exemption or trade program, and checking
// past entries for a refund. In the Tracker, the next step is its own (start the trial, or pick a
// plan); on the free calculator's pages, a free account first.

const usePremiumUnlock = (feature: PremiumFeature, page: string) => {
  const access = useOptionalTrackerAccess();
  const premium = Boolean(access?.premium);
  // Nothing to pay yet: a free account then the trial (signed out), or the trial
  const free = !access || !access.signedIn || access.canStartTrial;
  const note = !access || !access.signedIn
    ? `Free account (less than 30 seconds), then try it free for ${TRIAL_DAYS} days. No credit card.`
    : access.canStartTrial
      ? `Free for ${TRIAL_DAYS} days with the Tariff Tracker trial. No credit card.`
      : "Included in every Tariff Tracker plan.";
  const unlock = () => {
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature, reason: access?.access.kind ?? "anonymous", page });
    if (access) access.unlock(feature);
    else window.location.href = signupHref(currentPath());
  };
  return { premium, free, note, unlock };
};

const TeaserCard = ({
  feature,
  page,
  title,
  body,
  fact,
  cta,
}: {
  feature: PremiumFeature;
  page: string;
  title: string;
  body: string;
  // A real number from this import, when there is one
  fact?: ReactNode;
  // The button: what the visitor gets, in their words (the access step is in the note under it)
  cta: string;
}) => {
  const { premium, note, unlock } = usePremiumUnlock(feature, page);
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <div>
            <h4 className="text-sm font-semibold text-base-content">{title}</h4>
            <p className={`${ui.caption} mt-0.5 leading-snug`}>{body}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[0.7rem] font-semibold text-primary">
          <LockClosedIcon className="h-3 w-3" aria-hidden />
          Tariff Tracker
        </span>
      </div>
      {fact && <p className="text-sm text-base-content">{fact}</p>}
      {premium ? (
        // Included in the user's plan; the check itself is still being built (PRE_DEPLOY.md)
        <p className={ui.caption}>Coming soon to your plan.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} w-full sm:w-auto sm:min-w-[20rem] sm:self-start`} onClick={unlock}>
            {cta}
          </button>
          <span className={ui.caption}>{note}</span>
        </div>
      )}
    </div>
  );
};

// Under the possible adjustments: the guided check that works out which of them should apply (the
// paid tier; visitors see each adjustment's amount, free accounts what each would change)
export const QualifyTeaser = ({ page, bestSaving }: { page: string; bestSaving: number }) => (
  <TeaserCard
    feature="qualify"
    page={page}
    title="Find out which of these apply to your imports"
    cta={bestSaving < -0.005 ? `See if I can save up to ${formatMoney(Math.abs(bestSaving))}` : "Find out what I qualify for"}
    body="Step through a short, guided check about your goods. We work out which of these exemptions and trade programs should apply, and the proof you'd need to claim them."
    fact={
      bestSaving < -0.005 ? (
        <>
          The adjustments above could lower this duty by up to <b className="text-success">{formatMoney(Math.abs(bestSaving))}</b>, if your goods qualify.
        </>
      ) : undefined
    }
  />
);

// A row's own link to the same: on each adjustment that could save money
export const QualifyLink = ({ page }: { page: string }) => {
  const { premium, free, note, unlock } = usePremiumUnlock("qualify", page);
  if (premium) return null;
  // A paid feature, but free to try: it says so, so it doesn't read as a paywall; the lock is for
  // a plan to pick
  return (
    <button
      type="button"
      title={note}
      className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
      onClick={(e) => {
        e.preventDefault();
        unlock();
      }}
    >
      {!free && <LockClosedIcon className="h-3 w-3" aria-hidden />}
      <span className="underline-offset-2 group-hover:underline">Check if you qualify</span>
      {free && <span className="rounded-full bg-primary/10 px-1.5 py-px text-[0.7rem] font-semibold">Free trial</span>}
    </button>
  );
};

// Under the duty over time: check what was paid on past entries
export const RefundTeaser = ({ page, history, customsValue }: { page: string; history: HistorySegment[]; customsValue: number }) => {
  const today = new Date().toISOString().slice(0, 10);
  const past = history.filter((s) => s.from <= today);
  const current = past[past.length - 1];
  const peak = past.reduce<HistorySegment | undefined>((a, b) => (!a || b.result.totalDuty > a.result.totalDuty ? b : a), undefined);
  const over = peak && current ? peak.result.totalDuty - current.result.totalDuty : 0;
  return (
    <TeaserCard
      feature="refunds"
      page={page}
      title="Check if you might qualify for a refund"
      cta="Check my past entries for a refund"
      body="Enter what you paid on a past entry of this import. We'll compare it with the duty in force on its entry date: a refund you could ask your broker to request, or an underpayment to correct."
      fact={
        over > 0.005 && peak ? (
          <>
            On {formatMoney(customsValue)} of goods, this import paid up to <b className="text-warning">{formatMoney(over)}</b> more from {formatDate(peak.from)} than it does
            today. Entries from then are worth checking.
          </>
        ) : undefined
      }
    />
  );
};
