"use client";

import { ReactNode, useEffect, useState } from "react";
import { CheckIcon, ChevronDownIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../../duty-calculator/lib/format";
import { UsImports } from "../../../duty-calculator/lib/usImportsData";
import { SavingKind, SUPPLY_NOTES } from "../../insights/savings";
import { Measure } from "../../opportunities/measure";
import { OpportunityEvent } from "../../opportunities/OpportunitiesContext";
import { SavingOption } from "../../opportunities/options";
import { OpportunityStatus, statusInfo } from "../../opportunities/statuses";
import { TrackedProduct } from "../../report";
import { HtsSource } from "./HtsSource";
import { OriginSupply, RateChange } from "./OptionFacts";
import { SavingsCompare } from "./SavingsCompare";

// The parts of a saving shared by the savings review (SavingsReview) and the Savings tab's cards
// (SavingCard): the question it asks of the goods (Ask), No or Yes; the comparison with today, a
// tap away; the path to securing it and the move to confirm; and its history. Savings are only
// ever potential.

export const KINDS: Record<SavingKind, { label: string; tone: "success" | "warning" | "primary" }> = {
  program: { label: "Keep your supplier", tone: "success" },
  exemption: { label: "Exemption to check", tone: "warning" },
  origin: { label: "Source it somewhere else", tone: "primary" },
};

// The way to securing it, after Accept
export const PATH: { status: OpportunityStatus; label: string }[] = [
  { status: "researching", label: "Checking you qualify" },
  { status: "in_progress", label: "Paperwork under way" },
  { status: "secured", label: "Secured" },
];

export const NEXT: Partial<Record<OpportunityStatus, { title: string; detail: string; move: OpportunityStatus; button: string }>> = {
  researching: {
    title: "Confirm your goods qualify",
    detail: "Go through what it takes below with your supplier or broker. Once the paperwork starts, move it on.",
    move: "in_progress",
    button: "Paperwork under way",
  },
  in_progress: {
    title: "Claim it and mark it secured",
    detail: "When the paperwork is done and your broker is claiming it, mark it secured. We'll apply it to this import.",
    move: "secured",
    button: "Mark secured",
  },
};

export const applyText = (option: SavingOption, product: TrackedProduct) =>
  option.kind === "origin"
    ? `adds ${product.entry.element.htsno} from ${option.setup.country.name} to your imports and marks this one as moving there`
    : option.kind === "program"
      ? "claims it on this import in your imports"
      : "answers this condition yes on this import in your imports";

// What an event did, in the words of the review
const eventLabel = (e: OpportunityEvent) => {
  if (e.toStatus === "researching" && (!e.fromStatus || e.fromStatus === "found")) return "Accepted";
  if (e.toStatus === "not_eligible") return "Rejected";
  if (e.toStatus === "found") return e.fromStatus ? "Reopened for review" : "Saved for later";
  return statusInfo(e.toStatus).label;
};

const DOTS: Record<string, string> = { neutral: "bg-base-content/30", primary: "bg-primary", warning: "bg-warning", success: "bg-success", error: "bg-error" };

export const History = ({ events }: { events: OpportunityEvent[] }) => (
  <details className="group">
    <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-base-content/70 hover:text-base-content">
      <ChevronDownIcon className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
      History ({events.length})
    </summary>
    <ol className="mt-3 flex flex-col gap-3 pl-1">
      {[...events].reverse().map((e) => (
        <li key={e.id} className="flex gap-3">
          <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOTS[statusInfo(e.toStatus).tone]}`} aria-hidden />
          <div className="min-w-0">
            <p className="m-0 text-sm text-base-content">
              <span className="font-semibold">{eventLabel(e)}</span>
              <span className="text-base-content/60"> · {formatDate(e.createdAt.slice(0, 10))}</span>
            </p>
            {e.note && <p className="m-0 mt-0.5 text-sm text-base-content/70">{e.note}</p>}
            {e.applied && <p className="m-0 mt-0.5 text-xs text-base-content/60">Applied to your imports{e.applied.addedProductKey ? `: added ${e.applied.addedProductKey}` : ""}.</p>}
          </div>
        </li>
      ))}
    </ol>
  </details>
);

// The question an option asks of the goods, worded for its kind, and one line on what it turns on.
// A program with an appendix asks whether the product is named in it; an agreement, whether the
// goods meet its rule of origin (shown under it). An exemption's condition is asked as written when
// it's a question already ("Are the goods a donation…?"); a statement ("These goods are for use
// in…") is put to the user as it stands.
const APPENDIX_QUESTIONS: Record<string, { question: string; context: string }> = {
  K: { question: "Is your product named in the Pharmaceutical Appendix?", context: "Duty-free for the drugs it names, and their salts, esters and hydrates. Search it below." },
  L: { question: "Is your product named in the Intermediate Chemicals for Dyes Appendix?", context: "Duty-free for the chemicals it names. Search it below." },
};
export const askOf = (option: SavingOption): { lead?: string; question: string; context: string } => {
  if (option.kind === "program")
    return (
      APPENDIX_QUESTIONS[option.ref] ?? {
        question: `Do your goods meet the ${option.title.replace(/^Claim (the )?/, "")}'s rules?`,
        context: "Same supplier, same country. The rule your goods have to meet is below.",
      }
    );
  if (option.kind === "origin") return { question: `Would you consider sourcing it from ${option.setup.country.name}?`, context: `Longer term: a new supplier there. ${option.detail}` };
  return option.detail.trim().endsWith("?") ? { question: option.detail, context: "" } : { lead: "Is this true of your goods?", question: option.detail, context: "" };
};

// Keys typed into a field, or inside a dialog (dialogs keep focus while open), aren't the Savings
// tab's. Only where the key was pressed counts: widgets like the support chat keep dialog markup on
// the page all the time. The savings review is a dialog that takes its own keys (data-own-keys).
export const keyIsElsewhere = (e: KeyboardEvent) => {
  if (e.defaultPrevented) return true;
  const el = (e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true'], [role='listbox'], [role='menu'], [role='dialog'], [aria-modal='true']");
  return !!el && !el.hasAttribute("data-own-keys");
};

const Key = ({ children }: { children: ReactNode }) => (
  <kbd className="hidden rounded border border-current/25 px-1.5 text-[11px] font-semibold leading-4 opacity-70 sm:inline">{children}</kbd>
);

// One question and two big answers, No or Yes (the savings review's step). Y and N answer it from
// the keyboard.
export const Ask = ({
  option,
  product,
  measure,
  shipmentsPerYear,
  imports,
  busy,
  onYes,
  onNo,
  children,
}: {
  option: SavingOption;
  product: TrackedProduct;
  measure: Measure;
  shipmentsPerYear: number;
  imports: UsImports | null;
  busy: boolean;
  onYes: () => void;
  onNo: () => void;
  // Under the answers: the comparison, a tap away
  children?: ReactNode;
}) => {
  const { lead, question, context } = askOf(option);
  const kind = KINDS[option.kind];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (busy || e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (keyIsElsewhere(e)) return;
      const key = e.key.toLowerCase();
      if (key === "y") onYes();
      else if (key === "n") onNo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onYes, onNo]);

  return (
    <section className="flex flex-col gap-7" aria-label={question}>
      <div className="flex flex-col gap-2">
        <span className={tt.eyebrow(kind.tone)}>{kind.label}</span>
        {lead && <p className="m-0 text-base font-medium text-base-content/70">{lead}</p>}
        <h2 className={`${tt.display} m-0 text-[26px] font-semibold leading-snug text-base-content`}>
          {option.kind === "origin" && <span className="mr-2">{option.setup.country.flag}</span>}
          {lead ? `\u201C${question}\u201D` : question}
        </h2>
        {context && <p className={`${tt.subtitle} m-0`}>{context}</p>}
      </div>

      <RateChange product={product} option={option} measure={measure} shipmentsPerYear={shipmentsPerYear} />

      {option.supply && option.supply !== "proven" && (
        <p className={`${ui.notice("warning")} m-0 text-sm`}>
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          {SUPPLY_NOTES[option.supply]}.{" "}
          {option.supply === "unproven"
            ? "The US didn't import this product from here last year, so find out whether a supplier can make it before counting on it. It isn't counted in your totals."
            : "Census has no import figures for this code, so this is on duty alone: check that suppliers there can make it."}
        </p>
      )}

      {option.kind === "origin" ? <OriginSupply product={product} option={option} imports={imports} /> : <HtsSource option={option} product={product} />}

      {/* The answers stay in view while the source text is read */}
      <div className={`${tt.panel} sticky bottom-4 z-10 grid grid-cols-2 gap-3 p-3 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]`}>
        <button type="button" className={`${ui.button({ variant: "secondary", size: "lg" })} h-14! text-base!`} disabled={busy} onClick={onNo}>
          <XMarkIcon className="h-5 w-5" aria-hidden />
          No
          <Key>N</Key>
        </button>
        <button
          type="button"
          className={`${ui.button({ variant: "primary", size: "lg" })} h-14! !bg-success text-base! !text-success-content hover:!bg-success/90`}
          disabled={busy}
          onClick={onYes}
        >
          <CheckIcon className="h-5 w-5" aria-hidden />
          Yes, pursue it
          <Key>Y</Key>
        </button>
      </div>
      {children}
    </section>
  );
};

// A move to confirm: to the next stage, secured, or ruled out
export const Move = ({ to, children, onConfirm, onCancel, busy }: { to: OpportunityStatus; children?: ReactNode; onConfirm: () => void; onCancel: () => void; busy: boolean }) => {
  const rejecting = to === "not_eligible";
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-tt-soft p-4">
      <p className="m-0 text-sm font-semibold text-base-content">{rejecting ? "Rule it out?" : to === "secured" ? "Mark it secured?" : `Move to ${statusInfo(to).label}?`}</p>
      {children}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={ui.button({ variant: "primary", size: "sm" })} disabled={busy} onClick={onConfirm}>
          {busy ? "Saving…" : rejecting ? "Rule it out" : to === "secured" ? "Secure and apply" : "Save"}
        </button>
        <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

// The comparison with today, a tap away
export const Compare = ({
  product,
  option,
  imports,
  measure,
  center,
}: {
  product: TrackedProduct;
  option: SavingOption;
  imports: UsImports | null;
  measure: Measure;
  center?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className={`flex items-center gap-1.5 ${center ? "self-center" : "self-start"} text-sm font-semibold text-base-content/70 hover:text-base-content`}
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
        {open ? "Hide the comparison" : "How it compares with today"}
      </button>
      {open && <SavingsCompare product={product} option={option} imports={imports} measure={measure} />}
    </div>
  );
};
