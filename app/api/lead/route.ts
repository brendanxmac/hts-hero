import { NextResponse, NextRequest } from "next/server";
import { sendEmail } from "../../../libs/resend";

export const dynamic = "force-dynamic";

interface DemoRequestDto {
  email: string;
  name: string;
  notes?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, notes }: DemoRequestDto = await req.json();

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

    // Send classify team request email to Brendan
    const subject = "🎯 New Classify Pro Team Request!";
    const text = `${name} (${email}) has requested a demo for Classify Pro Team plan!\n\nNotes: ${notes || "None provided"}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">🎯 New Classify Team Request!</h2>
        <p style="font-size: 16px; line-height: 1.5;">
          <strong>${name}</strong> has requested a demo for the <strong>Classify Pro Team</strong> plan!
        </p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 8px 0;"><strong>Plan:</strong> Classify for Teams</p>
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

    await sendEmail({
      to: "brendan@htshero.com",
      subject,
      text,
      html,
      replyTo: email,
    });

    return NextResponse.json(
      { message: "Classify Team request sent successfully!" },
      { status: 200 }
    );
  } catch (e) {
    console.error("Error sending Classify Team request email:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
