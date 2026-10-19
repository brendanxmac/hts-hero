// Checks the Stripe account in STRIPE_SECRET_KEY is set up for the Tariff Tracker plans
// (libs/tariff-tracker/prices.ts): each tier's lookup key finds an active monthly price at the
// listed amount, and that price maps back to its plan. Read only.
//
//   TSX_TSCONFIG_PATH=tsconfig.scripts.json npx tsx --env-file=.env.local scripts/stripe/check-tracker-prices.ts
//
// For live mode, run it with the live key (e.g. a .env.production.local with STRIPE_SECRET_KEY).

import { TRACKER_PLANS } from "@/libs/tariff-tracker/plan";
import { trackerLookupKey, trackerPlanForPriceId, trackerPriceId } from "@/libs/tariff-tracker/prices";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-09-30.endive", typescript: true });

const main = async () => {
  const mode = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "LIVE" : "test";
  console.log(`Stripe ${mode} mode\n`);
  let ok = true;
  for (const { plan, price } of TRACKER_PLANS) {
    const key = trackerLookupKey(plan, "monthly");
    const id = await trackerPriceId(plan, "monthly");
    if (!id) {
      console.log(`✗ ${plan}: no active price with lookup key ${key}`);
      ok = false;
      continue;
    }
    const p = await stripe.prices.retrieve(id);
    const back = await trackerPlanForPriceId(id);
    const problems = [
      p.unit_amount !== price * 100 && `costs $${(p.unit_amount ?? 0) / 100}, the site says $${price}`,
      p.recurring?.interval !== "month" && "isn't monthly",
      back?.plan !== plan && `metadata.plan is "${p.metadata?.plan ?? ""}", should be "${plan}"`,
    ].filter(Boolean);
    ok &&= problems.length === 0;
    console.log(`${problems.length ? "✗" : "✓"} ${plan}: ${key} → ${id}${problems.length ? ` (${problems.join("; ")})` : ""}`);
  }
  console.log(ok ? "\nAll Tracker prices are set up." : "\nFix the ✗ lines in Stripe.");
  process.exit(ok ? 0 : 1);
};

main();
