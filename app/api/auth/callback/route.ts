import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/app/api/supabase/server";
import config from "@/config";
import { MixpanelEvent } from "../../../../libs/mixpanel";
import {
  identifyUserServer,
  trackEventServer,
} from "../../../../libs/mixpanel-server";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirect");

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    if (user) {
      // check if user.created_at was within the last 10 seconds
      const isNewUser =
        user?.created_at &&
        new Date(user.created_at).getTime() > Date.now() - 10000;

      console.log("isNewUser", isNewUser);

      if (isNewUser) {
        identifyUserServer(user.id, {
          email: user.email || "",
          created_at: user.created_at || "",
        });

        trackEventServer(MixpanelEvent.SIGN_UP, user.id, {
          email: user.email || "",
          created_at: user.created_at || "",
        });
      }
    }
  }

  // URL to redirect to after sign in process completes
  // Use the redirectTo parameter if provided, otherwise fallback to default callback URL
  const finalRedirectUrl = redirectTo
    ? requestUrl.origin + decodeURIComponent(redirectTo)
    : requestUrl.origin + config.auth.callbackUrl;

  console.log("Final redirect URL", finalRedirectUrl);

  return NextResponse.redirect(finalRedirectUrl);
}
