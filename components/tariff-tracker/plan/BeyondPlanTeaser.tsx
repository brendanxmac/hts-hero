"use client";

import { LockClosedIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatMoney } from "@/components/duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { useInsights } from "../insights/InsightsContext";
import { useTrackerNav } from "../shell/TrackerNav";

// What unlocking the rest of the catalog could find: potential savings on the products whose
// savings aren't checked (or, on a plan, covered), worked out in the background (InsightsContext
// `beyond`), with the way to them: a free savings check while the trial has some, else a plan.
// Signed in only. Savings are only ever potential (PRICING.md).
export const BeyondPlanTeaser = ({ compact = false }: { compact?: boolean }) => {
  const { signedIn, paid, savingsLeft, openUpgrade } = useTrackerAccess();
  const { beyond } = useInsights();
  const nav = useTrackerNav();
  if (!signedIn || beyond.productsWithSavings === 0) return null;
  const products = beyond.productsWithSavings.toLocaleString("en-US");
  const free = !paid && savingsLeft > 0;
  return (
    <section
      aria-label="Savings on imports you haven't unlocked"
      className={`${tt.panel} flex ${compact ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between"} gap-4 p-5`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
          <LockClosedIcon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-semibold text-base-content">
            {beyond.anyUsd > 0.005 ? (
              <>
                Up to <span className="text-success">{formatMoney(beyond.anyUsd)}</span> more in potential savings per shipment
              </>
            ) : (
              "More potential savings"
            )}
          </p>
          <p className="m-0 mt-0.5 text-sm text-base-content/70">
            Found on {products} {beyond.productsWithSavings === 1 ? "import" : "imports"}{" "}
            {paid ? "your plan doesn't cover" : "you haven't checked"}
            {beyond.ready ? "" : " so far"}.{" "}
            {free
              ? `You have ${savingsLeft} free savings ${savingsLeft === 1 ? "check" : "checks"} left.`
              : paid
                ? "Cover them to see what they are."
                : "A plan checks every import it covers."}
          </p>
        </div>
      </div>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "sm" })} ${compact ? "self-start" : ""}`}
        onClick={() => (free ? nav.openTab("savings") : openUpgrade("savings"))}
      >
        {free ? "Check savings free" : paid ? "Cover more imports" : "See plans"}
      </button>
    </section>
  );
};
