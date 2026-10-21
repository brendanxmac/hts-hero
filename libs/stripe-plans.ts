import { PricingPlan } from "@/types";
import { getIsoDateInFuture } from "@/utilities/time";
import { isTrackerPlan } from "@/libs/tariff-tracker/plan";
import { trackerPlanForPriceId } from "@/libs/tariff-tracker/prices";

// Which plan a Stripe price is for, and how long a payment for it lasts, for the Stripe webhook
// (app/api/webhook/stripe/route.ts). Kept out of the route so it can be tested.

// priceId: Tariff Tracker plans can be annual, which last a year
export const getPlanExpirationDate = async (plan: PricingPlan, priceId?: string) => {
  const tracker = priceId && isTrackerPlan(plan) ? await trackerPlanForPriceId(priceId) : null;
  if (tracker) return getIsoDateInFuture(tracker.billing === "annual" ? 366 : 31);
  switch (plan) {
    case PricingPlan.CLASSIFY_STARTER:
    case PricingPlan.CLASSIFY_PRO:
    case PricingPlan.TARIFF_IMPACT_STANDARD:
    case PricingPlan.TARIFF_IMPACT_PRO:
      return getIsoDateInFuture(31);
  }
};

// Tracker prices map by their Stripe metadata (libs/tariff-tracker/prices.ts), so every version of
// a Tracker price keeps working after a price change
export const getPlanFromPriceId = async (priceId: string): Promise<PricingPlan | null> => {
  if (!priceId) return null;
  switch (priceId) {
    case process.env.STRIPE_TARIFF_IMPACT_STANDARD_PRICE_ID:
      return PricingPlan.TARIFF_IMPACT_STANDARD;
    case process.env.STRIPE_TARIFF_IMPACT_PRO_PRICE_ID:
      return PricingPlan.TARIFF_IMPACT_PRO;
    case process.env.STRIPE_CLASSIFY_STARTER_PRICE_ID:
      return PricingPlan.CLASSIFY_STARTER;
    case process.env.STRIPE_CLASSIFY_PRO_PRICE_ID:
    case process.env.STRIPE_CLASSIFY_PRO_PRICE_ID_OLD:
      return PricingPlan.CLASSIFY_PRO;
  }
  // Anything else may be a Tracker price, any version (read from Stripe)
  return (await trackerPlanForPriceId(priceId))?.plan ?? null;
};
