import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../supabase/server";
import { RegistrationTrigger } from "../../../libs/early-registration";
import { getPreLaunchEmailHtml } from "../../../emails/registration/pre-launch";
import { getPreLaunchEmailText } from "../../../emails/registration/pre-launch";
import { sendEmail } from "../../../libs/resend";

export const dynamic = "force-dynamic";

interface EarlyRegistrationDto {
  email: string;
  buttonClicked: RegistrationTrigger;
  windowName?: string;
  jobTitle?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const {
      email,
      buttonClicked,
      jobTitle,
      source,
      windowName,
    }: EarlyRegistrationDto = await req.json();

    if (!email || !buttonClicked) {
      return NextResponse.json(
        {
          error: "Missing email or buttonClicked",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("early_registration").insert([
      {
        email,
        button_clicked: buttonClicked,
        job_title: jobTitle,
        source,
        window_name: windowName,
      },
    ]);

    if (error) {
      console.error("Error setting up early registration:", error);
      if (error.code === "23505") {
        // Email already exists, so we'll return a success response
        return NextResponse.json({ success: true }, { status: 200 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Sending pre-launch email");
    sendEmail({
      to: email,
      subject: "Pre-Launch Registration Confirmed!",
      html: getPreLaunchEmailHtml(),
      text: getPreLaunchEmailText(),
      replyTo: "brendan@htshero.com",
    }).catch((error: any) => {
      console.error("Error sending pre-launch email:", error);
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
