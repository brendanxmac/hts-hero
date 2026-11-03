"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  BanknotesIcon,
  CalculatorIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  FlagIcon,
  PaperAirplaneIcon,
  ReceiptRefundIcon,
  ScaleIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/20/solid";
import { partColors } from "@/components/ui/charts/partColors";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CalculationResult } from "../../../../tariffs/engine-v2/types";
import { calculatorUrl } from "../../../duty-calculator/lib/estimate";
import { formatDate } from "../../../duty-calculator/lib/format";
import { formatRate } from "../../formatRate";
import { delay, prefersReducedMotion, useCountUp } from "../../onboarding/parts";
import { BASE_PART, programName, rateParts, shortProgram, TrackedProduct } from "../../report";
import { TRACKER_PATH } from "../../sections";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/20/solid";
import { AuditDisclaimer } from "../AuditDisclaimer";
import { DeleteAuditDialog } from "../DeleteAuditDialog";
import { useEntries } from "../EntriesContext";
import { money, VERDICTS } from "../EntriesTable";
import { EntryAudit, TrackerEntry } from "../entries";
import { sendAuditReport } from "./reports";

// The entry audit's finale, once Finish saves the entry (decided 2026-11-02: the review is the
// finale): Duty Guard works through the check in front of the user, then it plays out. The verdict
// counts up; what was paid and what should have been stand side by side, their bars
// growing on one scale, then the calculation charge by charge (rate × value = amount); then what applied, and how to proceed: a refund to
// consider, a difference to pay CBP, AD/CVD to confirm, and a second check ("This looks wrong", with
// a note, sent to the admin with the whole audit). Closing it goes back to the audits.

const TONES = {
  overpaid: { text: "text-success", ring: "bg-success text-success-content", Icon: CheckIcon, eyebrow: "success" as const },
  underpaid: { text: "text-error", ring: "bg-error text-error-content", Icon: ExclamationTriangleIcon, eyebrow: "warning" as const },
  correct: { text: "text-base-content", ring: "bg-primary text-primary-content", Icon: ScaleIcon, eyebrow: "primary" as const },
};

const ADCVD_COLOR = "var(--color-warning)";
const PAID_COLOR = "color-mix(in oklab, var(--color-base-content) 62%, transparent)";

const Money = ({ value, wait }: { value: number; wait: number }) => {
  const shown = useCountUp(value, { wait, duration: 1400 });
  return <>{money(shown)}</>;
};

// Phase one: the check, worked through, while the entry saves (EntryCheck)
export const Checking = ({ date, onDone }: { date: string; onDone: () => void }) => {
  const steps = [`Looking up the duty in force on ${formatDate(date)}`, "Applying your adjustments", "Adding AD/CVD that covers the goods", "Comparing it with what you paid"];
  const [ticked, setTicked] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      onDone();
      return;
    }
    const timers = steps.map((_, i) => setTimeout(() => setTicked(i + 1), 380 + i * 400));
    timers.push(setTimeout(onDone, 380 + steps.length * 400 + 350));
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center" aria-live="polite">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="tt-ob-ping absolute inset-0 rounded-full bg-primary/25" aria-hidden />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-content">
          <ScaleIcon className="h-7 w-7" aria-hidden />
        </span>
      </span>
      <h1 id="tt-onboarding-title" tabIndex={-1} className={`${tt.display} m-0 text-[2rem] font-semibold tracking-tight outline-hidden`}>
        Auditing your entry…
      </h1>
      <ul className="m-0 flex w-full list-none flex-col gap-3 p-0 text-left">
        {steps.map((s, i) => (
          <li key={s} className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${i < ticked ? "opacity-100" : "opacity-35"}`}>
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${i < ticked ? "bg-success text-success-content" : "border-2 border-base-300"}`}
              aria-hidden
            >
              {i < ticked && <CheckIcon className="h-4 w-4" />}
            </span>
            <span className={i < ticked ? "font-semibold text-base-content" : "text-base-content/70"}>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

interface Segment {
  key: string;
  label: string;
  amount: number;
  color: string;
  // The heading or case numbers, small under the label
  ref?: string;
  // Its rate: "25%", or as the HTS writes it when it isn't a percentage
  rate?: string;
  // What the rate is charged on, for its sum ("25% × $56,000"); none when it isn't a percentage
  basis?: number;
}

// A base rate that's a plain percentage of the whole value, so it can be written out as a sum
const plainPercent = (result: CalculationResult) => result.baseParts.length === 1 && result.baseParts[0].kind === "percent" && !result.baseParts[0].component;

const adcvdName = (numbers: string[]) =>
  numbers.every((n) => n.startsWith("C-")) ? "Countervailing duty" : numbers.every((n) => n.startsWith("A-")) ? "Antidumping duty" : "AD/CVD";

// One side's bar, on a scale shared with the other side so the two compare at a glance
const Bar = ({ label, total, segments, max, grown, wait, strong }: { label: string; total: number; segments: Segment[]; max: number; grown: boolean; wait: number; strong?: boolean }) => (
  <div className="grid grid-cols-[8rem_minmax(0,1fr)_7rem] items-center gap-4">
    <span className={`text-sm ${strong ? "font-semibold text-base-content" : "text-base-content/70"}`}>{label}</span>
    <div className="h-4 w-full overflow-hidden rounded-full bg-tt-soft" aria-hidden>
      <div
        className="flex h-full overflow-hidden rounded-full transition-[width] duration-[1200ms] ease-out"
        style={{ width: grown ? `${Math.max((total / max) * 100, total > 0 ? 1 : 0)}%` : 0, transitionDelay: `${wait}ms` }}
      >
        {segments
          .filter((s) => s.amount > 0)
          .map((s) => (
            <span key={s.key} className="block h-full border-l-2 border-base-100/70 first:border-l-0" style={{ width: `${(s.amount / (total || 1)) * 100}%`, background: s.color }} />
          ))}
      </div>
    </div>
    <span className={`text-right text-sm tabular-nums ${strong ? "font-semibold text-base-content" : "text-base-content/80"}`}>{money(total)}</span>
  </div>
);

// The calculation's columns: the charge, its rate, what it's on, the amount
const ROW = "grid grid-cols-[minmax(0,1fr)_6rem_8rem_8rem] items-center gap-4";

// A way forward: an icon, what to do, and why
const Step = ({ Icon, tone, title, children, action, wait }: { Icon: typeof CheckIcon; tone: string; title: string; children: ReactNode; action?: ReactNode; wait: number }) => (
  <div className="tt-ob-rise flex gap-4 rounded-2xl bg-(--tt-ob-tile) p-5 ring-1 ring-(--tt-ob-tile-edge)" style={delay(wait)}>
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
      <Icon className="h-5 w-5" aria-hidden />
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
      <h3 className="m-0 text-base font-semibold text-base-content">{title}</h3>
      <div className="text-sm leading-relaxed text-base-content/75">{children}</div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  </div>
);

export const AuditResults = ({
  product,
  entry,
  audit,
  result,
  onClose,
  onAnother,
}: {
  product: TrackedProduct;
  entry: TrackerEntry;
  audit: EntryAudit;
  // The calculation the duty owed came from
  result: CalculationResult;
  onClose: () => void;
  onAnother: () => void;
}) => {
  const [grown, setGrown] = useState(false);
  const { remove } = useEntries();
  // Deleting it is only here, in its results: confirmed first (DeleteAuditDialog)
  const [deleting, setDeleting] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<"no" | "sending" | "yes" | "error">("no");
  useEffect(() => {
    document.getElementById("tt-onboarding-title")?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const tone = TONES[audit.verdict];
  const value = entry.customsValue;
  const parts = rateParts(result, value);
  const preference = result.availablePreferences.find((p) => p.symbol === result.claimedPreference);
  const applied = result.questions.filter((q) => q.answered && entry.answers?.[q.input.id] !== undefined);
  const adcvdCases = entry.adcvd?.cases ?? [];
  const covering = adcvdCases.filter((c) => c.answer === "yes");
  const unsure = adcvdCases.filter((c) => c.answer === "unsure");
  const max = Math.max(audit.paid, audit.owed, 1);
  const paidSegments: Segment[] = [
    {
      key: "duty",
      label: adcvdCases.length ? "Duty, AD/CVD included" : "Duty",
      ref: "From your entry summary",
      rate: formatRate((audit.dutyPaid / value) * 100),
      basis: value,
      amount: audit.dutyPaid,
      color: PAID_COLOR,
    },
    { key: "adcvd", label: "AD/CVD deposits", rate: formatRate((audit.adcvdPaid / value) * 100), basis: value, amount: audit.adcvdPaid, color: ADCVD_COLOR },
  ];
  // We Calculated, one charge at a time, each with its sum: the base duty, each tariff that
  // applied, each AD/CVD case that covers the goods
  const lines = result.lines.filter((l) => l.status === "applies" && l.amount > 0);
  const colors = partColors([BASE_PART, ...lines.map((l) => programName(l.program))]);
  const owedSegments: Segment[] = [
    {
      key: "base",
      label: BASE_PART,
      ref: preference ? `${preference.name} claimed` : "HTS rate",
      rate: plainPercent(result) ? formatRate(result.baseParts[0].rate) : result.baseParts.map((p) => p.raw).join(" + ") || "Free",
      basis: plainPercent(result) ? result.base.basisValue || value : undefined,
      amount: result.base.amount,
      color: colors[BASE_PART],
    },
    ...lines.map((l) => ({
      key: l.code,
      label: shortProgram(programName(l.program)),
      ref: l.code,
      rate: formatRate(l.ratePct ?? (l.amount / (l.basisValue || value)) * 100),
      basis: l.basisValue || value,
      amount: l.amount,
      color: colors[programName(l.program)],
    })),
    ...covering.map((c) => ({
      key: c.key,
      label: adcvdName(c.caseNumbers),
      ref: c.caseNumbers.join(" · "),
      rate: formatRate(c.ratePct ?? 0),
      basis: value,
      amount: ((c.ratePct ?? 0) / 100) * value,
      color: ADCVD_COLOR,
    })),
  ];
  // The Duty Guard calculator, with this entry's code, country, date, value and adjustments
  const calculation = calculatorUrl({
    path: TRACKER_PATH,
    extra: { tab: "calculator" },
    code: product.entry.element.htsno,
    country: product.entry.country.code,
    value,
    units: result.requiresQuantity ? (entry.quantity ?? product.quantity) : undefined,
    date: entry.entryDate,
    mode: product.input.transportMode ?? "ocean",
    pref: result.claimedPreference ?? undefined,
    answers: entry.answers ?? undefined,
  });
  const where = `${product.entry.element.htsno} from ${product.entry.country.name}, entered ${formatDate(entry.entryDate)}${entry.entryNumber ? ` (entry ${entry.entryNumber})` : ""}`;
  const summary = [
    `Entry audit: ${where}`,
    `Entered value ${money(entry.customsValue)}`,
    `Paid ${money(audit.paid)} (${formatRate(audit.ratePaidPct)}): duty ${money(audit.dutyPaid)}${audit.adcvdPaid ? `, AD/CVD ${money(audit.adcvdPaid)}` : ""}`,
    `Should have paid ${money(audit.owed)} (${formatRate(audit.rateOwedPct)}): ${parts.map((p) => `${shortProgram(p.key)} ${formatRate(p.pct)}`).join(", ") || "no duty"}${audit.adcvdOwed ? `, AD/CVD ${money(audit.adcvdOwed)}` : ""}`,
    `Trade program: ${preference ? `${preference.name} (${preference.symbol})` : "none claimed"}`,
    ...(applied.length ? [`Conditions: ${applied.map((q) => q.input.label).join("; ")}`] : []),
    ...(adcvdCases.length ? [`AD/CVD: ${adcvdCases.map((c) => `${c.caseNumbers.join("/")} ${c.answer}${c.answer === "yes" ? ` at ${formatRate(c.ratePct ?? 0)}` : ""}`).join("; ")}`] : []),
    `Result: ${VERDICTS[audit.verdict].label}${audit.verdict === "correct" ? "" : `, ${money(Math.abs(audit.difference))}`}`,
    "From HTS Hero's Duty Guard. Possible, not certain: confirm with the entry summary.",
  ].join("\n");

  const flag = async () => {
    setSent("sending");
    const ok = await sendAuditReport({
      kind: "looks_wrong",
      entryId: entry.id,
      htsCode: entry.htsCode,
      country: entry.country,
      note,
      details: {
        summary,
        entry,
        audit,
        product: { key: product.key, htsno: product.entry.element.htsno, country: product.entry.country.name, description: product.description },
        parts,
        claimedPreference: result.claimedPreference ?? null,
        conditions: applied.map((q) => ({ id: q.input.id, label: q.input.label, value: entry.answers?.[q.input.id] })),
      },
    });
    setSent(ok ? "yes" : "error");
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <header className="flex flex-col items-center gap-5 text-center">
        <span className={`tt-ob-pop flex h-16 w-16 items-center justify-center rounded-full shadow-[0_14px_30px_-12px_var(--tt-ob-glow)] ${tone.ring}`} aria-hidden>
          <tone.Icon className="h-8 w-8" />
        </span>
        <h1
          id="tt-onboarding-title"
          tabIndex={-1}
          className={`${tt.display} tt-ob-rise m-0 flex flex-col items-center gap-3 font-semibold tracking-tight outline-hidden`}
          style={delay(200)}
        >
          <span className="max-w-3xl text-xl lg:text-2xl font-medium leading-relaxed text-base-content">
            On your <span className="font-extrabold tabular-nums">{money(entry.customsValue)}</span> entry of <span className={`font-extrabold `}>{product.entry.element.htsno}</span> from{"  "}
            <span className="whitespace-nowrap font-extrabold">
              {product.entry.country.flag} {product.entry.country.name}
            </span>{" "}
            on <span className="whitespace-nowrap font-extrabold">{formatDate(entry.entryDate)}</span>,
            {audit.verdict === "correct" ? (
              " you paid"
            ) : (
              <>
                {" "}
                {/* Underlined in the verdict's color, tying it to the amount below */}
                <span className={`font-extrabold ${audit.verdict === "overpaid" ? "text-success" : "text-error"}`}>
                  {audit.verdict === "overpaid" ? "you may have overpaid up to" : "you may have underpaid by"}
                </span>
              </>
            )}
          </span>
          {audit.verdict === "correct" ? (
            <>
              <span className="text-[3.25rem] leading-none text-base-content">What was owed.</span>
              <span className="text-lg font-medium text-base-content/70">Within $1 of what was in force on its entry date.</span>
            </>
          ) : (
            <>
              <span className={`text-[4rem] leading-none tabular-nums ${tone.text}`}>
                <Money value={Math.abs(audit.difference)} wait={450} />
              </span>
              {/* How far off what was paid is, as a share of what was owed */}
              {audit.owed > 0 && (
                <span className="text-lg font-medium text-base-content/70">
                  <span className={`font-semibold tabular-nums ${tone.text}`}>( {formatRate((Math.abs(audit.difference) / audit.owed) * 100)} )</span>
                </span>
              )}
            </>
          )}
        </h1>
      </header>

      {/* Paid against calculated, then the calculation, charge by charge */}
      <section className={`${tt.panel} tt-ob-rise flex flex-col`} style={delay(520)} aria-label="What you paid against what we calculated">
        <div className="grid items-center gap-6 border-b border-base-300 p-6 md:grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-1">
            <span className={tt.eyebrow()}>You Paid</span>
            <span className={`${tt.metricLg} tabular-nums`}>
              <Money value={audit.paid} wait={720} />
            </span>
            <span className="text-sm text-base-content/60">{formatRate(audit.ratePaidPct)} of the entered value</span>
          </div>
          <span className={`flex flex-col items-center rounded-2xl px-5 py-3 text-center ${audit.verdict === "overpaid" ? "bg-success/10" : audit.verdict === "underpaid" ? "bg-error/10" : "bg-tt-soft"}`}>
            <span className={`text-lg font-semibold tabular-nums ${tone.text}`}>
              {audit.verdict === "correct" ? "=" : `${audit.verdict === "overpaid" ? "+" : "−"}${money(Math.abs(audit.difference))}`}
            </span>
            <span className="text-xs text-base-content/60">
              {audit.verdict === "correct" ? "Paid as owed" : audit.owed > 0 ? `${formatRate((Math.abs(audit.difference) / audit.owed) * 100)} ${audit.verdict === "overpaid" ? "over" : "under"}` : audit.verdict}
            </span>
          </span>
          <div className="flex flex-col gap-1 md:items-end md:text-right">
            <span className={tt.eyebrow("primary")}>We Calculated</span>
            <span className={`${tt.metricLg} tabular-nums`}>
              <Money value={audit.owed} wait={860} />
            </span>
            <span className="text-sm text-base-content/60">{formatRate(audit.rateOwedPct)} of the entered value</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-base-300 px-6 py-5">
          <Bar label="You paid" total={audit.paid} segments={paidSegments} max={max} grown={grown} wait={700} />
          <Bar label="We calculated" total={audit.owed} segments={owedSegments} max={max} grown={grown} wait={850} strong />
        </div>

        <div className="flex flex-col gap-3 p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className={`${tt.title} m-0`}>How We Calculated It</h2>
            <a href={calculation} target="_blank" rel="noopener" className={ui.button({ variant: "secondary", size: "sm" })}>
              <CalculatorIcon className="h-4 w-4" aria-hidden />
              Show in Calculator
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-60" aria-hidden />
            </a>
          </div>
          <div role="table" aria-label="The calculation, charge by charge" className="flex flex-col">
            <div role="row" className={`${ROW} border-b border-base-300 pb-2 text-xs font-semibold uppercase tracking-wide text-base-content/50`}>
              <span role="columnheader">Charge</span>
              <span role="columnheader" className="text-right">Rate</span>
              <span role="columnheader" className="text-right">On</span>
              <span role="columnheader" className="text-right">Amount</span>
            </div>
            {owedSegments
              .filter((s) => s.amount > 0 || s.key === "base")
              .map((s, i) => (
                <div role="row" key={s.key} className={`${ROW} tt-ob-rise border-b border-base-300/70 py-3`} style={delay(1000 + i * 80)}>
                  <span role="cell" className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-base-content">{s.label}</span>
                      {s.ref && <span className={`truncate text-xs text-base-content/55 ${/\d{4}\.\d{2}|[AC]-\d{3}/.test(s.ref) ? mono.className : ""}`}>{s.ref}</span>}
                    </span>
                  </span>
                  <span role="cell" className="text-right text-sm tabular-nums text-base-content">{s.rate}</span>
                  <span role="cell" className="text-right text-sm tabular-nums text-base-content/60">{s.basis !== undefined ? `× ${money(s.basis)}` : ""}</span>
                  <span role="cell" className="text-right text-sm font-semibold tabular-nums text-base-content">{money(s.amount)}</span>
                </div>
              ))}
            <div role="row" className={`${ROW} pt-3`}>
              <span role="cell" className="text-sm font-semibold text-base-content">Total</span>
              <span role="cell" className="text-right text-sm font-semibold tabular-nums text-base-content">{formatRate(audit.rateOwedPct)}</span>
              <span role="cell" className="text-right text-sm tabular-nums text-base-content/60">× {money(value)}</span>
              <span role="cell" className="text-right text-base font-semibold tabular-nums text-primary">{money(audit.owed)}</span>
            </div>
          </div>
          <p className="m-0 flex flex-col gap-1 text-xs text-base-content/55">
            {unsure.map((c) => (
              <span key={c.key}>
                <span className={mono.className}>{c.caseNumbers.join(" · ")}</span> not counted: you weren&apos;t sure it covers the goods.
              </span>
            ))}
            {adcvdCases.length > 0 && !covering.length && !unsure.length && <span>No AD/CVD counted: the cases checked don&apos;t cover the goods.</span>}
            <span>Rates in force on {formatDate(entry.entryDate)}. Fees (MPF, HMF) not included.</span>
          </p>
        </div>
      </section>

      {/* What applied */}
      <section className="tt-ob-rise grid gap-4 rounded-2xl bg-(--tt-ob-tile) p-6 ring-1 ring-(--tt-ob-tile-edge) md:grid-cols-3" style={delay(1450)} aria-label="What applied">
        <div className="flex flex-col gap-1">
          <span className={tt.eyebrow()}>Trade program</span>
          <span className="text-sm font-semibold text-base-content">{preference ? `${preference.name} (${preference.symbol})` : "None claimed"}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className={tt.eyebrow()}>Exemptions and conditions</span>
          {applied.length ? (
            applied.map((q) => (
              <span key={q.input.id} className="flex items-start gap-1.5 text-sm text-base-content/80">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  {q.input.label}
                  {q.input.type !== "boolean" && (
                    <strong className="text-base-content">
                      : {String(entry.answers?.[q.input.id])}
                      {q.input.unit ? ` ${q.input.unit}` : ""}
                    </strong>
                  )}
                </span>
              </span>
            ))
          ) : (
            <span className="text-sm text-base-content/60">None claimed</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className={tt.eyebrow()}>AD/CVD</span>
          {adcvdCases.length ? (
            adcvdCases.map((c) => (
              <span key={c.key} className="text-sm text-base-content/80">
                <span className={`${mono.className} text-xs`}>{c.caseNumbers.join(" · ")}</span>{" "}
                <strong className="text-base-content">{c.answer === "yes" ? `covers it, ${formatRate(c.ratePct ?? 0)}` : c.answer === "no" ? "doesn't cover it" : "not sure"}</strong>
              </span>
            ))
          ) : (
            <span className="text-sm text-base-content/60">No cases on this entry</span>
          )}
        </div>
      </section>

      {/* How to proceed */}
      <section className="flex flex-col gap-3" aria-labelledby="tt-review-next">
        <h2 id="tt-review-next" className={`${tt.title} tt-ob-rise m-0`} style={delay(1550)}>
          How to Proceed
        </h2>
        <Step Icon={CheckIcon} tone="bg-primary/12 text-primary" title="Double Check Entry Details & Results" wait={1620}>
          Double check that your entry details were entered correctly and review our calculation to make sure nothing was missing or included that shouldn&apos;t have been.
        </Step>
        {(unsure.length > 0 || covering.length > 0) && (
          <Step Icon={ShieldExclamationIcon} tone="bg-warning/15 text-warning" title={unsure.length ? "Confirm AD/CVD" : "Keep an eye on AD/CVD"} wait={1700}>
            {unsure.length
              ? `You weren't sure whether ${unsure.map((c) => c.caseNumbers.join("/")).join(", ")} ${unsure.length === 1 ? "covers" : "cover"} your goods, so ${unsure.length === 1 ? "it isn't" : "they aren't"} counted in what you should have paid. If you paid deposits on ${unsure.length === 1 ? "it" : "them"}, part of the difference above may be AD/CVD rather than an overpayment. AD/CVD scope is set by the product description: your broker can confirm it.`
              : "AD/CVD deposits are estimates until Commerce sets the final rate in a review, which can raise or lower what's owed years later."}
          </Step>
        )}
        {audit.verdict === "overpaid" && (
          <Step Icon={ReceiptRefundIcon} tone="bg-success/15 text-success" title="Consider pursuing a refund" wait={1620}>
            Share this review with your team or customs broker. Before the entry liquidates (usually about 314 days after entry) they may be able to file a
            post-summary correction; after it, a protest within 180 days of liquidation.
          </Step>
        )}
        {audit.verdict === "underpaid" && (
          <Step Icon={BanknotesIcon} tone="bg-error/12 text-error" title="Consider paying the difference to CBP" wait={1620}>
            Correcting an underpayment before Customs finds it can limit penalties. Your licensed customs broker can confirm it and pay the difference: a
            post-summary correction before the entry liquidates, or a prior disclosure after.
          </Step>
        )}
        {audit.verdict === "correct" && (
          <Step Icon={CheckCircleIcon} tone="bg-primary/12 text-primary" title="Nothing to fix on this one" wait={1620}>
            This entry paid what was in force on its date. Audit more of your entries: over and underpayments are most common around tariff changes.
          </Step>
        )}
        <Step
          Icon={FlagIcon}
          tone="bg-base-content/8 text-base-content"
          title="Something look off? Get a second check"
          wait={1780}
          action={
            sent === "yes" ? (
              <p className="m-0 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm font-semibold text-success">
                <CheckCircleIcon className="h-4 w-4" aria-hidden />
                Sent with your whole audit. We&apos;ll look at it and get back to you by email.
              </p>
            ) : flagging ? (
              <div className="flex flex-col gap-2">
                <textarea
                  autoFocus
                  className={`${ui.textarea} bg-base-100`}
                  rows={3}
                  maxLength={2000}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What looks wrong? E.g. the rate, a program that should apply, the AD/CVD case (optional)"
                />
                {sent === "error" && <span className="text-xs font-medium text-error">Couldn&apos;t send it. Please try again.</span>}
                <div className="flex gap-2">
                  <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={flag} disabled={sent === "sending"}>
                    <PaperAirplaneIcon className="h-3.5 w-3.5" aria-hidden />
                    {sent === "sending" ? "Sending…" : "Send for review"}
                  </button>
                  <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setFlagging(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => setFlagging(true)}>
                <FlagIcon className="h-3.5 w-3.5" aria-hidden />
                Request second check
              </button>
            )
          }
        >
          Send this check to the HTS Hero team with a note and we&apos;ll check the rates, programs, and AD/CVD ourselves.
        </Step>
      </section>

      <div className="tt-ob-rise flex flex-col items-center gap-4" style={delay(1900)}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} h-14! min-w-80 px-10! text-lg!`} onClick={onClose} autoFocus>
            Back to audits
          </button>
          {/* <button type="button" className={ui.button({ variant: "primary", size: "lg" })} onClick={onAnother}>
            Audit another entry
          </button> */}
        </div>
        <button type="button" className={`${ui.button({ variant: "ghost", size: "sm" })} hover:text-error!`} onClick={() => setDeleting(true)}>
          <TrashIcon className="h-4 w-4" aria-hidden />
          Delete this audit
        </button>
        <div className="max-w-3xl text-center mt-4">
          <AuditDisclaimer />
        </div>
      </div>
      <DeleteAuditDialog
        row={deleting ? { entry, product, audit } : null}
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          const ok = await remove(entry.id);
          if (ok) {
            toast.success("Audit deleted.");
            onClose();
          } else toast.error("Couldn't delete this audit. Please try again.");
          return ok;
        }}
      />
    </div>
  );
};
