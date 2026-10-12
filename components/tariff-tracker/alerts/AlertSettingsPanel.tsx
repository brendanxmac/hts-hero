"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { AlertSettings, SLACK_PREFIX, useAlertSettings } from "./AlertSettingsContext";

// Where tariff alerts go: email, a Slack channel, a Microsoft Teams channel
export const AlertSettingsPanel = ({ onSaved }: { onSaved?: () => void }) => {
  const { settings, save, configured, loading } = useAlertSettings();
  const [draft, setDraft] = useState<AlertSettings>(settings);
  const [state, setState] = useState<{ saving: boolean; message: string | null; saved: boolean }>({ saving: false, message: null, saved: false });
  // The saved settings arrive after the first render
  useEffect(() => setDraft(settings), [settings]);

  const set = (patch: Partial<AlertSettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setState((s) => ({ ...s, saved: false, message: null }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState({ saving: true, message: null, saved: false });
    const problem = await save(draft);
    setState({ saving: false, message: problem, saved: !problem });
    if (!problem) onSaved?.();
  };

  if (loading) return <div className={`${ui.skeleton} h-72 w-full`} />;

  return (
    <form onSubmit={submit} className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`} aria-labelledby="tt-alert-settings">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tt-alert-settings" className={tt.title}>
            Where alerts go
          </h2>
          <p className={tt.subtitle}>When a tariff change hits a product you track, we tell you here, with what changed and by how much.</p>
        </div>
        {configured && <span className={tt.chip("success")}>Alerts on</span>}
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className={`${tt.tile} flex flex-col gap-3 p-4`}>
          <label className="flex items-center gap-2.5 text-sm font-semibold text-base-content">
            <input type="checkbox" className={ui.checkbox} checked={draft.emailEnabled} onChange={(e) => set({ emailEnabled: e.target.checked })} />
            Email
          </label>
          <input
            type="email"
            aria-label="Email for alerts"
            className={ui.input}
            value={draft.email}
            disabled={!draft.emailEnabled}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="you@company.com"
          />
        </div>
        <div className={`${tt.tile} flex flex-col gap-3 p-4`}>
          <label htmlFor="tt-slack" className="text-sm font-semibold text-base-content">
            Slack <span className="font-normal text-base-content/60">(optional)</span>
          </label>
          <input id="tt-slack" type="url" className={ui.input} value={draft.slackWebhook} onChange={(e) => set({ slackWebhook: e.target.value })} placeholder={`${SLACK_PREFIX}services/…`} />
          <span className={ui.caption}>An incoming webhook for the channel to post in</span>
        </div>
        <div className={`${tt.tile} flex flex-col gap-3 p-4`}>
          <label htmlFor="tt-teams" className="text-sm font-semibold text-base-content">
            Microsoft Teams <span className="font-normal text-base-content/60">(optional)</span>
          </label>
          <input id="tt-teams" type="url" className={ui.input} value={draft.teamsWebhook} onChange={(e) => set({ teamsWebhook: e.target.value })} placeholder="https://…webhook.office.com/…" />
          <span className={ui.caption}>An incoming webhook for the channel to post in</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={tt.button("next")} disabled={state.saving}>
          {state.saving ? "Saving…" : configured ? "Save alert settings" : "Turn on alerts"}
        </button>
        {state.saved && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success" role="status">
            <CheckCircleIcon className="h-4 w-4" aria-hidden />
            Saved
          </span>
        )}
        {state.message && (
          <span className="text-sm font-semibold text-error" role="alert">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
};
