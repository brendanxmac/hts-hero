import { NextResponse, NextRequest } from "next/server";
import { createClient } from "../../supabase/server";
import { RegistrationTrigger } from "../../../../libs/early-registration";

export const dynamic = "force-dynamic";

interface EarlyRegistrationAttemptDto {
  buttonClicked: RegistrationTrigger;
  windowName?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { windowName, buttonClicked, source }: EarlyRegistrationAttemptDto =
      await req.json();

    if (!buttonClicked) {
      return NextResponse.json(
        {
          error: "Missing buttonClicked",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("early_registration_attempt")
      .insert([
        { window_name: windowName, button_clicked: buttonClicked, source },
      ]);

    if (error) {
      console.error("Error inserting early registration attempt:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
