import { Billing } from "@/components/pricing-calculator/lib/pricing";
import { PricingPlan } from "@/types";
import { TRACKER_PLANS, TrackerPlan } from "./plan";

// Stripe prices for the Tariff Tracker plans, monthly and annual. Server only (env vars).
// Placeholders until the prices exist in Stripe: set STRIPE_TARIFF_TRACKER_<10|30|100|500>_<MONTHLY|ANNUAL>_PRICE_ID.

const envName = (plan: TrackerPlan["plan"], billing: Billing) =>
  `STRIPE_TARIFF_TRACKER_${plan.split(" ").pop()}_${billing.toUpperCase()}_PRICE_ID`;

export const trackerPriceId = (plan: TrackerPlan["plan"], billing: Billing): string | undefined =>
  process.env[envName(plan, billing)];

// The plan and billing a Stripe price is for
export const trackerPlanForPriceId = (priceId: string): { plan: PricingPlan; billing: Billing } | null => {
  for (const { plan } of TRACKER_PLANS) {
    for (const billing of ["monthly", "annual"] as const) {
      if (priceId && trackerPriceId(plan, billing) === priceId) return { plan, billing };
    }
  }
  return null;
};
