import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/app/api/supabase/server";
import { createCustomerPortal } from "@/libs/stripe";
import { fetchUser } from "../../../../libs/supabase/user";
import { isTrackerPlan } from "@/libs/tariff-tracker/plan";
import { trackerPlanChangeFlow } from "@/libs/tariff-tracker/subscription";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    const body = await req.json();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // User who are not logged in can't make a purchase
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to view billing information." },
        { status: 401 }
      );
    } else if (!body.returnUrl) {
      return NextResponse.json(
        { error: "Return URL is required" },
        { status: 400 }
      );
    }

    // Get user profile
    const userProfile = await fetchUser(user?.id);

    if (!userProfile?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "You don't have a billing account yet. Make a purchase first.",
        },
        { status: 400 }
      );
    }

    const tracker = body.app === "tracker";
    // A Tracker plan change (`changePlan`: true, or the plan to move to): opens on Stripe's confirm
    // page for that plan, or its plan picker, and comes back with ?plan=changed
    const changeTo = typeof body.changePlan === "string" && isTrackerPlan(body.changePlan) ? body.changePlan : null;
    const flows =
      tracker && body.changePlan
        ? await trackerPlanChangeFlow(userProfile.stripe_customer_id, changeTo, withParam(body.returnUrl, "plan", "changed")).catch((e): Stripe.BillingPortal.SessionCreateParams.FlowData[] => {
            console.error("Couldn't read the Tracker subscription:", e);
            return [];
          })
        : [];

    const stripePortalUrl = await createCustomerPortal({
      customerId: userProfile.stripe_customer_id,
      returnUrl: body.returnUrl,
      // "tracker": the Tariff Tracker's billing portal (switching between its tiers only)
      app: tracker ? "tracker" : undefined,
      flows,
    });

    return NextResponse.json({
      url: stripePortalUrl,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

const withParam = (url: string, key: string, value: string) => {
  const next = new URL(url);
  next.searchParams.set(key, value);
  return next.toString();
};
