import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { connectionMessage, postToChannel } from "@/libs/chat-connect";
import { exchangeSlackCode, SLACK_STATE_COOKIE, slackRedirectUri } from "@/libs/slack";

export const dynamic = "force-dynamic";

// Where Slack sends the user back after "Add to Slack": saves the channel's incoming webhook as the
// account's Slack alerts, then returns to the Alerts tab with ?slack=connected (or cancelled/error).
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const back = (outcome: "connected" | "cancelled" | "error") => {
    const response = NextResponse.redirect(`${url.origin}/tariff-tracker?tab=alerts&slack=${outcome}`);
    response.cookies.delete({ name: SLACK_STATE_COOKIE, path: "/api/slack" });
    return response;
  };

  // The user clicked Cancel on Slack's screen
  if (url.searchParams.get("error")) return back("cancelled");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || state !== req.cookies.get(SLACK_STATE_COOKIE)?.value) return back("error");

  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return back("error");

  try {
    const webhook = await exchangeSlackCode(code, slackRedirectUri(url.origin));
    // A new row keeps every other setting's default (alerts to the account's email)
    const { error } = await createAdminClient()
      .from("tracker_alert_settings")
      .upsert(
        { user_id: user.id, slack_webhook: webhook.url, slack_channel: webhook.channel, slack_team: webhook.team, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (error) throw new Error(error.message);
    // The channel's first message: proof it works, and what this app is for everyone in it
    const problem = await postToChannel("slack", webhook.url, connectionMessage("welcome", { origin: url.origin, where: webhook.channel, channel: "slack" }));
    if (problem) console.error("Slack welcome message failed:", problem);
    return back("connected");
  } catch (e) {
    console.error("Error connecting Slack:", e);
    return back("error");
  }
}
