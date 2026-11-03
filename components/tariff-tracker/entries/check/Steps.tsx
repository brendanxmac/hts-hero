"use client";

import { ReactNode, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpTrayIcon, CheckCircleIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { Select } from "@/components/ui/Select";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../../duty-calculator/lib/format";
import { formatRate } from "../../formatRate";
import { delay, HowTo, StepHeading } from "../../onboarding/parts";
import { TrackedProduct } from "../../report";
import { money } from "../EntriesTable";
import { owedOn } from "../entries";
import { Calendar } from "./Calendar";
import { DetailsField, detailsProblems, EntryDraft, paidProblem } from "./draft";

// The entry audit's first three steps (EntryCheck): how the entry comes in (typed in; the 7501 and
// ES-003 upload is coming), the entry's details, and the duty paid on it.

const productLabel = (p: TrackedProduct) => `${p.entry.element.htsno} · ${p.entry.country.flag} ${p.entry.country.name}`;

// Back and Next under a step
export const StepNav = ({
  onBack,
  onNext,
  next = "Continue",
  disabled,
  wait = 240,
}: {
  onBack?: () => void;
  onNext: () => void;
  next?: ReactNode;
  disabled?: boolean;
  wait?: number;
}) => (
  <div className="tt-ob-rise flex items-center justify-between gap-3 pt-2" style={delay(wait)}>
    {onBack ? (
      <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onBack}>
        <ArrowLeftIcon className="h-4 w-4" aria-hidden />
        Back
      </button>
    ) : (
      <span />
    )}
    <button type="submit" className={`${ui.button({ variant: "primary", size: "lg" })} px-7`} onClick={onNext} disabled={disabled}>
      {next}
      <ArrowRightIcon className="h-4 w-4" aria-hidden />
    </button>
  </div>
);

// A field with its label, a hint under it, and its problem in place of the hint once it's shown
const Field = ({ label, hint, problem, children }: { label: string; hint?: ReactNode; problem?: string | null; children: ReactNode }) => (
  <label className="flex flex-col gap-1.5">
    <span className={ui.fieldLabel}>{label}</span>
    {children}
    {problem ? <span className="text-xs font-medium text-error">{problem}</span> : hint && <span className={ui.caption}>{hint}</span>}
  </label>
);

// A US dollar amount
export const MoneyInput = ({
  value,
  onChange,
  big,
  invalid,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  big?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
}) => (
  <span className="relative block">
    <span className={`pointer-events-none absolute inset-y-0 left-0 flex items-center text-base-content/50 ${big ? `${tt.display} pl-5 text-2xl` : "pl-3 text-sm"}`}>$</span>
    <input
      type="number"
      min="0"
      step="0.01"
      inputMode="decimal"
      autoFocus={autoFocus}
      data-autofocus={autoFocus || undefined}
      aria-invalid={invalid || undefined}
      className={`${ui.input} ${big ? `${tt.display} h-16 rounded-xl pl-10 text-2xl font-semibold tabular-nums` : "pl-7 tabular-nums"} ${invalid ? "border-error" : ""}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="0.00"
    />
  </span>
);

// ── Step 1: how the entry comes in ──

export const MethodStep = ({ onNext }: { onNext: () => void }) => (
  <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
    <StepHeading
      eyebrow="Step 1 · Select Upload Method"
      title="Check what you paid on a past entry."
      lead="Tell us about one line of an entry summary and Duty Guard works out the duty that was in force on its entry date. Then you see what you paid against what you should have paid."
    />
    <div className="grid gap-4 md:grid-cols-2">
      <button
        type="button"
        onClick={onNext}
        autoFocus
        className="tt-ob-rise group flex flex-col gap-4 rounded-2xl bg-(--tt-ob-tile) p-6 text-left ring-2 ring-primary transition-shadow hover:shadow-[0_18px_44px_-18px_var(--tt-ob-glow)] focus-visible:outline-hidden focus-visible:ring-4 focus-visible:ring-primary/50"
        style={delay(180)}
      >
        <span className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-content">
            <PencilSquareIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className={tt.chip("primary")}>About a minute</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className={`${tt.display} text-xl font-semibold text-base-content`}>Type it in</span>
          <span className="text-sm leading-relaxed text-base-content/70">
            Have your entry summary (CBP Form 7501) or your broker&apos;s invoice to hand: the entry date, entered value and duty paid.
          </span>
        </span>
        <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          Start
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </span>
      </button>
      <div
        className="tt-ob-rise flex flex-col gap-4 rounded-2xl border-2 border-dashed border-base-300 p-6"
        style={delay(260)}
        aria-label="Upload a 7501 or ES-003, coming soon"
      >
        <span className="flex items-center justify-between">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tt-soft text-base-content/60">
            <ArrowUpTrayIcon className="h-5 w-5" aria-hidden />
          </span>
          <span className={tt.chip("warning")}>Coming soon</span>
        </span>
        <span className="flex flex-col gap-1">
          <span className={`${tt.display} text-xl font-semibold text-base-content`}>Upload a 7501 or ES-003</span>
          <span className="text-sm leading-relaxed text-base-content/70">
            Drop in CBP Form 7501 entry summaries (PDF) or ES-003 ACE reports and every line is read, logged and audited for you. No typing.
          </span>
        </span>
        <span className="mt-auto flex flex-wrap gap-2">
          {["Every line at once", "Months of entries", "Nothing to type"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1 text-xs font-medium text-base-content/60">
              <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden />
              {t}
            </span>
          ))}
        </span>
      </div>
    </div>
    <div className={`${tt.panel} tt-ob-rise p-6`} style={delay(340)}>
      <p className={`${tt.eyebrow()} m-0 mb-4`}>How it works</p>
      <HowTo
        start={400}
        steps={[
          "The entry: which import, when it entered and its entered value.",
          "What you paid: the full duty on that line of the entry summary, AD/CVD included.",
          "Adjustments: a trade program claimed, an exemption. They can differ from today, so you set them for this entry, and see what you paid against what you should have paid as you go.",
          "AD/CVD: any antidumping or countervailing duty cases that cover the goods.",
          "Your review: paid against owed side by side, and what to do next.",
        ]}
      />
    </div>
  </div>
);

// ── Step 2: the entry, one thing at a time ──

export type EntryPart = "import" | "date" | "value" | "number";

// "ABC1234567 8" → "ABC-1234567-8": a filer code, the number and its check digit
export const formatEntryNumber = (raw: string) => {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
  return [c.slice(0, 3), c.slice(3, 10), c.slice(10)].filter(Boolean).join("-");
};

// Beside each part of the entry: the import it's for, what's been entered so far (each a way back
// to change it), and the duty in force on the entry date once there is one
export const EntrySideCard = ({
  product,
  draft,
  at,
  dateOk,
  onEdit,
}: {
  product: TrackedProduct;
  draft: EntryDraft;
  at?: EntryPart;
  dateOk: boolean;
  onEdit: (part: EntryPart) => void;
}) => {
  const rateThen = dateOk
    ? (owedOn(product, {
      entryDate: draft.entryDate,
      customsValue: product.customsValue,
      quantity: null,
      claimedPreference: product.input.claimedPreference ?? null,
      answers: product.adjustments.answers ?? {},
    }).totalDuty /
      product.customsValue) *
    100
    : null;
  const rows: { part: EntryPart; label: string; value: string | null }[] = [
    { part: "date", label: "Entry date", value: dateOk ? formatDate(draft.entryDate) : null },
    { part: "number", label: "Entry number", value: draft.entryNumber || null },
    { part: "value", label: "Entered value", value: Number(draft.customsValue) > 0 ? money(Number(draft.customsValue)) : null },
  ];
  return (
    <aside className="tt-ob-from-right flex flex-col gap-4 self-start rounded-2xl bg-(--tt-ob-tile) p-5 ring-1 ring-(--tt-ob-tile-edge)" style={delay(260)}>
      <span className={tt.eyebrow()}>Entry Audit For:</span>
      <span className="flex flex-col gap-1">
        <span className={`${mono.className} text-lg font-semibold text-base-content`}>{product.entry.element.htsno}</span>
        <span className="text-sm text-base-content">
          {product.entry.country.flag} {product.entry.country.name}
        </span>
        <span className="line-clamp-2 text-xs text-base-content/60">{product.description}</span>
      </span>
      <span className="h-px bg-base-300" />
      <span className="flex flex-col gap-1">
        {rows.map((r) => (
          <button
            key={r.part}
            type="button"
            onClick={() => onEdit(r.part)}
            disabled={r.part === at}
            className={`-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors enabled:hover:bg-base-content/5 ${r.part === at ? "bg-primary/8" : ""}`}
          >
            <span className={r.part === at ? "font-semibold text-primary" : "text-base-content/60"}>{r.label}</span>
            <span className={`truncate tabular-nums ${r.value ? "font-semibold text-base-content" : "text-base-content/35"}`}>{r.value ?? "—"}</span>
          </button>
        ))}
      </span>
      {rateThen !== null && (
        <>
          <span className="h-px bg-base-300" />
          <span key={draft.entryDate} className="tt-ob-rise flex flex-col gap-1">
            <span className="text-xs text-base-content/60">Duty in force on {formatDate(draft.entryDate)}</span>
            <span className={tt.metric}>{formatRate(rateThen)}</span>
            <span className={ui.caption}>With this import&apos;s settings. You can change what applied under Adjustments.</span>
          </span>
        </>
      )}
    </aside>
  );
};

// "Entry Audit For:" beside each part of the entry: off for now (2026-11-02), back by setting true
const SHOW_SIDE_CARD = false;

export const EntryPartStep = ({
  part,
  parts,
  draft,
  set,
  products,
  range,
  today,
  onBack,
  onNext,
  onEdit,
}: {
  part: EntryPart;
  // The parts in this flow, in order ("import" only when there's a choice)
  parts: EntryPart[];
  draft: EntryDraft;
  set: (patch: Partial<EntryDraft>) => void;
  products: TrackedProduct[];
  range: { from: string };
  today: string;
  onBack: () => void;
  onNext: () => void;
  onEdit: (part: EntryPart) => void;
}) => {
  const product = products.find((p) => p.key === draft.productKey);
  const problems = detailsProblems(draft, product, range, today);
  const [tried, setTried] = useState(false);
  const fields: Record<EntryPart, DetailsField[]> = { import: ["productKey"], date: ["entryDate"], value: ["customsValue", "quantity"], number: [] };
  const problem = fields[part].map((f) => problems[f]).find(Boolean) ?? null;
  const dateOk = !problems.entryDate;
  const counter = `${parts.indexOf(part) + 1} of ${parts.length}`;

  const heading: Record<EntryPart, { title: string; lead: ReactNode }> = {
    import: { title: "Which import was it?", lead: "Pick the import this line of the entry summary was for. Its HTS code and country of origin decide the duty." },
    date: {
      title: "What was the entry date?",
      lead: (
        <>
          The <strong className="text-base-content">Entry Date</strong>, block 7 at the top of the entry summary (7501). Not the summary date (block 3) or the
          import date (block 11). Pick it on the calendar or type it.
        </>
      ),
    },
    value: {
      title: "What was the customs value?",
      lead: (
        <>
          The <strong className="text-base-content">Entered Value</strong> for this line, column 32A on the 7501, in US dollars. It&apos;s what the duty is
          worked out on.
        </>
      ),
    },
    number: {
      title: "What was the entry number?",
      lead: (
        <>
          Optional. Block 1 on the 7501, a filer code and number like <span className={`${mono.className} text-base-content`}>ABC-1234567-8</span>. It
          helps you and your broker find this entry again.
        </>
      ),
    },
  };

  const body = (() => {
    switch (part) {
      case "import":
        return (
          <div data-autofocus>
            <Select
              className="w-full"
              label="Import"
              value={draft.productKey}
              onChange={(productKey) => set({ productKey, claimedPreference: null, answers: null })}
              options={products.map((p) => ({ value: p.key, label: productLabel(p), description: p.description }))}
            />
          </div>
        );
      case "date":
        return (
          <div className="flex flex-col gap-3">
            <input
              type="date"
              data-autofocus
              aria-label="Entry date"
              className={`${ui.input} ${tt.display} h-12 max-w-56 rounded-xl text-base font-semibold tabular-nums ${tried && problem ? "border-error" : ""}`}
              min={range.from}
              max={today}
              value={draft.entryDate}
              onChange={(e) => set({ entryDate: e.target.value })}
            />
            <Calendar value={draft.entryDate} onChange={(entryDate) => set({ entryDate })} from={range.from} to={today} />
          </div>
        );
      case "value":
        return (
          <div className="flex flex-col gap-5">
            <MoneyInput big autoFocus value={draft.customsValue} onChange={(customsValue) => set({ customsValue })} invalid={tried && !!problems.customsValue} />
            {product?.result.requiresQuantity && (
              <Field
                label="Quantity (optional)"
                problem={tried ? problems.quantity : null}
                hint={`Part of this rate is per unit. Leave it empty for ${product.quantity.toLocaleString("en-US")}.`}
              >
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  className={`${ui.input} max-w-56 ${tried && problems.quantity ? "border-error" : ""}`}
                  value={draft.quantity}
                  onChange={(e) => set({ quantity: e.target.value })}
                />
              </Field>
            )}
          </div>
        );
      case "number":
        return (
          <input
            autoFocus
            data-autofocus
            aria-label="Entry number"
            className={`${ui.input} ${mono.className} h-16 rounded-xl px-5 text-2xl font-semibold uppercase tracking-wider`}
            value={draft.entryNumber}
            onChange={(e) => set({ entryNumber: formatEntryNumber(e.target.value) })}
            placeholder="ABC-1234567-8"
            spellCheck={false}
            autoComplete="off"
          />
        );
    }
  })();

  return (
    <form
      className={`mx-auto grid w-full items-start gap-10 ${SHOW_SIDE_CARD ? "max-w-5xl lg:grid-cols-[1fr_20rem]" : "max-w-3xl"}`}
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!problem) onNext();
      }}
      noValidate
    >
      <div className="flex flex-col gap-8">
        <StepHeading eyebrow={`Step 2 · The entry · ${counter}`} title={heading[part].title} lead={heading[part].lead} size="md" />
        <div className="tt-ob-rise flex flex-col gap-2" style={delay(180)}>
          {body}
          {tried && problem && part !== "value" && <span className="text-xs font-medium text-error">{problem}</span>}
          {tried && part === "value" && problems.customsValue && <span className="text-xs font-medium text-error">{problems.customsValue}</span>}
        </div>
        <StepNav onBack={onBack} onNext={() => undefined} next={part === "number" && !draft.entryNumber ? "Skip for now" : "Continue"} />
      </div>
      {SHOW_SIDE_CARD && product && <EntrySideCard product={product} draft={draft} at={part} dateOk={dateOk} onEdit={onEdit} />}
    </form>
  );
};

// ── Step 3: what was paid ──

// A sliver of an entry summary's line, with the duty column lit: where to look
// Off for now (2026-11-02), back by setting true
const SHOW_SUMMARY_SLIVER = false;

const SummarySliver = () => (
  <figure className="tt-ob-from-right m-0 flex flex-col gap-2" style={delay(260)} aria-hidden>
    <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 text-[0.7rem] shadow-[var(--tt-shadow)]">
      <div className="flex items-center justify-between border-b border-base-300 bg-tt-soft px-3 py-2 font-semibold text-base-content/60">
        <span>Entry Summary · CBP Form 7501</span>
      </div>
      <div className="grid grid-cols-[1.4fr_1fr_1fr_1.1fr]">
        {["Description", "Entered value", "HTSUS rate", "Duty and I.R. tax"].map((h, i) => (
          <span key={h} className={`border-b border-r border-base-300 px-2 py-1.5 font-semibold last:border-r-0 ${i === 3 ? "bg-primary/15 text-primary" : "text-base-content/50"}`}>
            {h}
          </span>
        ))}
        {[["Pump housings", "$18,400", "25%", "$4,600.00"]].map((row, r) =>
          row.map((cell, i) => (
            <span
              key={`${r}-${i}`}
              className={`border-r border-base-300 px-2 py-1.5 last:border-r-0 ${i === 3 ? `bg-primary/8 font-semibold text-base-content ${cell ? "ring-2 ring-inset ring-primary" : ""}` : "text-base-content/40"}`}
            >
              {cell || " "}
            </span>
          ))
        )}
      </div>
    </div>
    <figcaption className="text-center text-xs text-base-content/60">The duty on your line, without MPF or HMF</figcaption>
  </figure>
);

export const PaidStep = ({
  draft,
  set,
  onBack,
  onNext,
}: {
  draft: EntryDraft;
  set: (patch: Partial<EntryDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const problem = paidProblem(draft);
  const [tried, setTried] = useState(false);
  const value = Number(draft.customsValue);
  const paid = Number(draft.dutyPaid);
  const pct = !problem && value > 0 ? (paid / value) * 100 : null;
  return (
    <form
      className={`mx-auto grid w-full items-center gap-10 ${SHOW_SUMMARY_SLIVER ? "max-w-5xl lg:grid-cols-[1fr_22rem]" : "max-w-3xl"}`}
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!problem) onNext();
      }}
      noValidate
    >
      <div className="flex flex-col gap-8">
        <StepHeading
          eyebrow="Step 3 · What you paid"
          title="What was your duty payment?"
          lead={
            <>
              The full duty paid on this line of the entry summary, on {money(value)} entered on {formatDate(draft.entryDate)}: regular duty, tariffs and any
              AD/CVD deposits, all together. Leave out fees: MPF and HMF aren&apos;t duty.
            </>
          }
          size="md"
        />
        <div className="tt-ob-rise flex flex-col gap-2" style={delay(180)}>
          <span className={ui.fieldLabel}>Total duty paid, including AD/CVD (USD)</span>
          <MoneyInput big autoFocus value={draft.dutyPaid} onChange={(dutyPaid) => set({ dutyPaid })} invalid={tried && !!problem} />
          {tried && problem ? (
            <span className="text-xs font-medium text-error">{problem}</span>
          ) : pct !== null ? (
            <span className="text-sm text-base-content/70">
              That&apos;s <strong className="text-base-content">{formatRate(pct)}</strong> of the entered value.
              {pct > 100 && " More than the value itself: possible with some tariffs, but check for a misplaced decimal."}
            </span>
          ) : (
            <span className={ui.caption}>Enter 0 if no duty was paid.</span>
          )}
        </div>
        <StepNav onBack={onBack} onNext={() => undefined} next="Continue" />
      </div>
      {SHOW_SUMMARY_SLIVER && <SummarySliver />}
    </form>
  );
};
