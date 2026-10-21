import { NextResponse } from "next/server";
import { createAdminClient, createClient } from "@/app/api/supabase/server";
import { connectionMessage, postToChannel } from "@/libs/chat-connect";

export const dynamic = "force-dynamic";

// The Alerts tab's "Send test", and the welcome right after Connect Teams: posts a short "you're
// connected" message to the account's saved Slack or Teams webhook (never a URL from the request).
const recent = new Map<string, number[]>();
const LIMIT = 5;
const WINDOW_MS = 60_000;

export async function POST(req: Request) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to send a test." }, { status: 401 });

  const { channel, kind: asked } = (await req.json().catch(() => ({}))) as { channel?: string; kind?: string };
  // "welcome" right after Connect Teams; "test" from Send test
  const kind = asked === "welcome" ? "welcome" : "test";
  if (channel !== "slack" && channel !== "teams") return NextResponse.json({ error: "Unknown channel." }, { status: 400 });

  const now = Date.now();
  const sent = (recent.get(user.id) ?? []).filter((t) => now - t < WINDOW_MS);
  if (sent.length >= LIMIT) return NextResponse.json({ error: "That's a lot of tests. Try again in a minute." }, { status: 429 });
  recent.set(user.id, [...sent, now]);

  const { data } = await createAdminClient()
    .from("tracker_alert_settings")
    .select("slack_webhook, slack_channel, teams_webhook")
    .eq("user_id", user.id)
    .maybeSingle<{ slack_webhook: string | null; slack_channel: string | null; teams_webhook: string | null }>();
  const url = channel === "slack" ? data?.slack_webhook : data?.teams_webhook;
  if (!url) return NextResponse.json({ error: `Connect ${channel === "slack" ? "Slack" : "Teams"} first.` }, { status: 400 });

  const where = channel === "slack" ? data?.slack_channel ?? null : null;
  const problem = await postToChannel(channel, url, connectionMessage(kind, { origin: new URL(req.url).origin, where, channel }));
  return problem ? NextResponse.json({ error: problem }, { status: 502 }) : NextResponse.json({ ok: true });
}
