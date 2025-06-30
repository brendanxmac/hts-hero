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

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    if (user) {
      // check if the user was just created
      console.log("user", user.created_at);

      console.log("Date.now()", Date.now());
      console.log("user.created_at", new Date(user.created_at).getTime());
      console.log(
        "user.created_at - 10000",
        new Date(user.created_at).getTime() - 10000
      );

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
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
