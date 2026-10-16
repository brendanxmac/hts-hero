"use client";

import { ReactNode, useState } from "react";
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
import { exemptionName } from "./OptionList";
import { SavingsCompare } from "./SavingsCompare";
import { WhatItTakes } from "./WhatItTakes";

// One way to save, opened from the list beside it. It starts as a quick review: what it is, how it
// compares with today, then Accept or Reject, with a note (a reason, to reject: it's kept on
// record). Rejecting moves on to the next option still to review. Accepting turns the view into
// securing it: where it's got to, the next step and what it takes, and the moves from there
// (paperwork under way, secured, which applies it to the catalog, or ruled out after all). Every
// move is kept, with its note, as the saving's history. Savings are only ever potential.

const KINDS: Record<SavingKind, { label: string; tone: "success" | "warning" | "primary" }> = {
  program: { label: "Keep your supplier", tone: "success" },
  exemption: { label: "Exemption to check", tone: "warning" },
  origin: { label: "Source it somewhere else", tone: "primary" },
};

// One tap fills the note with a common reason to reject
const REASONS: Record<SavingKind, string[]> = {
  program: ["Our goods don't meet the rules of origin", "Our supplier can't certify the origin", "Not worth the paperwork for us"],
  exemption: ["The condition isn't true of our goods", "We can't document it", "Not worth the effort for us"],
  origin: ["No realistic supplier there", "We're not changing suppliers", "Too much quality or cost risk"],
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

// A note, with one-tap reasons when it's a rejection
const NoteBox = ({ value, onChange, placeholder, reasons, invalid }: { value: string; onChange: (v: string) => void; placeholder: string; reasons?: string[]; invalid?: boolean }) => (
  <div className="flex flex-col gap-2">
    {reasons && (
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange(r)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${value === r ? "border-error bg-error/10 text-error" : "border-base-300 text-base-content/70 hover:border-base-content/40 hover:text-base-content"}`}
          >
            {r}
          </button>
        ))}
      </div>
    )}
    <textarea
      className={`${ui.textarea} ${invalid ? "!border-error" : ""}`}
      rows={2}
      maxLength={500}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-invalid={invalid}
    />
  </div>
);

// Undecided: Accept or Reject, with a note, in one slim bar that stays in view under the comparison
const Decide = ({ onAccept, onReject, kind, busy }: { onAccept: (note: string) => void; onReject: (note: string) => void; kind: SavingKind; busy: boolean }) => {
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [missing, setMissing] = useState(false);
  const reject = () => {
    if (!rejecting) return setRejecting(true);
    if (!note.trim()) return setMissing(true);
    onReject(note.trim());
  };
  return (
    <div className={`${tt.panel} sticky bottom-4 z-10 flex flex-col gap-3 px-5 py-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.35)]`}>
      {rejecting && (
        <div className="flex flex-col gap-2">
          <p className="m-0 text-sm font-semibold text-base-content">
            Why doesn&apos;t it work for you? <span className="font-normal text-base-content/60">Kept on record.</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {REASONS[kind].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setNote(r);
                  setMissing(false);
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${note === r ? "border-error bg-error/10 text-error" : "border-base-300 text-base-content/70 hover:border-base-content/40 hover:text-base-content"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        {!rejecting && <p className={`${tt.title} m-0 shrink-0 !text-base`}>Worth pursuing?</p>}
        <input
          className={`${ui.input} !h-9 min-w-[12rem] flex-1 text-sm ${missing ? "!border-error" : ""}`}
          maxLength={500}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setMissing(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && (rejecting ? reject() : onAccept(note.trim()))}
          placeholder={rejecting ? "Pick a reason or write your own (required)" : "Add a note (optional)"}
          aria-label={rejecting ? "Why it doesn't work for you" : "A note"}
          aria-invalid={missing}
        />
        <div className="flex shrink-0 gap-2">
          {rejecting ? (
            <>
              <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setRejecting(false)}>
                Back
              </button>
              <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} !border-error !bg-error !text-error-content`} disabled={busy} onClick={reject}>
                <XMarkIcon className="h-4 w-4" aria-hidden />
                {busy ? "Saving…" : "Reject"}
              </button>
            </>
          ) : (
            <>
              <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} disabled={busy} onClick={reject}>
                <XMarkIcon className="h-4 w-4" aria-hidden />
                Reject
              </button>
              <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} !border-success !bg-success !text-success-content`} disabled={busy} onClick={() => onAccept(note.trim())}>
                <CheckIcon className="h-4 w-4" aria-hidden />
                {busy ? "Saving…" : "Accept"}
              </button>
            </>
          )}
        </div>
      </div>
      {missing && <p className="m-0 -mt-1 text-xs text-error">Add a reason to reject it.</p>}
    </div>
  );
};

// A move waiting for its note: to the next stage, secured, or ruled out
const Move = ({ to, children, onConfirm, onCancel, busy, kind }: { to: OpportunityStatus; children?: ReactNode; onConfirm: (note: string) => void; onCancel: () => void; busy: boolean; kind: SavingKind }) => {
  const [note, setNote] = useState("");
  const [missing, setMissing] = useState(false);
  const rejecting = to === "not_eligible";
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-tt-soft p-4">
      <p className="m-0 text-sm font-semibold text-base-content">{rejecting ? "Rule it out" : to === "secured" ? "Mark it secured" : `Move to ${statusInfo(to).label}`}</p>
      {children}
      <NoteBox
        value={note}
        onChange={(v) => {
          setNote(v);
          setMissing(false);
        }}
        reasons={rejecting ? REASONS[kind] : undefined}
        invalid={missing}
        placeholder={rejecting ? "Why it doesn't work for you (required)" : "A note for the record (optional)"}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={ui.button({ variant: "primary", size: "sm" })}
          disabled={busy}
          onClick={() => (rejecting && !note.trim() ? setMissing(true) : onConfirm(note.trim()))}
        >
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
  onMove: (to: OpportunityStatus, note: string) => Promise<boolean>;
}) => {
  const [pending, setPending] = useState<OpportunityStatus | null>(null);
  const here = PATH.findIndex((p) => p.status === opportunity.status);
  const next = NEXT[opportunity.status];
  const kind = opportunity.kind;
  const confirm = async (note: string) => {
    if (pending && (await onMove(pending, note))) setPending(null);
  };

  return (
    <div className="flex flex-col gap-6 border-t border-base-300 pt-6">
      {/* Where it's got to */}
      <ol className="grid grid-cols-3 gap-2" aria-label="Progress">
        {PATH.map((p, i) => (
          <li key={p.status} className="flex flex-col gap-2">
            <span className={`h-1.5 rounded-full ${i < here ? "bg-success" : i === here ? "bg-primary" : "bg-base-300"}`} aria-hidden />
            <span className={`flex items-center gap-1.5 text-xs font-semibold ${i === here ? "text-base-content" : i < here ? "text-success" : "text-base-content/50"}`}>
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
            <Move key={pending} to={pending} busy={busy} kind={kind} onConfirm={confirm} onCancel={() => setPending(null)}>
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
  onRejected,
}: {
  product: TrackedProduct;
  // The option as it's worked out today; gone once it's secured (the product already has it)
  option?: SavingOption;
  opportunity?: Opportunity;
  imports: UsImports | null;
  shipmentsPerYear: number;
  measure: Measure;
  // After a rejection: on to the next option still to review
  onRejected: () => void;
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
  const move = async (to: OpportunityStatus, note: string) => {
    setBusy(true);
    let ok: boolean;
    if (!opportunity) {
      ok = !!option && !!(await track(product.key, option, to, product.totalPct, note || null));
    } else {
      const applied = to === "secured" && option ? apply(option, product) : undefined;
      ok = await setStatus(opportunity, to, note || null, applied);
      if (ok && applied) toast.success("Secured and applied to your imports.");
    }
    setBusy(false);
    if (!ok) toast.error("Couldn't save this. Please try again.");
    return ok;
  };

  const accept = async (note: string) => {
    if (await move("researching", note)) toast.success("Accepted. Here's how to secure it.");
  };
  const reject = async (note: string) => {
    if (await move("not_eligible", note)) onRejected();
  };

  const compare = option && <SavingsCompare product={product} option={option} imports={imports} measure={measure} />;

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
          {(option || opportunity) && (
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
              <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} disabled={busy} onClick={() => move("found", "Reopened for review")}>
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

        {/* The comparison: open while it's being reviewed, a tap away after */}
        {compare &&
          (stage === "review" ? (
            compare
          ) : (
            <div className="flex flex-col gap-4 border-t border-base-300 pt-4">
              <button
                type="button"
                className="flex items-center gap-1.5 self-start text-sm font-semibold text-base-content/70 hover:text-base-content"
                aria-expanded={showCompare}
                onClick={() => setShowCompare((s) => !s)}
              >
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${showCompare ? "rotate-180" : ""}`} aria-hidden />
                {showCompare ? "Hide the comparison" : "Compare with today"}
              </button>
              {showCompare && compare}
            </div>
          ))}
      </section>

      {stage === "review" && option && <Decide kind={kind} busy={busy} onAccept={accept} onReject={reject} />}
      {stage === "securing" && opportunity && <Securing opportunity={opportunity} option={option} product={product} busy={busy} onMove={move} />}
      {opportunity && eventsFor(opportunity.id).length > 0 && (
        <div className="border-t border-base-300 pt-4">
          <History events={eventsFor(opportunity.id)} />
        </div>
      )}
    </div>
  );
};
