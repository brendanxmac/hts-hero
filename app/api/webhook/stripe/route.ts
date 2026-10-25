import { findCheckoutSession, StripePaymentMode } from "@/libs/stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { PricingPlan } from "../../../../types";
import { createPurchase } from "../../../../libs/supabase/purchase";
import {
  fetchUser,
  fetchUserByEmail,
  fetchUserByStripeCustomerId,
  updateUserProfile,
  UserProfile,
} from "../../../../libs/supabase/user";
import { sendPurchaseConfirmationEmail } from "../../../../emails/purchase-confirmation/purchase-confirmation-email";
import { getPlanExpirationDate, getPlanFromPriceId } from "@/libs/stripe-plans";
import { isTrackerPlan, TRACKER_PLANS } from "@/libs/tariff-tracker/plan";
import { RENEWAL_GRACE_DAYS } from "@/libs/tariff-tracker/access";
import { MixpanelEvent } from "@/libs/mixpanel";
import { trackEventServerAsync } from "@/libs/mixpanel-server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-09-30.endive",
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = (await headers()).get("stripe-signature");

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
        const plan = await getPlanFromPriceId(priceId);

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
            const { error } = await supabase.auth.admin.createUser({
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
            expires_at: await getPlanExpirationDate(plan, priceId),
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

        // Once per checkout, even if Stripe sends the event again
        await trackEventServerAsync(MixpanelEvent.PURCHASE_COMPLETED, user.id, {
          $insert_id: `purchase-${stripeObject.id}`,
          plan,
          is_tracker_plan: isTrackerPlan(plan),
          mode: stripeObject.mode,
          amount_usd: (stripeObject.amount_total ?? 0) / 100,
          currency: stripeObject.currency,
        });

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

        // TODO: Need to handle when the customer has changed their subscription to a higher plan
        const event = stripeEvent as Stripe.CustomerSubscriptionUpdatedEvent;
        const updatedPlan = event.data.object.items.data[0].plan;
        const previousAttributes = event.data.previous_attributes;

        if (!previousAttributes) {
          console.log(
            `No previous attributes for subscription update via event ${event.id} : ${event.type}`
          );
          break;
        }

        const previousItem = previousAttributes.items?.data[0];

        // Prevents us from doing anything right away during downgrades and other updates
        if (!previousItem) {
          console.log(
            `No previous Item for subscription update via event ${event.id} : ${event.type}`
          );
          break;
        }

        const previousPlan = previousItem.plan;

        console.log("updatedPlan", updatedPlan);
        console.log("previousPlan", previousPlan);

        const updatedPlanProduct = updatedPlan.product;
        const previousPlanProduct = previousPlan.product;

        console.log("updatedPlanId", updatedPlanProduct);
        console.log("previousPlanId", previousPlanProduct);

        // ONLY do something if the plan has actually changed
        // and with the check above for !previousItem we ensure this only triggers
        // on upgrades, allowing the stripe subscription schedules and invoice.paid to handle
        // the downgrades at the end of the billing cycle
        if (
          updatedPlanProduct &&
          previousPlanProduct &&
          updatedPlanProduct !== previousPlanProduct
        ) {
          console.log(
            `Customer Subscription Updated from ${previousPlanProduct} to ${updatedPlanProduct}`
          );
          // TODO: Create purchase
          const customer = (await stripe.customers.retrieve(
            event.data.object.customer as string
          )) as Stripe.Customer;

          const customerEmail = customer.email;
          let userProfile = await fetchUserByEmail(customerEmail);

          if (!userProfile) {
            const { error } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            if (error) {
              console.error("Failed to create user:", error);
              break;
            }

            userProfile = await fetchUserByEmail(customer.email);
          }

          if (!userProfile) {
            console.error("User not found");
            throw new Error(
              `Failed to update subscription for user with email: ${customer.email}`
            );
          }

          const plan = await getPlanFromPriceId(updatedPlan.id);

          if (!plan) {
            console.error(
              `Plan not found for priceId ${updatedPlan.id} while updating user ${userProfile.id} subscription to ${updatedPlan.product}`
            );
            break;
          }

          // This is SECONDS (not milli) since Unix Epoch, which is what stripe uses for dates
          const previousPlanPeriodEndStripeDate =
            previousItem.current_period_end;
          // Convert to Milliseconds
          const previousPlanEnd = previousPlanPeriodEndStripeDate * 1000;
          // Convert to ISO Date for storing in DB
          const previousPlanEndDateIsoString = new Date(
            previousPlanEnd
          ).toISOString();

          const purchase = await createPurchase(
            {
              user_id: userProfile.id,
              customer_id: customer.id,
              price_id: updatedPlan.id,
              product_name: plan,
              expires_at: previousPlanEndDateIsoString,
            },
            "customer.subscription.updated"
          );

          // Set customer_id in user profile if it doesn't exist
          if (!userProfile.stripe_customer_id) {
            await updateUserProfile(userProfile.id, {
              stripe_customer_id: customer.id,
            });
          }

          console.log("Purchase created:", purchase.id);

          // TODO: Send subscription update email to user

          // try {
          //   await sendPurchaseConfirmationEmail(
          //     user.email,
          //     purchase,
          //     checkoutSession.mode as StripePaymentMode
          //   );
          // } catch (e) {
          //   console.error(
          //     "Error sending purchase confirmation email:",
          //     e?.message
          //   );
          // }
        }

        break;
      }

      case "customer.subscription.deleted": {
        console.log("Stripe Customer Subscription Deleted");
        // The subscription ended: at the end of a cancelled period, cancelled immediately, or after
        // the last failed payment retry. ❌ Revoke access now: its purchases stop at this moment
        // instead of running to their expires_at. For a Tariff Tracker plan, every Tracker purchase
        // of the customer ends (an upgrade leaves the old tier's purchase running to its period end).
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const plans = (
          await Promise.all(subscription.items.data.map((item) => getPlanFromPriceId(item.price.id)))
        ).filter((plan): plan is PricingPlan => !!plan);
        const ended = Array.from(new Set(plans.flatMap((plan) => (isTrackerPlan(plan) ? TRACKER_PLANS.map((p) => p.plan) : [plan]))));
        if (!ended.length) {
          console.log(`Subscription ${subscription.id} ended, but none of its prices is a plan`);
          break;
        }
        const now = new Date().toISOString();
        // Just past the renewal grace (libs/tariff-tracker/access.ts), so access ends now, not in 2 days
        const endedAt = new Date(Date.now() - (RENEWAL_GRACE_DAYS * 24 + 1) * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
          .from("purchases")
          .update({ expires_at: endedAt })
          .eq("customer_id", customerId)
          .in("product_name", ended)
          .gt("expires_at", now)
          .select("id");
        if (error) throw error;
        console.log(`Subscription ${subscription.id} ended: ${data?.length ?? 0} purchase(s) of ${ended.join(", ")} now expire`);
        const endedUser = await fetchUserByStripeCustomerId(customerId);
        if (endedUser) {
          await trackEventServerAsync(MixpanelEvent.SUBSCRIPTION_ENDED, endedUser.id, {
            $insert_id: `subscription-ended-${subscription.id}`,
            plans: plans.join(","),
            is_tracker_plan: plans.some(isTrackerPlan),
            reason: subscription.cancellation_details?.reason ?? null,
          });
        }
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

        const linePrice = stripeInvoice.lines.data[0].pricing.price_details.price;
        const priceId = typeof linePrice === "string" ? linePrice : linePrice.id;
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

        // Why were we doing this? \/ \/ \/
        // const latestUserPurchase = await getLatestPurchase(user.id);
        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        // if (latestUserPurchase.price_id !== priceId) {
        //   console.log("User has a different current plan than the invoice");
        //   break;
        // }

        const plan = await getPlanFromPriceId(priceId);

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
            expires_at: await getPlanExpirationDate(plan, priceId),
          },
          "invoice.paid"
        );

        break;
      }

      case "invoice.payment_failed": {
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
      }

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error(`stripe ${eventType} webhook handling error:`, e.message);
  }

  return NextResponse.json({});
}
