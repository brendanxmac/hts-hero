import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { readTrackerAccess } from "@/libs/tariff-tracker/access";
import { ANONYMOUS_ACCESS } from "@/libs/tariff-tracker/plan";

export const dynamic = "force-dynamic";

// The signed-in visitor's Tariff Tracker plan: free, trial or paid, and how many products it tracks
export async function GET() {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return NextResponse.json(ANONYMOUS_ACCESS);
    return NextResponse.json(await readTrackerAccess(createAdminClient(), user.id));
  } catch (e) {
    console.error("Error reading Tariff Tracker access:", e);
    return NextResponse.json({ error: "Couldn't load your plan" }, { status: 500 });
  }
}
