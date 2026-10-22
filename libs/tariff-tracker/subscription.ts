import Stripe from "stripe";
import { Billing } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";
import { TrackerPlan } from "./plan";
import { trackerPlanForPriceId, trackerPriceId } from "./prices";

// The customer's Tariff Tracker subscription in Stripe, and the billing portal's ways to change it.
// Server only.

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-09-30.endive",
    typescript: true,
  });

// What the plan card shows about a paid plan: when it renews, or ends (cancelled, still running),
// and whether the last payment failed
export interface TrackerSubscription {
  plan: PricingPlan;
  billing: Billing;
  status: Stripe.Subscription.Status;
  // The end of the current period: the next renewal, unless it's cancelled
  periodEnd: string | null;
  // Set when it's cancelled and runs to this date
  cancelsAt: string | null;
}

// The customer's live Tracker subscription (with its one item), or null
const findSubscription = async (customerId: string) => {
  const { data } = await stripe().subscriptions.list({ customer: customerId, status: "all", limit: 20 });
  for (const sub of data) {
    if (!["active", "trialing", "past_due", "unpaid"].includes(sub.status)) continue;
    const item = sub.items.data[0];
    const plan = item && (await trackerPlanForPriceId(item.price.id));
    if (plan) return { sub, item, ...plan };
  }
  return null;
};

const iso = (seconds: number | null | undefined) => (seconds ? new Date(seconds * 1000).toISOString() : null);

export const readTrackerSubscription = async (customerId: string): Promise<TrackerSubscription | null> => {
  const found = await findSubscription(customerId);
  if (!found) return null;
  const { sub, item, plan, billing } = found;
  const periodEnd = iso(item.current_period_end);
  return {
    plan,
    billing,
    status: sub.status,
    periodEnd,
    cancelsAt: sub.cancel_at ? iso(sub.cancel_at) : sub.cancel_at_period_end ? periodEnd : null,
  };
};

// The billing portal opened on a plan change: straight to Stripe's confirm page for `to` (on the
// same billing interval), else to its plan picker. Null when there's no subscription to change
// (or it's cancelled, which the portal can't update): the caller opens the portal's home instead.
export const trackerPlanChangeFlow = async (
  customerId: string,
  to: TrackerPlan["plan"] | null,
  returnUrl: string
): Promise<Stripe.BillingPortal.SessionCreateParams.FlowData[]> => {
  const found = await findSubscription(customerId);
  if (!found || found.sub.cancel_at_period_end || found.sub.cancel_at) return [];
  const after_completion = { type: "redirect" as const, redirect: { return_url: returnUrl } };
  const picker = { type: "subscription_update" as const, subscription_update: { subscription: found.sub.id }, after_completion };
  const price = to && to !== found.plan ? await trackerPriceId(to, found.billing) : undefined;
  if (!price) return [picker];
  return [
    {
      type: "subscription_update_confirm",
      subscription_update_confirm: { subscription: found.sub.id, items: [{ id: found.item.id, price, quantity: 1 }] },
      after_completion,
    },
    picker,
  ];
};
