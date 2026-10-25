"use client";

import { useState } from "react";
import { CheckIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { useTrackerAccess } from "../../access/accessContext";
import { useInsights } from "../../insights/InsightsContext";
import { formatRate } from "../../formatRate";
import { TrackedProduct } from "../../report";

// A product's Savings before they're unlocked: what a check found (as a rate, not the how), what
// the check includes, and the check itself: one of the trial's savings checks, or a plan
// (PRICING.md). Savings are only ever potential.

const INCLUDES = [
  "Every trade program this import could claim, and whether you could qualify",
  "Exemptions worth checking, with the condition each one needs",
  "Cheaper countries to source it from, that already make it for the US",
  "Each option side by side with what you pay today, line by line",
  "A record of each saving as you research it and secure it",
];

export const LockedSavings = ({ product }: { product: TrackedProduct }) => {
  const { paid, savingsLeft, spendCheck, openUpgrade } = useTrackerAccess();
  const { lockedBest } = useInsights();
  const [busy, setBusy] = useState(false);
  const found = lockedBest.get(product.key);
  const free = !paid && savingsLeft > 0;

  const check = async () => {
    if (!free) return openUpgrade("savings");
    setBusy(true);
    await spendCheck("savings", product.key, "savings");
    setBusy(false);
  };

  return (
    <section className={`${tt.panel} grid gap-8 p-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-8`} aria-labelledby="tt-locked-savings">
      <div className="flex flex-col gap-4">
        <span className={tt.eyebrow("success")}>Savings check</span>
        <h2 id="tt-locked-savings" className={`${tt.display} m-0 text-2xl font-semibold leading-snug text-base-content`}>
          {found === undefined
            ? "Looking for ways to pay less…"
            : found > 0.005
              ? (
                  <>
                    Up to <span className="text-success">{formatRate((found / product.customsValue) * 100)}</span> off the duty rate found on this import
                  </>
                )
              : "Check every way to pay less on this import"}
        </h2>
        <p className={tt.subtitle}>
          {found !== undefined && found > 0.005
            ? "We've found it. Run a savings check to see what it is, compare it with what you pay today, and what it takes to get it."
            : "A savings check goes through every trade program, exemption and country of origin for this import."}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={ui.button({ variant: "primary" })} disabled={busy} onClick={check}>
            {!free && <LockClosedIcon className="h-4 w-4" aria-hidden />}
            {busy ? "Checking…" : free ? "Check savings free" : paid ? "Cover this import" : "See plans"}
          </button>
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
