import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { readTrackerAccess } from "@/libs/tariff-tracker/access";
import { canStartTrial, trialEndFrom } from "@/libs/tariff-tracker/plan";

export const dynamic = "force-dynamic";

// Starts the account's one 14-day Tariff Tracker trial (PRICING.md). Written with the service
// role, so the browser can't start a second one or move its end date.
export async function POST(req: NextRequest) {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Create a free account to start your trial." }, { status: 401 });
    }

    const { source } = (await req.json().catch(() => ({}))) as { source?: string };
    const admin = createAdminClient();
    const access = await readTrackerAccess(admin, user.id);
    if (!canStartTrial(access)) {
      return NextResponse.json(
        { error: access.trial ? "Your account has already had its trial." : "Your plan already includes this.", access },
        { status: 409 }
      );
    }

    const start = new Date();
    const { error } = await admin.from("tracker_trials").insert({
      user_id: user.id,
      started_at: start.toISOString(),
      ends_at: trialEndFrom(start).toISOString(),
      source: typeof source === "string" ? source.slice(0, 40) : null,
    });
    // A second click that raced the first: the trial exists, so report it
    if (error && error.code !== "23505") throw error;

    return NextResponse.json(await readTrackerAccess(admin, user.id));
  } catch (e) {
    console.error("Error starting Tariff Tracker trial:", e);
    return NextResponse.json({ error: "Couldn't start your trial. Please try again." }, { status: 500 });
  }
}
