"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CheckIcon, MagnifyingGlassIcon, PaperAirplaneIcon, PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { MATCH_CHIP, depositRange, rangeText } from "@/components/adcvd/AdcvdDecision";
import { countryName, depositFor } from "@/components/adcvd/AdcvdParts";
import { caseKey } from "@/components/adcvd/useAdcvdAnswers";
import { useAdcvdLookup } from "@/components/adcvd/useAdcvd";
import { mono } from "@/components/ui/font";
import { Select } from "@/components/ui/Select";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { caseNumberOf, ratesText, type CaseSearchRow } from "@/libs/adcvd/format";
import type { AdcvdFlag } from "@/libs/adcvd/match";
import { STATUSES } from "@/libs/adcvd/types";
import { formatDate } from "../../../duty-calculator/lib/format";
import { delay, StepHeading } from "../../onboarding/parts";
import { TrackedProduct } from "../../report";
import { EntryAdcvdCase } from "../entries";
import { LiveCheckPanel } from "./CheckStep";
import { adcvdProblem, EntryDraft } from "./draft";
import { focusStepInput } from "./focus";
import { sendAuditReport } from "./reports";

// Step 5, AD/CVD: antidumping and countervailing duties can add a lot to an entry, so before the
// review: the cases our matching finds for the import that were in force on the entry date (with the
// import's own answers about them), whether each covers the goods and at what deposit rate. What was
// paid on them is in the duty paid (What You Paid asks for the total, AD/CVD included, 2026-11-02).
// Cases that cover the goods count toward what the entry should have paid
// (decided 2026-11-02). Any case can be added by searching or pasting its number; one we don't have
// is sent to the admin (audit_reports), so missing cases get added.

// A case was in force on the date: started (order, or investigation) and not yet ended
const inForceOn = (f: AdcvdFlag, date: string) =>
  f.cases.some((c) => {
    const start = c.order_on ?? c.initiated_on;
    return !!start && start <= date && (!c.ended_on || c.ended_on > date);
  });

const fromFlag = (f: AdcvdFlag, product: TrackedProduct): EntryAdcvdCase => {
  const known = product.adjustments.adcvd?.[caseKey(f)];
  const supplier = known?.supplier ?? null;
  return {
    key: caseKey(f),
    product: f.product,
    caseNumbers: f.cases.map((c) => c.case_number),
    answer: known?.answer ?? "unsure",
    supplier,
    ratePct: depositFor(f, supplier).total,
    source: "match",
  };
};

const fromSearch = (c: CaseSearchRow): EntryAdcvdCase => ({
  key: c.case_number,
  product: c.product ?? c.case_number,
  caseNumbers: [c.case_number],
  answer: "yes",
  supplier: null,
  ratePct: c.rates?.all_others ?? null,
  source: "added",
});

const ANSWERS: { id: EntryAdcvdCase["answer"]; label: string }[] = [
  { id: "yes", label: "Yes, it covers them" },
  { id: "no", label: "No" },
  { id: "unsure", label: "Not sure" },
];

const CaseCard = ({
  c,
  flag,
  onChange,
  onRemove,
  wait,
  first,
}: {
  c: EntryAdcvdCase;
  // The step's first card: its answer is focused once the cases are in
  first?: boolean;
  // Found by our matching: its companies and rates
  flag?: AdcvdFlag;
  onChange: (patch: Partial<EntryAdcvdCase>) => void;
  onRemove?: () => void;
  wait: number;
}) => {
  const companies = flag ? Array.from(new Set(flag.cases.flatMap((x) => (x.companies ?? []).map((co) => co.company)))).sort() : [];
  const setSupplier = (supplier: string) => {
    const s = supplier || null;
    onChange({ supplier: s, ratePct: flag ? depositFor(flag, s).total : c.ratePct });
  };
  return (
    <div
      className={`tt-ob-rise flex flex-col gap-4 rounded-xl p-5 ring-1 transition-colors ${c.answer === "yes" ? "bg-warning/6 ring-warning/40" : "bg-(--tt-ob-tile) ring-(--tt-ob-tile-edge)"
        }`}
      style={delay(wait)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            {flag ? <span className={tt.chip(MATCH_CHIP[flag.level].tone)}>{MATCH_CHIP[flag.level].label}</span> : <span className={tt.chip("primary")}>Added by you</span>}
            <span className={`${mono.className} text-xs text-base-content/60`}>{c.caseNumbers.join(" · ")}</span>
          </span>
          <span className="text-base font-semibold capitalize leading-snug text-base-content">{c.product.toLowerCase()}</span>
          <span className="text-xs text-base-content/60">
            {flag ? `${countryName(flag.country)} · Deposits ${rangeText(depositRange(flag))}` : "Rate below is the latest all-others rate, if one is set"}
          </span>
        </div>
        {onRemove && (
          <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onRemove} aria-label="Remove this case">
            <XMarkIcon className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-base-content">Does this case cover your goods?</span>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Does this case cover your goods?">
          {ANSWERS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={c.answer === a.id}
              data-autofocus={(first && c.answer === a.id) || undefined}
              onClick={() => onChange({ answer: a.id })}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition-colors ${c.answer === a.id ? "bg-base-content text-base-100 ring-base-content" : "text-base-content/75 ring-base-300 hover:ring-base-content/30"
                }`}
            >
              {a.label}
            </button>
          ))}
        </div>
        {c.answer === "unsure" && (
          <span className={ui.caption}>Not counted in what you should have paid. Ask your broker, and change it later by auditing the entry again.</span>
        )}
      </div>

      {c.answer === "yes" && (
        <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
          {flag && companies.length > 0 ? (
            <label className="flex flex-col gap-1.5">
              <span className={ui.fieldLabel}>Who made it</span>
              <Select
                className="w-full"
                label="Who made it"
                value={c.supplier ?? ""}
                onChange={setSupplier}
                options={[{ value: "", label: "Not listed / don't know (all others rate)" }, ...companies.map((co) => ({ value: co, label: co }))]}
              />
            </label>
          ) : (
            <span className="self-end text-xs text-base-content/60">Use the deposit rate on your entry summary if you have it.</span>
          )}
          <label className="flex flex-col gap-1.5">
            <span className={ui.fieldLabel}>Deposit rate</span>
            <span className="relative">
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className={`${ui.input} pr-8 tabular-nums ${c.ratePct === null ? "border-error" : ""}`}
                value={c.ratePct ?? ""}
                onChange={(e) => onChange({ ratePct: e.target.value === "" ? null : Number(e.target.value) })}
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-base-content/50">%</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
};

// Search the case list, or paste a case number; one we don't have goes to the admin
const AddCase = ({ product, have, onAdd, first }: { product: TrackedProduct; have: Set<string>; onAdd: (c: CaseSearchRow) => void; first?: boolean }) => {
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error" | { query: string; caseNumber: string | null; cases: CaseSearchRow[] }>("idle");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState<"no" | "sending" | "yes">("no");
  const search = async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (q.trim().length < 3) return;
    setState("loading");
    setSent("no");
    const r = await fetch(`/api/adcvd/search?q=${encodeURIComponent(q.trim())}`).catch((): null => null);
    setState(r?.ok ? await r.json() : "error");
  };
  const missing = typeof state === "object" && !state.cases.length ? (state.caseNumber ?? caseNumberOf(state.query)) : null;
  const sendMissing = async () => {
    setSent("sending");
    const ok = await sendAuditReport({
      kind: "missing_case",
      caseNumber: missing,
      htsCode: product.key.split("-")[0],
      country: product.entry.country.code,
      note,
      details: { query: typeof state === "object" ? state.query : q, summary: `Case ${missing} isn't in our case list` },
    });
    setSent(ok ? "yes" : "no");
  };

  return (
    <section className="tt-ob-rise flex flex-col gap-3 rounded-xl border-2 border-dashed border-base-300 p-5" style={delay(420)} aria-labelledby="tt-adcvd-add">
      <div>
        <h2 id="tt-adcvd-add" className="m-0 text-sm font-semibold text-base-content">
          Know of a case we didn&apos;t list?
        </h2>
        <p className="m-0 mt-0.5 text-xs text-base-content/60">Search by product, or paste the case number from your entry summary (like A-570-137).</p>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <span className="relative flex-1">
          <MagnifyingGlassIcon className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-base-content/45" aria-hidden />
          <input data-autofocus={first || undefined} className={`${ui.input} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Steel nails, or A-570-909" aria-label="Search AD/CVD cases" />
        </span>
        <button type="submit" className={ui.button({ variant: "secondary" })} disabled={q.trim().length < 3 || state === "loading"}>
          {state === "loading" ? "Searching…" : "Search"}
        </button>
      </form>
      {state === "error" && <p className="m-0 text-sm text-error">Couldn&apos;t search right now. Please try again.</p>}
      {typeof state === "object" && state.cases.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          {state.cases.map((c) => (
            <li key={c.case_number} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-base-content/4">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold capitalize text-base-content">{(c.product ?? c.case_number).toLowerCase()}</span>
                <span className="truncate text-xs text-base-content/60">
                  <span className={mono.className}>{c.case_number}</span> · {countryName(c.country)} · {STATUSES[c.status]}
                  {c.rates ? ` · ${ratesText(c.rates)}` : ""}
                </span>
              </span>
              <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => onAdd(c)} disabled={have.has(c.case_number)}>
                {have.has(c.case_number) ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5" aria-hidden />
                    Added
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-3.5 w-3.5" aria-hidden />
                    Add
                  </>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {typeof state === "object" && !state.cases.length && !missing && (
        <p className="m-0 text-sm text-base-content/70">No cases match &ldquo;{state.query}&rdquo;. Try fewer words, or paste the case number.</p>
      )}
      {missing &&
        (sent === "yes" ? (
          <p className="m-0 flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2.5 text-sm font-semibold text-success">
            <CheckCircleIcon className="h-4 w-4" aria-hidden />
            Thanks. We&apos;ll look up {missing} and add it to our case list.
          </p>
        ) : (
          <div className="flex flex-col gap-2 rounded-lg bg-tt-soft p-4">
            <p className="m-0 text-sm text-base-content">
              We don&apos;t have <strong className={mono.className}>{missing}</strong> yet. Send it to us and we&apos;ll add it.
            </p>
            <textarea
              className={`${ui.textarea} bg-base-100`}
              rows={2}
              maxLength={2000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything that helps (optional): the product, where you saw the case"
            />
            <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} self-start`} onClick={sendMissing} disabled={sent === "sending"}>
              <PaperAirplaneIcon className="h-3.5 w-3.5" aria-hidden />
              {sent === "sending" ? "Sending…" : "Send it to us"}
            </button>
          </div>
        ))}
    </section>
  );
};

// "Paid vs should have paid" beside AD/CVD: off for now (2026-11-02), back by setting true
const SHOW_LIVE_PANEL = false;

export const AdcvdStep = ({
  product,
  draft,
  set,
  busy,
  onBack,
  onFinish,
}: {
  product: TrackedProduct;
  draft: EntryDraft;
  set: (patch: Partial<EntryDraft>) => void;
  busy: boolean;
  onBack: () => void;
  onFinish: () => void;
}) => {
  const code = product.key.split("-")[0];
  const country = product.entry.country.code;
  const lookup = useAdcvdLookup(code, country);
  const flags = lookup && typeof lookup === "object" ? lookup.flags.filter((f) => inForceOn(f, draft.entryDate)) : [];
  const [tried, setTried] = useState(false);

  // The cases found, once: with the import's own answers and supplier
  const ready = lookup === "error" || lookup === "locked" || (lookup !== null && typeof lookup === "object");
  useEffect(() => {
    if (draft.adcvdCases === null && ready) set({ adcvdCases: flags.map((f) => fromFlag(f, product)) });
  }, [draft.adcvdCases, ready, flags, product, set]);

  // Once the cases are in, the first one's answer (or the case search) is focused
  const root = useRef<HTMLDivElement>(null);
  const loaded = draft.adcvdCases !== null;
  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => focusStepInput(root.current), 60);
    return () => clearTimeout(timer);
  }, [loaded]);

  const cases = draft.adcvdCases ?? [];
  const byKey = new Map(flags.map((f) => [caseKey(f), f]));
  const change = (key: string, patch: Partial<EntryAdcvdCase>) => set({ adcvdCases: cases.map((c) => (c.key === key ? { ...c, ...patch } : c)) });
  const have = new Set(cases.flatMap((c) => c.caseNumbers));
  const problem = adcvdProblem(draft);
  const finish = () => {
    setTried(true);
    if (!problem) onFinish();
  };
  const finishButton = (width: string) => (
    <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} ${width}`} onClick={finish} disabled={busy || draft.adcvdCases === null}>
      {busy ? (
        "Saving…"
      ) : (
        <>
          See results
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </>
      )}
    </button>
  );

  return (
    <div ref={root} className={`mx-auto grid w-full gap-10 ${SHOW_LIVE_PANEL ? "max-w-6xl lg:grid-cols-[1fr_24rem]" : "max-w-3xl"}`}>
      <div className="flex flex-col gap-8">
        <StepHeading
          eyebrow="Step 5 · AD/CVD"
          title="Any antidumping or countervailing duties?"
          lead={
            <>
              AD/CVD can add a lot on top of regular duty. These are the cases that may cover{" "}
              <span className={`${mono.className} text-base-content`}>{product.entry.element.htsno}</span> from {product.entry.country.name} and were in force on{" "}
              {formatDate(draft.entryDate)}. Scope is set by the product description, not the HTS code, so tell us which ones cover your goods.
            </>
          }
          size="md"
        />

        {draft.adcvdCases === null ? (
          <div className="flex flex-col gap-3" aria-live="polite">
            <div className={`${ui.skeleton} h-36 w-full rounded-xl`} />
            <span className="text-sm text-base-content/60">Checking the AD/CVD case list…</span>
          </div>
        ) : (
          <>
            {lookup === "error" && (
              <p className="m-0 rounded-lg bg-warning/10 px-4 py-3 text-sm text-base-content">
                Couldn&apos;t check the AD/CVD case list just now. You can still add a case below, or go on without one.
              </p>
            )}
            {!cases.length && lookup !== "error" && (
              <div className="tt-ob-rise flex items-center gap-4 rounded-xl bg-success/8 p-5 ring-1 ring-success/30" style={delay(200)}>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success text-success-content">
                  <CheckIcon className="h-6 w-6" aria-hidden />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-base-content">No AD/CVD cases found for this import on {formatDate(draft.entryDate)}.</span>
                  <span className="text-sm text-base-content/70">If your entry summary shows one, add it below so it&apos;s counted, and we&apos;ll check our case list.</span>
                </span>
              </div>
            )}
            {cases.map((c, i) => (
              <CaseCard
                key={c.key}
                c={c}
                flag={byKey.get(c.key)}
                onChange={(patch) => change(c.key, patch)}
                onRemove={c.source === "added" ? () => set({ adcvdCases: cases.filter((x) => x.key !== c.key) }) : undefined}
                wait={200 + i * 70}
                first={i === 0}
              />
            ))}
            <AddCase first={!cases.length} product={product} have={have} onAdd={(row) => set({ adcvdCases: [...cases, fromSearch(row)] })} />
          </>
        )}

        {SHOW_LIVE_PANEL ? (
          <div className="flex items-center pt-2">
            <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onBack}>
              <ArrowLeftIcon className="h-4 w-4" aria-hidden />
              Back
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pt-2">
            {tried && problem && <p className="m-0 text-right text-sm font-medium text-error">{problem}</p>}
            <div className="flex items-center justify-between gap-3">
              <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onBack}>
                <ArrowLeftIcon className="h-4 w-4" aria-hidden />
                Back
              </button>
              {finishButton("px-7")}
            </div>
            {/* <p className="m-0 text-right text-xs text-base-content/55">Saved to your audits. You can remove it any time.</p> */}
          </div>
        )}
      </div>

      {SHOW_LIVE_PANEL && (
        <LiveCheckPanel product={product} draft={draft}>
          {tried && problem && <p className="m-0 text-sm font-medium text-error">{problem}</p>}
          {finishButton("w-full")}
          {/* <p className="m-0 -mt-2 text-center text-xs text-base-content/55">Saved to your audits. You can remove it any time.</p> */}
        </LiveCheckPanel>
      )}
    </div>
  );
};
