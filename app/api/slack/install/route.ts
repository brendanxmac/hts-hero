import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/app/api/supabase/server";
import { SLACK_STATE_COOKIE, slackRedirectUri } from "@/libs/slack";

export const dynamic = "force-dynamic";

// "Add to Slack": sends the signed-in user to Slack, where they pick the channel HTS Hero posts
// tariff alerts to (the HTS Hero Slack app's incoming-webhook scope). Slack sends them back to
// /api/slack/callback, which saves the channel's webhook.
export async function GET(req: Request) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  const origin = new URL(req.url).origin;
  if (!user) return NextResponse.redirect(`${origin}/signin?redirect=${encodeURIComponent("/tariff-tracker?tab=alerts")}`);
  if (!process.env.SLACK_CLIENT_ID) return NextResponse.redirect(`${origin}/tariff-tracker?tab=alerts&slack=error`);

  // Proves the callback is the answer to this request, from this browser
  const state = randomBytes(24).toString("hex");
  const authorize = new URL("https://slack.com/oauth/v2/authorize");
  authorize.searchParams.set("client_id", process.env.SLACK_CLIENT_ID);
  authorize.searchParams.set("scope", "incoming-webhook");
  authorize.searchParams.set("redirect_uri", slackRedirectUri(origin));
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize.toString());
  response.cookies.set(SLACK_STATE_COOKIE, state, { httpOnly: true, secure: origin.startsWith("https://"), sameSite: "lax", path: "/api/slack", maxAge: 15 * 60 });
  return response;
}
