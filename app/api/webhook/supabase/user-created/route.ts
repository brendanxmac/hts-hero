import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "../../../supabase/server";
import { UserProfile } from "../../../../../libs/supabase/user";
import WelcomeEmail from "../../../../../emails/WelcomeEmail";
import React from "react";
import { sendEmailFromComponent } from "../../../../../libs/resend";

export const dynamic = "force-dynamic";

interface SupabaseInsertUserDto {
  type: "INSERT";
  table: string;
  schema: string;
  record: UserProfile;
  old_record: null;
}

export async function POST(req: NextRequest) {
  try {
    // Validate webhook secret
    const requestSecret = req.headers.get("x-supabase-secret");
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error("SUPABASE_WEBHOOK_SECRET environment variable is not set");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!requestSecret || requestSecret !== expectedSecret) {
      console.error("Invalid or missing x-supabase-secret header");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const payload: SupabaseInsertUserDto = await req.json();
    console.log(payload);

    if (
      !payload ||
      payload.type !== "INSERT" ||
      payload.table !== "users" ||
      !payload.record
    ) {
      console.log(`Invalid request body for user created webhook`);
      return NextResponse.json({ message: "Bad Request" }, { status: 400 });
    }

    const { id: userId } = payload.record;

    // Validate that record has required id and email fields as strings
    if (!payload.record.id || typeof payload.record.id !== "string") {
      console.error(`Invalid user record: missing or invalid id field`);
      return NextResponse.json(
        {
          message: "Bad Request",
        },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single<UserProfile>();

    if (error) {
      console.error("Failed to fetch user profile:", error);
      return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }

    // Send Welcome Email to User
    await sendEmailFromComponent({
      to: user.email,
      subject: "Welcome to HTS Hero!",
      emailComponent: React.createElement(WelcomeEmail),
      replyTo: "support@htshero.com",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
