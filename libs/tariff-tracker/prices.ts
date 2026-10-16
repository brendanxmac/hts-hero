import Stripe from "stripe";
import { Billing } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";
import { isTrackerPlan, TRACKER_PLANS, TrackerPlan } from "./plan";

// Stripe prices for the Tariff Tracker plans. Server only.
//
// Each tier is one Stripe product ("Tariff Tracker · 10 imports"); each version of its price is a
// price under it. The current price carries the lookup key tracker_<10|30|100|500>_<monthly|annual>,
// and every price carries metadata.plan (the PricingPlan, e.g. "Tariff Tracker 10") and
// metadata.billing. To change a price: create the new one under the same product with the same
// lookup key and "transfer lookup key" on, then archive the old one. Checkout picks the new price
// up by its lookup key, and subscribers still on an old price keep mapping to their plan by its
// metadata. No env vars to change. Add the new price to the "Tariff Tracker" billing portal
// configuration too (metadata.app = tracker, libs/stripe.ts), so customers can switch to it.
//
// STRIPE_TARIFF_TRACKER_<10|30|100|500>_<MONTHLY|ANNUAL>_PRICE_ID still works as an override
// (comma-separated: the first is used for checkout, every one maps to the plan).

const stripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-05-28.basil",
    typescript: true,
  });

const size = (plan: TrackerPlan["plan"]) => plan.split(" ").pop();

const envIds = (plan: TrackerPlan["plan"], billing: Billing) =>
  (process.env[`STRIPE_TARIFF_TRACKER_${size(plan)}_${billing.toUpperCase()}_PRICE_ID`] ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

export const trackerLookupKey = (plan: TrackerPlan["plan"], billing: Billing) => `tracker_${size(plan)}_${billing}`;

// The price a new checkout uses
export const trackerPriceId = async (plan: TrackerPlan["plan"], billing: Billing): Promise<string | undefined> => {
  const [override] = envIds(plan, billing);
  if (override) return override;
  const { data } = await stripe().prices.list({ lookup_keys: [trackerLookupKey(plan, billing)], active: true, limit: 1 });
  return data[0]?.id;
};

// The plan and billing a Stripe price is for (any version, archived or not)
const known = new Map<string, { plan: PricingPlan; billing: Billing } | null>();

export const trackerPlanForPriceId = async (priceId: string): Promise<{ plan: PricingPlan; billing: Billing } | null> => {
  if (!priceId) return null;
  for (const { plan } of TRACKER_PLANS) {
    for (const billing of ["monthly", "annual"] as const) {
      if (envIds(plan, billing).includes(priceId)) return { plan, billing };
    }
  }
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
