// Sets up the Stripe account in STRIPE_SECRET_KEY for the Duty Guard plans:
// 8 products, 16 prices, and the "tracker" billing portal configuration listing them. Safe to run
// again: what's already there is left alone, and a price that differs stops the run.
//
//   TSX_TSCONFIG_PATH=tsconfig.scripts.json npx tsx --env-file=.env.local scripts/stripe/setup-offers.ts [--archive-old]
//
// --archive-old also archives the old Duty Guard prices (tracker_* lookup keys). Their
// subscribers, if any, keep paying them. A live key needs --live as well.

import Stripe from "stripe";
import { isLive, offerProducts, PORTAL_APP, PRICE_VERSION, stripeClient } from "./offers";

const stripe = stripeClient();
const args = process.argv.slice(2);

const allProducts = async () => {
  const products: Stripe.Product[] = [];
  for await (const product of stripe.products.list({ active: true, limit: 100 })) products.push(product);
  return products;
};

const main = async () => {
  if (isLive() && !args.includes("--live")) {
    console.log("That's a live key. Add --live to run against live Stripe.");
    process.exit(1);
  }
  console.log(`Stripe ${isLive() ? "LIVE" : "test"} mode\n`);

  const existing = await allProducts();
  const portalProducts: Stripe.BillingPortal.ConfigurationUpdateParams.Features.SubscriptionUpdate.Product[] = [];

  for (const { offer, plan, size, description, prices } of offerProducts()) {
    let product = existing.find((p) => p.metadata?.plan === plan);
    if (product) console.log(`= ${plan}: ${product.id}`);
    else {
      product = await stripe.products.create({ name: plan, description, metadata: { offer, plan, size: String(size) } });
      console.log(`+ ${plan}: ${product.id}`);
    }

    const priceIds: string[] = [];
    for (const { billing, lookupKey, amount, interval } of prices) {
      const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
      let price = data[0];
      if (price && (price.unit_amount !== amount || price.recurring?.interval !== interval || price.product !== product.id)) {
        console.log(`✗ ${lookupKey} is ${price.id} at ${price.unit_amount}/${price.recurring?.interval}, should be ${amount}/${interval}. Stopping.`);
        process.exit(1);
      }
      if (price) console.log(`  = ${lookupKey}: ${price.id}`);
      else {
        price = await stripe.prices.create({
          product: product.id,
          currency: "usd",
          unit_amount: amount,
          recurring: { interval },
          lookup_key: lookupKey,
          metadata: { plan, billing, version: PRICE_VERSION },
        });
        console.log(`  + ${lookupKey}: ${price.id}`);
      }
      priceIds.push(price.id);
    }
    portalProducts.push({ product: product.id, prices: priceIds });
  }

  const features: Stripe.BillingPortal.ConfigurationUpdateParams.Features = {
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      products: portalProducts,
      // Upgrades invoice now; downgrades wait for the period's end
      proration_behavior: "always_invoice",
      schedule_at_period_end: { conditions: [{ type: "decreasing_item_amount" }, { type: "shortening_interval" }] },
    },
    subscription_cancel: { enabled: true, mode: "at_period_end" },
    payment_method_update: { enabled: true },
    invoice_history: { enabled: true },
  };
  const { data: portals } = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const portal = portals.find((c) => c.metadata?.app === PORTAL_APP);
  if (portal) {
    await stripe.billingPortal.configurations.update(portal.id, { features });
    console.log(`\n~ Billing portal ${portal.id} updated`);
  } else {
    const created = await stripe.billingPortal.configurations.create({
      name: "Duty Guard",
      business_profile: {},
      features: features as Stripe.BillingPortal.ConfigurationCreateParams.Features,
      metadata: { app: PORTAL_APP },
    });
    console.log(`\n+ Billing portal ${created.id} created`);
  }

  if (args.includes("--archive-old")) {
    const keys = [10, 30, 100, 500].flatMap((size) => [`tracker_${size}_monthly`, `tracker_${size}_annual`]);
    const { data } = await stripe.prices.list({ lookup_keys: keys, active: true, limit: 100 });
    for (const price of data) {
      await stripe.prices.update(price.id, { active: false });
      console.log(`- Archived ${price.lookup_key}: ${price.id}`);
    }
    console.log(`${data.length} old price(s) archived.`);
  }
};

main();
