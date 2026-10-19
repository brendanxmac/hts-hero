"use client";

import { useMemo } from "react";
import { todayIso } from "../../duty-calculator/lib/format";
import { addDays } from "../../../tariffs/engine-v2/history";
import { setActionReviewed, useCatalog } from "../catalogStore";
import { useImportMatches } from "../news/useImportMatches";
import { useTariffUpdates, type TrackerUpdate } from "../overview/useTariffUpdates";
import { useTracker } from "../TrackerContext";

// Impact checks to review: the tariff actions that affect, or may affect, the user's imports with
// alerts on (confirmed by the duty engine, or naming their code and country), from the last
// REVIEW_DAYS or still to take effect. The user marks one reviewed once they've looked at what it
// does to their imports; the mark is kept on each import it touches (adjustments.ts `reviewed`),
// so it syncs with the account, and an import added later is still to review for an older action.
// HTS revisions aren't checked (they carry out actions listed on their own).

export const REVIEW_DAYS = 90;

export interface ActionToReview {
  update: TrackerUpdate;
  // The imports with alerts on that it affects or may affect
  keys: string[];
}

export const useActionReviews = () => {
  const { adjustments } = useCatalog();
  const { trackedKeys } = useTracker();
  const updates = useTariffUpdates("all");
  const matches = useImportMatches(updates);
  const today = todayIso();

  return useMemo(() => {
    const since = addDays(today, -REVIEW_DAYS);
    const reviewedOn = (slug: string, keys: string[]) => {
      const days = keys.map((k) => adjustments[k]?.reviewed?.[slug]);
      return keys.length && days.every(Boolean) ? (days as string[]).sort().pop()! : null;
    };
    const due: ActionToReview[] = (updates ?? [])
      .filter((u) => u.kind !== "hts_revision" && (u.last_activity_at.slice(0, 10) >= since || (!!u.effective_on && u.effective_on > today)))
      .map((u) => ({ update: u, keys: (matches.get(u.slug)?.keys ?? []).filter((k) => trackedKeys.has(k)) }))
      .filter((a) => a.keys.length > 0);
    const outstanding = due.filter((a) => !reviewedOn(a.update.slug, a.keys));
    return {
      ready: updates !== null,
      due,
      outstanding,
      // The day an action was marked reviewed on all the given imports, or null
      reviewedOn,
      mark: (slug: string, keys: string[], on: boolean) => setActionReviewed(slug, keys, on),
    };
  }, [updates, matches, trackedKeys, adjustments, today]);
};
