import Stripe from "stripe";
import { Billing } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";
import { isTrackerPlan, TRACKER_PLANS, TrackerPlan } from "./plan";

// Stripe prices for the Duty Guard plans. Server only.
//
// Each plan is one Stripe product ("Duty Guard Pro 100"); each version of its price is a price under
// it. The current price carries the lookup key <alerts|audits>_<10|25|100|500>_<monthly|annual>, and
// every price carries metadata.plan (the PricingPlan), metadata.billing and metadata.version. To
// change a price: create the new one under the same product with the same lookup key and "transfer
// lookup key" on, then archive the old one. Checkout picks the new price up by its lookup key, and
// subscribers still on an old price keep mapping to their plan by its metadata, as do the old
// Duty Guard prices. Add the new price to the billing portal configuration too (metadata.app =
// tracker, libs/stripe.ts): npm run stripe:setup-offers sets all of this up.

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-09-30.endive",
    typescript: true,
  });

export const trackerLookupKey = (plan: TrackerPlan, billing: Billing) => `${plan.offer}_${plan.maxPairs}_${billing}`;

// The price a new checkout uses
export const trackerPriceId = async (plan: TrackerPlan["plan"], billing: Billing): Promise<string | undefined> => {
  const tier = TRACKER_PLANS.find((p) => p.plan === plan);
  if (!tier) return undefined;
  const { data } = await stripe().prices.list({ lookup_keys: [trackerLookupKey(tier, billing)], active: true, limit: 1 });
  return data[0]?.id;
};

// The plan and billing a Stripe price is for (any version, archived or not)
const known = new Map<string, { plan: PricingPlan; billing: Billing } | null>();

export const trackerPlanForPriceId = async (priceId: string): Promise<{ plan: PricingPlan; billing: Billing } | null> => {
  if (!priceId) return null;
  if (known.has(priceId)) return known.get(priceId)!;
  let found: { plan: PricingPlan; billing: Billing } | null = null;
  try {
    const price = await stripe().prices.retrieve(priceId);
    const plan = price.metadata?.plan;
    if (plan && isTrackerPlan(plan)) {
      const billing: Billing = price.metadata?.billing === "annual" || price.recurring?.interval === "year" ? "annual" : "monthly";
      found = { plan, billing };
    }
  } catch (e) {
    console.error("Couldn't read Stripe price", priceId, e);
    return null;
  }
  known.set(priceId, found);
  return found;
};
