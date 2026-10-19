import { KINDS, type Kind } from "../../../libs/tariff-updates/types";

// Alert preferences, shared by the Tracker (where they're set) and the server (where alerts are
// sent: libs/tariff-updates/alerts.ts, libs/email/lifecycle.ts).
//
// Alerts are on from the moment an account adds an import: with no saved settings they go to the
// account's email. They're off only once the account turns every channel off (after a warning).
// Each account also picks which kinds of tariff update alert it; unsaved, the ones that change
// what an import pays (DEFAULT_ALERT_KINDS); AD/CVD cases are a choice, off until picked. Only updates that affect the account's own imports
// ever alert. HTS revisions and deadlines aren't choices: a revision only confirms the actions it
// carries out (their alerts say so), and a deadline doesn't change what anyone pays.

export interface AlertSettingsRow {
  email_enabled: boolean;
  email: string | null;
  slack_webhook: string | null;
  teams_webhook: string | null;
  alert_kinds?: string[] | null;
}

// The kinds an account can choose, in the order shown, and the ones on by default
export const ALERT_KIND_OPTIONS: { kind: Kind; label: string; note: string }[] = [
  { kind: "new_tariff", label: KINDS.new_tariff, note: "A new duty on your imports" },
  { kind: "rate_change", label: KINDS.rate_change, note: "A tariff's rate goes up or down" },
  { kind: "scope_change", label: KINDS.scope_change, note: "Products or countries added to or taken out of a tariff" },
  { kind: "exclusion", label: KINDS.exclusion, note: "Your import is exempted or excluded" },
  { kind: "pause", label: KINDS.pause, note: "A tariff is paused or delayed" },
  { kind: "end", label: KINDS.end, note: "A tariff on your import ends" },
  { kind: "deal", label: KINDS.deal, note: "A trade deal changes what you pay" },
  { kind: "other", label: "Bans, quotas and other actions", note: "Import bans, quotas and limits" },
  { kind: "guidance", label: KINDS.guidance, note: "CBP filing instructions for an action" },
  { kind: "investigation", label: KINDS.investigation, note: "Early warning: an investigation or proposal that could lead to a tariff" },
  {
    kind: "ad_cvd",
    label: "AD/CVD cases",
    note: "Antidumping and countervailing duty petitions, new investigations, preliminary and final decisions, orders, five-year reviews and scope rulings on your imports' products and countries",
  },
];

export const DEFAULT_ALERT_KINDS: Kind[] = ["new_tariff", "rate_change", "scope_change", "exclusion", "pause", "end", "deal", "other"];

const CHOOSABLE = new Set<string>(ALERT_KIND_OPTIONS.map((o) => o.kind));
export const alertKinds = (s: Pick<AlertSettingsRow, "alert_kinds"> | null | undefined): Kind[] =>
  (s?.alert_kinds ?? DEFAULT_ALERT_KINDS).filter((k): k is Kind => CHOOSABLE.has(k));

// On unless the account turned every channel off
export const alertsOn = (s: AlertSettingsRow | null | undefined) => !s || s.email_enabled || !!s.slack_webhook || !!s.teams_webhook;
