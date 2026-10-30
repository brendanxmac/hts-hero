"use client";

import { ReactNode } from "react";
import {
  ArrowUpTrayIcon,
  BellAlertIcon,
  CheckCircleIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ScaleIcon,
  SparklesIcon,
} from "@heroicons/react/20/solid";
import * as tt from "@/components/ui/styles/tracker";
import { mono } from "@/components/ui/font";
import { delay } from "../parts";
import { Cursor, MockTitle, MockWindow, useBeats } from "./mock";

// Each tour step's demo: the Tracker, small, doing what the step explains, a cursor doing the
// clicking. The labels are the Tracker's own (Your Imports, Alert Settings, the AD/CVD Check…);
// products, codes and rates are examples. Rate changes are before → after and in %, savings are
// what an import could or may save, AD/CVD rates depend on the exporter: as in the Tracker.

type Props = { run: number };

const Code = ({ children }: { children: string }) => <span className={`${mono.className} font-semibold`}>{children}</span>;

const COLS = "grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)_auto]";

// A row of the imports table, as Your Imports draws it
const Row = ({
  code,
  name,
  flag,
  country,
  rate,
  chip,
  lit = false,
  wait = 0,
}: {
  code: string;
  name: string;
  flag: string;
  country: string;
  rate: string;
  chip?: ReactNode;
  lit?: boolean;
  wait?: number;
}) => (
  <div
    className={`tt-ob-rise grid ${COLS} items-center gap-2 border-b border-base-300 px-2.5 py-1.5 text-[0.65rem] transition-colors duration-300 last:border-b-0 ${lit ? "bg-primary/10" : ""}`}
    style={delay(wait)}
  >
    <span className="flex min-w-0 flex-col items-start">
      <Code>{code}</Code>
      <span className="truncate text-base-content/55">{name}</span>
      {chip}
    </span>
    <span className="truncate text-base-content/80">
      {flag} {country}
    </span>
    <span className={`${tt.display} text-right text-xs font-semibold tabular-nums text-base-content`}>{rate}</span>
  </div>
);

const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100">
    <div className={`grid ${COLS} gap-2 border-b border-base-300 bg-tt-soft px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider text-base-content/50`}>
      <span>Product</span>
      <span>Origin</span>
      <span>Duty rate</span>
    </div>
    {children}
  </div>
);

const Button = ({ children, pressed = false, tone = "primary" }: { children: ReactNode; pressed?: boolean; tone?: "primary" | "secondary" }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.6rem] font-semibold transition-transform duration-150 ${
      tone === "primary" ? "bg-primary text-primary-content" : "border border-base-300 bg-base-100 text-base-content"
    } ${pressed ? "scale-95" : ""}`}
  >
    {children}
  </span>
);

const Check = ({ on, label, flash = false }: { on: boolean; label: string; flash?: boolean }) => (
  <span className={`flex items-center gap-1.5 rounded px-1 text-[0.6rem] transition-colors duration-300 ${flash ? "bg-primary/10" : ""}`}>
    <span
      className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-300 ${on ? "border-primary bg-primary text-primary-content" : "border-base-300 bg-base-100"}`}
    >
      {on && <CheckIcon className="h-2.5 w-2.5" />}
    </span>
    <span className={on ? "text-base-content" : "text-base-content/60"}>{label}</span>
  </span>
);

// ── 1. Add your imports ──────────────────────────────────────────────────────────────────────────
const IMPORTS = [
  { code: "8413.91.90.15", name: "Pump parts", flag: "🇧🇷", country: "Brazil", rate: "50.0%" },
  { code: "8409.99.91.90", name: "Engine parts", flag: "🇦🇷", country: "Argentina", rate: "12.5%" },
  { code: "8482.10.50.44", name: "Ball bearings", flag: "🇩🇪", country: "Germany", rate: "17.4%" },
  { code: "7326.90.86.88", name: "Steel brackets", flag: "🇨🇳", country: "China", rate: "77.9%" },
];

export const ImportsVisual = ({ run }: Props) => {
  const b = useBeats([700, 1400, 2200, 2800, 3500, 4400, 5700], run);
  const cursor = [
    { x: 62, y: 80 },
    { x: 61, y: 66 },
    { x: 61, y: 66, click: true },
    { x: 61, y: 47 },
    { x: 61, y: 47, click: true },
    { x: 75, y: 85 },
    { x: 75, y: 85 },
    { x: 75, y: 85, hidden: true },
  ][b];
  return (
    <MockWindow tab="catalog" cursor={<Cursor {...cursor} />}>
      <MockTitle title="Your Imports" />
      {b < 2 && (
        <div className="flex h-[19rem] flex-col items-center justify-center gap-2 rounded-lg border border-base-300 bg-base-100 text-center">
          <span className={tt.chip("primary")}>Tariff Tracker</span>
          <span className={`${tt.display} max-w-[16rem] text-sm font-semibold leading-snug text-base-content`}>Tariff Alerts, Savings, &amp; Audits on Autopilot</span>
          <span className="max-w-[15rem] text-[0.6rem] text-base-content/60">Add your HTS codes and countries of origin once.</span>
          <span className="mt-2">
            <Button pressed={b === 2}>
              Set up my imports
            </Button>
          </span>
        </div>
      )}
      {b >= 2 && b < 5 && (
        <div className="flex flex-col gap-2 pt-6">
          <span className={`${tt.display} tt-ob-rise text-xs font-semibold text-base-content`}>Choose a way to add your imports</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { t: "Your recent searches", d: "From the calculator" },
              { t: "Upload a spreadsheet", d: "Excel or CSV" },
              { t: "Paste a list", d: "Codes and countries" },
            ].map((o, i) => (
              <div
                key={o.t}
                className={`tt-ob-rise flex flex-col gap-1 rounded-lg border bg-base-100 p-2.5 transition-all duration-300 ${
                  i === 1 && b >= 3 ? "border-primary shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-primary)_18%,transparent)]" : "border-base-300"
                }`}
                style={delay(i * 80)}
              >
                <span className="flex h-9 items-center justify-center rounded-md bg-tt-soft text-base-content/40">
                  {i === 1 && <ArrowUpTrayIcon className="h-4 w-4" />}
                </span>
                <span className="text-[0.62rem] font-semibold text-base-content">{o.t}</span>
                <span className="text-[0.55rem] text-base-content/55">{o.d}</span>
              </div>
            ))}
          </div>
          {b >= 4 && (
            <div className="tt-ob-pop mt-3 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
              <span className="text-[0.65rem] font-semibold text-base-content">my-imports.xlsx</span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-success/15">
                <span className="tt-ob-fill block h-full rounded-full bg-success" />
              </span>
              <CheckCircleIcon className="h-3.5 w-3.5 text-success" />
            </div>
          )}
        </div>
      )}
      {b >= 5 && (
        <div className="flex flex-col gap-2">
          <Table>
            {IMPORTS.map((r, i) => (
              <Row key={r.code} {...r} wait={i * 110} />
            ))}
          </Table>
          {b >= 6 && (
            <div className="tt-ob-pop flex items-center gap-2 self-start rounded-full bg-success px-3 py-1.5 text-[0.65rem] font-semibold text-success-content">
              <CheckIcon className="h-3.5 w-3.5" />
              You&apos;re tracking 4 imports
            </div>
          )}
        </div>
      )}
    </MockWindow>
  );
};

// ── 2. Set up your alerts ────────────────────────────────────────────────────────────────────────
const KINDS = ["New tariff", "Rate change", "Coverage change", "Exclusion or exemption", "Tariff ended", "AD/CVD cases"];

export const AlertsVisual = ({ run }: Props) => {
  const b = useBeats([700, 1300, 2100, 2700, 3400, 4000, 4700, 5300, 6100], run);
  const cursor = [
    { x: 55, y: 80 },
    { x: 75, y: 16 },
    { x: 75, y: 16, click: true },
    { x: 62, y: 46 },
    { x: 62, y: 46, click: true },
    { x: 68, y: 79 },
    { x: 68, y: 79, click: true },
    { x: 41, y: 92 },
    { x: 41, y: 92, click: true },
    { x: 41, y: 92, hidden: true },
  ][b];
  const settings = b >= 2;
  const slack = b >= 4;
  const adcvd = b >= 6;
  const saved = b >= 8;
  return (
    <MockWindow tab="changes" cursor={<Cursor {...cursor} />}>
      <MockTitle
        title="Tariff Changes"
        action={
          <span className="flex gap-1 rounded-full bg-base-100 p-0.5 text-[0.55rem] font-semibold">
            {["Actions", "Rate History", "Alert Settings"].map((v) => (
              <span
                key={v}
                className={`rounded-full px-2 py-0.5 transition-colors duration-300 ${(v === "Alert Settings") === settings ? "bg-base-content text-base-100" : "text-base-content/60"}`}
              >
                {v}
              </span>
            ))}
          </span>
        }
      />
      {!settings && (
        <div className="flex flex-col gap-2">
          {["Section 232 rate change on steel derivatives", "New reciprocal tariff on Brazil", "Exclusions extended for China"].map((t, i) => (
            <div key={t} className="tt-ob-rise flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2" style={delay(i * 90)}>
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="flex-1 text-[0.62rem] text-base-content">{t}</span>
              <span className="text-[0.55rem] text-base-content/50">Oct {14 - i * 3}</span>
            </div>
          ))}
        </div>
      )}
      {settings && (
        <div className="tt-ob-rise flex flex-col gap-2.5 rounded-lg border border-base-300 bg-base-100 p-3">
          <span className="flex items-center justify-between">
            <span className={`${tt.display} text-xs font-semibold text-base-content`}>Where Alerts Go</span>
            <span className={tt.chip("success")}>Alerts on</span>
          </span>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1 rounded-md bg-tt-soft p-2">
              <Check on label="Email" />
              <span className="truncate text-[0.55rem] text-base-content/60">you@company.com</span>
            </div>
            <div className={`flex flex-col gap-1 rounded-md p-2 transition-colors duration-300 ${slack ? "bg-success/10" : "bg-tt-soft"}`}>
              <span className="text-[0.6rem] font-semibold text-base-content">Slack</span>
              {slack ? (
                <span className="tt-ob-pop text-[0.55rem] font-semibold text-success">Connected · #imports</span>
              ) : (
                <Button pressed={b === 4} tone="secondary">
                  Add to Slack
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-tt-soft p-2">
              <span className="text-[0.6rem] font-semibold text-base-content">Microsoft Teams</span>
              <span className="text-[0.55rem] text-base-content/50">Optional</span>
            </div>
          </div>
          <span className="pt-1 text-[0.6rem] font-semibold text-base-content">Which Updates That Affect Your Imports Should Alert You</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {KINDS.map((k) => (
              <Check key={k} label={k} on={k !== "AD/CVD cases" || adcvd} flash={k === "AD/CVD cases" && b === 6} />
            ))}
          </div>
          <span className="self-start pt-1">
            <Button pressed={b === 8}>{saved ? "Saved" : "Save alert settings"}</Button>
          </span>
        </div>
      )}
      {/* What they get: the alert, landing */}
      {b >= 9 && (
        <div className="tt-ob-from-right absolute bottom-3 right-3 flex w-[62%] items-start gap-2.5 rounded-lg border border-base-300 bg-base-100 p-3 shadow-[0_18px_40px_-14px_rgb(0_0_0/0.35)]">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
            <span className="tt-ob-ping absolute inset-0 rounded-full bg-error/30" style={delay(300)} />
            <BellAlertIcon className="relative h-4 w-4" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1 text-[0.55rem] font-bold uppercase tracking-wider text-error">
              <EnvelopeIcon className="h-3 w-3" /> Tariff alert · Email &amp; Slack
            </span>
            <span className="text-[0.65rem] font-semibold leading-snug text-base-content">A rate change hits 3 of your imports</span>
            <span className="text-[0.6rem] text-base-content/70">
              Steel brackets from China: 52.9% → 77.9% <span className="font-semibold text-error">(+25%)</span>
            </span>
          </span>
        </div>
      )}
    </MockWindow>
  );
};

// ── 3. View and manage your imports ──────────────────────────────────────────────────────────────
const CATALOG = [
  ...IMPORTS,
  { code: "8413.70.20.04", name: "Centrifugal pumps", flag: "🇲🇽", country: "Mexico", rate: "0.0%" },
  { code: "8481.80.10.99", name: "Hand valves", flag: "🇻🇳", country: "Vietnam", rate: "24.0%" },
];

export const ManageVisual = ({ run }: Props) => {
  const b = useBeats([700, 1300, 1650, 2000, 2350, 3200, 3800, 4600], run);
  const typed = "pump".slice(0, Math.max(0, Math.min(4, b - 1)));
  const filtered = b >= 2 ? CATALOG.filter((r) => r.name.toLowerCase().includes(typed)) : CATALOG;
  const cursor = [
    { x: 55, y: 80 },
    { x: 40, y: 24 },
    { x: 40, y: 24 },
    { x: 40, y: 24 },
    { x: 40, y: 24 },
    { x: 45, y: 40 },
    { x: 45, y: 40, click: true },
    { x: 88, y: 70 },
    { x: 88, y: 70, hidden: true },
  ][b];
  const open = b >= 6;
  return (
    <MockWindow tab="catalog" cursor={<Cursor {...cursor} />}>
      <MockTitle
        title="Your Imports"
        action={
          <span className="flex items-center gap-1">
            <Button tone="secondary">Export</Button>
            <Button>
              <PlusIcon className="h-3 w-3" />
              Add imports
            </Button>
          </span>
        }
      />
      <div className="mb-2 flex items-center gap-1.5">
        <span
          className={`flex flex-1 items-center gap-1.5 rounded-md border bg-base-100 px-2 py-1 text-[0.6rem] transition-colors ${b >= 1 && b < 5 ? "border-primary" : "border-base-300"}`}
        >
          <MagnifyingGlassIcon className="h-3 w-3 shrink-0 text-base-content/40" />
          {typed ? <span className="text-base-content">{typed}</span> : <span className="truncate text-base-content/40">Search code, product or country</span>}
          {b >= 1 && b < 5 && <span className="h-3 w-px animate-pulse bg-primary" />}
        </span>
        {["Country of origin", "Tariff", "Alerts"].map((f) => (
          <span key={f} className="whitespace-nowrap rounded-full border border-base-300 bg-base-100 px-2 py-1 text-[0.55rem] text-base-content/60">
            {f}
          </span>
        ))}
      </div>
      <Table>
        {filtered.map((r, i) => (
          <Row key={r.code} {...r} lit={open && i === 0} />
        ))}
      </Table>

      {/* The import, opened: every tariff on it, stacked */}
      {open && (
        <div className="tt-ob-from-right absolute inset-y-3 right-3 flex w-[58%] flex-col gap-2.5 rounded-lg border border-base-300 bg-base-100 p-3 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.3)]">
          <span className="flex flex-col">
            <Code>8413.91.90.15</Code>
            <span className="text-[0.6rem] text-base-content/60">Pump parts · From 🇧🇷 Brazil</span>
          </span>
          <span className="flex gap-0.5 border-b border-base-300 text-[0.55rem]">
            {["Overview", "Duty", "Compare", "Changes", "Savings", "Audits"].map((t) => (
              <span key={t} className={`px-1.5 pb-1 font-semibold ${t === "Duty" ? "border-b-2 border-primary text-primary" : "text-base-content/50"}`}>
                {t}
              </span>
            ))}
          </span>
          <span className={`${tt.display} text-xl font-semibold tabular-nums text-base-content`}>50.0%</span>
          <span className="flex h-2.5 overflow-hidden rounded-full bg-tt-soft">
            <span className="tt-ob-fill h-full bg-(--chart-2)" style={{ width: "20%" }} />
            <span className="tt-ob-fill h-full bg-(--chart-3)" style={{ width: "80%", ...delay(200) }} />
          </span>
          <span className="flex flex-col gap-1 text-[0.6rem]">
            {[
              ["Base duty", "Free", "--chart-1"],
              ["Reciprocal (Brazil)", "+10.0%", "--chart-2"],
              ["Brazil (IEEPA)", "+40.0%", "--chart-3"],
            ].map(([l, v, c], i) => (
              <span key={l} className="tt-ob-rise flex items-center gap-1.5" style={delay(300 + i * 90)}>
                <span className="h-2 w-2 rounded-sm" style={{ background: `var(${c})` }} />
                <span className="flex-1 text-base-content/70">{l}</span>
                <span className="font-semibold tabular-nums text-base-content">{v}</span>
              </span>
            ))}
          </span>
          {b >= 7 && (
            <span className="tt-ob-rise mt-auto flex items-center justify-between rounded-md bg-tt-soft px-2 py-1.5 text-[0.55rem]">
              <span className="text-base-content/70">Alerts on for this import</span>
              <span className={tt.chip("success")}>On</span>
            </span>
          )}
        </div>
      )}
    </MockWindow>
  );
};

// ── 4. Check for AD/CVD ──────────────────────────────────────────────────────────────────────────
export const AdcvdVisual = ({ run }: Props) => {
  const b = useBeats([800, 1700, 2300, 3200, 3900, 4600, 5300], run);
  const cursor = [
    { x: 55, y: 85 },
    { x: 55, y: 85 },
    { x: 40, y: 50 },
    { x: 40, y: 50, click: true },
    { x: 66, y: 46 },
    { x: 66, y: 46, click: true },
    { x: 70, y: 76 },
    { x: 70, y: 76, hidden: true },
  ][b];
  const flagged = b >= 1;
  const opened = b >= 3;
  const checking = b >= 5;
  return (
    <MockWindow tab="catalog" cursor={<Cursor {...cursor} />}>
      <MockTitle title="Your Imports" />
      <Table>
        {CATALOG.slice(0, 2).map((r) => (
          <Row key={r.code} {...r} />
        ))}
        <Row
          code="7604.29.10.00"
          name="Aluminum extrusions"
          flag="🇨🇳"
          country="China"
          rate="80.0%"
          lit={opened}
          chip={
            flagged && (
              <span className="relative mt-0.5 inline-flex">
                {!opened && <span className="tt-ob-ping absolute inset-0 rounded-full bg-warning/50" />}
                <span className="tt-ob-pop relative rounded-full bg-warning/15 px-1.5 py-px text-[0.5rem] font-bold text-warning">AD/CVD</span>
              </span>
            )
          }
        />
        {CATALOG.slice(3, 6).map((r) => (
          <Row key={r.code} {...r} />
        ))}
      </Table>

      {/* The import's Duty tab: the warning, then the AD/CVD Check */}
      {opened && (
        <div className="tt-ob-from-right absolute inset-y-3 right-3 flex w-[60%] flex-col gap-2 rounded-lg border border-base-300 bg-base-100 p-3 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.3)]">
          <span className="flex items-center gap-1.5">
            <Code>7604.29.10.00</Code>
            <span className="rounded-full bg-warning/15 px-1.5 py-px text-[0.5rem] font-bold text-warning">AD/CVD</span>
          </span>
          <span className="flex gap-0.5 border-b border-base-300 text-[0.55rem]">
            {["Overview", "Duty", "Compare", "Changes"].map((t) => (
              <span key={t} className={`px-1.5 pb-1 font-semibold ${t === "Duty" ? "border-b-2 border-primary text-primary" : "text-base-content/50"}`}>
                {t}
                {t === "Duty" && <span className="ml-1 rounded-full bg-warning/15 px-1 text-[0.5rem] text-warning">AD/CVD may apply</span>}
              </span>
            ))}
          </span>
          <span className="flex items-start gap-1.5 rounded-md bg-warning/10 px-2 py-1.5 text-[0.58rem] text-base-content/80">
            <ExclamationTriangleIcon className="mt-px h-3 w-3 shrink-0 text-warning" />
            <span>
              AD/CVD duties may apply to this import and aren&apos;t in this estimate. <span className="font-semibold text-primary">Check the cases</span>
            </span>
          </span>
          {checking && (
            <div className="tt-ob-rise flex flex-col gap-1.5 rounded-md border border-base-300 p-2">
              <span className="flex items-center gap-1 text-[0.5rem] font-bold uppercase tracking-wider text-warning">
                <ScaleIcon className="h-3 w-3" /> AD/CVD Check
              </span>
              <span className="text-[0.62rem] font-semibold text-base-content">Is your product aluminum extrusions?</span>
              <span className="flex gap-1">
                <Button pressed={b === 6}>Yes, it is</Button>
                <Button tone="secondary">No</Button>
                <Button tone="secondary">Not sure</Button>
              </span>
              {b >= 7 && (
                <span className="tt-ob-rise flex flex-col gap-1 pt-1">
                  <span className="text-[0.58rem] font-semibold text-base-content">Who made and exported it?</span>
                  <span className="flex items-center gap-1 rounded border border-base-300 px-1.5 py-1 text-[0.55rem] text-base-content/40">
                    <MagnifyingGlassIcon className="h-3 w-3" />
                    Search for your supplier
                  </span>
                  <span className="text-[0.55rem] text-base-content/55">The rate depends on the exporter, as Commerce set it.</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </MockWindow>
  );
};

// ── 5. Check for savings ───────────────────────────────────────────────────────────────────────
const SAVINGS = [
  { name: "Centrifugal pumps", flag: "🇲🇽", what: "Trade program: may qualify for USMCA", from: "25.0%", to: "0.0%" },
  { name: "Hand valves", flag: "🇻🇳", what: "Cheaper country of origin worth checking", from: "24.0%", to: "10.0%" },
  { name: "Engine parts", flag: "🇦🇷", what: "Exclusion worth checking", from: "12.5%", to: "2.5%" },
];

export const SavingsVisual = ({ run }: Props) => {
  const b = useBeats([700, 1500, 2200, 2900, 3800], run);
  return (
    <MockWindow tab="savings">
      <MockTitle title="Savings" />
      <div className="relative mb-2.5 overflow-hidden rounded-lg border border-base-300 bg-base-100 p-3">
        <span className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-base-content">
          <SparklesIcon className="h-3.5 w-3.5 text-primary" />
          {b >= 4 ? "3 ways your imports could pay less" : "Checking every import…"}
        </span>
        {b < 4 && <span key={run} className="tt-ob-fill absolute bottom-0 left-0 h-0.5 w-full bg-primary" style={{ animationDuration: "2800ms" }} />}
      </div>
      <div className="flex flex-col gap-2">
        {SAVINGS.map(
          (s, i) =>
            b > i && (
              <div key={s.name} className="tt-ob-from-right flex items-center gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2">
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[0.65rem] font-semibold text-base-content">
                    {s.flag} {s.name}
                  </span>
                  <span className="text-[0.6rem] text-success">{s.what}</span>
                </span>
                <span className="text-right text-[0.6rem] tabular-nums text-base-content/60">
                  {s.from} → <span className="font-semibold text-success">{s.to}</span>
                </span>
              </div>
            ),
        )}
      </div>
      {b >= 5 && (
        <div className="tt-ob-pop mt-3 flex items-center justify-between rounded-lg bg-success/10 px-3 py-2 text-[0.65rem]">
          <span className="font-semibold text-base-content">Ranked by what could save the most</span>
          <span className="text-[0.6rem] text-base-content/60">with what each one takes</span>
        </div>
      )}
    </MockWindow>
  );
};

// ── 6. Audit your entries ──────────────────────────────────────────────────────────────────────
const ENTRIES = [
  { id: "ABC-1234567-8", date: "Mar 4", paid: "25.0%", due: "25.0%", verdict: "ok" as const },
  { id: "ABC-1234612-0", date: "Apr 18", paid: "35.0%", due: "10.0%", verdict: "over" as const },
  { id: "ABC-1234701-5", date: "May 2", paid: "7.5%", due: "7.5%", verdict: "ok" as const },
  { id: "ABC-1234799-3", date: "Jun 9", paid: "2.5%", due: "27.5%", verdict: "under" as const },
];

export const AuditsVisual = ({ run }: Props) => {
  const b = useBeats([700, 1300, 1900, 2500, 3100, 3900], run);
  const ECOLS = "grid-cols-[minmax(0,1.3fr)_auto_auto_minmax(0,1.3fr)]";
  return (
    <MockWindow tab="entries">
      <MockTitle title="Audits" action={<span className={tt.chip("warning")}>Beta</span>} />
      <div className="mb-2 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2">
        <ClipboardDocumentListIcon className="h-3.5 w-3.5 text-success" />
        <span className="flex-1 text-[0.62rem] font-semibold text-base-content">entry-summaries-q2.pdf</span>
        <span className="text-[0.55rem] text-base-content/55">4 entries read</span>
      </div>
      <div className="overflow-hidden rounded-lg border border-base-300 bg-base-100">
        <div className={`grid ${ECOLS} gap-2 border-b border-base-300 bg-tt-soft px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wider text-base-content/50`}>
          <span>Entry</span>
          <span>Paid</span>
          <span>Rate that day</span>
          <span className="text-right">Check</span>
        </div>
        {ENTRIES.map((e, i) => {
          const checked = b > i + 1;
          const checking = b === i + 1;
          return (
            <div
              key={e.id}
              className={`grid ${ECOLS} items-center gap-2 border-b border-base-300 px-2.5 py-2 text-[0.6rem] transition-colors duration-300 last:border-b-0 ${checking ? "bg-primary/10" : ""}`}
            >
              <span className="flex min-w-0 flex-col">
                <Code>{e.id}</Code>
                <span className="text-base-content/55">{e.date}</span>
              </span>
              <span className="tabular-nums text-base-content">{e.paid}</span>
              <span className="tabular-nums text-base-content/70">{checked ? e.due : "…"}</span>
              <span className="flex justify-end">
                {checking && <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
                {checked && e.verdict === "ok" && (
                  <span className="tt-ob-pop flex items-center gap-1 font-semibold text-success">
                    <CheckIcon className="h-3 w-3" />
                    Matches
                  </span>
                )}
                {checked && e.verdict === "over" && <span className="tt-ob-pop rounded-full bg-success/15 px-1.5 py-0.5 font-semibold text-success">May have overpaid</span>}
                {checked && e.verdict === "under" && <span className="tt-ob-pop rounded-full bg-warning/15 px-1.5 py-0.5 font-semibold text-warning">May have underpaid</span>}
              </span>
            </div>
          );
        })}
      </div>
      {b >= 6 && (
        <div className="tt-ob-pop mt-3 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-[0.6rem] text-base-content">
            <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" />
            <span>
              <strong>1 entry</strong> may be worth a refund
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-warning/10 px-3 py-2 text-[0.6rem] text-base-content">
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" />
            <span>
              <strong>1 entry</strong> to fix before Customs finds it
            </span>
          </div>
        </div>
      )}
    </MockWindow>
  );
};

// The welcome step: the Tracker's home at a glance, its three numbers rising in (changes that hit
// the imports, what they could save, what audits found), then a few imports with what each found
export const WelcomeVisual = ({ run }: Props) => {
  const tiles = [
    { icon: BellAlertIcon, label: "Changes", value: "3", note: "hit your imports", tone: "text-error" },
    { icon: SparklesIcon, label: "Savings", value: "$94,400", note: "you could save a year", tone: "text-success" },
    { icon: ScaleIcon, label: "Audits", value: "$4,000", note: "you may have overpaid", tone: "text-warning" },
  ];
  return (
    <MockWindow tab="overview">
      <MockTitle title="Home" />
      <div key={run} className="grid grid-cols-3 gap-2">
        {tiles.map((t, i) => (
          <div key={t.label} className="tt-ob-rise flex flex-col gap-1 rounded-lg border border-base-300 bg-base-100 p-2.5" style={delay(150 + i * 140)}>
            <span className="flex items-center gap-1 text-[0.6rem] font-bold uppercase tracking-wider text-base-content/55">
              <t.icon className={`h-3 w-3 ${t.tone}`} aria-hidden /> {t.label}
            </span>
            <span className={`${tt.display} text-lg font-semibold leading-none ${t.tone}`}>{t.value}</span>
            <span className="text-[0.6rem] text-base-content/55">{t.note}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-base-300 bg-base-100">
        <Row code="9403.60.80" name="Wooden furniture" flag="🇻🇳" country="VN" rate="25% → 35%" chip={<span className="text-[0.6rem] font-semibold text-error">New tariff +10%</span>} lit wait={650} />
        <Row code="7318.15.80" name="Steel screws" flag="🇨🇳" country="CN" rate="32.5%" chip={<span className="text-[0.6rem] font-semibold text-success">Could save 7.5%</span>} wait={760} />
        <Row code="7217.10.90" name="Steel wire" flag="🇨🇳" country="CN" rate="50%" chip={<span className="text-[0.6rem] font-semibold text-warning">May have overpaid $4,000</span>} wait={870} />
      </div>
    </MockWindow>
  );
};
