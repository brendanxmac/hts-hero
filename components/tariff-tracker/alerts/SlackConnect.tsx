"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { SLACK_PREFIX, useAlertSettings } from "./AlertSettingsContext";

// The Slack box in Where Alerts Go. "Add to Slack" (the HTS Hero Slack app) is the way in: the user
// picks a channel on Slack's own screen and lands back here connected, with alerts posting as
// HTS Hero. A pasted incoming webhook still works for anyone who has one.
const SlackMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 122.8 122.8" className={className} aria-hidden>
    <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#E01E5A" />
    <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36C5F0" />
    <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2EB67D" />
    <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ECB22E" />
  </svg>
);

const RETURN_MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  connected: { tone: "success", text: "Slack is connected. We posted a welcome message in your channel." },
  cancelled: { tone: "error", text: "Slack wasn't connected. Try again whenever you're ready." },
  error: { tone: "error", text: "Couldn't connect Slack. Please try again." },
};

type Status = { tone: "success" | "error"; text: string } | null;

export const SlackConnect = ({ webhook, onWebhookChange }: { webhook: string; onWebhookChange: (url: string) => void }) => {
  const { settings, disconnectSlack } = useAlertSettings();
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState<"test" | "disconnect" | null>(null);
  const [pasting, setPasting] = useState(false);
  const connected = Boolean(settings.slackWebhook);

  // Back from Slack: ?slack=connected|cancelled|error says how it went, once
  useEffect(() => {
    const url = new URL(window.location.href);
    const outcome = url.searchParams.get("slack");
    if (!outcome) return;
    setStatus(RETURN_MESSAGES[outcome] ?? null);
    if (outcome === "connected") trackEvent(MixpanelEvent.TARIFF_TRACKER_SLACK_CONNECTED);
    url.searchParams.delete("slack");
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  const sendTest = async () => {
    setBusy("test");
    setStatus(null);
    const response = await fetch("/api/tracker/alerts/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel: "slack" }) }).catch((): null => null);
    const data = (await response?.json().catch((): null => null)) as { ok?: boolean; error?: string } | null;
    setBusy(null);
    setStatus(data?.ok ? { tone: "success", text: `Sent. Check ${settings.slackChannel || "your Slack channel"}.` } : { tone: "error", text: data?.error ?? "Couldn't send the test. Please try again." });
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ALERT_TEST_SENT, { channel: "slack", ok: Boolean(data?.ok) });
  };

  const disconnect = async () => {
    setBusy("disconnect");
    const problem = await disconnectSlack();
    setBusy(null);
    setStatus(problem ? { tone: "error", text: problem } : null);
  };

  const install = (
    <a href="/api/slack/install" className={ui.button({ variant: connected ? "ghost" : "secondary", size: "sm" })} onClick={() => trackEvent(MixpanelEvent.TARIFF_TRACKER_SLACK_CONNECT_STARTED, { change: connected })}>
      {connected ? "Change channel" : (
        <>
          <SlackMark className="h-4 w-4" />
          Add to Slack
        </>
      )}
    </a>
  );

  return (
    <div className={`${tt.tile} flex flex-col gap-3 p-4`}>
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-base-content">
          <SlackMark className="h-4 w-4" />
          Slack <span className="font-normal text-base-content/60">(optional)</span>
        </span>
        {connected && <span className={tt.chip("success")}>Connected</span>}
      </div>

      {connected ? (
        <>
          <p className="text-sm text-base-content">
            {settings.slackChannel ? (
              <>
                Alerts post in <span className="font-semibold">{settings.slackChannel}</span>
                {settings.slackTeam ? <> in {settings.slackTeam}</> : null}, as HTS Hero.
              </>
            ) : (
              "Alerts post to the channel of the webhook you pasted."
            )}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => void sendTest()} disabled={busy !== null}>
              {busy === "test" ? "Sending…" : "Send test"}
            </button>
            {install}
            <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => void disconnect()} disabled={busy !== null}>
              {busy === "disconnect" ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
          <span className={ui.caption}>To hear each alert, open the channel in Slack and set its notifications to All new messages.</span>
        </>
      ) : (
        <>
          <div>{install}</div>
          <span className={ui.caption}>
            Pick a channel on Slack&apos;s screen and alerts post there as HTS Hero. Want a new channel for alerts? Create it in Slack first. If your workspace needs admin
            approval for apps, Slack asks them, and alerts start once they approve.
          </span>
          {pasting || webhook ? (
            <input
              id="tt-slack"
              type="url"
              aria-label="Slack incoming webhook"
              className={ui.input}
              value={webhook}
              onChange={(e) => onWebhookChange(e.target.value)}
              placeholder={`${SLACK_PREFIX}services/…`}
            />
          ) : (
            <button type="button" className={`${ui.link} self-start text-xs`} onClick={() => setPasting(true)}>
              Have a webhook? Paste it instead
            </button>
          )}
        </>
      )}

      {status && (
        <span className={`inline-flex items-start gap-1.5 text-sm font-semibold ${status.tone === "success" ? "text-success" : "text-error"}`} role={status.tone === "success" ? "status" : "alert"}>
          {status.tone === "success" && <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
          {status.text}
        </span>
      )}
    </div>
  );
};
