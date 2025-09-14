import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { sendEmailFromComponent } from "../../../../libs/resend";
import TariffImpactTrialSartedEmail from "../../../../emails/TariffImpactTrialSartedEmail";
import React from "react";
import { getExactDateDaysAgo } from "../../../../libs/date";
import TariffImpactTrialEndingEmail from "../../../../emails/TariffImpactTrialEndingEmail";

export async function POST(req: NextRequest) {
  try {
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response("Unauthorized", {
    //     status: 401,
    //   });
    // }

    // Get the exact date for 6 days ago (avoids timezone issues with DATE fields)
    const dateSixDaysAgo = getExactDateDaysAgo(6);

    // Check all users who have a trial started exactly 6 days ago AND no stripe customer id
    const supabase = createClient();
    const { data: trialUsersWhoStartedSixDaysAgo, error } = await supabase
      .from("users")
      .select("*")
      .is("stripe_customer_id", null)
      .not("tariff_impact_trial_started_at", "is", null)
      .eq("tariff_impact_trial_started_at", dateSixDaysAgo);

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { error: "Database query failed" },
        { status: 500 }
      );
    }

    console.log("Looking for users with trial started on:", dateSixDaysAgo);
    console.log("users to notify:", trialUsersWhoStartedSixDaysAgo);

    const emailsSent = [];
    const errors = [];

    // Send trial ending email to each qualifying user
    for (const user of trialUsersWhoStartedSixDaysAgo || []) {
      try {
        await sendEmailFromComponent({
          to: user.email,
          subject: "Your Trial Ends Tomorrow - Don't Miss Out!",
          emailComponent: React.createElement(TariffImpactTrialEndingEmail),
        });

        emailsSent.push(user.email);
        console.log(`Trial ending email sent to: ${user.email}`);
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
