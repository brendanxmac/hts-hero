// The HTS Hero Slack app ("Add to Slack"): app/api/slack/install sends the user to Slack to pick a
// channel; app/api/slack/callback trades Slack's code for that channel's incoming webhook.

export const SLACK_STATE_COOKIE = "slack_oauth_state";

// Slack sends the user back to the site they started on. Every one must be listed in the app's
// OAuth & Permissions → Redirect URLs (https only: run dev with `npm run dev:https`).
export const slackRedirectUri = (origin: string) => `${origin}/api/slack/callback`;

export interface SlackWebhook {
  url: string;
  channel: string;
  team: string | null;
}

// https://api.slack.com/methods/oauth.v2.access
export const exchangeSlackCode = async (code: string, redirectUri: string): Promise<SlackWebhook> => {
  const response = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID ?? "",
      client_secret: process.env.SLACK_CLIENT_SECRET ?? "",
      code,
      redirect_uri: redirectUri,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await response.json()) as {
    ok: boolean;
    error?: string;
    team?: { name?: string };
    incoming_webhook?: { url: string; channel: string };
  };
  if (!data.ok || !data.incoming_webhook?.url) throw new Error(`Slack answered ${data.error ?? response.status}`);
  return { url: data.incoming_webhook.url, channel: data.incoming_webhook.channel, team: data.team?.name ?? null };
};
