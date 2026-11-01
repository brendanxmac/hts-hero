import { createCheckout, StripePaymentMode } from "@/libs/stripe";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { readTrackerAccess } from "@/libs/tariff-tracker/access";
import { NextRequest, NextResponse } from "next/server";
import { PricingPlan } from "../../../../types";
import { fetchUser, UserProfile } from "../../../../libs/supabase/user";
import { Billing } from "@/components/pricing-calculator/lib/pricing";
import { isSellablePlan, isTrackerPlan } from "@/libs/tariff-tracker/plan";
import { trackerPriceId } from "@/libs/tariff-tracker/prices";

interface CreateCheckoutDto {
  itemId: PricingPlan;
  // Duty Guard plans are billed monthly or annually
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

    const getPriceId = async (itemId: PricingPlan) => {
      if (isSellablePlan(itemId)) return trackerPriceId(itemId, billing);
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
      if (isSellablePlan(itemId)) return StripePaymentMode.SUBSCRIPTION;
      switch (itemId) {
        case PricingPlan.CLASSIFY_STARTER:
        case PricingPlan.CLASSIFY_PRO:
        case PricingPlan.TARIFF_IMPACT_STANDARD:
        case PricingPlan.TARIFF_IMPACT_PRO:
          return StripePaymentMode.SUBSCRIPTION;
      }
    };

    // Plans are bought signed in, from Duty Guard (PRICING.md, decided 2026-10-31)
    if (isTrackerPlan(itemId) && !user) {
      return NextResponse.json({ error: "Sign in to choose a plan." }, { status: 401 });
    }

    // A second subscription would bill twice: a plan changes in the billing portal
    if (isTrackerPlan(itemId) && (await readTrackerAccess(createAdminClient(), user.id)).kind === "paid") {
      return NextResponse.json({ error: "You already have a plan. Change it in Billing." }, { status: 409 });
    }

    // Back in Duty Guard with the plan named, for the "you're on X" confirmation
    const successUrl = isTrackerPlan(itemId)
      ? `${process.env.BASE_URL}/duty-guard?checkout=success&purchased=${encodeURIComponent(itemId)}`
      : `${process.env.BASE_URL}${successEndpoint ? successEndpoint : "/"}`;
    const priceId = await getPriceId(itemId);
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
