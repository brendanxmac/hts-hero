import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { readTrackerAccess } from "@/libs/tariff-tracker/access";
import { canSpendCheck, CheckKind, hasChecked, isPaid } from "@/libs/tariff-tracker/plan";

export const dynamic = "force-dynamic";

const KINDS: CheckKind[] = ["savings", "audit"];
// A product key ("6110202010-CN") or an entry id (uuid)
const REF = /^[A-Za-z0-9-]{1,80}$/;

// Spends one check from the usage-based trial (PRICING.md): a savings check on one import, or an
// audit check on one entry. Checking the same one again is free. Written with the service role,
// so the browser can't hand itself more than the allowance. Paid plans don't spend checks:
// their savings follow the plan's coverage and their audits are unlimited.
export async function POST(req: NextRequest) {
  try {
    const {
      data: { user },
    } = await createClient().auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Create a free account to check your imports." }, { status: 401 });
    }

    const { kind, ref } = (await req.json().catch(() => ({}))) as { kind?: string; ref?: string };
    if (!KINDS.includes(kind as CheckKind) || typeof ref !== "string" || !REF.test(ref)) {
      return NextResponse.json({ error: "Unknown check." }, { status: 400 });
    }

    const admin = createAdminClient();
    const access = await readTrackerAccess(admin, user.id);
    if (isPaid(access) || hasChecked(access, kind as CheckKind, ref)) return NextResponse.json(access);
    if (!canSpendCheck(access, kind as CheckKind, ref)) {
      return NextResponse.json(
        { error: kind === "savings" ? "You've used your free savings checks." : "You've used your free audit checks.", access },
        { status: 402 }
      );
    }

    const { error } = await admin.from("tracker_checks").insert({ user_id: user.id, kind, ref });
    // A second click that raced the first: the check exists, so report it
    if (error && error.code !== "23505") throw error;

    return NextResponse.json(await readTrackerAccess(admin, user.id));
  } catch (e) {
    console.error("Error spending a Tariff Tracker check:", e);
    return NextResponse.json({ error: "Couldn't run that check. Please try again." }, { status: 500 });
  }
}
