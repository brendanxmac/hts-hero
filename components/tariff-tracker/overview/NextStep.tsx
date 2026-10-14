"use client";

import { ReactNode, useEffect, useState } from "react";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { useTrackerAccess } from "../access/accessContext";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { pathSteps, Step, StepId } from "./lib/steps";
import { readSeenSections } from "./seenSections";

// The path to lower duty, as a slim strip of its own under the story (DESIGN_SYSTEM.md §15): the
// next step up front with what it's worth and one button, then the whole path as a checklist, each
// step still to do saying what it would show and opening it in one click.

const R = 20;
const C = 2 * Math.PI * R;

// How much of the path is done, as a ring with the count inside
const ProgressRing = ({ done, total }: { done: number; total: number }) => (
  <div className="relative h-14 w-14 shrink-0" aria-label={`${done} of ${total} steps done`} role="img">
    <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90" aria-hidden>
      <circle cx="24" cy="24" r={R} fill="none" strokeWidth="5" className="stroke-base-300" />
      <circle
        cx="24"
        cy="24"
        r={R}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - done / Math.max(total, 1))}
        className="stroke-primary transition-[stroke-dashoffset] duration-700"
      />
    </svg>
    <span className={`${tt.display} absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-base-content`}>
      {done}/{total}
    </span>
  </div>
);

interface StepContent {
  title: string;
  body: string;
  // Under the step in the checklist: what doing it would show
  payoff: string;
  action: ReactNode;
  go: () => void;
}

export const NextStep = () => {
  const { items, products } = useTracker();
  const insights = useInsights();
  const { signedIn, paid, access, savingsLeft, auditsLeft, unlock, unlockLabel } = useTrackerAccess();
  const nav = useTrackerNav();
  const [seen, setSeen] = useState<Set<string>>(new Set());
  useEffect(() => setSeen(readSeenSections()), [nav.tab]);

  const valuesSet = products.filter((p) => p.adjustments.customsValue !== undefined).length;
  const { steps, next } = pathSteps({
    products: items.length,
    valuesSet,
    savingsSeen: insights.unlocked.size > 0 && seen.has("savings"),
    entriesAudited: access.usage.auditsChecked.length > 0 || (paid && seen.has("entries")),
  });
  // Across the whole catalog, checked or not
  const potential = insights.savingsReady && insights.beyond.ready ? insights.totals.anyUsd + insights.beyond.anyUsd : null;
  const firstDefault = products.find((p) => p.adjustments.customsValue === undefined);
  const onEstimate = items.length - valuesSet;

  const openValues = () => (firstDefault ? nav.openProduct(firstDefault.key, false, "duty") : nav.openTab("catalog"));
  const openSavings = () => (signedIn ? nav.openTab("savings") : unlock("savings"));

  const content: Record<Exclude<StepId, "products">, StepContent> = {
    values: {
      title: "Set your product values",
      body: `${onEstimate.toLocaleString("en-US")} of your ${items.length.toLocaleString("en-US")} products use the $10,000 estimate. Your own values make every duty and potential saving yours.`,
      payoff: onEstimate > 0 ? `${onEstimate.toLocaleString("en-US")} still on the estimate` : "Every number is yours",
      go: openValues,
      action: (
        <button type="button" className={tt.button("next")} onClick={openValues}>
          Set values
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
          <button type="button" className={tt.button("money")} onClick={openSavings}>
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
          <button type="button" className={tt.button("next")} onClick={() => nav.openTab("entries")}>
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

  // A step in the checklist: done ones are quiet, the next one is marked, the rest open in a click
  const checklistStep = (step: Step) => {
    const c = step.id === "products" ? null : content[step.id];
    const isNext = step === next;
    const inner = (
      <>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            step.done ? "bg-success text-success-content" : isNext ? "bg-primary text-primary-content" : "bg-base-300 text-base-content/70"
          }`}
        >
          {step.done ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : step.number}
        </span>
        <span className="flex min-w-0 flex-col text-left">
          <span className={`text-sm font-semibold ${step.done ? "text-base-content/50 line-through decoration-base-content/30" : "text-base-content"}`}>
            {step.label}
          </span>
          {!step.done && c && <span className="truncate text-xs text-base-content/60">{c.payoff}</span>}
        </span>
      </>
    );
    if (step.done || !c)
      return (
        <li key={step.id} className="flex min-w-0 items-center gap-2.5 rounded-2xl px-3 py-2">
          {inner}
        </li>
      );
    return (
      <li key={step.id} className="min-w-0">
        <button
          type="button"
          onClick={c.go}
          className={`flex w-full min-w-0 items-center gap-2.5 rounded-2xl px-3 py-2 transition-colors hover:bg-tt-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
            isNext ? "bg-primary/5" : ""
          }`}
        >
          {inner}
        </button>
      </li>
    );
  };

  return (
    <section aria-label="Get more from your Tracker" className={`${tt.panel} flex flex-col gap-4 p-5 lg:px-6`}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <ProgressRing done={done} total={steps.length} />
        <div className="flex min-w-64 flex-1 flex-col gap-1">
          {current ? (
            <>
              <span className={tt.eyebrow("primary")}>Your next step</span>
              <h2 className={`${tt.display} m-0 text-lg font-semibold text-base-content`}>{current.title}</h2>
              <p className="m-0 text-sm leading-relaxed text-base-content/70">{current.body}</p>
            </>
          ) : (
            <>
              <span className={tt.eyebrow("success")}>All set up</span>
              <h2 className={`${tt.display} m-0 text-lg font-semibold text-base-content`}>You&apos;re getting everything the Tracker finds</h2>
              <p className="m-0 text-sm leading-relaxed text-base-content/70">
                Your products are in with your own values, your potential savings are in view and you&apos;ve audited your entries.
              </p>
            </>
          )}
        </div>
        {current && <div className="flex flex-wrap items-center gap-3">{current.action}</div>}
      </div>
      <ol className="m-0 grid list-none gap-1 border-t border-base-300 p-0 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map(checklistStep)}
      </ol>
    </section>
  );
};
