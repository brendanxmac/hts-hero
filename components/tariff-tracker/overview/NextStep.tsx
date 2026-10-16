"use client";

import { ReactNode, useEffect, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { useTrackerAccess } from "../access/accessContext";
import { useAlertSettings } from "../alerts/AlertSettingsContext";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { pathSteps, Step, StepId } from "./lib/steps";
import { readSeenSections } from "./seenSections";

// The path to lower duty, as one slim row under the news (DESIGN_SYSTEM.md §15): the whole path
// as a small track beside "Your next step" (each step still to do opens in a click), the next
// step's title and what it's worth on one line, and one button.

interface StepContent {
  title: string;
  body: string;
  // Under the step in the checklist: what doing it would show
  payoff: string;
  action: ReactNode;
  go: () => void;
}

export const NextStep = () => {
  const { items, products, trackedKeys } = useTracker();
  const alerts = useAlertSettings();
  const insights = useInsights();
  const { signedIn, paid, access, savingsLeft, auditsLeft, unlock, unlockLabel } = useTrackerAccess();
  const nav = useTrackerNav();
  const [seen, setSeen] = useState<Set<string>>(new Set());
  useEffect(() => setSeen(readSeenSections()), [nav.tab]);

  const valuesSet = products.filter((p) => p.adjustments.customsValue !== undefined).length;
  const { steps, next } = pathSteps({
    products: items.length,
    valuesSet,
    alertsSet: signedIn && alerts.on,
    savingsSeen: insights.unlocked.size > 0 && seen.has("savings"),
    entriesAudited: access.usage.auditsChecked.length > 0 || (paid && seen.has("entries")),
  });
  // Across the whole catalog, checked or not
  const potential = insights.savingsReady && insights.beyond.ready ? insights.totals.anyUsd + insights.beyond.anyUsd : null;
  const firstDefault = products.find((p) => p.adjustments.customsValue === undefined);
  const onEstimate = items.length - valuesSet;

  const openValues = () => (firstDefault ? nav.openProduct(firstDefault.key, false, "duty") : nav.openTab("catalog"));
  const openSavings = () => (signedIn ? nav.openTab("savings") : unlock("savings"));
  const openAlerts = () => (signedIn ? nav.openTab("alerts") : unlock("alerts"));
  const covered = trackedKeys.size;

  const content: Record<Exclude<StepId, "products">, StepContent> = {
    values: {
      title: "Set your import values",
      body: `${onEstimate.toLocaleString("en-US")} of your ${items.length.toLocaleString("en-US")} imports use the default $10,000 estimate. Your own values make every duty and potential saving yours.`,
      payoff: onEstimate > 0 ? `${onEstimate.toLocaleString("en-US")} still on the estimate` : "Every number is yours",
      go: openValues,
      action: (
        <button type="button" className={ui.button({ variant: "primary" })} onClick={openValues}>
          Set import values
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      ),
    },
    alerts: {
      title: "Set up your tariff alerts",
      // Signed out nothing is covered yet, so it speaks to every import
      body: `Say where to tell you when a tariff changes on ${!signedIn || covered === 0 || covered === items.length ? "your" : `${covered.toLocaleString("en-US")} of your`
        } ${items.length.toLocaleString("en-US")} imports: email, Slack or Microsoft Teams.`,
      payoff: "Hear about a change the day it's published",
      go: openAlerts,
      action: (
        <button type="button" className={ui.button({ variant: "primary" })} onClick={openAlerts}>
          {signedIn ? "Set up alerts" : unlockLabel}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      ),
    },
    savings: {
      title: "See your potential savings",
      body:
        potential !== null && potential > 0
          ? `Up to ${wholeDollars(potential)} per shipment across ${(insights.totals.productsWithSavings + insights.beyond.productsWithSavings).toLocaleString("en-US")} products, if you qualify: trade programs and lower-duty origins.`
          : "Trade programs and lower-duty origins for every product, in dollars.",
      payoff: potential !== null && potential > 0 ? `Up to ${wholeDollars(potential)} per shipment spotted` : "Programs and cheaper origins",
      go: openSavings,
      action: (
        <>
          <button type="button" className={ui.button({ variant: "primary" })} onClick={openSavings}>
            {!signedIn ? unlockLabel : paid || savingsLeft === 0 ? "See potential savings" : "Check savings free"}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
          {signedIn && !paid && savingsLeft > 0 && (
            <span className="text-sm text-base-content/60">
              {savingsLeft} free {savingsLeft === 1 ? "check" : "checks"} left
            </span>
          )}
        </>
      ),
    },
    audit: {
      title: "Audit your past entries",
      body: "Check an entry's duty against the rate in force that day, to spot a refund to request through your broker or an underpayment to fix.",
      payoff: "Find duty you may have overpaid",
      go: () => nav.openTab("entries"),
      action: (
        <>
          <button type="button" className={ui.button({ variant: "primary" })} onClick={() => nav.openTab("entries")}>
            Audit an entry
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
          {!paid && (
            <span className="text-sm text-base-content/60">
              {auditsLeft} free audit {auditsLeft === 1 ? "check" : "checks"} left
            </span>
          )}
        </>
      ),
    },
  };

  const done = steps.filter((s) => s.done).length;
  const current = next && next.id !== "products" ? content[next.id as keyof typeof content] : null;

  // A step on the track in the header: done ones are a green check, the suggested one a cobalt
  // dot, the rest an open ring that opens in a click (its payoff in the tooltip)
  const trackStep = (step: Step, i: number) => {
    const c = step.id === "products" ? null : content[step.id];
    const isNext = step === next;
    const inner = (
      <>
        {/* No numbers: past adding imports, the steps can be done in any order */}
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-success text-success-content" : isNext ? "bg-primary ring-4 ring-primary/15" : "border-2 border-base-300"
            }`}
          aria-hidden
        >
          {step.done && <CheckIcon className="h-3 w-3" />}
        </span>
        <span
          className={`whitespace-nowrap text-xs font-semibold ${step.done ? "text-base-content/50 line-through decoration-base-content/30" : isNext ? "text-primary" : "text-base-content/70"
            }`}
        >
          {step.label}
        </span>
        {step.done && <span className="sr-only">(done)</span>}
      </>
    );
    return (
      <li key={step.id} className="flex items-center gap-1.5">
        {i > 0 && <span className={`h-px w-4 ${step.done || isNext ? "bg-primary/40" : "bg-base-300"}`} aria-hidden />}
        {step.done || !c || isNext ? (
          <span className="flex items-center gap-1.5 px-1 py-0.5" aria-current={isNext ? "step" : undefined}>
            {inner}
          </span>
        ) : (
          <button
            type="button"
            onClick={c.go}
            title={c.payoff}
            className="flex items-center gap-1.5 rounded-full px-1 py-0.5 transition-colors hover:bg-tt-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {inner}
          </button>
        )}
      </li>
    );
  };

  return (
    <section aria-label="Get more from your Tracker" className={`${tt.panel} flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 lg:px-6`}>
      <div className="flex min-w-64 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {current ? (
            <span className={tt.eyebrow("primary")}>Your next step</span>
          ) : (
            <span className={tt.eyebrow("success")}>All set up</span>
          )}
          <ol className="m-0 flex list-none flex-wrap items-center gap-1.5 p-0" aria-label={`${done} of ${steps.length} steps done`}>
            {steps.map(trackStep)}
          </ol>
        </div>
        {current ? (
          <p className="m-0 min-w-0 text-sm leading-snug text-base-content/70">
            <span className={`${tt.display} font-semibold text-base-content`}>{current.title}.</span> {current.body}
          </p>
        ) : (
          <p className="m-0 text-sm leading-snug text-base-content/70">
            <span className={`${tt.display} font-semibold text-base-content`}>You&apos;re getting everything the Tracker finds.</span> Your
            imports are in with your own values, alerts are set up, your potential savings are in view and you&apos;ve audited your entries.
          </p>
        )}
      </div>
      {current && <div className="flex flex-wrap items-center gap-3">{current.action}</div>}
    </section>
  );
};
