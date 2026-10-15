"use client";

import { useEffect, useState } from "react";
import type { TrackerUpdate } from "../overview/useTariffUpdates";

// For the admin only (everyone else gets a 404 and sees nothing more): the tariff updates still
// in review, and where each update's impact check stands (/api/tariff-updates/review-list)

export interface ImpactCheck {
  approvedAt: string | null;
  alerted: number | null;
  eligible: boolean;
  inReview: boolean;
  hidden: boolean;
}

interface ReviewList {
  pending: TrackerUpdate[];
  checks: Record<string, ImpactCheck>;
}

let cache: Promise<ReviewList | null> | null = null;

export const useReviewList = (signedIn: boolean) => {
  const [list, setList] = useState<ReviewList | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    cache ??= fetch("/api/tariff-updates/review-list")
      .then((r) => (r.ok ? (r.json() as Promise<ReviewList>) : null))
      .catch((): null => null);
    cache.then((l) => !cancelled && setList(l));
    return () => {
      cancelled = true;
    };
  }, [signedIn]);
  return list;
};
