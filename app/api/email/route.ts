import { NextResponse } from "next/server";
import { sendEmailFromComponent } from "../../../libs/resend";
import React from "react";
import WelcomeEmail from "../../../emails/WelcomeEmail";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await sendEmailFromComponent({
      to: "brendan@htshero.com",
      subject: "Test Welcome Email",
      emailComponent: React.createElement(WelcomeEmail),
      replyTo: "support@htshero.com",
    });
    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
