import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "@/app/api/supabase/server";
import { sendTransactional } from "@/libs/email/outbox";

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

    // A notice to Brendan (replies go to the person) and a confirmation to them, both at once
    const db = createAdminClient();
    await Promise.all([
      sendTransactional(
        db,
        {
          recipient: "brendan@htshero.com",
          template: "internal_notice",
          props: {
            eyebrow: "New demo request",
            title: `Demo request: ${name}`,
            rows: [
              { label: "Name", value: name },
              { label: "Email", value: email },
              { label: "Notes", value: notes || "None" },
            ],
          },
        },
        { replyTo: email }
      ),
      sendTransactional(db, {
        recipient: email,
        template: "demo_request",
        props: { name, footer: { reason: "You're getting this because you asked for an HTS Hero demo with this email." } },
      }),
    ]);

    return NextResponse.json(
      { message: `HTS Hero Demo request sent successfully!` },
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
