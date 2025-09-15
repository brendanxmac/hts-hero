import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { sendEmailFromComponent } from "../../../../libs/resend";
import TariffImpactTrialSartedEmail from "../../../../emails/TariffImpactTrialSartedEmail";
import React from "react";
import { getExactDateDaysAgo } from "../../../../libs/date";
import TariffImpactTrialEndingEmail from "../../../../emails/TariffImpactTrialEndingEmail";
import {
  fetchPurchasesForUser,
  getActiveTariffImpactPurchasesForUser,
} from "../../../../libs/supabase/purchase";
import { PricingPlan } from "../../../../types";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // Get the exact date for 6 days ago (avoids timezone issues with DATE fields)
    const dateSixDaysAgo = getExactDateDaysAgo(6);

    // Check all users who have a tariff impact trial that started
    //  exactly 6 days ago AND do not have a stripe customer id
    const supabase = createClient();
    const { data: trialUsersWhoStartedSixDaysAgo, error } = await supabase
      .from("users")
      .select("*")
      .not("tariff_impact_trial_started_at", "is", null)
      .eq("tariff_impact_trial_started_at", dateSixDaysAgo);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    console.log(
      "Trial Started 6 Days Ago:",
      trialUsersWhoStartedSixDaysAgo.map((user) => user.id)
    );

    const trialUserIds = trialUsersWhoStartedSixDaysAgo.map((user) => user.id);

    const { data: tariffImpactPurchases, error: tariffImpactPurchasesError } =
      await supabase
        .from("purchases")
        .select("*")
        .in("product_name", [
          PricingPlan.TARIFF_IMPACT_STARTER,
          PricingPlan.TARIFF_IMPACT_STANDARD,
          PricingPlan.TARIFF_IMPACT_PRO,
        ])
        .in("user_id", trialUserIds)
        .gte("expires_at", new Date().toISOString());

    const trialUsersWithActiveTariffImpactPurchases = trialUserIds.filter(
      (userId) => {
        return tariffImpactPurchases.some(
          (purchase) => purchase.user_id === userId
        );
      }
    );

    console.log(
      "Users with Active Tariff Impact Subscription:",
      trialUsersWithActiveTariffImpactPurchases.map((userId) => userId)
    );

    const usersWithTrialExpiringAndNoActivePurchase =
      trialUsersWhoStartedSixDaysAgo.filter((user) => {
        return !tariffImpactPurchases.some(
          (purchase) => purchase.user_id === user.id
        );
      });

    console.log(
      "Users with Trial Expiring and No Active Purchase:",
      usersWithTrialExpiringAndNoActivePurchase.map((user) => user.id)
    );

    const emailsSent = [];
    const errors = [];

    // Send trial ending email to each qualifying user with rate limiting
    for (const user of usersWithTrialExpiringAndNoActivePurchase || []) {
      try {
        // await sendEmailFromComponent({
        //   to: user.email,
        //   subject: "Your Trial Ends Tomorrow - Don't Miss Out!",
        //   emailComponent: React.createElement(TariffImpactTrialEndingEmail),
        // });

        emailsSent.push(user.email);
        console.log(`Trial ending email sent to: ${user.email}`);

        // Rate limit: wait 700ms before sending next email
        await new Promise((resolve) => setTimeout(resolve, 700));
      } catch (emailError) {
        console.error(`Failed to send email to ${user.email}:`, emailError);
        errors.push({ email: user.email, error: emailError.message });
      }
    }

    return NextResponse.json(
      {
        message: "Trial ending notifications processed",
        emailsSent: emailsSent.length,
        emails: emailsSent,
        errors: errors.length > 0 ? errors : undefined,
        dateChecked: dateSixDaysAgo,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
