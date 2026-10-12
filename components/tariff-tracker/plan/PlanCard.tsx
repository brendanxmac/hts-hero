"use client";

import Link from "next/link";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { TRIAL_DAYS, TRACKER_TIERS, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath, signupHref } from "../access/signup";
import { useTracker } from "../TrackerContext";

// The plan at the foot of the sidebar (dark in both modes): what it is, how much is used, and
// the next step up. Always in view, so more value is never more than a click away.

const BOX = "flex flex-col gap-3 rounded-2xl bg-tt-side-card p-4";

const Meter = ({ value, max }: { value: number; max: number }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-base-content/15" aria-hidden>
    {/* Runtime width (DESIGN_SYSTEM §10) */}
    <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
  </div>
);

export const PlanCard = () => {
  const { loading, signedIn, access, canStartTrial, daysLeft, openTrial, openUpgrade } = useTrackerAccess();
  const { items } = useTracker();
  if (loading) return <div className={`${ui.skeleton} h-32 w-full`} />;

  const tracked = Math.min(items.length, access.pairLimit);
  const fromPrice = formatPrice(TRACKER_TIERS[0].price);

  if (!signedIn) {
    return (
      <div className={BOX}>
        <span className={tt.eyebrow("primary")}>Save your catalog</span>
        <span className={`${tt.display} text-base font-semibold leading-snug`}>Keep your products and unlock Analysis</span>
        <Link href={signupHref(currentPath())} className={tt.button("next", "sm")}>
          Create free account
        </Link>
      </div>
    );
  }

  if (access.kind === "trial") {
    const used = TRIAL_DAYS - daysLeft;
    return (
      <div className={BOX}>
        <div className="flex items-center justify-between">
          <span className={tt.eyebrow("success")}>Trial</span>
          <span className="text-xs text-base-content/70">
            {daysLeft} {daysLeft === 1 ? "day" : "days"} left
          </span>
        </div>
        <div className="flex gap-1" aria-label={`${used} of ${TRIAL_DAYS} trial days used`}>
          {Array.from({ length: TRIAL_DAYS }, (_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i < used ? "bg-success" : "bg-base-content/15"}`} />
          ))}
        </div>
        <span className={`${tt.display} text-base font-semibold leading-snug`}>Keep watching all {items.length || ""} products</span>
        <button type="button" className={tt.button("money", "sm")} onClick={() => openUpgrade("plan")}>
          See plans
        </button>
      </div>
    );
  }

  if (access.kind === "paid") {
    const nearLimit = items.length >= access.pairLimit * 0.8;
    return (
      <div className={BOX}>
        <span className={tt.eyebrow("success")}>Tracker {access.pairLimit}</span>
        <span className="text-xs text-base-content/70">
          {tracked.toLocaleString("en-US")} of {access.pairLimit.toLocaleString("en-US")} products tracked
        </span>
        <Meter value={tracked} max={access.pairLimit} />
        {nearLimit && (
          <button type="button" className={tt.button("secondary", "sm")} onClick={() => openUpgrade("tracking")}>
            Track more products
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={BOX}>
      <span className={tt.eyebrow("warning")}>Free plan</span>
      <span className={`${tt.display} text-base font-semibold leading-snug`}>
        {tracked} of {items.length || access.pairLimit} products tracked
      </span>
      <Meter value={tracked} max={Math.max(items.length, access.pairLimit)} />
      {canStartTrial ? (
        <button type="button" className={tt.button("money", "sm")} onClick={() => openTrial("plan")}>
          Try everything for {TRIAL_DAYS} days
        </button>
      ) : (
        <button type="button" className={tt.button("money", "sm")} onClick={() => openUpgrade("plan")}>
          Track them all · from {fromPrice}/mo
        </button>
      )}
    </div>
  );
};
