// The Duty Guard plans as Stripe should have them: 8 products, 16 prices. Shared
// by setup-offers.ts (creates them) and check-tracker-prices.ts (checks them).

import { ALERT_TIERS, AUDIT_TIERS, monthlyRate } from "@/components/pricing-calculator/lib/pricing";
import Stripe from "stripe";

export const stripeClient = () => new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-09-30.endive", typescript: true });

export const isLive = () => !!process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_");

export const PRICE_VERSION = "2026-10";

// The billing portal configuration Duty Guard opens (metadata.app, libs/stripe.ts)
export const PORTAL_APP = "tracker";

export const OFFERS = [
  { offer: "alerts", title: "Duty Guard Essentials", tiers: ALERT_TIERS },
  { offer: "audits", title: "Duty Guard Pro", tiers: AUDIT_TIERS },
] as const;

export const BILLINGS = ["monthly", "annual"] as const;

export const offerProducts = () =>
  OFFERS.flatMap(({ offer, title, tiers }) =>
    tiers.map((tier) => ({
      offer,
      plan: `${title} ${tier.maxPairs}`,
      size: tier.maxPairs,
      description: `Up to ${tier.maxPairs} products. A product is one HTS code from one country of origin.`,
      prices: BILLINGS.map((billing) => ({
        billing,
        lookupKey: `${offer}_${tier.maxPairs}_${billing}`,
        // Annual is the rounded-down monthly rate, charged once a year
        amount: (billing === "annual" ? monthlyRate(tier.price, "annual") * 12 : tier.price) * 100,
        interval: billing === "annual" ? ("year" as const) : ("month" as const),
      })),
    })),
  );
