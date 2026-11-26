"use client";

import type { Billing } from "@/components/pricing-calculator/lib/pricing";
import type { TrackerPlan } from "@/libs/tariff-tracker/plan";

// Opens Stripe's checkout for a Duty Guard plan (signed in; the server adds a running sale's coupon
// to an annual plan). `cancelUrl` is where Stripe's back link returns, this page by default.
// Throws with the server's reason when checkout can't open.
export const startCheckout = async (plan: Pick<TrackerPlan, "plan">, billing: Billing, cancelUrl = window.location.href) => {
  const res = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId: plan.plan, billing, cancelUrl }),
  });
  const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!res.ok || !body.url) throw new Error(body.error ?? "Checkout isn't available right now.");
  window.location.href = body.url;
};
