import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { isSkipReason, signupSourceFor } from "@/libs/tariff-tracker/onboarding";

export const dynamic = "force-dynamic";

// The signed-in account's import onboarding (tracker_onboarding), written here only:
//   {action: "visit"}                    the Tracker opened: the first time is kept (the no-imports
//                                        emails count from it)
//   {action: "skip", reason, note?}      "Skip for now" on the import takeover, and why
//   {action: "signup", redirect}         a sign-up by typed code (no auth callback): its source,
//                                        for an account made in the last hour
// The trial start isn't written here: a trigger on tracker_catalogs sets it.
export async function POST(req: Request) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const body = (await req.json().catch((): null => null)) as { action?: string; reason?: unknown; note?: unknown; redirect?: unknown } | null;
  const db = createAdminClient();
  const now = new Date().toISOString();
  // The row, made once
  const ensure = () => db.from("tracker_onboarding").upsert({ user_id: user.id }, { onConflict: "user_id", ignoreDuplicates: true });

  try {
    if (body?.action === "visit") {
      await ensure();
      const { error } = await db.from("tracker_onboarding").update({ first_visit_at: now, updated_at: now }).eq("user_id", user.id).is("first_visit_at", null);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body?.action === "skip" && isSkipReason(body.reason)) {
      await ensure();
      const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) || null : null;
      const { error } = await db.from("tracker_onboarding").update({ skipped_at: now, skip_reason: body.reason, skip_note: note, updated_at: now }).eq("user_id", user.id);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    if (body?.action === "signup" && typeof body.redirect === "string") {
      if (Date.now() - Date.parse(user.created_at) > 60 * 60 * 1000) return NextResponse.json({ ok: true });
      await ensure();
      const { error } = await db.from("tracker_onboarding").update({ signup_source: signupSourceFor(body.redirect), updated_at: now }).eq("user_id", user.id).is("signup_source", null);
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("Saving Tracker onboarding:", e);
    return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
  }
}
