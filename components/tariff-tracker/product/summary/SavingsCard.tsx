"use client";

import { useState } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { TRIAL_ALLOWANCE } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "../../access/accessContext";
import { formatRate } from "../../formatRate";
import { useInsights } from "../../insights/InsightsContext";
import { wholeDollars } from "../../insights/teasers";
import { useOpportunities } from "../../opportunities/OpportunitiesContext";
import { isQuickWin, REVIEW_LABELS } from "../../opportunities/review";
import { isOpen } from "../../opportunities/statuses";
import { TrackedProduct } from "../../report";
import { SummaryCard } from "./SummaryCard";

// The product's savings at a glance: where its review stands, the open quick wins and the best
// way to source it elsewhere (each as what it takes off the rate), and what's being worked on and
// secured. Before a savings check, what one found and the check itself.
export const SavingsCard = ({ product, onOpen }: { product: TrackedProduct; onOpen: () => void }) => {
  const insights = useInsights();
  const { opportunities } = useOpportunities();
  const { paid, savingsLeft, spendCheck, openUpgrade } = useTrackerAccess();
  const [busy, setBusy] = useState(false);
  const review = insights.review.get(product.key) ?? "unchecked";
  const chip = <span className={tt.chip(REVIEW_LABELS[review].tone)}>{REVIEW_LABELS[review].label}</span>;

  if (!insights.unlocked.has(product.key)) {
    const found = insights.lockedBest.get(product.key);
    const free = !paid && savingsLeft > 0;
    const check = async () => {
      if (!free) return openUpgrade("savings");
      setBusy(true);
      await spendCheck("savings", product.key, "savings");
      setBusy(false);
    };
    return (
      <SummaryCard title="Savings" chip={chip}>
        <p className="m-0 text-sm text-base-content/70">
          {found && found > 0.005 ? (
            <>
              Up to <span className="font-semibold text-success">{wholeDollars(found)}</span> less per shipment found on this import.
            </>
          ) : (
            "Check every trade program, exemption and country of origin for this import."
          )}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={tt.button("money", "sm")} disabled={busy} onClick={check}>
            {busy ? "Checking…" : free ? "Check savings free" : "See plans"}
          </button>
          {free && <span className="text-xs text-base-content/60">{savingsLeft} of {TRIAL_ALLOWANCE.savingsChecks} free checks left</span>}
        </div>
      </SummaryCard>
    );
  }

  const open = insights.savings.get(product.key) ?? [];
  const quick = open.filter((s) => isQuickWin(s.kind)).slice(0, 3);
  const sourcing = open.find((s) => s.kind === "origin");
  const mine = opportunities.filter((o) => o.productKey === product.key);
  const working = mine.filter((o) => isOpen(o.status) && o.status !== "found").length;
  const secured = mine.filter((o) => o.status === "secured").length;

  return (
    <SummaryCard title="Savings" chip={chip} link={{ label: "Review savings", onClick: onOpen }}>
      {quick.length ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {quick.map((s) => (
            <li key={`${s.kind}:${s.ref}`} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-base-content">{s.title}</span>
              <span className="shrink-0 font-semibold tabular-nums text-success">−{formatRate(s.pts)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-sm text-base-content/70">
          {review === "reviewed" ? "Quick wins explored: none left open." : "No quick wins on this import."}
        </p>
      )}
      {sourcing && (
        <p className="m-0 rounded-2xl bg-tt-soft px-3 py-2 text-sm text-base-content/70">
          <span className="font-semibold text-base-content">Longer term:</span> {sourcing.title} could take{" "}
          <span className="font-semibold text-success">{formatRate(sourcing.pts)}</span> off the rate.
        </p>
      )}
      <p className="m-0 text-xs text-base-content/60">
        {working} being worked on · {secured} secured
      </p>
    </SummaryCard>
  );
};
