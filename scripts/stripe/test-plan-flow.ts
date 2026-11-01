// Runs the plan changes against the Stripe sandbox and the dev database, with a real checkout first,
// and prints what the account's access becomes after each one. Needs the dev server and
// `stripe listen --forward-to localhost:3000/api/webhook/stripe` running. Refuses a live key.
//
//   npx tsx ... scripts/stripe/test-plan-flow.ts start               a test account and a checkout link
//   npx tsx ... scripts/stripe/test-plan-flow.ts run <user> <cus>    after paying: switches and cancel

import { createClient } from "@supabase/supabase-js";
import { readTrackerAccess } from "@/libs/tariff-tracker/access";
import { isLive, stripeClient } from "./offers";

const stripe = stripeClient();
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const priceFor = async (key: string) => (await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 })).data[0].id;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const show = async (step: string, userId: string) => {
  await wait(8000);
  const a = await readTrackerAccess(db, userId);
  console.log(`${step}: ${a.kind} ${a.paidPlan ?? "-"} · ${a.pairLimit} products · ${JSON.stringify(a.entitlements)}`);
};

const start = async () => {
  const email = `plan-flow-test+${Date.now()}@example.com`;
  const { data, error } = await db.auth.admin.createUser({ email, email_confirm: true });
  if (error) throw error;
  const customer = await stripe.customers.create({ email });
  await wait(1500);
  await db.from("users").update({ stripe_customer_id: customer.id }).eq("id", data.user.id);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customer.id,
    client_reference_id: data.user.id,
    line_items: [{ price: await priceFor("audits_10_monthly"), quantity: 1 }],
    success_url: "http://localhost:3000/",
    cancel_url: "http://localhost:3000/",
  });
  console.log(`user ${data.user.id}\ncustomer ${customer.id}\n${session.url}`);
};

const run = async (userId: string, customerId: string) => {
  await show("After checkout (Duty Guard Pro 10 monthly)", userId);
  const { data } = await stripe.subscriptions.list({ customer: customerId, limit: 1 });
  const sub = data[0];
  const change = async (key: string) => {
    const current = await stripe.subscriptions.retrieve(sub.id);
    await stripe.subscriptions.update(sub.id, { items: [{ id: current.items.data[0].id, price: await priceFor(key) }], proration_behavior: "always_invoice" });
  };
  await change("alerts_500_monthly");
  await show("Switched to Tariff Alerts Scale", userId);
  await change("audits_100_monthly");
  await show("Switched to Duty Guard Pro 100", userId);
  await change("audits_100_annual");
  await show("Monthly to annual", userId);
  const { data: rows } = await db.from("purchases").select("product_name, expires_at").eq("user_id", userId).order("created_at");
  console.log(rows);
  await stripe.subscriptions.cancel(sub.id);
  await show("Cancelled", userId);
};

if (isLive()) throw new Error("This is for the sandbox.");
const [command, ...args] = process.argv.slice(2);
(command === "run" ? run(args[0], args[1]) : start()).then(() => process.exit(0));
