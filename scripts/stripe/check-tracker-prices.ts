// Checks the Stripe account in STRIPE_SECRET_KEY is set up for the Duty Guard
// plans (scripts/stripe/offers.ts): each product exists, each lookup key finds an active price at
// the listed amount with its metadata, the billing portal lists all of them, and no old Duty Guard
// price can still be bought. Read only.
//
//   TSX_TSCONFIG_PATH=tsconfig.scripts.json npx tsx --env-file=.env.local scripts/stripe/check-tracker-prices.ts
//
// For live mode, run it with the live key (e.g. a .env.production.local with STRIPE_SECRET_KEY).

import { isLive, offerProducts, PORTAL_APP, PRICE_VERSION, stripeClient } from "./offers";

const stripe = stripeClient();

const main = async () => {
  console.log(`Stripe ${isLive() ? "LIVE" : "test"} mode\n`);
  let ok = true;
  const report = (name: string, problems: (string | false | null | undefined)[]) => {
    const found = problems.filter(Boolean);
    ok &&= found.length === 0;
    console.log(`${found.length ? "✗" : "✓"} ${name}${found.length ? ` (${found.join("; ")})` : ""}`);
  };

  const portalPrices: { product: string; prices: string[] }[] = [];
  for (const { plan, prices } of offerProducts()) {
    let productId: string | null = null;
    const ids: string[] = [];
    for (const { billing, lookupKey, amount, interval } of prices) {
      const { data } = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
      const price = data[0];
      if (!price) {
        report(`${plan} ${billing}`, [`no active price with lookup key ${lookupKey}`]);
        continue;
      }
      productId = price.product as string;
      ids.push(price.id);
      const product = await stripe.products.retrieve(productId);
      report(`${plan} ${billing}: ${lookupKey} → ${price.id}`, [
        price.unit_amount !== amount && `costs $${(price.unit_amount ?? 0) / 100}, should be $${amount / 100}`,
        price.recurring?.interval !== interval && `bills every ${price.recurring?.interval}, should be ${interval}`,
        price.metadata?.plan !== plan && `metadata.plan is "${price.metadata?.plan ?? ""}"`,
        price.metadata?.billing !== billing && `metadata.billing is "${price.metadata?.billing ?? ""}"`,
        price.metadata?.version !== PRICE_VERSION && `metadata.version is "${price.metadata?.version ?? ""}"`,
        product.name !== plan && `product is named "${product.name}"`,
        !product.active && "product is archived",
      ]);
    }
    if (productId) portalPrices.push({ product: productId, prices: ids });
  }

  const { data: portals } = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  const found = portals.find((c) => c.metadata?.app === PORTAL_APP);
  // The list leaves the plan-change products out unless they're asked for
  const portal = found && (await stripe.billingPortal.configurations.retrieve(found.id, { expand: ["features.subscription_update.products"] }));
  if (!portal) report("Billing portal", [`no active configuration with metadata.app = ${PORTAL_APP}`]);
  else {
    const { subscription_update: update, subscription_cancel: cancel } = portal.features;
    const listed = update.products ?? [];
    const missing = portalPrices.flatMap(({ product, prices }) => {
      const entry = listed.find((p) => p.product === product);
      return prices.filter((id) => !entry?.prices.includes(id));
    });
    report(`Billing portal ${portal.id}`, [
      !update.enabled && "plan changes are off",
      missing.length > 0 && `doesn't list ${missing.join(", ")}`,
      update.proration_behavior !== "always_invoice" && "upgrades don't invoice now",
      !update.schedule_at_period_end?.conditions?.some((c) => c.type === "decreasing_item_amount") && "downgrades don't wait for period end",
      cancel.mode !== "at_period_end" && "cancellations don't wait for period end",
    ]);
  }

  const oldKeys = [10, 30, 100, 500].flatMap((size) => [`tracker_${size}_monthly`, `tracker_${size}_annual`]);
  const { data: old } = await stripe.prices.list({ lookup_keys: oldKeys, active: true, limit: 100 });
  report("Old Duty Guard prices archived", old.map((p) => `${p.lookup_key} is still active`));

  console.log(ok ? "\nStripe is set up for the plans." : "\nFix the ✗ lines (npm run stripe:setup-offers).");
  process.exit(ok ? 0 : 1);
};

main();
