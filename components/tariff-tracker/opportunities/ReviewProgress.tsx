"use client";

import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { useInsights } from "../insights/InsightsContext";

// How much of the catalog has been reviewed for savings: the share of imports whose quick wins
// are all secured or ruled out (review.ts), as one number and a bar split into reviewed, being
// reviewed, checked but not started, and not checked yet. Nothing until there are products.

const SEGMENTS = [
  { key: "reviewed", label: "Reviewed", className: "bg-success" },
  { key: "inProgress", label: "Reviewing", className: "bg-warning" },
  { key: "toReview", label: "Checked, to review", className: "bg-primary" },
  { key: "unchecked", label: "Not checked", className: "bg-base-300" },
] as const;

export const ReviewProgress = ({ action }: { action?: { label: string; onClick: () => void } }) => {
  const { reviewStats: stats } = useInsights();
  if (!stats.total) return null;
  const counts = {
    reviewed: stats.reviewed,
    inProgress: stats.inProgress,
    toReview: stats.checked - stats.reviewed - stats.inProgress,
    unchecked: stats.total - stats.checked,
  };
  const share = Math.round((stats.reviewed / stats.total) * 100);

  return (
    <section className={`${tt.panel} flex flex-col gap-4 p-5`} aria-label="Imports reviewed for savings">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className={tt.eyebrow("success")}>Savings review</span>
          <p className="m-0 mt-1 flex items-baseline gap-2">
            <span className={tt.metric}>{share}%</span>
            <span className="text-sm text-base-content/70">
              of your imports reviewed · {stats.reviewed.toLocaleString("en-US")} of {stats.total.toLocaleString("en-US")}
            </span>
          </p>
        </div>
        {action && (
          <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" aria-hidden>
        {SEGMENTS.filter((s) => counts[s.key] > 0).map((s) => (
          // Runtime width (DESIGN_SYSTEM §10)
          <div key={s.key} className={`h-full ${s.className}`} style={{ width: `${(counts[s.key] / stats.total) * 100}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-base-content/70">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-xs ${s.className}`} aria-hidden />
            {s.label} <span className="font-semibold tabular-nums text-base-content">{counts[s.key].toLocaleString("en-US")}</span>
          </span>
        ))}
      </div>
      <p className="m-0 text-xs text-base-content/60">
        An import is reviewed once each of its quick wins (trade programs and exemptions) is secured or ruled out. Sourcing it
        elsewhere is a longer-term option, and doesn&apos;t count against it.
      </p>
    </section>
  );
};
