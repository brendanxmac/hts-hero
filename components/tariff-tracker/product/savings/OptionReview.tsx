"use client";

import { ReactNode, useEffect, useState } from "react";
import { ArrowPathIcon, CheckCircleIcon, CheckIcon, ChevronDownIcon, ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import toast from "react-hot-toast";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../../duty-calculator/lib/format";
import { UsImports } from "../../../duty-calculator/lib/usImportsData";
import { formatRate } from "../../formatRate";
import { SavingKind, SUPPLY_NOTES } from "../../insights/savings";
import { wholeDollars } from "../../insights/teasers";
import { useApplyOption } from "../../opportunities/apply";
import { formatSaving, Measure } from "../../opportunities/measure";
import { Opportunity, OpportunityEvent, useOpportunities } from "../../opportunities/OpportunitiesContext";
import { SavingOption } from "../../opportunities/options";
import { OpportunityStatus, statusInfo } from "../../opportunities/statuses";
import { StatusChip } from "../../opportunities/StatusChip";
import { TrackedProduct } from "../../report";
import { HtsSource } from "./HtsSource";
import { OriginSupply, RateChange } from "./OptionFacts";
import { exemptionName } from "./OptionList";
import { SavingsCompare } from "./SavingsCompare";
import { WhatItTakes } from "./WhatItTakes";

// One way to save, opened from the list beside it. It starts as one question about the goods (Ask),
// answered No or Yes with two big buttons (or N and Y), and either answer moves on to the next
// option still to review, with an Undo. No notes for now. A Yes turns the view into securing it:
// where it's got to, the next step and what it takes, and the moves from there (paperwork under
// way, secured, which applies it to the catalog, or ruled out after all). Every move is kept as the
// saving's history. The comparison with today is a tap away. Savings are only ever potential.

const KINDS: Record<SavingKind, { label: string; tone: "success" | "warning" | "primary" }> = {
  program: { label: "Keep your supplier", tone: "success" },
  exemption: { label: "Exemption to check", tone: "warning" },
  origin: { label: "Source it somewhere else", tone: "primary" },
};

// The way to securing it, after Accept
const PATH: { status: OpportunityStatus; label: string }[] = [
  { status: "researching", label: "Checking you qualify" },
  { status: "in_progress", label: "Paperwork under way" },
  { status: "secured", label: "Secured" },
];

const NEXT: Partial<Record<OpportunityStatus, { title: string; detail: string; move: OpportunityStatus; button: string }>> = {
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

const applyText = (option: SavingOption, product: TrackedProduct) =>
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

const History = ({ events }: { events: OpportunityEvent[] }) => (
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
const askOf = (option: SavingOption): { lead?: string; question: string; context: string } => {
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
// the page all the time.
export const keyIsElsewhere = (e: KeyboardEvent) =>
  e.defaultPrevented || !!(e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true'], [role='listbox'], [role='menu'], [role='dialog'], [aria-modal='true']");

const Key = ({ children }: { children: ReactNode }) => (
  <kbd className="hidden rounded border border-current/25 px-1.5 text-[11px] font-semibold leading-4 opacity-70 sm:inline">{children}</kbd>
);

// Undecided: one question and two big answers, No or Yes. Y and N answer it from the keyboard.
const Ask = ({
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
const Move = ({ to, children, onConfirm, onCancel, busy }: { to: OpportunityStatus; children?: ReactNode; onConfirm: () => void; onCancel: () => void; busy: boolean }) => {
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

// Accepted: the path to securing it, the next step and what it takes
const Securing = ({
  opportunity,
  option,
  product,
  busy,
  onMove,
}: {
  opportunity: Opportunity;
  option?: SavingOption;
  product: TrackedProduct;
  busy: boolean;
  onMove: (to: OpportunityStatus) => Promise<boolean>;
}) => {
  const [pending, setPending] = useState<OpportunityStatus | null>(null);
  const here = PATH.findIndex((p) => p.status === opportunity.status);
  const next = NEXT[opportunity.status];
  const kind = opportunity.kind;
  const confirm = async () => {
    if (pending && (await onMove(pending))) setPending(null);
  };

  return (
    <div className="flex flex-col gap-6 border-t border-base-300 pt-6">
      {/* Where it's got to */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
        {PATH.map((p, i) => (
          <li key={p.status} className="flex flex-col gap-2">
            <span className={`h-1.5 rounded-full ${i < here ? "bg-success" : i === here ? "bg-primary" : "bg-base-300"}`} aria-hidden />
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${i === here ? "text-base-content" : i < here ? "text-success" : "text-base-content/60"}`}>
              {i < here && <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden />}
              {p.label}
            </span>
          </li>
        ))}
      </ol>

      {/* The next step, and the move it leads to */}
      {next && (
        <div className="flex flex-col gap-4 rounded-2xl bg-primary/[0.06] p-5">
          <div>
            <span className={tt.eyebrow("primary")}>Next step</span>
            <p className={`${tt.title} m-0 mt-1`}>{next.title}</p>
            <p className={`${tt.subtitle} m-0 mt-1`}>{next.detail}</p>
          </div>
          {pending ? (
            <Move key={pending} to={pending} busy={busy} onConfirm={confirm} onCancel={() => setPending(null)}>
              {pending === "secured" && option && (
                <p className="m-0 flex items-start gap-2 text-sm text-base-content/70">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Securing it {applyText(option, product)}. The change is kept in its history.
                </p>
              )}
            </Move>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={ui.button({ variant: "primary", size: "sm" })} disabled={busy || (next.move === "secured" && !option)} onClick={() => setPending(next.move)}>
                {next.button}
              </button>
              {next.move !== "secured" && option && (
                <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} disabled={busy} onClick={() => setPending("secured")}>
                  Already secured
                </button>
              )}
              <button type="button" className={`${ui.link} ml-auto text-sm`} onClick={() => setPending("not_eligible")}>
                Rule it out
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h3 className={tt.title}>What It Takes</h3>
        <WhatItTakes kind={kind} current={opportunity.status === "in_progress" ? 1 : 0} />
      </div>
    </div>
  );
};

export const OptionReview = ({
  product,
  option,
  opportunity,
  imports,
  shipmentsPerYear,
  measure,
  onDecided,
}: {
  product: TrackedProduct;
  // The option as it's worked out today; gone once it's secured (the product already has it)
  option?: SavingOption;
  opportunity?: Opportunity;
  imports: UsImports | null;
  shipmentsPerYear: number;
  measure: Measure;
  // After a Yes or a No: on to the next option still to review
  onDecided: (to: OpportunityStatus) => void;
}) => {
  const { track, setStatus, eventsFor } = useOpportunities();
  const apply = useApplyOption();
  const [busy, setBusy] = useState(false);
  const status = opportunity?.status;
  const stage = !opportunity || status === "found" ? "review" : status === "not_eligible" ? "rejected" : status === "secured" ? "secured" : "securing";
  const [showCompare, setShowCompare] = useState(false);

  const kind = option?.kind ?? opportunity?.kind ?? "program";
  const title = option?.kind === "exemption" ? `Exemption: ${exemptionName(option)}` : (option?.title ?? opportunity?.title ?? "");
  const usd = option ? option.usd : opportunity ? ((opportunity.rateBefore - opportunity.rateAfter) / 100) * product.customsValue : 0;
  const perShipment = option?.usd ?? opportunity?.usdPerShipment ?? 0;

  // Moves it to a status (tracking it first if it isn't yet); securing it applies it to the catalog
  const move = async (to: OpportunityStatus) => {
    setBusy(true);
    let ok: boolean;
    if (!opportunity) {
      ok = !!option && !!(await track(product.key, option, to, product.totalPct));
    } else {
      const applied = to === "secured" && option ? apply(option, product) : undefined;
      ok = await setStatus(opportunity, to, null, applied);
      if (ok && applied) toast.success("Secured and applied to your imports.");
    }
    setBusy(false);
    if (!ok) toast.error("Couldn't save this. Please try again.");
    return ok;
  };

  // Yes or No, then on to the next one
  const decide = async (to: OpportunityStatus) => {
    if (await move(to)) onDecided(to);
  };

  // The comparison with today, a tap away (under the answers, centred)
  const compare = option && (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className={`flex items-center gap-1.5 ${stage === "review" ? "self-center" : "self-start"} text-sm font-semibold text-base-content/70 hover:text-base-content`}
        aria-expanded={showCompare}
        onClick={() => setShowCompare((s) => !s)}
      >
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${showCompare ? "rotate-180" : ""}`} aria-hidden />
        {showCompare ? "Hide the comparison" : "How it compares with today"}
      </button>
      {showCompare && <SavingsCompare product={product} option={option} imports={imports} measure={measure} />}
    </div>
  );
  const history = opportunity && eventsFor(opportunity.id).length > 0 && (
    <div className="border-t border-base-300 pt-4">
      <History events={eventsFor(opportunity.id)} />
    </div>
  );

  if (stage === "review" && option)
    return (
      <div className="flex flex-col gap-6">
        <Ask option={option} product={product} measure={measure} shipmentsPerYear={shipmentsPerYear} imports={imports} busy={busy} onYes={() => decide("researching")} onNo={() => decide("not_eligible")}>
          {compare}
        </Ask>
        {history}
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-6" aria-label={title}>
        {/* What it is, and what it could save */}
        <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="flex flex-wrap items-center gap-2">
              <span className={tt.eyebrow(KINDS[kind].tone)}>{KINDS[kind].label}</span>
              {opportunity && <StatusChip status={opportunity.status} />}
            </span>
            <h2 className={`${tt.display} m-0 text-2xl font-semibold leading-snug text-base-content`}>
              {option?.kind === "origin" && <span className="mr-2">{option.setup.country.flag}</span>}
              {title}
            </h2>
            {option && option.kind !== "exemption" && <p className={`${tt.subtitle} m-0`}>{option.detail}</p>}
          </div>
          {!option && opportunity && (
            <div className="text-right">
              <span className="block text-xs text-base-content/60">{stage === "secured" ? "Saving" : "Could save up to"}</span>
              <span className={`${tt.metric} !text-success`}>{formatSaving(measure === "pct" ? usd : perShipment, product.customsValue, measure)}</span>
              <span className="block text-xs text-base-content/60">
                {measure === "pct" ? "off the rate" : `a shipment · ${wholeDollars(perShipment * shipmentsPerYear)} a year`}
                {stage === "secured" ? "" : kind === "exemption" ? ", if it applies" : ", if you qualify"}
              </span>
            </div>
          )}
        </header>

        {option && <RateChange product={product} option={option} measure={measure} shipmentsPerYear={shipmentsPerYear} done={stage === "secured"} />}

        {/* An exemption turns on one condition: the question to ask of the goods */}
        {option?.kind === "exemption" && (
          <div className="flex flex-col gap-2 rounded-2xl border border-warning/30 bg-warning/[0.06] p-4">
            <span className={tt.eyebrow("warning")}>Applies only if this is true of your goods</span>
            <p className="m-0 text-base font-medium text-base-content">{option.detail}</p>
            {(option.headings ?? []).map((h) => (
              <p key={h.code} className="m-0 flex flex-wrap items-baseline gap-2 text-sm">
                <span className={`${mono.className} font-semibold text-base-content`}>{h.code}</span>
                {h.name && <span className="text-base-content/70">{h.name}</span>}
              </p>
            ))}
          </div>
        )}

        {option?.supply && option.supply !== "proven" && (
          <p className={`${ui.notice("warning")} m-0 text-sm`}>
            <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
            {SUPPLY_NOTES[option.supply]}.{" "}
            {option.supply === "unproven"
              ? "The US didn't import this product from here last year, so find out whether a supplier can make it before counting on it. It isn't counted in your totals."
              : "Census has no import figures for this code, so this is on duty alone: check that suppliers there can make it."}
          </p>
        )}

        {/* Decided: what came of it */}
        {stage === "rejected" && opportunity && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-error/[0.06] p-4">
            <p className="m-0 flex items-start gap-2 text-sm text-base-content">
              <XMarkIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden />
              <span>
                <span className="font-semibold">Rejected {formatDate(opportunity.updatedAt.slice(0, 10))}</span>
                {opportunity.note ? `: ${opportunity.note}` : ""}
              </span>
            </p>
            {option && (
              <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} disabled={busy} onClick={() => move("found")}>
                <ArrowPathIcon className="h-4 w-4" aria-hidden />
                Review again
              </button>
            )}
          </div>
        )}
        {stage === "secured" && opportunity && (
          <p className="m-0 flex items-start gap-2 rounded-2xl bg-success/[0.08] p-4 text-sm text-base-content">
            <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            <span>
              <span className="font-semibold">Secured {formatDate((opportunity.securedAt ?? opportunity.updatedAt).slice(0, 10))}</span> and applied to your imports: the
              rate went from {formatRate(opportunity.rateBefore)} to {formatRate(opportunity.rateAfter)}.
            </span>
          </p>
        )}

        {compare && <div className="border-t border-base-300 pt-4">{compare}</div>}
      </section>

      {stage === "securing" && opportunity && <Securing opportunity={opportunity} option={option} product={product} busy={busy} onMove={move} />}
      {history}
    </div>
  );
};
