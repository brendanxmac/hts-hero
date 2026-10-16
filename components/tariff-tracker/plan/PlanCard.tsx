"use client";

import Link from "next/link";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { TRACKER_TIERS, TRIAL_ALLOWANCE, formatPrice } from "@/components/pricing-calculator/lib/pricing";
import { useTrackerAccess } from "../access/accessContext";
import { currentPath, signupHref } from "../access/signup";
import { useTracker } from "../TrackerContext";
import { AUDITS_ENABLED, SAVINGS_ENABLED } from "@/libs/tariff-tracker/features";

// The plan at the foot of the sidebar (dark in both modes): what it is, how much of it is used
// (on the trial, each allowance), and the next step up. Always in view, so more value is never more than a click away.

const BOX = "flex flex-col gap-3 rounded-2xl bg-tt-side-card p-4";

const Meter = ({ value, max }: { value: number; max: number }) => (
  <div className="h-1.5 overflow-hidden rounded-full bg-base-content/15" aria-hidden>
    {/* Runtime width (DESIGN_SYSTEM §10) */}
    <div className="h-full rounded-full bg-warning" style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
  </div>
);

// One allowance on the trial: how much of it is used
const Allowance = ({ label, used, max }: { label: string; used: number; max: number }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between text-xs">
      <span className="text-base-content/70">{label}</span>
      <span className="font-semibold tabular-nums text-base-content">
        {Math.min(used, max)} / {max}
      </span>
    </div>
    <Meter value={used} max={max} />
  </div>
);

export const PlanCard = () => {
  const { loading, signedIn, access, openUpgrade } = useTrackerAccess();
  const { items, trackedKeys } = useTracker();
  if (loading) return <div className={`${ui.skeleton} h-32 w-full`} />;

  const fromPrice = formatPrice(TRACKER_TIERS[0].price);

  if (!signedIn) {
    return (
      <div className={BOX}>
        <span className={tt.eyebrow("primary")}>Save your imports</span>
        <span className={`${tt.display} text-base font-semibold leading-snug`}>Keep your products and unlock Analysis</span>
        <Link href={signupHref(currentPath())} className={ui.button({ variant: "primary", size: "sm" })}>
          Create free account
        </Link>
      </div>
    );
  }

  if (access.kind === "paid") {
    // The plan's tracking slots: how many are in use, and how many are left (or how many imports
    // are left out, when the catalog is bigger than the plan)
    const tracked = Math.min(trackedKeys.size, access.pairLimit);
    const open = access.pairLimit - tracked;
    const untracked = Math.max(0, items.length - access.pairLimit);
    const n = (count: number) => count.toLocaleString("en-US");
    const nearLimit = items.length >= access.pairLimit * 0.8;
    return (
      <div className={BOX}>
        <span className={tt.eyebrow("success")}>Tracker {access.pairLimit}</span>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-base-content/70">Imports tracked</span>
            <span className="font-semibold tabular-nums text-base-content">
              {n(tracked)} / {n(access.pairLimit)}
            </span>
          </div>
          <Meter value={tracked} max={access.pairLimit} />
          <span className="text-xs text-base-content/60">
            {untracked > 0
              ? `${n(untracked)} ${untracked === 1 ? "import isn't" : "imports aren't"} tracked`
              : `${n(open)} more ${open === 1 ? "import" : "imports"} available to track`}
          </span>
        </div>
        {nearLimit && (
          <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openUpgrade("tracking")}>
            Track more imports
          </button>
        )}
      </div>
    );
  }

  // The usage-based trial: what's been used of each allowance (for the Tracker MVP, only the
  // imports tracked: alerts and impact checks run on those)
  return (
    <div className={BOX}>
      <span className={tt.eyebrow("success")}>Free plan</span>
      <div className="flex flex-col gap-2.5">
        {SAVINGS_ENABLED && <Allowance label="Savings checks" used={access.usage.savingsChecked.length} max={TRIAL_ALLOWANCE.savingsChecks} />}
        {AUDITS_ENABLED && <Allowance label="Audit checks" used={access.usage.auditsChecked.length} max={TRIAL_ALLOWANCE.auditChecks} />}
        <Allowance label="Imports tracked" used={trackedKeys.size} max={TRIAL_ALLOWANCE.alertImports} />
      </div>
      <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={() => openUpgrade("plan")}>
        Upgrade · from {fromPrice}/mo
      </button>
    </div>
  );
};
