"use client";

import { ReactNode, useMemo } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { calculate } from "../../../../tariffs/engine-v2/calculate";
import { AllRules } from "../../../../tariffs/engine-v2/data";
import { CalculationResult, Question } from "../../../../tariffs/engine-v2/types";
import { formatDate } from "../../../duty-calculator/lib/format";
import { preferenceImpacts, questionImpacts, sortBySpecificity } from "../../../duty-calculator/lib/questions";
import { QuestionControl } from "../../../duty-calculator/results/QuestionControl";
import { formatRate } from "../../formatRate";
import { delay, StepHeading } from "../../onboarding/parts";
import { rateParts, shortProgram, TrackedProduct } from "../../report";
import { money, VERDICTS } from "../EntriesTable";
import { adcvdOwed, compare, EntryAudit, entryInput } from "../entries";
import { draftAdcvd, draftFacts, EntryDraft } from "./draft";

// Step 4, Adjustments: what was paid against what the entry should have paid, live, beside what
// applied to it when it was filed (the trade program claimed, the questions that change the duty).
// They start from the import's settings today and are set to how this entry was filed; then on to
// AD/CVD (AdcvdStep).

// Below this, a question doesn't change this entry's duty
const MATTERS_USD = 0.005;

const signed = (n: number) => `${n < 0 ? "−" : "+"}${money(Math.abs(n))}`;

// What the entry owed and how it compares, for the draft as it stands
export const useDraftCheck = (product: TrackedProduct, draft: EntryDraft) =>
  useMemo(() => {
    const facts = draftFacts(draft);
    const input = entryInput(product, facts);
    const result = calculate(AllRules, input);
    const adcvd = draftAdcvd(draft);
    const audit = compare(facts.customsValue, { duty: Number(draft.dutyPaid), adcvd: adcvd.paid }, { duty: result.totalDuty, adcvd: adcvdOwed(adcvd, facts.customsValue) });
    return { facts, input, result, audit, adcvd };
  }, [product, draft]);

// The questions that change this entry's duty (or have been answered), most specific first
const questionsThatMatter = (result: CalculationResult, impacts: Record<string, number>) =>
  sortBySpecificity(result.questions, result.asOf).filter(
    (q) => q.answered || q.liftsProhibition || q.input.type !== "boolean" || Math.abs(impacts[q.input.id] ?? 0) >= MATTERS_USD
  );

// One thing that may have applied, as a checkbox row
const Toggle = ({
  on,
  title,
  detail,
  tag,
  impact,
  onChange,
  wait,
  first,
}: {
  on: boolean;
  // The step's first control: focused as the step opens
  first?: boolean;
  title: string;
  detail?: string;
  tag?: string;
  // What turning it on (or, on, turning it off) changes the duty by
  impact?: number;
  onChange: (on: boolean) => void;
  wait: number;
}) => (
  <button
    type="button"
    role="checkbox"
    data-autofocus={first || undefined}
    aria-checked={on}
    onClick={() => onChange(!on)}
    className={`tt-ob-rise flex w-full items-start gap-4 rounded-xl p-4 text-left ring-1 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/50 ${on ? "bg-primary/6 ring-primary/40" : "bg-(--tt-ob-tile) ring-(--tt-ob-tile-edge) hover:ring-base-content/20"
      }`}
    style={delay(wait)}
  >
    <span
      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${on ? "border-primary bg-primary text-primary-content" : "border-base-content/30 bg-base-100"}`}
      aria-hidden
    >
      {on && <CheckIcon className="h-3.5 w-3.5" />}
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-base-content">{title}</span>
        {tag && <span className={tt.chip()}>{tag}</span>}
      </span>
      {detail && <span className="line-clamp-3 text-xs leading-relaxed text-base-content/65">{detail}</span>}
    </span>
    {impact !== undefined && Math.abs(impact) >= MATTERS_USD && (
      <span className="flex shrink-0 flex-col items-end">
        <span className={`text-sm font-semibold tabular-nums ${(on ? -impact : impact) < 0 ? "text-success" : "text-error"}`}>
          {signed(on ? -impact : impact)}
        </span>
        <span className="text-[0.7rem] text-base-content/55">{on ? "applied" : "if it applied"}</span>
      </span>
    )}
  </button>
);

// The question's program, from the first heading it decides
const questionTag = (q: Question, result: CalculationResult) => {
  const line = result.lines.find((l) => q.headings.includes(l.code));
  return line ? shortProgram(line.name) : undefined;
};

// Paid against should have paid, as two bars and the difference
export const PaidOwed = ({ audit, size = "md" }: { audit: EntryAudit; size?: "md" | "lg" }) => {
  const paid = audit.paid;
  const max = Math.max(paid, audit.owed, 1);
  const verdict = VERDICTS[audit.verdict];
  const rows = [
    { label: "You paid", amount: paid, pct: audit.ratePaidPct, bar: "bg-base-content/70" },
    { label: "Should have paid", amount: audit.owed, pct: audit.rateOwedPct, bar: "bg-primary" },
  ];
  return (
    <div className="flex flex-col gap-4">
      {rows.map((r) => (
        <div key={r.label} className="flex flex-col gap-1.5">
          <span className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-base-content/70">{r.label}</span>
            <span className="flex items-baseline gap-2">
              <span className={`${size === "lg" ? tt.metric : tt.metricSm} tabular-nums`}>{money(r.amount)}</span>
              <span className="text-xs text-base-content/55">{formatRate(r.pct)}</span>
            </span>
          </span>
          <span className={`block overflow-hidden rounded-full bg-tt-soft ${size === "lg" ? "h-4" : "h-2.5"}`}>
            <span className={`block h-full rounded-full transition-[width] duration-500 ease-out ${r.bar}`} style={{ width: `${(r.amount / max) * 100}%` }} />
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 rounded-xl bg-tt-soft px-4 py-3">
        <span className={tt.chip(verdict.tone)}>{verdict.label}</span>
        <span className={`${tt.display} text-lg font-semibold tabular-nums ${audit.verdict === "overpaid" ? "text-success" : audit.verdict === "underpaid" ? "text-error" : "text-base-content"}`}>
          {audit.verdict === "correct" ? "Within $1" : `${audit.verdict === "overpaid" ? "Up to " : ""}${money(Math.abs(audit.difference))}`}
        </span>
      </div>
    </div>
  );
};

// Beside Adjustments and AD/CVD: paid against should have paid as it stands, what made up the duty,
// and the step's way on
export const LiveCheckPanel = ({ product, draft, children }: { product: TrackedProduct; draft: EntryDraft; children: ReactNode }) => {
  const { facts, result, audit } = useDraftCheck(product, draft);
  const parts = rateParts(result, facts.customsValue);
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className={`${tt.panel} tt-ob-from-right flex flex-col gap-5 p-6`} style={delay(240)}>
        <div>
          <p className={`${tt.eyebrow("primary")} m-0`}>Paid vs should have paid</p>
          <p className="m-0 mt-1 text-xs text-base-content/60">
            {money(facts.customsValue)} entered on {formatDate(facts.entryDate)}
          </p>
        </div>
        <PaidOwed audit={audit} />
        {(parts.length > 0 || audit.adcvdOwed > 0) && (
          <div className="flex flex-col gap-2 border-t border-base-300 pt-4">
            <span className="text-xs font-semibold text-base-content/60">Should have paid, by part</span>
            {parts.map((p) => (
              <span key={p.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-base-content/80">{shortProgram(p.key)}</span>
                <span className="shrink-0 tabular-nums text-base-content">{formatRate(p.pct)}</span>
              </span>
            ))}
            {audit.adcvdOwed > 0 && (
              <span className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-base-content/80">AD/CVD deposits</span>
                <span className="shrink-0 tabular-nums text-base-content">{formatRate((audit.adcvdOwed / facts.customsValue) * 100)}</span>
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </aside>
  );
};

// "Paid vs should have paid" beside Adjustments: off for now (2026-11-02), back by setting true.
// AD/CVD keeps its own.
const SHOW_LIVE_PANEL = false;

export const CheckStep = ({
  product,
  draft,
  set,
  onBack,
  onNext,
}: {
  product: TrackedProduct;
  draft: EntryDraft;
  set: (patch: Partial<EntryDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const { facts, input, result } = useDraftCheck(product, draft);
  const answers = facts.answers;
  const impacts = useMemo(() => questionImpacts(input, result, answers), [input, result, answers]);
  const prefImpacts = useMemo(() => preferenceImpacts(input, result, answers), [input, result, answers]);
  const questions = questionsThatMatter(result, impacts);
  const booleans = questions.filter((q) => q.input.type === "boolean");
  const others = questions.filter((q) => q.input.type !== "boolean");
  const preferences = result.availablePreferences;
  const claimed = preferences.some((p) => p.symbol === draft.claimedPreference) ? draft.claimedPreference : null;
  const answer = (id: string, value: unknown) => {
    const next = { ...answers };
    if (value === undefined) delete next[id];
    else next[id] = value;
    set({ answers: next });
  };
  const nothingToSet = !preferences.length && !questions.length;
  // Each row rises a beat after the one above
  const prefAt = 1;
  const boolAt = prefAt + (preferences.length ? preferences.length + 1 : 0);
  const otherAt = boolAt + (booleans.length ? booleans.length + 1 : 0);
  const at = (i: number) => 200 + i * 50;

  return (
    <div className={`mx-auto grid w-full gap-10 ${SHOW_LIVE_PANEL ? "max-w-6xl lg:grid-cols-[1fr_24rem]" : "max-w-3xl"}`}>
      <div className="flex flex-col gap-8">
        <StepHeading
          eyebrow="Step 4 · Adjustments"
          title="Exemptions & Trade Programs "
          lead={
            nothingToSet ? (
              <>Nothing on {formatDate(facts.entryDate)} changes this import&apos;s duty: no trade program to claim, no exemption to confirm. The check is ready.</>
            ) : (
              <>
                Check off any that were claimed when this entry was filed on {formatDate(facts.entryDate)}: a program can go unclaimed, or an exemption differ,
                from one entry to the next.
              </>
            )
          }
          size="md"
        />

        {!nothingToSet && (
          <span className="tt-ob-rise -mt-4 inline-flex items-center gap-2 self-start rounded-full bg-success/10 px-3 py-1.5 text-sm font-semibold text-success" style={delay(160)}>
            <CheckIcon className="h-4 w-4" aria-hidden />
            Defaults for your import already applied
          </span>
        )}

        {preferences.length > 0 && (
          <section className="flex flex-col gap-3" aria-labelledby="tt-check-program">
            <h2 id="tt-check-program" className={`${tt.eyebrow()} tt-ob-rise m-0`} style={delay(at(prefAt))}>
              Trade program claimed
            </h2>
            <p className="tt-ob-rise -mt-1 m-0 text-xs text-base-content/60" style={delay(at(prefAt))}>
              Check the one claimed on this entry, if any. One program per entry line.
            </p>
            {preferences.map((p, i) => (
              <Toggle
                key={p.symbol}
                on={claimed === p.symbol}
                title={p.name}
                tag={`SPI “${p.symbol}”`}
                detail="Claimed on the entry summary, with the goods qualifying under its rules of origin."
                impact={claimed === p.symbol ? undefined : prefImpacts[p.symbol]}
                onChange={(on) => set({ claimedPreference: on ? p.symbol : null })}
                wait={at(prefAt + 1 + i)}
                first={i === 0}
              />
            ))}
          </section>
        )}

        {booleans.length > 0 && (
          <section className="flex flex-col gap-3" aria-labelledby="tt-check-conditions">
            <h2 id="tt-check-conditions" className={`${tt.eyebrow()} tt-ob-rise m-0`} style={delay(at(boolAt))}>
              Exemptions and conditions
            </h2>
            {booleans.map((q, i) => (
              <Toggle
                key={q.input.id}
                on={answers[q.input.id] === true}
                title={q.input.label}
                detail={q.input.help}
                tag={questionTag(q, result)}
                impact={impacts[q.input.id]}
                onChange={(on) => answer(q.input.id, on || undefined)}
                wait={at(boolAt + 1 + i)}
                first={i === 0 && !preferences.length}
              />
            ))}
          </section>
        )}

        {others.length > 0 && (
          <section className="tt-ob-rise flex flex-col gap-4 rounded-xl bg-(--tt-ob-tile) p-5 ring-1 ring-(--tt-ob-tile-edge)" style={delay(at(otherAt))}
            aria-label="Details of the goods"
            data-autofocus={!preferences.length && !booleans.length ? true : undefined}>
            <h2 className={`${tt.eyebrow()} m-0`}>Details of the goods</h2>
            {others.map((q) => (
              <QuestionControl key={q.input.id} question={q} value={answers[q.input.id]} onChange={(v) => answer(q.input.id, v)} hideLegal />
            ))}
          </section>
        )}

        <div className="flex items-center justify-between gap-3 pt-2">
          <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onBack}>
            <ArrowLeftIcon className="h-4 w-4" aria-hidden />
            Back
          </button>
          {!SHOW_LIVE_PANEL && (
            <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} px-7`} onClick={onNext} data-autofocus={nothingToSet || undefined}>
              Continue
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {SHOW_LIVE_PANEL && (
        <LiveCheckPanel product={product} draft={draft}>
          <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} w-full`} onClick={onNext} data-autofocus={nothingToSet || undefined}>
            Continue
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </LiveCheckPanel>
      )}
    </div>
  );
};
