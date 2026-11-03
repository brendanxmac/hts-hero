"use client";

import { hasAudits } from "@/libs/tariff-tracker/plan";
import { useState } from "react";
import { ArrowRightIcon, CheckIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { useTrackerAccess } from "../../access/accessContext";
import { useInsights } from "../../insights/InsightsContext";
import { formatRate } from "../../formatRate";
import { TrackedProduct } from "../../report";
import { ListItem } from "./useSavingsItems";

// A product's Savings before the review has started: what a check found (as a rate, not the how),
// what the review covers, and the way in. Not checked yet, starting it spends one of the trial's
// savings checks, or takes a plan (PRICING.md); checked, it opens the review (SavingsReview).
// Savings are only ever potential.

const INCLUDES = [
  "Every trade program this import could claim, and whether you could qualify",
  "Exemptions worth checking, with the condition each one needs",
  "Cheaper countries to source it from, that already make it for the US",
  "One question at a time, Yes or No, with the rule each one turns on",
  "A summary of what you could save, and the next step for each saving",
];

export const LockedSavings = ({
  product,
  checked,
  items = [],
  onStart,
}: {
  product: TrackedProduct;
  // Its savings are unlocked: the review is ready to start
  checked: boolean;
  // Checked: its options, for what was found
  items?: ListItem[];
  onStart: () => void;
}) => {
  const { paid, access, savingsLeft, spendCheck, openUpgrade } = useTrackerAccess();
  const { lockedBest } = useInsights();
  const [busy, setBusy] = useState(false);
  const audits = hasAudits(access);
  const options = items.filter((i) => i.option).map((i) => i.option!);
  // Checked, the best of its options; before, nothing about what was found without Duty Guard Pro
  const foundPct = checked
    ? Math.max(0, ...options.map((o) => product.totalPct - o.ratePct))
    : audits
      ? ((lockedBest.get(product.key) ?? 0) / product.customsValue) * 100
      : 0;
  const loadingFound = !checked && audits && lockedBest.get(product.key) === undefined;
  const free = !paid && savingsLeft > 0;

  const start = async () => {
    if (checked) return onStart();
    if (!free) return openUpgrade("savings");
    setBusy(true);
    const ok = await spendCheck("savings", product.key, "savings");
    setBusy(false);
    if (ok) onStart();
  };

  return (
    <section className={`${tt.panel} grid gap-8 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-8`} aria-labelledby="tt-locked-savings">
      <div className="flex flex-col gap-4">
        <span className="flex flex-wrap items-center gap-2">
          <span className={tt.eyebrow("success")}>Savings Review</span>
          <span className={tt.chip("neutral")}>Not started</span>
        </span>
        <h2 id="tt-locked-savings" className={`${tt.display} m-0 text-2xl font-semibold leading-snug text-base-content`}>
          {loadingFound ? (
            "Looking for ways to pay less…"
          ) : foundPct > 0.005 ? (
            <>
              Up to <span className="text-success">{formatRate(foundPct)}</span> off the duty rate found on this import
            </>
          ) : (
            "Check every way to pay less on this import"
          )}
        </h2>
        <p className={tt.subtitle}>
          {checked
            ? `${options.length} ${options.length === 1 ? "way" : "ways"} to check. The review takes you through each one, then sums up what you could save and what to do next.`
            : foundPct > 0.005
              ? "We've found it. Start a savings review to see what it is, whether you could qualify, and what it takes to get it."
              : "A savings review goes through every trade program, exemption and country of origin for this import, one question at a time."}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={ui.button({ variant: "primary", size: "lg" })} disabled={busy} onClick={start}>
            {!checked && !free && <LockClosedIcon className="h-4 w-4" aria-hidden />}
            {busy ? "Checking…" : checked || free ? "Start Savings Review" : audits ? "Cover this import" : "Upgrade to Duty Guard Pro"}
            {(checked || free) && !busy && <ArrowRightIcon className="h-4 w-4" aria-hidden />}
          </button>
          {!checked && free && <span className="text-xs text-base-content/60">Uses one free savings check</span>}
        </div>
      </div>
      <ul className="flex flex-col gap-2.5 self-center">
        {INCLUDES.map((item) => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-base-content">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <CheckIcon className="h-3.5 w-3.5" aria-hidden />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
};
