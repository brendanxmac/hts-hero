import { createCheckout, StripePaymentMode } from "@/libs/stripe";
import { createClient } from "@/app/api/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PricingPlan } from "../../../../types";
import { fetchUser, UserProfile } from "../../../../libs/supabase/user";
import { Billing } from "@/components/pricing-calculator/lib/pricing";
import { isTrackerPlan } from "@/libs/tariff-tracker/plan";
import { trackerPriceId } from "@/libs/tariff-tracker/prices";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";

interface CreateCheckoutDto {
  itemId: PricingPlan;
  // Tariff Tracker plans are billed monthly or annually
  billing?: Billing;
  successEndpoint: string;
  cancelUrl: string;
}

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const requestDto: CreateCheckoutDto = await req.json();

  if (!requestDto.itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { itemId, billing = "monthly", successEndpoint, cancelUrl } = requestDto;

    let userProfile: UserProfile | null = null;

    if (user) {
      userProfile = await fetchUser(user.id);
    }

    const getPriceId = (itemId: PricingPlan) => {
      // Tracker plans are monthly only for now (libs/tariff-tracker/features.ts)
      if (isTrackerPlan(itemId)) return trackerPriceId(itemId, TRACKER_ANNUAL_ENABLED ? billing : "monthly");
      switch (itemId) {
        case PricingPlan.CLASSIFY_STARTER:
          return process.env.STRIPE_CLASSIFY_STARTER_PRICE_ID;
        case PricingPlan.CLASSIFY_PRO:
          return process.env.STRIPE_CLASSIFY_PRO_PRICE_ID;
        case PricingPlan.TARIFF_IMPACT_STANDARD:
          return process.env.STRIPE_TARIFF_IMPACT_STANDARD_PRICE_ID;
        case PricingPlan.TARIFF_IMPACT_PRO:
          return process.env.STRIPE_TARIFF_IMPACT_PRO_PRICE_ID;
        default:
          return null;
      }
    };

    const getMode = (itemId: PricingPlan): StripePaymentMode => {
      switch (itemId) {
        case PricingPlan.CLASSIFY_STARTER:
        case PricingPlan.CLASSIFY_PRO:
        case PricingPlan.TARIFF_IMPACT_STANDARD:
        case PricingPlan.TARIFF_IMPACT_PRO:
        case PricingPlan.TARIFF_TRACKER_10:
        case PricingPlan.TARIFF_TRACKER_30:
        case PricingPlan.TARIFF_TRACKER_100:
        case PricingPlan.TARIFF_TRACKER_500:
          return StripePaymentMode.SUBSCRIPTION;
      }
    };

    const successUrl = `${process.env.BASE_URL}${successEndpoint ? successEndpoint : "/"}`;
    const priceId = getPriceId(itemId);
    const mode = getMode(itemId);

    if (!priceId) {
      return NextResponse.json({ error: "This plan isn't available to buy yet." }, { status: 400 });
    }

    console.log("cancelUrl", cancelUrl);
    console.log("successEndpoint", successEndpoint);
    console.log(`User: ${user?.id}`);
    console.log("priceId", priceId);
    console.log("mode", mode);

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      // promotionCode removed for now,
      successUrl,
      cancelUrl: cancelUrl || `${process.env.BASE_URL}/classify`,
      // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
      clientReferenceId: userProfile ? userProfile.id : user?.id,
      user: {
        email: userProfile ? userProfile.email : user?.email,
        // If the user has already purchased, it will automatically prefill it's credit card
        customerId: userProfile ? userProfile.stripe_customer_id : null,
      },
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
