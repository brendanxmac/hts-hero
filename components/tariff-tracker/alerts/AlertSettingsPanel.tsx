"use client";

import { FormEvent, useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import type { Kind } from "@/libs/tariff-updates/types";
import { ALERT_KIND_OPTIONS, DEFAULT_ALERT_KINDS } from "./alertPrefs";
import { AlertSettings, settingsOn, SLACK_PREFIX, useAlertSettings } from "./AlertSettingsContext";

// Where tariff alerts go (email, a Slack channel, a Microsoft Teams channel) and which kinds of
// tariff update set one off. Alerts are on from the start; turning every channel off asks first.
export const AlertSettingsPanel = ({ onSaved }: { onSaved?: () => void }) => {
  const { settings, save, on, loading } = useAlertSettings();
  const [draft, setDraft] = useState<AlertSettings>(settings);
  const [state, setState] = useState<{ saving: boolean; message: string | null; saved: boolean }>({ saving: false, message: null, saved: false });
  const [confirmOff, setConfirmOff] = useState(false);
  // The saved settings arrive after the first render
  useEffect(() => setDraft(settings), [settings]);

  const set = (patch: Partial<AlertSettings>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setState((s) => ({ ...s, saved: false, message: null }));
  };
  const toggleKind = (kind: Kind, checked: boolean) =>
    set({ kinds: checked ? ALERT_KIND_OPTIONS.map((o) => o.kind).filter((k) => k === kind || draft.kinds.includes(k)) : draft.kinds.filter((k) => k !== kind) });

  const commit = async () => {
    setConfirmOff(false);
    setState({ saving: true, message: null, saved: false });
    const problem = await save(draft);
    setState({ saving: false, message: problem, saved: !problem });
    if (!problem) onSaved?.();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // Turning alerts off is one click from missing a tariff on your own imports: ask first
    if (on && !settingsOn(draft)) setConfirmOff(true);
    else void commit();
  };

  if (loading) return <div className={`${ui.skeleton} h-72 w-full`} />;

  const draftOn = settingsOn(draft);
  return (
    <form onSubmit={submit} className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`} aria-labelledby="tt-alert-settings">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tt-alert-settings" className={tt.title}>
            Where Alerts Go
          </h2>
          <p className={tt.subtitle}>When a tariff change hits a product you track, we tell you here, with what changed and by how much.</p>
        </div>
        <span className={tt.chip(on ? "success" : "warning")}>{on ? "Alerts on" : "Alerts off"}</span>
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

      <fieldset className="flex flex-col gap-3" disabled={!draftOn}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <legend className="text-sm font-semibold text-base-content">Which Updates That Affect Your Imports Should Alert You</legend>
          <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => set({ kinds: [...DEFAULT_ALERT_KINDS] })}>
            Reset to recommended
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {ALERT_KIND_OPTIONS.map((o) => (
            <label key={o.kind} className={`${tt.tile} flex cursor-pointer items-start gap-2.5 p-3 ${draftOn ? "" : "opacity-60"}`}>
              <input type="checkbox" className={`${ui.checkbox} mt-0.5`} checked={draft.kinds.includes(o.kind)} onChange={(e) => toggleKind(o.kind, e.target.checked)} />
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold text-base-content">{o.label}</span>
                <span className={ui.caption}>{o.note}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={ui.button({ variant: "primary" })} disabled={state.saving}>
          {state.saving ? "Saving…" : on || draftOn ? "Save alert settings" : "Save"}
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

      <Dialog open={confirmOff} onClose={() => setConfirmOff(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className={`${ui.card} hts-theme flex w-full max-w-md flex-col gap-4 p-5`}>
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
              <div className="flex flex-col gap-1.5">
                <Dialog.Title className="text-lg font-semibold tracking-tight text-base-content">Turn off tariff alerts?</Dialog.Title>
                <p className={ui.bodySm}>
                  With no email, Slack or Teams, you won&apos;t hear when a new tariff, rate change or exemption hits one of your imports. You&apos;d only find out from
                  your next customs bill, or by checking the Tracker yourself.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={ui.button({ variant: "ghost" })} onClick={() => void commit()}>
                Turn alerts off
              </button>
              <button type="button" className={ui.button({ variant: "primary" })} onClick={() => setConfirmOff(false)}>
                Keep alerts on
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </form>
  );
};
