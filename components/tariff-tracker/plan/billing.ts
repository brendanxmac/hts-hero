"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { TrackerPlan } from "@/libs/tariff-tracker/plan";
import type { TrackerSubscription } from "@/libs/tariff-tracker/subscription";

// The Tracker's Stripe billing portal (it switches between Tracker plans only). `changePlan` opens
// it on a plan change: Stripe's confirm page for that plan, or its plan picker for `true`.
export const openBillingPortal = async (changePlan?: TrackerPlan["plan"] | true) => {
  const res = await fetch("/api/stripe/create-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnUrl: window.location.href, app: "tracker", changePlan }),
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (body.url) window.location.href = body.url;
  else toast.error(body.error ?? "Billing isn't available right now.");
  return Boolean(body.url);
};

// The paid plan's subscription in Stripe (renewal, cancellation, a failed payment); null until
// loaded, or without one
export const useTrackerSubscription = (enabled: boolean) => {
  const [subscription, setSubscription] = useState<TrackerSubscription | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/tracker/subscription", { cache: "no-store" })
      .then((res): Promise<TrackerSubscription | null> | null => (res.ok ? res.json() : null))
      .then((sub) => {
        if (!cancelled) setSubscription(sub);
      })
      .catch((): void => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return enabled ? subscription : null;
};

export const shortDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
