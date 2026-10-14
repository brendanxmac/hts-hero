"use client";

import { useMemo } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { wholeDollars } from "../insights/teasers";
import { useTracker } from "../TrackerContext";
import { useOpportunities } from "./OpportunitiesContext";
import { tallyOpportunities } from "./tallies";

// The catalog's savings so far: what's been secured and what's being worked on, per year (each
// product's shipments a year). Nothing until a saving is tracked.
export const SavingsTally = () => {
  const { opportunities, loading } = useOpportunities();
  const { itemFor } = useTracker();
  const tally = useMemo(() => tallyOpportunities(opportunities, (key) => itemFor(key)?.shipmentsPerYear ?? 1), [opportunities, itemFor]);
  if (loading || !opportunities.length) return null;
  return (
    <section className={`${tt.panel} grid gap-4 p-5 sm:grid-cols-3`} aria-label="Your savings so far">
      <div className="flex flex-col gap-1">
        <span className={tt.eyebrow("success")}>Secured</span>
        <span className={`${tt.metric} text-success`}>{wholeDollars(tally.secured.perYear)}</span>
        <span className="text-xs text-base-content/60">
          a year, from {tally.secured.count} {tally.secured.count === 1 ? "saving" : "savings"} applied to your imports
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className={tt.eyebrow("primary")}>In progress</span>
        <span className={tt.metric}>{wholeDollars(tally.pipeline.perYear)}</span>
        <span className="text-xs text-base-content/60">
          a year, if they come through: {tally.pipeline.count} being researched or worked on
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className={tt.eyebrow()}>Ruled out</span>
        <span className={tt.metric}>{tally.notEligible.toLocaleString("en-US")}</span>
        <span className="text-xs text-base-content/60">kept for the record, with the reason</span>
      </div>
    </section>
  );
};
