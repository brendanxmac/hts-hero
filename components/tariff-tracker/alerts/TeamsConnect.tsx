"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { useAlertSettings } from "./AlertSettingsContext";

// The Microsoft Teams box in Where Alerts Go. Until there's an HTS Hero app for Teams, a channel
// connects with a Workflows webhook ("Post to a channel when a webhook request is received"), the
// replacement for Office 365 connectors: the steps say where to click in Teams, then the URL is
// pasted here and saved.
const STEPS = [
  <>In Teams, open the channel for alerts and click <b>⋯</b> (More options) next to its name, then <b>Workflows</b>.</>,
  <>Pick <b>Post to a channel when a webhook request is received</b>, name it &ldquo;HTS Hero tariff alerts&rdquo; and click <b>Next</b>.</>,
  <>Check the team and channel, then click <b>Add workflow</b>.</>,
  <>Copy the URL Teams shows and paste it below.</>,
];

type Status = { tone: "success" | "error"; text: string } | null;

export const TeamsConnect = ({ webhook, onWebhookChange, onConnect, saving }: { webhook: string; onWebhookChange: (url: string) => void; onConnect: () => Promise<string | null>; saving: boolean }) => {
  const { settings, disconnectTeams } = useAlertSettings();
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState<"test" | "disconnect" | null>(null);
  const [changing, setChanging] = useState(false);
  const connected = Boolean(settings.teamsWebhook);
  const editing = !connected || changing;

  const sendTest = async () => {
    setBusy("test");
    setStatus(null);
    const response = await fetch("/api/tracker/alerts/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel: "teams" }) }).catch((): null => null);
    const data = (await response?.json().catch((): null => null)) as { ok?: boolean; error?: string } | null;
    setBusy(null);
    setStatus(data?.ok ? { tone: "success", text: "Sent. Check your Teams channel; it can take a few seconds." } : { tone: "error", text: data?.error ?? "Couldn't send the test. Please try again." });
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ALERT_TEST_SENT, { channel: "teams", ok: Boolean(data?.ok) });
  };

  const disconnect = async () => {
    setBusy("disconnect");
    const problem = await disconnectTeams();
    setBusy(null);
    setChanging(false);
    setStatus(problem ? { tone: "error", text: problem } : null);
  };

  const connect = async (): Promise<void> => {
    setStatus(null);
    const problem = await onConnect();
    if (problem) return setStatus({ tone: "error", text: problem });
    setChanging(false);
    // The channel's first message: proof the URL works, and what this is for everyone in it
    const response = await fetch("/api/tracker/alerts/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel: "teams", kind: "welcome" }) }).catch((): null => null);
    const data = (await response?.json().catch((): null => null)) as { ok?: boolean; error?: string } | null;
    setStatus(
      data?.ok
        ? { tone: "success", text: "Teams is connected. We posted a welcome message in your channel." }
        : { tone: "error", text: `Saved, but Teams didn't take the welcome message: ${data?.error ?? "no answer"} Check the URL, or make the workflow again.` }
    );
  };

  return (
    <div className={`${tt.tile} flex flex-col gap-3 p-4`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-base-content">
          Microsoft Teams <span className="font-normal text-base-content/60">(optional)</span>
        </span>
        {connected && <span className={tt.chip("success")}>Connected</span>}
      </div>

      {connected && !changing && (
        <>
          <p className="text-sm text-base-content">Alerts post to your Teams channel through the workflow you made there.</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => void sendTest()} disabled={busy !== null}>
              {busy === "test" ? "Sending…" : "Send test"}
            </button>
            <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => { setChanging(true); onWebhookChange(""); setStatus(null); }} disabled={busy !== null}>
              Change webhook
            </button>
            <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => void disconnect()} disabled={busy !== null}>
              {busy === "disconnect" ? "Disconnecting…" : "Disconnect"}
            </button>
          </div>
          <span className={ui.caption}>The workflow belongs to whoever made it in Teams. If they leave your company, make a new one and paste it here.</span>
        </>
      )}

      {editing && (
        <>
          <details className="group" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && trackEvent(MixpanelEvent.TARIFF_TRACKER_TEAMS_STEPS_OPENED)} open={!connected}>
            <summary className={`${ui.link} cursor-pointer text-xs`}>How to get the URL (about a minute)</summary>
            <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-4 text-xs leading-snug text-base-content/70">
              {STEPS.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </details>
          <input
            id="tt-teams"
            type="url"
            aria-label="Teams workflow webhook URL"
            className={ui.input}
            value={webhook}
            onChange={(e) => onWebhookChange(e.target.value)}
            placeholder="https://…logic.azure.com/… or …powerplatform.com/…"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => void connect()} disabled={saving || !webhook.trim()}>
              {saving ? "Connecting…" : "Connect Teams"}
            </button>
            {changing && (
              <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => { setChanging(false); onWebhookChange(settings.teamsWebhook); }}>
                Cancel
              </button>
            )}
          </div>
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
