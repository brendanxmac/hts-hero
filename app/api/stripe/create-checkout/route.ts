import { createCheckout, StripePaymentMode } from "@/libs/stripe";
import { createClient } from "@/app/api/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PricingPlan } from "../../../../types";
import { fetchUser, UserProfile } from "../../../../libs/supabase/user";

interface CreateCheckoutDto {
  itemId: PricingPlan;
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

    const { itemId, successEndpoint, cancelUrl } = requestDto;

    let userProfile: UserProfile | null = null;

    if (user) {
      userProfile = await fetchUser(user.id);
    }

    const getPriceId = (itemId: PricingPlan) => {
      console.log("itemId", itemId);

      switch (itemId) {
        case PricingPlan.CLASSIFY_PRO:
          return process.env.STRIPE_CLASSIFY_PRO_PRICE_ID;
        case PricingPlan.TARIFF_IMPACT_STANDARD:
          return process.env.STRIPE_TARIFF_IMPACT_STANDARD_PRICE_ID;
        case PricingPlan.TARIFF_IMPACT_PRO:
          return process.env.STRIPE_TARIFF_IMPACT_PRO_PRICE_ID;
      }

      return null;
    };

    const getMode = (itemId: PricingPlan): StripePaymentMode => {
      switch (itemId) {
        case PricingPlan.CLASSIFY_PRO:
        case PricingPlan.TARIFF_IMPACT_STANDARD:
        case PricingPlan.TARIFF_IMPACT_PRO:
          return StripePaymentMode.SUBSCRIPTION;
      }
    };

    const successUrl = `${process.env.BASE_URL}${successEndpoint ? successEndpoint : "/"}`;
    const priceId = getPriceId(itemId);
    const mode = getMode(itemId);

    console.log("cancelUrl", cancelUrl);
    console.log("successEndpoint", successEndpoint);
    console.log(`User: ${user?.id}`);
    console.log("priceId", priceId);
    console.log("mode", mode);

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      // promotionCode,
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
