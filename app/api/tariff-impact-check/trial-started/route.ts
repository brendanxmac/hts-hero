import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { sendEmailFromComponent } from "../../../../libs/resend";
import TariffImpactTrialSartedEmail from "../../../../emails/TariffImpactTrialSartedEmail";
import React from "react";
import { updateUserProfile } from "../../../../libs/supabase/user";

export const dynamic = "force-dynamic";

interface TariffImpactTrialStartedDto {
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to complete this action." },
        { status: 401 }
      );
    }

    const { email }: TariffImpactTrialStartedDto = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    if (user.email !== email) {
      console.error(
        `User email: ${user.email} does not match request email: ${email}`
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Promise.all([
      updateUserProfile(user.id, {
        tariff_impact_trial_started_at: new Date().toISOString(),
      }),
      sendEmailFromComponent({
        to: email,
        subject: "Trial Activated: Tariff Impact Pro",
        emailComponent: React.createElement(TariffImpactTrialSartedEmail),
        replyTo: "support@htshero.com",
      }),
    ]);

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
