"use client";

import {
  ArrowRightIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  LinkIcon,
} from "@heroicons/react/20/solid";
import { MixpanelEvent, trackEvent } from "../../libs/mixpanel";
import { getLatestVerifiedRevision, isVerifiedDate } from "../../tariffs/engine-v2/revisions";
import { Explore } from "../Explore";
import { Segmented } from "./controls";
import { formatDate } from "./format";
import { mono } from "./font";
import { EXAMPLES, Example, MAX_COMPARE, TariffFinder, View } from "./useTariffFinder";
import styles from "./theme.module.css";

// Smaller pieces of the Tariff Finder page

// ── Simple / Detailed / Compare ──

const VIEWS: { id: View; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "detailed", label: "Detailed" },
  { id: "compare", label: "Compare" },
];

export const ViewSwitch = ({ f, className = "" }: { f: TariffFinder; className?: string }) => (
  <div className={`min-w-0 w-full sm:w-[280px] ${className}`}>
    <Segmented label="View" options={VIEWS} value={f.view} onChange={f.changeView} compact />
  </div>
);

// ── Copy and share ──

export const ShareButtons = ({ f }: { f: TariffFinder }) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      className={styles.button}
      onClick={() => f.copy("summary")}
      aria-label="Copy summary"
    >
      {f.copied === "summary" ? <CheckIcon className="w-4 h-4" /> : <ClipboardDocumentIcon className="w-4 h-4" />}
      <span className="hidden sm:inline">{f.copied === "summary" ? "Copied" : "Copy"}</span>
    </button>
    <button
      type="button"
      className={styles.buttonPrimary}
      onClick={() => f.copy("link")}
      aria-label="Copy share link"
    >
      {f.copied === "link" ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
      <span className="hidden sm:inline">{f.copied === "link" ? "Link copied" : "Share"}</span>
      <span className="sm:hidden">{f.copied === "link" ? "Copied" : "Share"}</span>
    </button>
  </div>
);

// ── Entry date outside verified data ──

// For any entry date; the Tariff Finder's version is VerifiedNotice below
export const DateNotice = ({
  entryDate,
  onUseVerified,
}: {
  entryDate: string;
  onUseVerified: (date: string) => void;
}) => {
  if (isVerifiedDate(entryDate)) return null;
  const latestVerified = getLatestVerifiedRevision();
  return (
    <div
      role="status"
      className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-[var(--dc-warning-border)] bg-[var(--dc-warning-soft)] px-4 py-3.5"
    >
      <ExclamationTriangleIcon className="w-5 h-5 shrink-0 text-[var(--dc-warning)]" aria-hidden />
      <p className="flex-1 text-[14px] leading-snug text-[var(--dc-warning)]">
        <span className="font-semibold">Tariff rules for {formatDate(entryDate)} aren&apos;t verified yet.</span>{" "}
        Our data is verified for HTS {latestVerified.title} ({formatDate(latestVerified.from)} –{" "}
        {latestVerified.to ? formatDate(latestVerified.to) : "present"}). Changes outside that window may be missing.
      </p>
      <button type="button" className={`${styles.button} shrink-0`} onClick={() => onUseVerified(latestVerified.from)}>
        Use {formatDate(latestVerified.from)}
        <ArrowRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export const VerifiedNotice = ({ f }: { f: TariffFinder }) => (
  <DateNotice entryDate={f.entryDate} onUseVerified={(date) => f.setEntryDate(date, "verified_notice")} />
);

// ── Before a code is chosen ──

export const ExampleButtons = ({ onExample }: { onExample: (e: Example) => void }) => (
  <div className="flex flex-col gap-2.5">
    {EXAMPLES.map((example) => (
      <button
        key={example.code}
        type="button"
        onClick={() => onExample(example)}
        className="group flex items-center justify-between gap-4 rounded-lg border border-[var(--dc-border)] bg-[var(--dc-surface-2)] px-4 py-3.5 text-left transition-colors hover:border-[var(--dc-accent-border)] hover:bg-[var(--dc-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]"
      >
        <span className="flex flex-col">
          <span className="text-[14.5px] font-semibold text-[var(--dc-text)]">
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
  "Enter an 8 or 10 digit HTS code, or search by description",
  `Choose the country of origin (or up to ${MAX_COMPARE} to compare), value and entry date`,
  "Select any adjustments that apply to your product or entry to see the final estimate ",
];

export const emptyTitle = (f: TariffFinder) =>
  f.selectedElement && !f.country ? "Choose a country of origin to see your duty" : "Enter an HTS code to see your duty";

// ── Around the page ──

export const Disclaimer = () => (
  <p className="text-center text-[12.5px] leading-relaxed text-[var(--dc-text-3)] max-w-2xl mx-auto">
    All figures shown are estimates based on the details provided and may not be complete nor correct. <br /> Spot something wrong?{" "}
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
