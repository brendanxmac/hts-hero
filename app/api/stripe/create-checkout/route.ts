import { createCheckout, StripePaymentMode } from "@/libs/stripe";
import { createClient } from "@/app/api/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PricingPlan } from "../../../../types";
import { fetchUserProfile, UserProfile } from "../../../../libs/supabase/user";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { itemId, cancelUrl } = body;

    let userProfile: UserProfile | null = null;

    if (user) {
      userProfile = await fetchUserProfile(user.id);
    }

    const getPriceId = (itemId: string) => {
      console.log("itemId", itemId);
      if (itemId === PricingPlan.ONE_DAY_PASS) {
        return process.env.STRIPE_ONE_DAY_PASS_PRICE_ID;
      }
      if (itemId === PricingPlan.FIVE_DAY_PASS) {
        return process.env.STRIPE_FIVE_DAY_PASS_PRICE_ID;
      }
      if (itemId === PricingPlan.IMPORTER) {
        return process.env.STRIPE_IMPORTER_PRICE_ID;
      }
      if (itemId === PricingPlan.PRO) {
        return process.env.STRIPE_STANDARD_PRICE_ID;
      }
      if (itemId === PricingPlan.PREMIUM) {
        return process.env.STRIPE_PRO_PRICE_ID;
      }

      return null;
    };

    const getMode = (itemId: PricingPlan): StripePaymentMode => {
      switch (itemId) {
        case PricingPlan.ONE_DAY_PASS:
        case PricingPlan.FIVE_DAY_PASS:
          return StripePaymentMode.PAYMENT;
        case PricingPlan.IMPORTER:
        case PricingPlan.PRO:
        case PricingPlan.PREMIUM:
          return StripePaymentMode.SUBSCRIPTION;
      }
    };

    const getPromotionCode = () => {
      return process.env.STRIPE_HALF_OFF_PROMO_ID;
    };

    const successUrl = `${process.env.BASE_URL}/signin`;
    const priceId = getPriceId(itemId);
    const mode = getMode(itemId);
    const promotionCode = getPromotionCode();

    console.log("cancelUrl", cancelUrl);

    console.log(`User: ${user?.id}`);
    console.log("priceId", priceId);
    console.log("mode", mode);
    console.log("promotionCode", promotionCode);

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      promotionCode,
      successUrl,
      cancelUrl: cancelUrl || `${process.env.BASE_URL}/about`,
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
