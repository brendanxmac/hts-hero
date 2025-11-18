import { NextResponse, NextRequest } from "next/server";
import { sendEmail, sendEmailFromComponent } from "../../../libs/resend";
import TeamRequestConfirmationEmail from "../../../emails/TeamRequestConfirmationEmail";
import React from "react";

export const dynamic = "force-dynamic";

interface TeamRequestConfirmationParams {
  name: string;
  email: string;
  productType: "classify" | "tariff";
}

export const sendTeamRequestConfirmationEmail = async ({
  name,
  productType,
  email,
}: TeamRequestConfirmationParams) => {
  const productName = productType === "tariff" ? "Tariff Pro" : "Classify Pro";
  const emoji = "🎉";

  await sendEmailFromComponent({
    to: email,
    subject: `${emoji} Your Demo of ${productName} for Teams!`,
    emailComponent: React.createElement(TeamRequestConfirmationEmail, {
      name,
      productName,
      email,
    }),
    replyTo: "brendan@htshero.com",
  });
};

interface DemoRequestDto {
  email: string;
  name: string;
  notes?: string;
  productType?: "classify" | "tariff";
}

export async function POST(req: NextRequest) {
  try {
    const {
      email,
      name,
      notes,
      productType = "classify",
    }: DemoRequestDto = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Determine product name and emoji based on productType
    const productName =
      productType === "tariff" ? "Tariff Pro" : "Classify Pro";
    const emoji = productType === "tariff" ? "📊" : "🎯";

    // Send enterprise request email to Brendan
    const subject = `${emoji} New ${productName} Team Request!`;
    const text = `${name} (${email}) has requested a demo for ${productName} Team plan!\n\nNotes: ${notes || "None provided"}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">${emoji} New ${productName} Team Request!</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          <strong>${name}</strong> has requested info about the <strong>${productName} Team</strong> plan!
        </p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0;"><strong>Plan:</strong> ${productName} for Teams</p>
          <p style="margin: 8px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          ${
            notes
              ? `
          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #d1d5db;">
            <p style="margin: 8px 0;"><strong>Notes/Details:</strong></p>
            <p style="margin: 8px 0; white-space: pre-wrap; color: #374151;">${notes}</p>
          </div>
          `
              : ""
          }
        </div>
        <p style="font-size: 14px; color: #6b7280;">
          Follow up with them soon to discuss their team needs!
        </p>
      </div>
    `;

    Promise.all([
      sendEmail({
        to: "brendan@htshero.com",
        subject,
        text,
        html,
        replyTo: email,
      }),
      sendTeamRequestConfirmationEmail({
        name,
        productType,
        email,
      }),
    ]);

    // Send enterprise request email to Brendan
    // await sendEmail({
    //   to: "brendan@htshero.com",
    //   subject,
    //   text,
    //   html,
    //   replyTo: email,
    // });

    // Send confirmation email to the prospect
    // await sendTeamRequestConfirmationEmail({
    //   name,
    //   email,
    //   productType,
    //   notes,
    // });

    return NextResponse.json(
      { message: `${productName} Team request sent successfully!` },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error sending enterprise request email:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
