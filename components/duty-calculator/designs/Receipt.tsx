"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { Country } from "../../../constants/countries";
import { CalculationResult, Question } from "../../../tariffs/engine-v2/types";
import { CountryField } from "../CountryField";
import { formatDate, formatMoney, formatPct, mono, TRANSPORT_MODES } from "../format";
import { HtsCodeField } from "../HtsCodeField";
import { COLUMN_LABEL, describeHtsRevision, programName, QuestionControl } from "../Results";
import { emptyTitle, ExampleButtons, ShareButtons, VerifiedNotice, ViewSwitch } from "../shared";
import { MAX_COMPARE, TariffFinder } from "../useTariffFinder";
import styles from "../theme.module.css";

// Receipt: one calm column. The inputs read as a sentence, the result reads like an invoice,
// and each question sits under the line it would change.

export const ReceiptDesign = ({ f }: { f: TariffFinder }) => {
  const { result, selectedElement, country } = f;
  const ready = !f.loading && result && selectedElement && country;

  return (
    <div className="flex flex-col gap-8">
      <Sentence f={f} />

      {!f.loading && !ready && (
        <div className="mx-auto w-full max-w-[640px] text-center flex flex-col items-center gap-5 py-6">
          <p className="text-[15px] text-[var(--dc-text-2)]">{emptyTitle(f)}, or try one of these.</p>
          <ExampleButtons onExample={f.selectExample} compact />
        </div>
      )}

      {ready && (
        <section className="flex flex-col items-center gap-5" aria-label="Duty estimate" aria-live="polite">
          <div className="w-full max-w-[640px] flex flex-wrap items-center justify-between gap-3">
            <ViewSwitch f={f} />
            <ShareButtons f={f} compact />
          </div>
          <div className="w-full max-w-[640px]">
            <VerifiedNotice f={f} compact />
          </div>

          {f.comparing ? (
            <div
              className={`w-full grid grid-cols-1 gap-5 items-start ${
                f.compareEntries.length === 3 ? "lg:grid-cols-3" : "md:grid-cols-2 max-w-[900px]"
              }`}
            >
              {f.compareEntries.map((entry) => (
                <CompareReceipt
                  key={entry.country.code}
                  f={f}
                  country={entry.country}
                  result={entry.result}
                  lowest={isLowest(f, entry.result)}
                />
              ))}
            </div>
          ) : f.view === "simple" ? (
            <Paper className="max-w-[440px]">
              <Total f={f} result={result} />
              <Rule />
              <Leader label="Duty" amount={result.totalDuty} />
              <Leader label="Customs fees" amount={result.totalFees} />
              <Rule />
              <Leader label="Landed cost" amount={f.customsValue + result.totalDuty + result.totalFees} strong />
              {f.openQuestions > 0 && (
                <button
                  type="button"
                  className={`${styles.link} mt-5 text-[13.5px]`}
                  onClick={() => f.changeView("detailed")}
                >
                  {f.openQuestions === 1 ? "1 question" : `${f.openQuestions} questions`} could change this →
                </button>
              )}
            </Paper>
          ) : (
            <FullReceipt f={f} result={result} />
          )}
        </section>
      )}
    </div>
  );
};

// ── The sentence ──

const Sentence = ({ f }: { f: TariffFinder }) => {
  const { result } = f;
  const mode = TRANSPORT_MODES.find((m) => m.id === f.transportMode);

  if (f.loading) {
    return (
      <div className="mx-auto w-full max-w-[760px] flex flex-col gap-3 py-4" aria-busy="true">
        <div className={`${styles.skeleton} h-9 w-full`} />
        <div className={`${styles.skeleton} h-9 w-2/3`} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[780px] pt-2 text-center">
      {/* A div, not a p: the popovers hold block-level fields */}
      <div
        role="group"
        aria-label="Entry details"
        className="text-[22px] sm:text-[28px] leading-[1.9] font-medium tracking-tight text-[var(--dc-text-2)]"
      >
        Importing{" "}
        <MoneyToken value={f.customsValue} onChange={f.setCustomsValue} label="Customs value" />{" "}
        {result?.requiresQuantity && (
          <>
            <span className="whitespace-nowrap">
              (<NumberToken value={f.quantity} onChange={f.setQuantity} label="Quantity" /> {f.unitLabel})
            </span>{" "}
          </>
        )}
        of{" "}
        <PopoverToken
          label="HTS code"
          text={f.selectedElement ? f.selectedElement.htsno : "an HTS code"}
          empty={!f.selectedElement}
          mono
          autoOpen={!f.selectedElement && !f.codeParam}
        >
          {(close) => (
            <div className="flex flex-col gap-2 w-[min(460px,85vw)]">
              <HtsCodeField
                id="rc-hts"
                selectedElement={f.selectedElement}
                onSelect={(el) => {
                  f.selectElement(el, "hts_selector");
                  if (el) close();
                }}
                autoFocus
              />
              <button
                type="button"
                className={`${styles.link} self-start inline-flex items-center gap-1 text-[13px]`}
                onClick={() => {
                  close();
                  f.openExplore();
                }}
              >
                <MagnifyingGlassIcon className="w-3.5 h-3.5" />
                Search by description
              </button>
            </div>
          )}
        </PopoverToken>{" "}
        from{" "}
        <PopoverToken
          label="Countries of origin"
          text={countriesText(f.countries)}
          empty={f.countries.length === 0}
        >
          {() => (
            <div className="flex flex-col gap-2 w-[min(420px,85vw)] text-left">
              <CountryField id="rc-country" selected={f.countries} onChange={f.changeCountries} max={MAX_COMPARE} />
              <p className="text-[12.5px] text-[var(--dc-text-3)]">
                Add up to {MAX_COMPARE - 1} more to compare receipts side by side.
              </p>
            </div>
          )}
        </PopoverToken>{" "}
        by{" "}
        <SelectToken
          label="Mode of transport"
          value={f.transportMode}
          options={TRANSPORT_MODES.map((m) => ({ value: m.id, label: m.label.toLowerCase() }))}
          onChange={(v) => f.setTransportMode(v as typeof f.transportMode)}
          text={mode?.label.toLowerCase() ?? ""}
        />
        , entering{" "}
        <DateToken value={f.entryDate} onChange={(v) => f.setEntryDate(v)} />
        {result && result.availablePreferences.length > 0 && !f.comparing && (
          <>
            , claiming{" "}
            <SelectToken
              label="Trade preference"
              value={f.claimedPreference}
              options={[
                { value: "", label: "no preference" },
                ...result.availablePreferences.map((p) => ({ value: p.symbol, label: `${p.symbol} (${p.name})` })),
              ]}
              onChange={(v) => f.country && f.setPreference(f.country.code, v)}
              text={f.claimedPreference || "no preference"}
            />
          </>
        )}
        .
      </div>
      {f.codeDescription && (
        <p className="mt-2 text-[13.5px] text-[var(--dc-text-3)] line-clamp-2 max-w-[640px] mx-auto">
          {f.codeDescription}
        </p>
      )}
    </div>
  );
};

const countriesText = (countries: Country[]) => {
  if (countries.length === 0) return "a country";
  const names = countries.map((c) => `${c.flag} ${c.name}`);
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
};

const tokenClass = (empty?: boolean) =>
  `inline rounded-md px-1 -mx-0.5 font-semibold underline decoration-2 underline-offset-[6px] transition-colors cursor-pointer ${
    empty
      ? "text-[var(--dc-accent)] decoration-[var(--dc-accent)] decoration-dashed"
      : "text-[var(--dc-text)] decoration-[var(--dc-accent-border)] hover:decoration-[var(--dc-accent)]"
  } hover:bg-[var(--dc-accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--dc-accent)]`;

// A token that opens a small panel with the real field
const PopoverToken = ({
  label,
  text,
  empty,
  mono: useMono,
  autoOpen,
  children,
}: {
  label: string;
  text: string;
  empty?: boolean;
  mono?: boolean;
  autoOpen?: boolean;
  children: (close: () => void) => ReactNode;
}) => {
  const [open, setOpen] = useState(Boolean(autoOpen));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline-block">
      <button
        type="button"
        className={`${tokenClass(empty)} ${useMono ? mono.className : ""}`}
        aria-label={`${label}: ${text}. Change`}
        aria-expanded={open}
        onClick={() => setOpen((x) => !x)}
      >
        {text}
      </button>
      {open && (
        <span
          className={`${styles.card} absolute left-1/2 -translate-x-1/2 top-full mt-2 z-30 block p-3 text-left text-[15px] leading-normal font-normal tracking-normal`}
          style={{ boxShadow: "var(--dc-shadow-pop)" }}
          role="dialog"
          aria-label={label}
        >
          {children(() => setOpen(false))}
        </span>
      )}
    </span>
  );
};

const inlineInputClass =
  "bg-transparent outline-none font-semibold tracking-normal text-[var(--dc-text)] underline decoration-2 underline-offset-[6px] decoration-[var(--dc-accent-border)] hover:decoration-[var(--dc-accent)] focus:decoration-[var(--dc-accent)] focus:bg-[var(--dc-accent-soft)] rounded-md px-1 -mx-0.5 text-center";

const formatAmount = (value: number) => value.toLocaleString("en-US", { maximumFractionDigits: 2 });

// Grows with its text so the sentence doesn't jump
const NumberToken = ({
  value,
  onChange,
  label,
  prefix,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  prefix?: string;
}) => {
  const [text, setText] = useState(formatAmount(value));
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(formatAmount(value));
  }, [value, focused]);
  const shown = `${prefix ?? ""}${text}`;
  return (
    // The hidden copy sets the width, so the token is exactly as wide as its text
    <span className="inline-grid align-baseline">
      <span aria-hidden className={`${inlineInputClass} ${styles.num} invisible whitespace-pre col-start-1 row-start-1 pr-2`}>
        {shown || " "}
      </span>
      <input
        aria-label={label}
        // size=1 stops the input's default width from widening the token
        size={1}
        inputMode="decimal"
        autoComplete="off"
        className={`${inlineInputClass} ${styles.num} col-start-1 row-start-1 w-full min-w-0`}
        value={shown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          setText(formatAmount(value));
        }}
        onChange={(e) => {
          const cleaned = e.target.value.replace(/[^\d.]/g, "");
          setText(cleaned);
          const parsed = parseFloat(cleaned);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
      />
    </span>
  );
};

const MoneyToken = (props: { value: number; onChange: (v: number) => void; label: string }) => (
  <NumberToken {...props} prefix="$" />
);

const DateToken = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        className={tokenClass()}
        aria-label={`Entry date: ${formatDate(value)}. Change`}
        onClick={() => {
          const input = ref.current;
          if (!input) return;
          if (typeof input.showPicker === "function") input.showPicker();
          else input.focus();
        }}
      >
        {formatDate(value)}
      </button>
      {/* The native picker, anchored under the token */}
      <input
        ref={ref}
        type="date"
        tabIndex={-1}
        aria-hidden
        className="absolute left-0 bottom-0 w-full h-0 opacity-0 pointer-events-none"
        value={value}
        onChange={(e) => e.target.value && onChange(e.target.value)}
      />
    </span>
  );
};

// A native select, so it's accessible and works on phones, dressed as a token
const SelectToken = ({
  label,
  value,
  options,
  onChange,
  text,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  text: string;
}) => (
  <span className="relative inline-block">
    <span className={tokenClass()} aria-hidden>
      {text}
    </span>
    <select
      aria-label={label}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </span>
);

// ── The receipt ──

const Paper = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div
    className={`relative w-full ${className} rounded-[4px] bg-[var(--dc-surface)] border border-[var(--dc-border)] px-6 sm:px-9 pt-8 pb-9`}
    style={{
      boxShadow: "var(--dc-shadow)",
      // A torn-paper edge along the bottom
      WebkitMaskImage:
        "linear-gradient(#000 0 0) top/100% calc(100% - 8px) no-repeat, radial-gradient(circle 5px at 50% 100%, transparent 98%, #000) bottom/14px 8px repeat-x",
      maskImage:
        "linear-gradient(#000 0 0) top/100% calc(100% - 8px) no-repeat, radial-gradient(circle 5px at 50% 100%, transparent 98%, #000) bottom/14px 8px repeat-x",
    }}
  >
    {children}
  </div>
);

const Rule = ({ strong }: { strong?: boolean }) => (
  <div
    className={`my-4 border-t ${strong ? "border-[var(--dc-border-strong)]" : "border-dashed border-[var(--dc-border-strong)]"}`}
    role="presentation"
  />
);

// "Label ........ $1,000.00" with a dotted leader
const Leader = ({
  label,
  sub,
  amount,
  strong,
  code,
}: {
  label: ReactNode;
  sub?: ReactNode;
  amount: number;
  strong?: boolean;
  code?: string;
}) => (
  <div className="py-1.5">
    <div className="flex items-baseline gap-2">
      <span className={`min-w-0 ${strong ? "text-[15.5px] font-semibold" : "text-[14.5px]"} text-[var(--dc-text)]`}>
        {code && (
          <span className={`${mono.className} mr-2 text-[12.5px] font-semibold text-[var(--dc-accent)]`}>{code}</span>
        )}
        {label}
      </span>
      <span className="flex-1 min-w-[16px] translate-y-[-3px] border-b-2 border-dotted border-[var(--dc-border-strong)]" />
      <span
        className={`${styles.num} ${mono.className} whitespace-nowrap ${
          strong ? "text-[16px] font-semibold" : "text-[14.5px] font-medium"
        }`}
      >
        {formatMoney(amount)}
      </span>
    </div>
    {sub && <div className="mt-0.5 text-[12.5px] leading-snug text-[var(--dc-text-3)]">{sub}</div>}
  </div>
);

const Total = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const dutyAndFees = result.totalDuty + result.totalFees;
  const effective = f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  return (
    <div className="text-center">
      <div className={styles.eyebrow}>Duty and fees due</div>
      <div className={`${styles.num} mt-2 text-[44px] sm:text-[52px] leading-none font-semibold tracking-tight`}>
        {formatMoney(dutyAndFees)}
      </div>
      <div className={`${styles.num} mt-2 text-[13.5px] text-[var(--dc-text-2)]`}>
        {formatPct(Math.round(effective * 100) / 100)} effective duty rate
      </div>
    </div>
  );
};

const partText = (p: CalculationResult["baseParts"][number], unitLabel: string) => {
  const basis =
    p.kind === "percent"
      ? formatMoney(p.basis)
      : `${p.basis.toLocaleString("en-US")} ${p.unit === "each" ? unitLabel : p.unit}`;
  return `${p.raw} × ${basis}${p.assumed ? " (assumed)" : ""}`;
};

// Where a question belongs: under the applied line it's about, or in the "could this be lower" list
const questionHome = (q: Question, result: CalculationResult) => {
  if (q.headings.includes("BASE")) return "BASE";
  const applied = result.lines.find((l) => l.status === "applies" && q.headings.includes(l.code));
  return applied?.code ?? null;
};

const FullReceipt = ({ f, result }: { f: TariffFinder; result: CalculationResult }) => {
  const [showChecked, setShowChecked] = useState(false);
  const applied = result.lines.filter((l) => l.status === "applies");
  const notApplied = result.lines.filter((l) => l.status !== "applies");
  const matters = (q: Question) =>
    q.answered || q.input.type !== "boolean" || Math.abs(f.impacts[q.input.id] ?? 0) >= 0.005;
  const questions = result.questions.filter(matters);
  const under = (code: string) => questions.filter((q) => questionHome(q, result) === code);
  const loose = questions.filter((q) => questionHome(q, result) === null);
  // Answering "yes" lowers the total (exemptions) or raises it (duties that apply once confirmed)
  const raises = (q: Question) => (f.impacts[q.input.id] ?? 0) > 0;
  const savings = loose.filter((q) => !raises(q));
  const extras = loose.filter(raises);
  const itemized = result.baseParts.length > 1 || result.baseParts.some((p) => p.kind === "amount" || p.component);

  const questionItems = (list: Question[]) =>
    list.map((q) => (
      <li key={q.input.id}>
        <ReceiptQuestion f={f} result={result} question={q} />
      </li>
    ));

  const questionList = (list: Question[]) =>
    list.length > 0 && (
      <ul className="mt-1.5 mb-2 ml-1 pl-4 border-l-2 border-[var(--dc-accent-border)] flex flex-col gap-2.5">
        {questionItems(list)}
      </ul>
    );

  return (
    <Paper className="max-w-[640px]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className={`${mono.className} text-[15px] font-semibold`}>{result.htsCode}</div>
          <div className="text-[13px] text-[var(--dc-text-3)]">
            {f.country?.flag} {f.country?.name} · {formatDate(result.asOf)} · {f.transportLabel}
          </div>
        </div>
        <div className="text-right text-[13px] text-[var(--dc-text-3)]">
          <div>Customs value</div>
          <div className={`${styles.num} ${mono.className} text-[14px] font-medium text-[var(--dc-text)]`}>
            {formatMoney(f.customsValue)}
          </div>
        </div>
      </div>

      <Total f={f} result={result} />
      <Rule />

      {/* Duty */}
      <div className={`${styles.eyebrow} mb-1`}>Duty</div>
      <Leader
        code="Base"
        label={COLUMN_LABEL[result.column] + (result.claimedPreference ? ` (${result.claimedPreference})` : "")}
        sub={
          itemized ? (
            <span className="flex flex-col">
              {result.baseParts.map((p, i) => (
                <span key={i} className={styles.num}>
                  {partText(p, f.unitLabel)} = {formatMoney(p.amount)}
                </span>
              ))}
            </span>
          ) : (
            `${result.base.reasons[0] ?? "Free"} of ${formatMoney(result.base.basisValue)}`
          )
        }
        amount={result.base.amount}
      />
      {questionList(under("BASE"))}
      {applied.map((line) => (
        <div key={line.code}>
          <Leader
            code={line.code}
            label={programName(line.program)}
            sub={`${line.ratePct !== undefined ? formatPct(line.ratePct) : "—"} of ${formatMoney(line.basisValue)} · ${line.name}`}
            amount={line.amount}
          />
          {questionList(under(line.code))}
        </div>
      ))}
      <Rule />
      <Leader label="Total duty" amount={result.totalDuty} strong />

      {/* Fees */}
      <div className={`${styles.eyebrow} mt-5 mb-1`}>Customs fees</div>
      {result.fees.map((fee) => (
        <Leader key={fee.id} code={fee.id.toUpperCase()} label={fee.name} sub={fee.note} amount={fee.amount} />
      ))}
      {result.fees.length === 0 && <p className="text-[13.5px] text-[var(--dc-text-3)]">None for this entry</p>}
      <Rule strong />
      <Leader label="Duty and fees" amount={result.totalDuty + result.totalFees} strong />
      <Leader label="Landed cost" amount={f.customsValue + result.totalDuty + result.totalFees} />

      {savings.length > 0 && (
        <div className="mt-7 rounded-xl bg-[var(--dc-positive-soft)] border border-[var(--dc-border)] p-4 sm:p-5">
          <div className="text-[14.5px] font-semibold">Could this be lower?</div>
          <p className="mt-0.5 mb-3 text-[12.5px] text-[var(--dc-text-2)]">
            Check any that are true. Unchecked counts as “no”.
          </p>
          <ul className="flex flex-col gap-3">{questionItems(savings)}</ul>
        </div>
      )}
      {extras.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-[var(--dc-border-strong)] p-4 sm:p-5">
          <div className="text-[14.5px] font-semibold">Might also apply</div>
          <p className="mt-0.5 mb-3 text-[12.5px] text-[var(--dc-text-2)]">
            These only apply if they describe your goods, so they aren&apos;t included until you check them.
          </p>
          <ul className="flex flex-col gap-3">{questionItems(extras)}</ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <ul className="mt-5 flex flex-col gap-1.5">
          {result.warnings.map((w) => (
            <li key={w} className="text-[12.5px] leading-snug text-[var(--dc-warning)]">
              ⚠ {w}
            </li>
          ))}
        </ul>
      )}

      {/* Fine print */}
      <Rule />
      <div className="text-center text-[12px] leading-relaxed text-[var(--dc-text-3)]">
        Rules: HTS {f.revisionForDate?.title ?? "—"}
        {f.verified ? " (verified)" : " (unverified)"} · Base rates: HTS {describeHtsRevision(f.htsRevisionName)}
        {notApplied.length > 0 && (
          <>
            {" · "}
            <button
              type="button"
              className="font-semibold underline underline-offset-2 hover:text-[var(--dc-text)]"
              onClick={() => setShowChecked((x) => !x)}
              aria-expanded={showChecked}
            >
              {notApplied.length} more headings checked
              <ChevronDownIcon className={`inline w-3.5 h-3.5 transition-transform ${showChecked ? "rotate-180" : ""}`} />
            </button>
          </>
        )}
      </div>
      {showChecked && (
        <ul className="mt-3 flex flex-col gap-2 text-left">
          {notApplied.map((line) => (
            <li key={line.code} className="text-[12.5px] leading-snug text-[var(--dc-text-2)]">
              <span className={`${mono.className} font-semibold mr-1.5`}>{line.code}</span>
              {line.name}
              {line.reasons[0] && <span className="text-[var(--dc-text-3)]"> — {line.reasons.join(" · ")}</span>}
            </li>
          ))}
        </ul>
      )}
    </Paper>
  );
};

// Yes/no questions use the shared control; values (e.g. the case) are one compact row
const ReceiptQuestion = ({
  f,
  result,
  question,
}: {
  f: TariffFinder;
  result: CalculationResult;
  question: Question;
}) => {
  const id = question.input.id;
  if (question.input.type === "boolean") {
    return (
      <QuestionControl
        question={question}
        value={f.answers[id]}
        impact={f.impacts[id]}
        heading={result.lines.find((l) => `confirm:${l.code}` === id)}
        onChange={(v) => f.answer(id, v)}
      />
    );
  }
  const money = question.input.unit === "USD";
  return (
    <label className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[13.5px]">
      <span className="text-[var(--dc-text)]">
        {question.input.label.replace(/ \(USD\)$/, "")}
        <span className="block text-[12px] text-[var(--dc-text-3)]">
          {f.answers[id] === undefined ? "Blank uses the whole value, the most it can be" : "Entered"}
        </span>
      </span>
      <span className={`${styles.input} ${styles.num} flex items-center gap-1 px-2.5`} style={{ height: 34, width: 150 }}>
        {money && <span className="text-[var(--dc-text-3)]">$</span>}
        <input
          type="number"
          min={0}
          inputMode="decimal"
          className="w-full min-w-0 bg-transparent outline-none text-[14px]"
          placeholder={money ? formatMoney(f.customsValue).replace("$", "") : String(f.quantity)}
          value={(f.answers[id] as number | undefined) ?? ""}
          onChange={(e) => f.answer(id, e.target.value === "" ? undefined : Number(e.target.value))}
        />
      </span>
    </label>
  );
};

// ── Comparing ──

const landed = (f: TariffFinder, r: CalculationResult) => f.customsValue + r.totalDuty + r.totalFees;

const isLowest = (f: TariffFinder, r: CalculationResult) => {
  const all = f.compareEntries.map((e) => landed(f, e.result));
  const min = Math.min(...all);
  const tied = all.every((v) => Math.abs(v - min) < 0.005);
  return !tied && Math.abs(landed(f, r) - min) < 0.005;
};

const CompareReceipt = ({
  f,
  country,
  result,
  lowest,
}: {
  f: TariffFinder;
  country: Country;
  result: CalculationResult;
  lowest: boolean;
}) => {
  const applied = result.lines.filter((l) => l.status === "applies");
  const min = Math.min(...f.compareEntries.map((e) => landed(f, e.result)));
  const more = landed(f, result) - min;
  return (
    <Paper>
      {lowest && (
        <div
          className="absolute right-5 top-5 rotate-[8deg] rounded-md border-2 border-[var(--dc-positive)] px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--dc-positive)]"
          aria-label="Lowest landed cost"
        >
          Lowest
        </div>
      )}
      <div className="flex items-center gap-2 pr-16">
        <span className="text-2xl leading-none" aria-hidden>
          {country.flag}
        </span>
        <span className="text-[16px] font-semibold truncate">{country.name}</span>
      </div>
      <div className="mt-5 text-center">
        <div className={`${styles.num} text-[34px] leading-none font-semibold tracking-tight`}>
          {formatMoney(result.totalDuty + result.totalFees)}
        </div>
        <div className={`${styles.num} mt-1.5 text-[12.5px] text-[var(--dc-text-3)]`}>
          {lowest || more < 0.005 ? "duty and fees" : `+${formatMoney(more)} vs lowest`}
        </div>
      </div>
      <Rule />
      <Leader code="Base" label="" amount={result.base.amount} />
      {applied.map((line) => (
        <Leader key={line.code} code={line.code} label="" amount={line.amount} />
      ))}
      {result.fees.map((fee) => (
        <Leader key={fee.id} code={fee.id.toUpperCase()} label="" amount={fee.amount} />
      ))}
      <Rule strong />
      <Leader label="Landed cost" amount={landed(f, result)} strong />

      {result.availablePreferences.length > 0 && (
        <label className="mt-4 flex flex-col gap-1 text-[12.5px] text-[var(--dc-text-3)]">
          Trade preference
          <select
            className={`${styles.input} appearance-none`}
            style={{ height: 36, fontSize: 13.5 }}
            value={f.preferences[country.code] ?? ""}
            onChange={(e) => f.setPreference(country.code, e.target.value)}
          >
            <option value="">None claimed</option>
            {result.availablePreferences.map((p) => (
              <option key={p.symbol} value={p.symbol}>
                {p.symbol} · {p.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--dc-text-3)] hover:text-[var(--dc-text)]"
          onClick={() => f.removeCountry(country.code)}
          aria-label={`Remove ${country.name} from the comparison`}
        >
          <XMarkIcon className="w-3.5 h-3.5" /> Remove
        </button>
        <button
          type="button"
          className={`${styles.link} inline-flex items-center gap-1 text-[13px]`}
          onClick={() => f.viewCountryDetails(country)}
        >
          <PencilIcon className="w-3.5 h-3.5" /> Full receipt
        </button>
      </div>
    </Paper>
  );
};
