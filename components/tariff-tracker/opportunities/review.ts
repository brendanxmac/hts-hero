import { Saving, SavingKind } from "../insights/savings";
import { Opportunity } from "./OpportunitiesContext";
import { isOpen } from "./statuses";

// Where each import's savings review stands. The quick wins (trade programs and exemptions) are
// what a review is about: once each one is secured or ruled out, the import is reviewed. Sourcing
// it somewhere else is a separate, longer-term track (a new supplier, the goods made elsewhere:
// slow, costly and risky), so open sourcing options never hold a review back, and ruling out the
// quick wins never means there's nothing left to save.
//
// - unchecked: its savings aren't unlocked yet (no savings check)
// - to_review: checked, nothing decided
// - in_progress: a saving is being researched or worked on, or some quick wins are still open
// - reviewed: every quick win is secured or ruled out (or there were none)

export type ReviewState = "unchecked" | "to_review" | "in_progress" | "reviewed";

export const QUICK_WINS: SavingKind[] = ["program", "exemption"];

export const isQuickWin = (kind: SavingKind) => QUICK_WINS.includes(kind);

export const opportunityKey = (productKey: string, kind: SavingKind, ref: string) => `${productKey}|${kind}:${ref}`;

export const reviewOf = (unlocked: boolean, savings: Pick<Saving, "kind" | "ref">[], opportunities: Pick<Opportunity, "kind" | "optionRef" | "status">[]): ReviewState => {
  if (!unlocked) return "unchecked";
  const statusOf = new Map(opportunities.map((o) => [`${o.kind}:${o.optionRef}`, o.status]));
  const quick = savings.filter((s) => isQuickWin(s.kind));
  const decided = quick.filter((s) => {
    const status = statusOf.get(`${s.kind}:${s.ref}`);
    return status !== undefined && !isOpen(status);
  });
  if (decided.length === quick.length) return "reviewed";
  if (decided.length > 0 || opportunities.some((o) => isOpen(o.status) && o.status !== "found")) return "in_progress";
  return "to_review";
};

export interface ReviewStats {
  total: number;
  checked: number;
  reviewed: number;
  inProgress: number;
}

export const reviewStats = (states: ReviewState[]): ReviewStats => ({
  total: states.length,
  checked: states.filter((s) => s !== "unchecked").length,
  reviewed: states.filter((s) => s === "reviewed").length,
  inProgress: states.filter((s) => s === "in_progress").length,
});

export const REVIEW_LABELS: Record<ReviewState, { label: string; tone: "neutral" | "primary" | "warning" | "success" }> = {
  unchecked: { label: "Not checked", tone: "neutral" },
  to_review: { label: "To review", tone: "primary" },
  in_progress: { label: "Reviewing", tone: "warning" },
  reviewed: { label: "Reviewed", tone: "success" },
};
