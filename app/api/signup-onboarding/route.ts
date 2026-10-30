import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { cleanWebsite, isCompanyType, isEntryPoint, isRole } from "@/libs/signup-onboarding";

export const dynamic = "force-dynamic";

// The signed-in account's sign-up onboarding answers (signup_onboarding), written here only:
//   {action: "start", firstTouch?, entryPoint?}  /onboarding opened: the row, where they first came
//                                        from, and the homepage section whose button they clicked
//   {action: "company_type", value}      COMPANY_TYPES id
//   {action: "website", value}           the company website as typed
//   {action: "skip_website"}
//   {action: "role", value}              ROLES id; finishes the onboarding
export async function POST(req: Request) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const body = (await req.json().catch((): null => null)) as { action?: string; value?: unknown; firstTouch?: unknown; entryPoint?: unknown } | null;
  const db = createAdminClient();
  const now = new Date().toISOString();
  const update = (fields: Record<string, unknown>) =>
    db.from("signup_onboarding").upsert({ user_id: user.id, ...fields, updated_at: now }, { onConflict: "user_id" });

  try {
    let result;
    if (body?.action === "start") {
      // Made once, with the first touch and entry point kept from the first start only
      const { error } = await db
        .from("signup_onboarding")
        .upsert(
          { user_id: user.id, first_touch: cleanFirstTouch(body.firstTouch), entry_point: isEntryPoint(body.entryPoint) ? body.entryPoint : null },
          { onConflict: "user_id", ignoreDuplicates: true },
        );
      if (error) throw error;
      return NextResponse.json({ ok: true });
    } else if (body?.action === "company_type" && isCompanyType(body.value)) {
      result = await update({ company_type: body.value });
    } else if (body?.action === "website" && typeof body.value === "string" && cleanWebsite(body.value)) {
      result = await update({ company_website: cleanWebsite(body.value), website_skipped: false });
    } else if (body?.action === "skip_website") {
      result = await update({ company_website: null, website_skipped: true });
    } else if (body?.action === "role" && isRole(body.value)) {
      result = await update({ role: body.value, completed_at: now });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    if (result.error) throw result.error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Saving sign-up onboarding:", e);
    return NextResponse.json({ error: "Couldn't save" }, { status: 500 });
  }
}

// Only the first-touch fields we expect, as short strings
const FIRST_TOUCH_FIELDS = ["referrer", "referring_domain", "landing_path", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "at"];
const cleanFirstTouch = (raw: unknown): Record<string, string> | null => {
  if (!raw || typeof raw !== "object") return null;
  const out: Record<string, string> = {};
  for (const key of FIRST_TOUCH_FIELDS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === "string" && value) out[key] = value.slice(0, 500);
  }
  return Object.keys(out).length ? out : null;
};
