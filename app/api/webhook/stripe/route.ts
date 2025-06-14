import { findCheckoutSession } from "@/libs/stripe";
import { SupabaseClient, UserResponse } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PricingPlan } from "../../../../types";
import { getIsoDateInFuture } from "../../../../utilities/time";
import { createPurchase } from "../../../../libs/supabase/purchase";
import {
  fetchUserProfile,
  fetchUserProfileByEmail,
  updateUserProfile,
  UserProfile,
} from "../../../../libs/supabase/user";

const getExpirationDate = (plan: PricingPlan) => {
  if (plan === PricingPlan.ONE_DAY_PASS) {
    return getIsoDateInFuture(1);
  }
  if (plan === PricingPlan.FIVE_DAY_PASS) {
    return getIsoDateInFuture(5);
  }
};

export const getPlanFromPriceId = (priceId: string) => {
  if (priceId === process.env.STRIPE_ONE_DAY_PASS_PRICE_ID) {
    return PricingPlan.ONE_DAY_PASS;
  }
  if (priceId === process.env.STRIPE_FIVE_DAY_PASS_PRICE_ID) {
    return PricingPlan.FIVE_DAY_PASS;
  }
  return null;
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = headers().get("stripe-signature");

  let stripeEvent: Stripe.Event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const eventType = stripeEvent.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = stripeEvent.data
          .object as Stripe.Checkout.Session;

        console.log("UserId from Stripe:", stripeObject.client_reference_id);

        const session = await findCheckoutSession(stripeObject.id);

        // console.log("Stripe Session:", session);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        const plan = getPlanFromPriceId(priceId);

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        // console.log("Customer:", customer);

        if (!plan) {
          console.error("Plan not found for priceId: ", priceId);
          break;
        }

        let user: UserProfile | null = null;

        if (!userId) {
          console.log("No userId found, checking if user already exists");
          // check if user already exists
          const userProfile = await fetchUserProfileByEmail(customer.email);

          if (userProfile) {
            console.log("User already exists:", userProfile.email);
            user = userProfile;
          } else {
            console.log("User does not exist, creating new user");
            const { data, error } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            console.log("User created:", data);
            console.log(data.user);

            if (error) {
              console.error("Failed to create user:", error);
              break;
            }

            console.log("Fetching user PROFILE by email");

            user = await fetchUserProfileByEmail(customer.email);
            console.log("User profile:", user);
          }
        } else {
          console.log(
            "UserId included in stripe response - Fetching user PROFILE by userId"
          );
          user = await fetchUserProfile(userId);
        }

        if (!user) {
          console.error("User not found");
          throw new Error(
            `Failed to set user on purchase -- userId: ${userId} -- email: ${customer.email}`
          );
        }

        console.log("creating purchase for user:");

        const purchase = await createPurchase({
          user_id: user.id,
          customer_id: customerId as string,
          price_id: priceId,
          product_name: plan,
          expires_at: getExpirationDate(plan),
        });

        console.log("Purchase created:", purchase);

        // TODO: Send Thank you email to user for their purchase
        // Include instructions to have them sign in with THIS email they're
        // receiving this email at (either w/ google or magic link)

        // Extra: send email with user link, product page, etc...
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case "checkout.session.expired": {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case "customer.subscription.updated": {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        // The customer subscription stopped
        // ❌ Revoke access to the product
        // const stripeObject: Stripe.Subscription = stripeEvent.data
        //   .object as Stripe.Subscription;
        // const subscription = await stripe.subscriptions.retrieve(
        //   stripeObject.id
        // );
        // await supabase
        //   .from("users")
        //   .update({ has_access: false }) // TODO: this does not exist, need to update
        //   .eq("stripe_customer_id", subscription.customer);
        break;
      }

      case "invoice.paid": {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        // const stripeObject: Stripe.Invoice = stripeEvent.data
        //   .object as Stripe.Invoice;
        // const priceId = stripeObject.lines.data[0].price.id;
        // const customerId = stripeObject.customer;

        // // Find profile where customer_id equals the customerId (in table called 'users')
        // const { data: profile } = await supabase
        //   .from("users")
        //   .select("*")
        //   .eq("stripe_customer_id", customerId)
        //   .single();

        // // Make sure the invoice is for the same plan (priceId) the user subscribed to
        // if (profile.price_id !== priceId) break;

        // // Grant the profile access to your product. It's a boolean in the database, but could be a number of credits, etc...
        // await supabase
        //   .from("users")
        //   .update({ has_access: true })
        //   .eq("stripe_customer_id", customerId);

        break;
      }

      case "invoice.payment_failed":
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error(`stripe ${eventType} webhook handling error:`, e.message);
  }

  return NextResponse.json({});
}
