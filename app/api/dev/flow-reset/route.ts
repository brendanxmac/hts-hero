import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";

export const dynamic = "force-dynamic";

// Development only (the Flow Tester, /dev/flows): forgets the signed-in account's sign-up
// onboarding (its signup_onboarding row), so /onboarding asks the questions again and sends it on
// as a new account. The browser clears its own "seen" flags. Never runs outside development.
export async function POST() {
  if (process.env.NODE_ENV !== "development") return NextResponse.json({ error: "Not found" }, { status: 404 });
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const { error } = await createAdminClient().from("signup_onboarding").delete().eq("user_id", user.id);
  // Before the migration there's no table, and nothing to forget
  if (error && !/schema cache|does not exist/i.test(error.message)) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
