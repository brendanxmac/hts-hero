import { NextResponse, NextRequest } from "next/server";
import { PricingPlan, PricingType } from "../../../types";
import { createClient } from "../supabase/server";

export interface BuyAttempt {
  id: string;
  window_id?: string;
  pricing_plan: PricingPlan; // e.g., "starter", "pro", etc.
  plan_type?: PricingType; // e.g., "monthly", "annual", etc.
  job_title?: string;
  reason?: string | null;
  created_at: string; // ISO timestamp format (timestamptz)
}

// This route is used to store the leads that are generated from the landing page.
// The API call is initiated by <ButtonLead /> component
export async function POST(req: NextRequest) {
  const body: Partial<BuyAttempt> = await req.json();

  console.log("body", body);

  if (!body.pricing_plan) {
    return NextResponse.json({ error: "Plan is required" }, { status: 400 });
  }

  try {
    // If the attempt already exists, update it
    const supabase = createClient();
    const { data, error } = await supabase
      .from("buy_attempt")
      .upsert<Partial<BuyAttempt>>(
        {
          id: body.id,
          window_id: body.window_id,
          pricing_plan: body.pricing_plan,
          plan_type: body.plan_type,
          job_title: body.job_title,
          reason: body.reason,
        },
        {
          onConflict: "id",
        }
      )
      .select()
      .single();

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
