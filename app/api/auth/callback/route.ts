import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/api/supabase/server";
import config from "@/config";
import { createAdminClient } from "@/app/api/supabase/server";
import { signupSourceFor } from "@/libs/tariff-tracker/onboarding";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect");

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    // A new account: where its sign-up was headed says what it came for (the onboarding emails
    // follow it, libs/email/lifecycle.ts). Kept from the first callback only.
    const user = data?.user;
    if (user && Date.now() - Date.parse(user.created_at) < 60 * 60 * 1000) {
      const { error } = await createAdminClient()
        .from("tracker_onboarding")
        .upsert({ user_id: user.id, signup_source: signupSourceFor(redirectTo ? decodeURIComponent(redirectTo) : null) }, { onConflict: "user_id", ignoreDuplicates: true });
      if (error) console.error("Recording the sign-up source:", error.message);
    }
  }

  // URL to redirect to after sign in process completes
  // Use the redirectTo parameter if provided, otherwise fallback to default callback URL
  // Only paths on this site ("/tariff-tracker"), never another host ("//evil.com")
  const path = redirectTo ? decodeURIComponent(redirectTo) : "";
  const safe = path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : config.auth.callbackUrl;
  const finalRedirectUrl = requestUrl.origin + safe;

  return NextResponse.redirect(finalRedirectUrl);
}
