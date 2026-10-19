import { slackPayload, teamsPayload, type ChatMessage } from "@/emails/chat";

// The messages a Slack or Teams channel gets about the connection itself: a welcome as soon as
// it's connected (Add to Slack, Connect Teams), and the Alerts tab's "Send test". Real alerts go
// through the outbox (libs/email/outbox.ts).

export type ChatChannel = "slack" | "teams";

const NAMES: Record<ChatChannel, string> = { slack: "Slack", teams: "Teams" };

export const connectionMessage = (kind: "welcome" | "test", { origin, where, channel }: { origin: string; where: string | null; channel: ChatChannel }): ChatMessage => ({
  title: kind === "welcome" ? `Welcome! Tariff alerts for your imports will post ${where ? `in ${where}` : "here"}` : "Test: tariff alerts are connected",
  tone: "brand",
  eyebrow: kind === "welcome" ? "HTS Hero · Tariff alerts" : "HTS Hero · Test message",
  summary:
    "When a tariff change hits one of your imports, you'll see what changed, the rate before → after on each import, and a link to the details. Tariff News you follow posts here too.",
  notes: [
    channel === "slack"
      ? "Tip: set this channel's notifications to All new messages so you hear each alert."
      : "Tip: set this channel's notifications to All activity so you hear each alert.",
  ],
  actions: [
    { label: "Open my alerts", url: `${origin}/tariff-tracker?tab=alerts` },
    { label: "See recent tariff news", url: `${origin}/tariff-updates` },
  ],
});

// Posts to a Slack or Teams webhook; null when it went, else a message for the user
export const postToChannel = async (channel: ChatChannel, url: string, message: ChatMessage): Promise<string | null> => {
  const name = NAMES[channel];
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(channel === "slack" ? slackPayload(message) : teamsPayload(message)),
      signal: AbortSignal.timeout(15_000),
    });
    if (response.ok) return null;
    const body = (await response.text()).slice(0, 100);
    // Slack answers 403/404 ("no_service", "channel_not_found") once the webhook is removed
    if ([403, 404, 410].includes(response.status)) return `${name} says this connection was removed (${body || response.status}). Connect it again.`;
    return `${name} answered ${response.status}${body ? `: ${body}` : ""}.`;
  } catch {
    return `Couldn't reach ${name}. Try again.`;
  }
};
