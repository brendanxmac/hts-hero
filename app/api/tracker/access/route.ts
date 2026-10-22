import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { readTrackerAccess } from "@/libs/tariff-tracker/access";
import { ANONYMOUS_ACCESS, previewAccess, TRIAL_PREVIEWS, TrialPreview } from "@/libs/tariff-tracker/plan";
import { REVISION_DIFF_ADMIN_EMAIL } from "@/libs/hts-revision-diff/constants";

export const dynamic = "force-dynamic";

// The signed-in visitor's Tariff Tracker plan: free, trial or paid, and how many products it tracks.
// ?trialPreview=start|trial|ending|ended|paid|lapsed shows the admin (or anyone in local
// development) a plan stage on their own account; only what the Tracker shows changes, never what alerts cover.
export async function GET(req: Request) {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) return NextResponse.json(ANONYMOUS_ACCESS);
    const access = await readTrackerAccess(createAdminClient(), user.id);
    const stage = new URL(req.url).searchParams.get("trialPreview") as TrialPreview | null;
    const mayPreview = process.env.NODE_ENV === "development" || user.email === REVISION_DIFF_ADMIN_EMAIL;
    if (stage && TRIAL_PREVIEWS.includes(stage) && mayPreview) return NextResponse.json(previewAccess(access, stage));
    return NextResponse.json(access);
  } catch (e) {
    console.error("Error reading Tariff Tracker access:", e);
    return NextResponse.json({ error: "Couldn't load your plan" }, { status: 500 });
  }
}
