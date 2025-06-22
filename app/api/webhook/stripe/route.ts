import { findCheckoutSession, StripePaymentMode } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PricingPlan } from "../../../../types";
import { getIsoDateInFuture } from "../../../../utilities/time";
import {
  createPurchase,
  getLatestPurchase,
} from "../../../../libs/supabase/purchase";
import {
  fetchUser,
  fetchUserByEmail,
  fetchUserByStripeCustomerId,
  updateUserProfile,
  UserProfile,
} from "../../../../libs/supabase/user";
import { sendPurchaseConfirmationEmail } from "../../../../emails/purchase-confirmation/purchase-confirmation-email";

const getPlanExpirationDate = (plan: PricingPlan) => {
  switch (plan) {
    case PricingPlan.ONE_DAY_PASS:
      return getIsoDateInFuture(1);
    case PricingPlan.FIVE_DAY_PASS:
      return getIsoDateInFuture(5);
    case PricingPlan.PRO:
    case PricingPlan.PREMIUM:
      return getIsoDateInFuture(31);
  }
};

const getPlanFromPriceId = (priceId: string): PricingPlan | null => {
  switch (priceId) {
    case process.env.STRIPE_ONE_DAY_PASS_PRICE_ID:
      return PricingPlan.ONE_DAY_PASS;
    case process.env.STRIPE_FIVE_DAY_PASS_PRICE_ID:
      return PricingPlan.FIVE_DAY_PASS;
    case process.env.STRIPE_PRO_PRICE_ID:
      return PricingPlan.PRO;
    case process.env.STRIPE_PREMIUM_PRICE_ID:
      return PricingPlan.PREMIUM;
    default:
      return null;
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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
        console.log("Stripe Checkout Session Completed");
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = stripeEvent.data
          .object as Stripe.Checkout.Session;
        const checkoutSession = await findCheckoutSession(stripeObject.id);

        if (checkoutSession) {
          console.log("User:", checkoutSession.client_reference_id);
          console.log("Email:", checkoutSession.customer_details?.email);
          console.log(
            "Purchase:",
            checkoutSession.line_items?.data[0]?.description
          );
        }

        const customerId = checkoutSession?.customer;
        const priceId = checkoutSession?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        const plan = getPlanFromPriceId(priceId);

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) {
          console.error("Plan not found for priceId: ", priceId);
          break;
        }

        let user: UserProfile | null = null;

        if (!userId) {
          // check if user already exists
          const userProfile = await fetchUserByEmail(customer.email);

          if (userProfile) {
            user = userProfile;
          } else {
            const { data, error } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            if (error) {
              console.error("Failed to create user:", error);
              break;
            }

            user = await fetchUserByEmail(customer.email);
          }
        } else {
          user = await fetchUser(userId);
        }

        if (!user) {
          console.error("User not found");
          throw new Error(
            `Failed to set user on purchase -- userId: ${userId} -- email: ${customer.email}`
          );
        }

        const purchase = await createPurchase(
          {
            user_id: (checkoutSession.client_reference_id as string) || user.id,
            customer_id: checkoutSession.customer as string,
            price_id: checkoutSession.line_items?.data[0]?.price.id,
            product_name: plan,
            expires_at: getPlanExpirationDate(plan),
          },
          "checkout.session.completed"
        );

        // Set customer_id in user profile if it doesn't exist
        if (!user.stripe_customer_id) {
          await updateUserProfile(user.id, {
            stripe_customer_id: customerId as string,
          });
        }

        console.log("Purchase created:", purchase.id);

        try {
          await sendPurchaseConfirmationEmail(
            user.email,
            purchase,
            checkoutSession.mode as StripePaymentMode
          );
        } catch (e) {
          console.error(
            "Error sending purchase confirmation email:",
            e?.message
          );
        }

        break;
      }

      case "checkout.session.expired": {
        console.log("Stripe Checkout Session Expired");
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        const stripeObject: Stripe.Checkout.Session = stripeEvent.data
          .object as Stripe.Checkout.Session;
        const session = await findCheckoutSession(stripeObject.id);

        if (session) {
          console.log("Session:", session.id);
          console.log("User:", session.client_reference_id);
          console.log("Email:", session.customer_details?.email);
          console.log("Item:", session.line_items?.data[0]?.description);
        }

        break;
      }

      case "customer.subscription.updated": {
        console.log("Stripe Customer Subscription Updated");
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case "customer.subscription.deleted": {
        console.log("Stripe Customer Subscription Deleted");
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
        console.log("Stripe Invoice Paid");
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeInvoice: Stripe.Invoice = stripeEvent.data
          .object as Stripe.Invoice;

        // Only proceed if this is a subscription cycle - ignore all other events for now
        if (stripeInvoice.billing_reason !== "subscription_cycle") {
          console.log(
            `Invoice Paid but not a subscription cycle (${stripeInvoice.billing_reason}), skipping purchase creation`
          );
          break;
        }

        const priceId = stripeInvoice.lines.data[0].pricing.price_details.price;
        const customerId = stripeInvoice.customer;
        console.log("Price ID:", priceId);
        console.log("Customer ID:", customerId);

        // // Find user where stripe_customer_id equals the customerId (in table called 'users')
        const user = await fetchUserByStripeCustomerId(customerId as string);

        if (!user) {
          console.error(
            `User with customer Id ${customerId} and email ${stripeInvoice.customer_email} not found during invoice paid`
          );
          break; // Here we break so that the logic that triggers during initial payments can handle setup
        }

        const latestUserPurchase = await getLatestPurchase(user?.id);

        // // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (latestUserPurchase.price_id !== priceId) {
          console.log("User has a different current plan than the invoice");
          break;
        }

        const plan = getPlanFromPriceId(priceId);

        if (!plan) {
          console.error("Plan not found for priceId: ", priceId);
          break;
        }

        // This is what will create a new purchase record in the database which
        // is used to determine if a user has access to the product via expires_at
        await createPurchase(
          {
            user_id: user.id,
            customer_id: customerId as string,
            price_id: priceId,
            product_name: plan,
            expires_at: getPlanExpirationDate(plan),
          },
          "invoice.paid"
        );

        break;
      }

      case "invoice.payment_failed":
        const stripeInvoice: Stripe.Invoice = stripeEvent.data
          .object as Stripe.Invoice;

        console.log(
          "Stripe Invoice Payment Failed for customer:",
          stripeInvoice.customer
        );

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
