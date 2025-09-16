import config from "@/config";
import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { sendEmail, sendEmails } from "@/libs/resend";
import React from "react";
import { getExactDateDaysAgo } from "@/libs/date";
import TariffImpactTrialEndingEmail from "@/emails/TariffImpactTrialEndingEmail";
import { PricingPlan } from "@/types";
import { CreateEmailOptions } from "resend";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }

    // Get the exact date for 9 days ago (avoids timezone issues with DATE fields)
    const dateNineDaysAgo = getExactDateDaysAgo(9);

    // Check all users who have a tariff impact trial that started
    //  exactly 9 days ago AND do not have a stripe customer id
    const supabase = createClient();
    const { data: trialUsersWhoStartedNineDaysAgo, error } = await supabase
      .from("users")
      .select("*")
      .not("tariff_impact_trial_started_at", "is", null)
      .eq("tariff_impact_trial_started_at", dateNineDaysAgo);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Users query failed" },
        { status: 500 }
      );
    }

    console.log(
      "Trial Started 9 Days Ago:",
      trialUsersWhoStartedNineDaysAgo.map((user) => user.id)
    );

    const trialUserIds = trialUsersWhoStartedNineDaysAgo.map((user) => user.id);

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

    if (tariffImpactPurchasesError) {
      console.error(
        "Error fetching tariff impact purchases:",
        tariffImpactPurchasesError
      );
      return NextResponse.json(
        { error: "Purchases query failed" },
        { status: 500 }
      );
    }

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
      trialUsersWhoStartedNineDaysAgo.filter((user) => {
        return !tariffImpactPurchases.some(
          (purchase) => purchase.user_id === user.id
        );
      });

    console.log(
      "Users with Trial Expiring and No Active Purchase:",
      usersWithTrialExpiringAndNoActivePurchase.map((user) => user.id)
    );

    const trialExpiringEmails = usersWithTrialExpiringAndNoActivePurchase.map(
      (user): CreateEmailOptions => ({
        from: config.resend.fromAdmin,
        to: user.email,
        subject: "⏰ Your Tariff Impact Checker Pro Trial Ends Tomorrow!",
        react: React.createElement(TariffImpactTrialEndingEmail),
        replyTo: config.resend.supportEmail,
      })
    );

    if (trialExpiringEmails.length > 1000) {
      sendEmail({
        to: "brendan@htshero.com",
        subject: "Over 1000 Trial Emails to Send",
        text: "Over 1000 Trial Emails to Send",
        html: "Over 1000 Tariff Impact Trial Emails to Send",
        replyTo: config.resend.supportEmail,
      });

      return NextResponse.json(
        {
          message: "Over 1000 Trial Emails to Send",
        },
        { status: 400 }
      );
    }

    const bulkEmailsSendResponse = await sendEmails(trialExpiringEmails);

    return NextResponse.json(
      {
        message: "Sent Tariff Impact Trial Ending Emails",
        dateChecked: dateNineDaysAgo,
        emailsSent: bulkEmailsSendResponse.length,
      },
      { status: 200 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
