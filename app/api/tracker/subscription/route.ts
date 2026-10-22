import { NextResponse } from "next/server";
import { createClient } from "@/app/api/supabase/server";
import { fetchUser } from "@/libs/supabase/user";
import { readTrackerSubscription } from "@/libs/tariff-tracker/subscription";

export const dynamic = "force-dynamic";

// The signed-in customer's Tariff Tracker subscription in Stripe (renewal, cancellation, a failed
// payment), for the plan card; null without one. Asked only on a paid plan.
export async function GET() {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return NextResponse.json(null);
    const profile = await fetchUser(user.id);
    if (!profile?.stripe_customer_id) return NextResponse.json(null);
    return NextResponse.json(await readTrackerSubscription(profile.stripe_customer_id));
  } catch (e) {
    console.error("Error reading the Tariff Tracker subscription:", e);
    return NextResponse.json({ error: "Couldn't load your subscription" }, { status: 500 });
  }
}
