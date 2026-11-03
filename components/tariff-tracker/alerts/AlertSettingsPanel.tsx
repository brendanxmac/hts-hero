"use client";

import { FormEvent, useEffect, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { CheckCircleIcon, ExclamationTriangleIcon, LockClosedIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { trackerSans } from "@/components/ui/font";
import { THEME } from "@/components/ui/theme";
import type { Kind } from "@/libs/tariff-updates/types";
import { ALERT_KIND_OPTIONS, DEFAULT_ALERT_KINDS } from "./alertPrefs";
import { useTrackerAccess } from "../access/accessContext";
import { AlertSettings, settingsOn, useAlertSettings } from "./AlertSettingsContext";
import { SlackConnect } from "./SlackConnect";
import { TeamsConnect } from "./TeamsConnect";

// Slack or Teams on a plan without them (plans for 100 or more products have them): locked, and a channel connected
// during the trial stays saved, paused, ready for an upgrade
const LockedChannel = ({ name, connected, onUnlock }: { name: string; connected: boolean; onUnlock: () => void }) => (
  <div className={`${tt.tile} flex flex-col gap-3 p-4`}>
    <span className="flex items-center justify-between gap-2 text-sm font-semibold text-base-content">
      <span className="flex items-center gap-2">
        <LockClosedIcon className="h-4 w-4 text-base-content/50" aria-hidden />
        {name}
      </span>
      <span className={tt.chip("neutral")}>Available on Pro</span>
    </span>
    <p className={ui.caption}>{connected ? `Your ${name} channel is saved and paused. It starts again on a plan for 100 or more products.` : `Get alerts in ${name} on a Pro or Scale plan.`}</p>
    <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={onUnlock}>
      See plans
    </button>
  </div>
);

// Where tariff alerts go (email, a Slack channel, a Microsoft Teams channel) and which kinds of
// tariff update set one off. Alerts are on from the start; turning every channel off asks first.
export const AlertSettingsPanel = ({ onSaved }: { onSaved?: () => void }) => {
  const { settings, save, on, loading } = useAlertSettings();
  const { access, openUpgrade } = useTrackerAccess();
  const { alertEmails, chat } = access.entitlements;
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
    return problem;
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
          {draft.extraEmails.map((email, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="email"
                aria-label={`Alert email ${i + 2}`}
                className={ui.input}
                value={email}
                disabled={!draft.emailEnabled}
                onChange={(e) => set({ extraEmails: draft.extraEmails.map((x, j) => (j === i ? e.target.value : x)) })}
                placeholder="teammate@company.com"
              />
              <button
                type="button"
                className="rounded-full p-1.5 text-base-content/50 hover:bg-tt-soft hover:text-base-content"
                aria-label={`Remove ${email || "this email"}`}
                onClick={() => set({ extraEmails: draft.extraEmails.filter((_, j) => j !== i) })}
              >
                <XMarkIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          {draft.extraEmails.length + 1 < alertEmails ? (
            <button type="button" className={`${ui.button({ variant: "ghost", size: "sm" })} self-start`} disabled={!draft.emailEnabled} onClick={() => set({ extraEmails: [...draft.extraEmails, ""] })}>
              Add another email
            </button>
          ) : (
            alertEmails < 20 && (
              <p className={ui.caption}>
                Your plan sends alerts to {alertEmails === 1 ? "1 email" : `${alertEmails} emails`}.{" "}
                <button type="button" className="font-semibold text-primary hover:underline" onClick={() => openUpgrade("alerts")}>
                  Add more
                </button>
              </p>
            )
          )}
        </div>
        {chat ? (
          <>
            <SlackConnect webhook={draft.slackWebhook} onWebhookChange={(slackWebhook) => set({ slackWebhook })} />
            <TeamsConnect webhook={draft.teamsWebhook} onWebhookChange={(teamsWebhook) => set({ teamsWebhook })} onConnect={commit} saving={state.saving} />
          </>
        ) : (
          <>
            <LockedChannel name="Slack" connected={!!draft.slackWebhook} onUnlock={() => openUpgrade("alerts")} />
            <LockedChannel name="Teams" connected={!!draft.teamsWebhook} onUnlock={() => openUpgrade("alerts")} />
          </>
        )}
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
          {/* It portals out of Duty Guard, so it carries Duty Guard's look itself (DESIGN_SYSTEM §15) */}
          <Dialog.Panel className={`${THEME} hts-tracker ${trackerSans.className} ${tt.panel} flex w-full max-w-md flex-col gap-5 p-6 shadow-2xl`}>
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning" aria-hidden>
                <ExclamationTriangleIcon className="h-5 w-5" />
              </span>
              <div className="flex flex-col gap-1.5">
                <Dialog.Title className={`${tt.title} m-0`}>Turn Off Tariff Alerts?</Dialog.Title>
                <p className={ui.bodySm}>
                  With no email, Slack or Teams, you won&apos;t hear when a new tariff, rate change or exemption hits one of your imports. You&apos;d only find out from
                  your next customs bill, or by checking Duty Guard yourself.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={ui.button({ variant: "secondary" })} onClick={() => void commit()}>
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
