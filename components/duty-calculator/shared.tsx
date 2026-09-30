"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  LinkIcon,
  SwatchIcon,
} from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { Explore } from "../Explore";
import { Segmented } from "./controls";
import { formatDate, mono } from "./format";
import { DESIGNS, EXAMPLES, Example, MAX_COMPARE, TariffFinder, View } from "./useTariffFinder";
import styles from "./theme.module.css";

// Pieces every design uses, so each design file is only about layout

// ── Design switcher (experiment) ──

export const DesignSwitcher = ({ f }: { f: TariffFinder }) => (
  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--dc-text-3)]">
      <SwatchIcon className="w-4 h-4" aria-hidden />
      Design preview
    </span>
    <div className="w-full sm:w-[420px]">
      <Segmented label="Page design" options={DESIGNS} value={f.design} onChange={f.changeDesign} compact />
    </div>
  </div>
);

// ── Detailed / Simple / Compare ──

const VIEWS: { id: View; label: string }[] = [
  { id: "detailed", label: "Detailed" },
  { id: "simple", label: "Simple" },
];
const VIEWS_WITH_COMPARE: { id: View; label: string }[] = [...VIEWS, { id: "compare", label: "Compare" }];

export const ViewSwitch = ({ f, className = "" }: { f: TariffFinder; className?: string }) => {
  const canCompare = f.compareCountries.length > 0;
  return (
    <div className={`min-w-0 ${canCompare ? "w-full sm:w-[280px]" : "w-full sm:w-[200px]"} ${className}`}>
      <Segmented
        label="View"
        options={canCompare ? VIEWS_WITH_COMPARE : VIEWS}
        value={f.view === "compare" && !canCompare ? "detailed" : f.view}
        onChange={f.changeView}
        compact
      />
    </div>
  );
};

// ── Copy and share ──

export const ShareButtons = ({ f, compact }: { f: TariffFinder; compact?: boolean }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      className={styles.button}
      style={compact ? { height: 32, padding: "0 10px", fontSize: 13 } : undefined}
      onClick={() => f.copy("summary")}
      aria-label="Copy summary"
    >
      {f.copied === "summary" ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
      <span className="hidden sm:inline">{f.copied === "summary" ? "Copied" : "Copy"}</span>
    </button>
    <button
      type="button"
      className={styles.buttonPrimary}
      style={compact ? { height: 32, padding: "0 10px", fontSize: 13 } : undefined}
      onClick={() => f.copy("link")}
      aria-label="Copy share link"
    >
      {f.copied === "link" ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      <span className="hidden sm:inline">{f.copied === "link" ? "Link copied" : "Share link"}</span>
      <span className="sm:hidden">{f.copied === "link" ? "Copied" : "Share"}</span>
    </button>
  </div>
);

// ── Entry date outside verified data ──

export const VerifiedNotice = ({ f, compact }: { f: TariffFinder; compact?: boolean }) => {
  if (f.verified) return null;
  const { latestVerified } = f;
  return (
    <div
      role="status"
      className={`flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)] ${
        compact ? "px-3 py-2.5" : "px-4 py-3.5"
      }`}
    >
      <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-[var(--dc-warning)]" aria-hidden />
      <p className={`flex-1 leading-snug text-[var(--dc-warning)] ${compact ? "text-[13px]" : "text-[14px]"}`}>
        <span className="font-semibold">Tariff rules for {formatDate(f.entryDate)} aren&apos;t verified yet.</span>{" "}
        {compact
          ? `Verified: HTS ${latestVerified.title}.`
          : `Our data is verified for HTS ${latestVerified.title} (${formatDate(latestVerified.from)} – ${
              latestVerified.to ? formatDate(latestVerified.to) : "present"
            }). Changes outside that window may be missing.`}
      </p>
      <button
        type="button"
        className={`${styles.button} shrink-0`}
        style={compact ? { height: 32, fontSize: 13 } : undefined}
        onClick={() => f.setEntryDate(latestVerified.from, "verified_notice")}
      >
        Use {formatDate(latestVerified.from)}
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

// ── Trade preference ──

export const PreferenceSelect = ({
  f,
  id,
  countryCode,
  className = "",
  style,
}: {
  f: TariffFinder;
  id?: string;
  countryCode?: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const code = countryCode ?? f.country?.code;
  const entry = f.compareEntries.find((e) => e.country.code === code);
  const result = entry?.result ?? f.result;
  if (!code || !result || result.availablePreferences.length === 0) return null;
  return (
    <select
      id={id}
      className={`${styles.input} appearance-none ${className}`}
      style={style}
      value={f.preferences[code] ?? ""}
      onChange={(e) => f.setPreference(code, e.target.value)}
      aria-label="Trade preference"
    >
      <option value="">None claimed</option>
      {result.availablePreferences.map((p) => (
        <option key={p.symbol} value={p.symbol}>
          {p.symbol} · {p.name}
        </option>
      ))}
    </select>
  );
};

// ── Before a code is chosen ──

export const ExampleButtons = ({ onExample, compact }: { onExample: (e: Example) => void; compact?: boolean }) => (
  <div className={compact ? "flex flex-wrap gap-2" : "flex flex-col gap-2.5"}>
    {EXAMPLES.map((example) => (
      <button
        key={example.code}
        type="button"
        onClick={() => onExample(example)}
        className={`group flex items-center justify-between gap-4 rounded-xl border border-[var(--dc-border)] bg-[var(--dc-surface-2)] text-left transition-colors hover:border-[var(--dc-accent-border)] hover:bg-[var(--dc-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)] ${
          compact ? "px-3 py-2" : "px-4 py-3.5"
        }`}
      >
        <span className="flex flex-col">
          <span className={`${compact ? "text-[13.5px]" : "text-[14.5px]"} font-semibold text-[var(--dc-text)]`}>
            {example.label} from {example.origin}
          </span>
          <span className={`${mono.className} text-[12.5px] text-[var(--dc-text-2)]`}>{example.code}</span>
        </span>
        <ArrowRightIcon className="w-4 h-4 text-[var(--dc-text-3)] group-hover:text-[var(--dc-accent)]" />
      </button>
    ))}
  </div>
);

export const EMPTY_STEPS = [
  "Enter the 8- or 10-digit HTS code, or search by description",
  `Choose the country of origin (or up to ${MAX_COMPARE} to compare), value and entry date`,
  "Answer any questions that could lower your duty",
];

export const emptyTitle = (f: TariffFinder) =>
  f.selectedElement && !f.country ? "Choose a country of origin to see your duty" : "Enter an HTS code to see your duty";

// ── Around the page ──

export const Disclaimer = () => (
  <p className="mt-4 text-center text-[12.5px] leading-relaxed text-[var(--dc-text-3)] max-w-2xl mx-auto">
    Estimates are based on the HTS and Chapter 99 rules in effect on the entry date and your answers. They don&apos;t
    include antidumping or countervailing duties. Spot something wrong?{" "}
    <a
      href="mailto:support@htshero.com"
      className={styles.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent(MixpanelEvent.DUTY_CALCULATOR_SUPPORT_CLICKED)}
    >
      Tell us
    </a>{" "}
    and we&apos;ll fix it.
  </p>
);

export const ExploreModal = ({ f }: { f: TariffFinder }) =>
  f.showExplore ? (
    <dialog className="modal modal-open" aria-label="Search HTS by description">
      <div className="modal-box w-11/12 max-w-6xl h-[85vh] p-0 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-base-content/10">
          <span className="font-semibold">Find your HTS code</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={f.closeExplore}>
            Close
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Explore explorerSurface="duty_calculator_modal" />
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={f.closeExplore}>
          close
        </button>
      </form>
    </dialog>
  ) : null;
