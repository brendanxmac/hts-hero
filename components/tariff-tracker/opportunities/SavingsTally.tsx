"use client";

import { useMemo } from "react";
import { StatStrip } from "@/components/ui/StatStrip";
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
    <StatStrip
      label="Your savings so far"
      stats={[
        {
          label: "Secured",
          value: wholeDollars(tally.secured.perYear),
          tone: "success",
          note: `a year, from ${tally.secured.count} ${tally.secured.count === 1 ? "saving" : "savings"} applied to your imports`,
        },
        {
          label: "In progress",
          value: wholeDollars(tally.pipeline.perYear),
          note: `a year, if they come through: ${tally.pipeline.count} being researched or worked on`,
        },
        { label: "Ruled out", value: tally.notEligible.toLocaleString("en-US"), note: "kept for the record, with the reason" },
      ]}
    />
  );
};
