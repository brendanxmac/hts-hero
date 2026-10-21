import { NextResponse, NextRequest } from "next/server";
import { createAdminClient } from "../../../supabase/server";
import { UserProfile } from "../../../../../libs/supabase/user";
import { sendTransactional } from "@/libs/email/outbox";
import { ensureAccountSubscriber } from "@/libs/email/subscribers";
import { UPDATE_EMAIL_COLUMNS, updateSummary, type UpdateRowForEmail } from "@/libs/email/tariff-news";
import { MixpanelEvent } from "../../../../../libs/mixpanel";
import {
  identifyUserServer,
  trackEventServer,
} from "../../../../../libs/mixpanel-server";

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

    // Every account gets the weekly tariff digest (choices in the Tracker's Alerts section, or
    // any email's manage link)
    if (user.email) {
      try {
        await ensureAccountSubscriber(supabase, { userId: user.id, email: user.email });
      } catch (e) {
        console.error("Failed to add the account's email choices:", e);
      }
    }

    // The welcome email, with the latest tariff action so the first email already teaches
    // something. Sent at once: it answers the sign-up (libs/email/outbox.ts)
    try {
      const { data: latest } = await supabase
        .from("tariff_updates")
        .select(UPDATE_EMAIL_COLUMNS)
        .eq("status", "published")
        .neq("kind", "hts_revision")
        .order("last_activity_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      await sendTransactional(supabase, {
        recipient: user.email,
        userId: user.id,
        template: "welcome",
        props: {
          latestUpdate: latest ? updateSummary(latest as UpdateRowForEmail) : null,
          footer: { reason: "You're getting this because you created an HTS Hero account with this email." },
        },
      });
    } catch (e) {
      console.error("Failed to send the welcome email:", e);
    }

    try {
      identifyUserServer(user.id, {
        email: user.email || "",
      });

      trackEventServer(MixpanelEvent.SIGN_UP, user.id, {
        email: user.email || "",
      });
    } catch (e) {
      console.error("Failed to identify user in Mixpanel:", e);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
