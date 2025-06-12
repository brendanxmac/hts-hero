import { createCheckout, StripePaymentMode } from "@/libs/stripe";
import { createClient } from "@/app/api/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { PricingPlan } from "../../../../types";

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.itemId) {
    return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
  }
  // else if (!body.successUrl || !body.cancelUrl) {
  //   return NextResponse.json(
  //     { error: "Success and cancel URLs are required" },
  //     { status: 400 }
  //   );
  // else if (!body.mode) {
  //   return NextResponse.json(
  //     {
  //       error:
  //         "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
  //     },
  //     { status: 400 }
  //   );
  // }

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { itemId } = body;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    const getPriceId = (itemId: string) => {
      if (itemId === PricingPlan.ONE_DAY_PASS) {
        return process.env.STRIPE_ONE_DAY_PASS_PRICE_ID;
      }
      if (itemId === PricingPlan.FIVE_DAY_PASS) {
        return process.env.STRIPE_FIVE_DAY_PASS_PRICE_ID;
      }

      return null;
    };

    const getMode = (): StripePaymentMode => {
      return "payment";
    };

    const getPromotionCode = (itemId: string) => {
      if (
        itemId === PricingPlan.ONE_DAY_PASS ||
        itemId === PricingPlan.FIVE_DAY_PASS
      ) {
        return process.env.STRIPE_HALF_OFF_PROMO_ID;
      }

      return null;
    };

    const successUrl = `${process.env.BASE_URL}/app`;
    const cancelUrl = `${process.env.BASE_URL}/about/importer#pricing`;
    const priceId = getPriceId(itemId);
    const mode = getMode();
    const promotionCode = getPromotionCode(itemId);

    console.log("User Data", data);

    console.log("successUrl", successUrl);
    console.log("cancelUrl", cancelUrl);
    console.log("priceId", priceId);
    console.log("mode", mode);
    console.log("promotionCode", promotionCode);

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      promotionCode,
      successUrl,
      cancelUrl,
      // If user is logged in, it will pass the user ID to the Stripe Session so it can be retrieved in the webhook later
      clientReferenceId: user?.id,
      user: {
        email: data?.email,
        // If the user has already purchased, it will automatically prefill it's credit card
        customerId: data?.customer_id,
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
