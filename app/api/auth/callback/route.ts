import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/api/supabase/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  // Use the redirectTo parameter if provided, otherwise fallback to default callback URL
  const finalRedirectUrl = redirectTo
    ? requestUrl.origin + decodeURIComponent(redirectTo)
    : requestUrl.origin + config.auth.callbackUrl;

  console.log("Final redirect URL", finalRedirectUrl);

  return NextResponse.redirect(finalRedirectUrl);
}
