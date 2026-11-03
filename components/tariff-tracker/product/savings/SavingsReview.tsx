"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, CheckIcon, ChevronDownIcon, GlobeAmericasIcon, ReceiptPercentIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatRate } from "../../formatRate";
import { SavingKind } from "../../insights/savings";
import { FlowPage } from "../../shell/FlowPage";
import { delay, HowTo, prefersReducedMotion, StepHeading } from "../../onboarding/parts";
import { useOpportunities } from "../../opportunities/OpportunitiesContext";
import { OpportunityStatus } from "../../opportunities/statuses";
import { TrackedProduct } from "../../report";
import { Ask, Compare } from "./OptionReview";
import { itemName, KIND_ORDER, ListItem, undecided, useSavingsItems } from "./useSavingsItems";

// The savings review, one question at a time (2026-11-02), like the entry audit, in Duty Guard's
// content area beside the sidebar (FlowPage, 2026-11-03):
// the import and what the review covers, then each trade program, each exemption and (longer term,
// and only if they want to look) each other country, put as one question about the goods to answer
// No or Yes. Each question sits at the top of the screen, and an answer moves straight on to the
// next while it's saved in the background (opportunities/), one save at a time per option, so the
// questions never wait on the network. Closing midway and opening again picks up at the next one
// still to answer. Then a summary: what they could save, what's
// ruled out, what's left, and what to do next. Securing a saving stays on the Savings tab. Savings
// are only ever potential.

export type ReviewStep = "intro" | SavingKind | "summary";

// Where the review opens: a step, at an option (id) or a position in its group (at)
export type ReviewStart = { step: ReviewStep; id?: string; at?: number };

const GROUPS: Record<SavingKind, { label: string; title: string; lead: string }> = {
  program: {
    label: "Trade Programs",
    title: "Trade programs",
    lead: "Same supplier, same country: a program your goods may already qualify for.",
  },
  exemption: {
    label: "Exemptions",
    title: "Exemptions",
    lead: "Each one turns on one fact about your goods. Answer Yes only if it's true of them.",
  },
  origin: {
    label: "Other Countries",
    title: "Other countries",
    lead: "Longer term: a new supplier, with the goods made there.",
  },
};

const Rail = ({ steps, step, done, onGo }: { steps: ReviewStep[]; step: ReviewStep; done: (s: ReviewStep) => boolean; onGo: (s: ReviewStep) => void }) => (
  <ol className="m-0 hidden list-none items-center gap-2 p-0 md:flex" aria-label="Review steps">
    {steps.map((s, i) => {
      const current = s === step;
      const ticked = !current && done(s);
      return (
        <li key={s} className="flex items-center gap-2">
          {i > 0 && <span className={`h-px w-6 ${ticked || current ? "bg-primary/50" : "bg-base-300"}`} aria-hidden />}
          <button
            type="button"
            disabled={current}
            onClick={() => onGo(s)}
            aria-current={current ? "step" : undefined}
            className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors enabled:hover:bg-base-300/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-default"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${ticked ? "bg-primary text-primary-content" : current ? "border-2 border-primary text-primary" : "border-2 border-base-300 text-base-content/40"
                }`}
              aria-hidden
            >
              {ticked ? <CheckIcon className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className={`whitespace-nowrap text-sm font-semibold ${current ? "text-base-content" : ticked ? "text-base-content/70" : "text-base-content/45"}`}>
              {s === "intro" ? "Your Import" : s === "summary" ? "Summary" : GROUPS[s].label}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

// What an option takes off the rate, in %
const ptsOf = (product: TrackedProduct, i: ListItem) =>
  i.option ? product.totalPct - i.option.ratePct : i.opportunity ? i.opportunity.rateBefore - i.opportunity.rateAfter : 0;

// ── The import, and what the review covers ──

const Intro = ({ product, items, onStart, onClose }: { product: TrackedProduct; items: ListItem[]; onStart: () => void; onClose: () => void }) => {
  const reviewable = items.filter((i) => i.option);
  const left = reviewable.filter(undecided).length;
  const started = left < reviewable.length;
  const best = Math.max(0, ...reviewable.map((i) => ptsOf(product, i)));
  const count = (kind: SavingKind) => reviewable.filter((i) => i.option!.kind === kind).length;

  if (!reviewable.length)
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <StepHeading
          eyebrow="Savings Review"
          title="Nothing to review on this import today."
          lead="No trade program, exemption or cheaper country of origin would lower the duty on it right now. We'll keep checking as tariffs change."
        />
        <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} self-start px-7`} onClick={onClose} autoFocus>
          Back to Savings
        </button>
      </div>
    );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <StepHeading
        eyebrow={`Savings Review ${left > 0 ? `· ${left} still to answer` : ``}`}
        title={started ? "Pick up where you left off." : "Find every way to pay less on this import."}
        lead="One question at a time about your goods, each with the rule it turns on. Answer Yes to pursue it, No to rule it out. At the end you get a summary of what you could save and what to do next."
      />
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="tt-ob-rise flex flex-col gap-5 rounded-2xl bg-(--tt-ob-tile) p-6 ring-1 ring-(--tt-ob-tile-edge)" style={delay(160)} aria-label="Your import">
          <div className="flex flex-col gap-1">
            <span className={tt.eyebrow()}>Your import</span>
            <span className="text-base text-base-content">
              <span className={`${mono.className} font-semibold`}>{product.entry.element.htsno}</span> · {product.entry.country.flag} {product.entry.country.name}
            </span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <span className="flex flex-col">
              <span className="text-xs text-base-content/60">Duty rate today</span>
              <span className={tt.metric}>{formatRate(product.totalPct)}</span>
            </span>
            {best > 0.005 && (
              <span className="flex flex-col items-end">
                <span className="text-xs text-base-content/60">Could come off, up to</span>
                <span className={`${tt.metric} !text-success`}>−{formatRate(best)}</span>
              </span>
            )}
          </div>
          <ul className="m-0 flex list-none flex-col gap-2 border-t border-base-300 p-0 pt-4">
            {KIND_ORDER.filter(count).map((kind) => (
              <li key={kind} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-base-content/80">
                  {kind === "origin" ? <GlobeAmericasIcon className="h-4 w-4 text-primary" aria-hidden /> : <ReceiptPercentIcon className="h-4 w-4 text-success" aria-hidden />}
                  {GROUPS[kind].label}
                  {kind === "origin" && <span className={tt.chip("neutral")}>Longer term</span>}
                </span>
                <span className="font-semibold tabular-nums text-base-content">
                  {count(kind)} to check
                </span>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col justify-center gap-6">
          <HowTo
            start={220}
            steps={[
              "Read the question and the rule under it. Have your supplier's details to hand if it helps.",
              "Answer Yes to pursue it, or No to rule it out. Not sure? Skip it and come back.",
              "Other countries are optional: look at them only if you'd consider a new supplier.",
              "See what you could save, and the next step for each saving you pursue.",
            ]}
          />
        </div>
      </div>
      <div className="tt-ob-rise flex justify-end" style={delay(320)}>
        <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} px-8`} onClick={onStart} autoFocus>
          {started ? "Continue Review" : "Start Review"}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
};

// ── Other countries: only if they'd consider it ──

const SourcingGate = ({ count, onLook, onRuleOut, onSkip }: { count: number; onLook: () => void; onRuleOut: () => void; onSkip: () => void }) => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
    <StepHeading
      eyebrow="Other Countries · Longer term"
      title="Would you consider sourcing it somewhere else?"
      lead={`${count} ${count === 1 ? "country makes" : "countries make"} it for a lower rate. Moving takes a new supplier and time, so it's its own decision: it doesn't hold your review back.`}
    />
    <div className="tt-ob-rise flex flex-col gap-3" style={delay(200)}>
      <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} justify-between px-6`} onClick={onLook} autoFocus>
        Yes, show me the countries
      </button>
      <button type="button" className={`${ui.button({ variant: "secondary", size: "lg" })} justify-between px-6`} onClick={onRuleOut}>
        No, we&apos;re not looking to change suppliers
      </button>
      <button type="button" className={`${ui.button({ variant: "ghost", size: "lg" })} justify-between px-6`} onClick={onSkip}>
        Skip for now
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  </div>
);

// ── One option ──

const ANSWERED: Partial<Record<OpportunityStatus, { text: string; tone: "success" | "error" | "primary" }>> = {
  researching: { text: "You answered Yes: you're pursuing this one.", tone: "success" },
  in_progress: { text: "You're pursuing this one: paperwork under way.", tone: "success" },
  not_eligible: { text: "You answered No: it's ruled out.", tone: "error" },
};

const Question = ({
  product,
  item,
  at,
  of,
  kind,
  imports,
  shipmentsPerYear,
  status,
  onAnswer,
  onBack,
  onSkip,
}: {
  product: TrackedProduct;
  item: ListItem;
  at: number;
  of: number;
  kind: SavingKind;
  imports: Parameters<typeof Compare>[0]["imports"];
  shipmentsPerYear: number;
  // Its answer, as given here (saved in the background) or as it stands
  status?: OpportunityStatus;
  onAnswer: (to: OpportunityStatus) => void;
  onBack: () => void;
  onSkip: () => void;
}) => {
  const option = item.option!;
  const answered = status ? ANSWERED[status] : undefined;
  return (
    <div className="tt-ob-fade mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4" aria-hidden />
          Back
        </button>
        <span className="flex items-center gap-3 text-sm text-base-content/60">
          <span className="font-semibold text-base-content">{GROUPS[kind].label}</span>
          <span className="tabular-nums">
            {at + 1} of {of}
          </span>
          <span className="hidden gap-1 sm:flex" aria-hidden>
            {Array.from({ length: of }, (_, i) => (
              <span key={i} className={`h-1.5 w-5 rounded-full ${i < at ? "bg-primary/60" : i === at ? "bg-primary" : "bg-base-300"}`} />
            ))}
          </span>
        </span>
        <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={onSkip}>
          {answered ? "Next" : "Skip"}
          <ArrowRightIcon className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {answered && (
        <p className={`${ui.notice(answered.tone)} m-0 text-sm`}>
          {answered.tone === "error" ? <XMarkIcon className="h-4 w-4 shrink-0 text-error" aria-hidden /> : <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />}
          {answered.text} Answer again to change it.
        </p>
      )}
      <h1 id="tt-onboarding-title" tabIndex={-1} className="sr-only">
        {GROUPS[kind].title}, {at + 1} of {of}: {itemName(item)}
      </h1>
      <Ask
        option={option}
        product={product}
        measure="pct"
        shipmentsPerYear={shipmentsPerYear}
        imports={imports}
        busy={false}
        onYes={() => onAnswer("researching")}
        onNo={() => onAnswer("not_eligible")}
      >
        <Compare product={product} option={option} imports={imports} measure="pct" center />
      </Ask>
    </div>
  );
};

// ── The summary ──

// Worked through on screen, and done once the answers are all saved too
const Checking = ({ saved, onDone }: { saved: Promise<unknown>; onDone: () => void }) => {
  const steps = ["Going through your answers", "Working out what you could save", "Putting your next steps together"];
  const [ticked, setTicked] = useState(0);
  useEffect(() => {
    let live = true;
    const shown = prefersReducedMotion() ? Promise.resolve() : new Promise((done) => setTimeout(done, 320 + steps.length * 380 + 300));
    const timers = prefersReducedMotion() ? [] : steps.map((_, i) => setTimeout(() => setTicked(i + 1), 320 + i * 380));
    Promise.all([shown, saved]).then(() => live && onDone());
    return () => {
      live = false;
      timers.forEach(clearTimeout);
    };
  }, []);
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 text-center" aria-live="polite">
      <span className="relative flex h-16 w-16 items-center justify-center">
        <span className="tt-ob-ping absolute inset-0 rounded-full bg-success/25" aria-hidden />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-success text-success-content">
          <ReceiptPercentIcon className="h-7 w-7" aria-hidden />
        </span>
      </span>
      <h1 id="tt-onboarding-title" tabIndex={-1} className={`${tt.display} m-0 text-[2rem] font-semibold tracking-tight outline-hidden`}>
        Summing up your review…
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

// A saving in the summary: its name, the rate before and after, and what comes off
const SummaryRow = ({ product, item }: { product: TrackedProduct; item: ListItem }) => {
  const off = ptsOf(product, item);
  const after = item.option?.ratePct ?? item.opportunity?.rateAfter ?? product.totalPct;
  return (
    <li className="flex items-center justify-between gap-3 py-3 text-sm">
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/10 text-success" aria-hidden>
          {item.option?.kind === "origin" ? item.option.setup.country.flag : <ReceiptPercentIcon className="h-4 w-4" />}
        </span>
        <span className="truncate font-medium text-base-content">{itemName(item)}</span>
      </span>
      <span className="flex shrink-0 items-baseline gap-3 tabular-nums">
        <span className="text-base-content/55">
          {formatRate(product.totalPct)} → {formatRate(after)}
        </span>
        <span className="w-16 text-right font-semibold text-success">−{formatRate(off)}</span>
      </span>
    </li>
  );
};

export const Summary = ({
  product,
  items,
  statusOf,
  animate,
  saved,
  onAnimated,
  onClose,
  onAnswerLeft,
  onChange,
}: {
  product: TrackedProduct;
  items: ListItem[];
  // Each option's answer, as given in the review (saved in the background) or as it stands
  statusOf: (i: ListItem) => OpportunityStatus | undefined;
  // The review has just been finished: work through it on screen first, once
  animate: boolean;
  // The answers still being saved, for that to wait on
  saved: Promise<unknown>;
  onAnimated: () => void;
  onClose: () => void;
  onAnswerLeft: () => void;
  onChange: () => void;
}) => {
  const [revealed, setRevealed] = useState(!animate);
  useEffect(() => {
    if (revealed) document.getElementById("tt-onboarding-title")?.focus({ preventScroll: true });
  }, [revealed]);
  if (!revealed)
    return (
      <Checking
        saved={saved}
        onDone={() => {
          setRevealed(true);
          onAnimated();
        }}
      />
    );

  const byOff = (a: ListItem, b: ListItem) => ptsOf(product, b) - ptsOf(product, a);
  const reviewable = items.filter((i) => i.option);
  const secured = items.filter((i) => statusOf(i) === "secured");
  const pursuing = items.filter((i) => statusOf(i) === "researching" || statusOf(i) === "in_progress").sort(byOff);
  const ruledOut = items.filter((i) => statusOf(i) === "not_eligible");
  const left = reviewable.filter((i) => statusOf(i) === undefined || statusOf(i) === "found");
  const quickLeft = left.filter((i) => i.option!.kind !== "origin").length;
  const best = pursuing.length ? ptsOf(product, pursuing[0]) : 0;
  const saving = best > 0.005;
  const ruledOutBy = KIND_ORDER.map((kind) => ({ kind, names: ruledOut.filter((i) => (i.option?.kind ?? i.opportunity?.kind) === kind).map(itemName) })).filter(
    (g) => g.names.length
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className={`tt-ob-pop flex h-12 w-12 items-center justify-center rounded-full ${saving ? "bg-success/15 text-success" : "bg-primary/10 text-primary"}`} aria-hidden>
          {saving ? <ReceiptPercentIcon className="h-6 w-6" /> : <CheckIcon className="h-6 w-6" />}
        </span>
        <span className={`${tt.eyebrow(quickLeft ? "warning" : "success")} tt-ob-rise`} style={delay(80)}>
          {quickLeft ? `${quickLeft} still to answer` : "Review complete"}
        </span>
        <h1 id="tt-onboarding-title" tabIndex={-1} className={`${tt.display} tt-ob-rise m-0 text-[2.25rem] font-semibold leading-tight tracking-tight outline-hidden`} style={delay(140)}>
          {saving ? (
            <>
              You could take up to <span className="text-success">−{formatRate(best)}</span> off
            </>
          ) : secured.length ? (
            "Your savings are secured"
          ) : (
            "Nothing to pursue right now"
          )}
        </h1>
        <p className="tt-ob-rise m-0 max-w-xl text-base text-base-content/70" style={delay(200)}>
          {saving
            ? "The duty rate on this import, if your goods qualify. Next, confirm each one with your supplier or broker."
            : "We'll keep checking as tariffs change, and tell you if a new way to save opens up."}
        </p>
      </header>

      <section className={`${tt.panel} tt-ob-rise flex flex-col`} style={delay(280)} aria-label="Your review">
        {/* The rate today, with the best saving, and how much is answered */}
        <dl className="m-0 grid grid-cols-3 divide-x divide-base-300 border-b border-base-300">
          {[
            { label: "Duty rate today", value: formatRate(product.totalPct), tone: "" },
            { label: saving ? "If you qualify" : "With your answers", value: formatRate(product.totalPct - best), tone: saving ? "!text-success" : "" },
            { label: "Answered", value: `${reviewable.length - left.length} of ${reviewable.length}`, tone: "" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-1 px-5 py-4">
              <dt className="text-xs text-base-content/60">{s.label}</dt>
              <dd className={`m-0 ${tt.metricSm} ${s.tone}`}>{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-col px-5 py-2">
          {pursuing.length + secured.length > 0 ? (
            <>
              <h2 className={`${tt.eyebrow("success")} m-0 pt-3`}>Pursuing</h2>
              <ul className="m-0 flex list-none flex-col divide-y divide-base-300 p-0">
                {[...secured, ...pursuing].map((i) => (
                  <SummaryRow key={i.id} product={product} item={i} />
                ))}
              </ul>
            </>
          ) : (
            <p className="m-0 py-3 text-sm text-base-content/60">You didn&apos;t answer Yes to any option.</p>
          )}
        </div>

        {ruledOut.length > 0 && (
          <details className="group border-t border-base-300 px-5 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm">
              <span className="text-base-content/70">
                <span className="font-semibold text-base-content">{ruledOut.length}</span> ruled out
              </span>
              <ChevronDownIcon className="h-4 w-4 text-base-content/50 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <dl className="m-0 mt-3 flex flex-col gap-2">
              {ruledOutBy.map((g) => (
                <div key={g.kind} className="grid gap-1 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
                  <dt className="text-base-content/55">{GROUPS[g.kind].label}</dt>
                  <dd className="m-0 text-base-content/80">{g.names.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}

        {left.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-base-300 px-5 py-3 text-sm">
            <span className="text-base-content/70">
              <span className="font-semibold text-base-content">{left.length}</span> not answered
              {left.length > quickLeft ? ` (${left.length - quickLeft} other ${left.length - quickLeft === 1 ? "country" : "countries"})` : ""}
            </span>
            <button type="button" className={`${ui.link} font-semibold`} onClick={onAnswerLeft}>
              Answer Them
            </button>
          </div>
        )}
      </section>

      <div className="tt-ob-rise flex items-center justify-center gap-3" style={delay(380)}>
        <button type="button" className={`${ui.button({ variant: "primary", size: "lg" })} px-8`} onClick={onClose} autoFocus>
          Back to Savings
        </button>
        <button type="button" className={ui.button({ variant: "ghost", size: "lg" })} onClick={onChange}>
          Change Answers
        </button>
      </div>
    </div>
  );
};

// ── The review ──

export const SavingsReview = ({ product, start, onClose }: { product: TrackedProduct; start?: ReviewStart; onClose: () => void }) => {
  const { items, imports, shipmentsPerYear, loading } = useSavingsItems(product);
  const { track, setStatus } = useOpportunities();
  const group = (kind: SavingKind) => items.filter((i) => i.option?.kind === kind);
  const kinds = KIND_ORDER.filter((k) => group(k).length > 0);
  const steps: ReviewStep[] = ["intro", ...kinds, "summary"];

  const [step, setStep] = useState<ReviewStep>(start?.step ?? "intro");
  const [index, setIndex] = useState(() =>
    start?.id && start.step !== "intro" && start.step !== "summary" ? Math.max(0, group(start.step).findIndex((i) => i.id === start.id)) : (start?.at ?? 0)
  );
  // Other countries open on the question of whether to look at all, unless opened on one of them
  const [gate, setGate] = useState(!start?.id && start?.at === undefined);
  const scroller = useRef<HTMLDivElement>(null);
  // Answers given here, ahead of their saves: the review moves on at once and goes by these
  const [answers, setAnswers] = useState<Map<string, OpportunityStatus>>(() => new Map());
  const statusOf = (i: ListItem) => answers.get(i.id) ?? i.opportunity?.status;
  const open = (i: ListItem) => !!i.option && (statusOf(i) === undefined || statusOf(i) === "found");
  // The latest items, for a save that waits its turn behind another on the same option
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  }, [items]);
  // Saves, one at a time per option (a second answer waits for the first to be tracked), and all of
  // them, for the summary to wait on
  const queue = useRef(new Map<string, Promise<void>>());
  const [saved, setSaved] = useState<Promise<unknown>>(Promise.resolve());
  // The summary works through the review on screen once: when it's first finished here (every
  // trade program and exemption answered, review.ts). Opened on a finished review, it doesn't.
  const quickDone = () => items.filter((i) => i.option && i.option.kind !== "origin").every((i) => !open(i));
  const [animated, setAnimated] = useState(() => !loading && quickDone());

  // A group, from its first option still to answer (or its first) unless told where
  const goGroup = (kind: SavingKind, at?: number) => {
    const list = group(kind);
    setStep(kind);
    setIndex(at ?? Math.max(0, list.findIndex(open)));
    setGate(kind === "origin" && at === undefined);
  };
  // On from a group: the next group with something to answer, or the summary
  const after = (kind: SavingKind | "intro") => {
    const rest = kinds.slice(kind === "intro" ? 0 : kinds.indexOf(kind) + 1);
    const next = rest.find((k) => group(k).some(open));
    if (next) goGroup(next);
    else setStep("summary");
  };
  const go = (s: ReviewStep) => (s === "intro" || s === "summary" ? setStep(s) : goGroup(s));

  // Within a group: the next one still to answer after this one, else on to the next group
  const forward = (kind: SavingKind, from: number, skipAnswered: boolean) => {
    const list = group(kind);
    const nextAt = list.findIndex((i, n) => n > from && (!skipAnswered || open(i)));
    if (nextAt >= 0) setIndex(nextAt);
    else after(kind);
  };
  const back = (kind: SavingKind) => {
    if (index > 0) return setIndex(index - 1);
    const prev = kinds[kinds.indexOf(kind) - 1];
    if (prev) {
      setStep(prev);
      setIndex(group(prev).length - 1);
    } else setStep("intro");
  };

  // Saves an answer behind the review: after any save already going on this option, against the
  // option as it is by then
  const save = (id: string, to: OpportunityStatus, note: string | null = null) => {
    const run = async () => {
      const item = latest.current.find((i) => i.id === id);
      if (!item?.option && !item?.opportunity) return;
      const status = item.opportunity?.status;
      // A Yes on one already being pursued leaves it where it's got to
      if (status === to || (to === "researching" && (status === "in_progress" || status === "secured"))) return;
      const ok = item.opportunity ? await setStatus(item.opportunity, to, note) : !!(await track(product.key, item.option!, to, product.totalPct, note));
      if (ok) return;
      toast.error(`Couldn't save your answer on ${itemName(item)}. Please answer it again.`);
      setAnswers((a) => {
        const next = new Map(a);
        next.delete(id);
        return next;
      });
    };
    const done = (queue.current.get(id) ?? Promise.resolve()).then(run);
    queue.current.set(id, done);
    setSaved(Promise.all(Array.from(queue.current.values())));
  };

  // A first answer moves on to the next question; changing one stays on it
  const answer = (kind: SavingKind, item: ListItem, to: OpportunityStatus) => {
    const first = open(item);
    setAnswers((a) => new Map(a).set(item.id, to));
    save(item.id, to);
    if (first) forward(kind, index, true);
  };

  const ruleOutCountries = () => {
    const reason = "We're not looking to change suppliers";
    const left = group("origin").filter(open);
    setAnswers((a) => {
      const next = new Map(a);
      left.forEach((i) => next.set(i.id, "not_eligible"));
      return next;
    });
    left.forEach((i) => save(i.id, "not_eligible", reason));
    setStep("summary");
  };

  // Each step starts at the top, its title focused for screen readers
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
    const timer = setTimeout(() => document.getElementById("tt-onboarding-title")?.focus({ preventScroll: true }), 50);
    return () => clearTimeout(timer);
  }, [step, index, gate]);

  const body = (() => {
    if (loading) return <div className={`${ui.skeleton} mx-auto h-72 w-full max-w-4xl`} aria-busy="true" />;
    if (step === "intro") return <Intro product={product} items={items} onStart={() => after("intro")} onClose={onClose} />;
    if (step === "summary")
      return (
        <Summary
          product={product}
          items={items}
          statusOf={statusOf}
          animate={!animated && quickDone()}
          saved={saved}
          onAnimated={() => setAnimated(true)}
          onClose={onClose}
          onAnswerLeft={() => {
            const k = kinds.find((x) => group(x).some(open));
            if (k) goGroup(k, k === "origin" ? group(k).findIndex(open) : undefined);
          }}
          onChange={() => kinds[0] && goGroup(kinds[0], 0)}
        />
      );
    const list = group(step);
    if (step === "origin" && gate)
      return (
        <SourcingGate
          count={list.length}
          onLook={() => setGate(false)}
          onRuleOut={ruleOutCountries}
          onSkip={() => setStep("summary")}
        />
      );
    const item = list[Math.min(index, list.length - 1)];
    if (!item) return null;
    return (
      <Question
        key={item.id}
        product={product}
        item={item}
        at={index}
        of={list.length}
        kind={step}
        imports={imports ?? null}
        shipmentsPerYear={shipmentsPerYear}
        status={statusOf(item)}
        onAnswer={(to) => answer(step, item, to)}
        onBack={() => back(step)}
        onSkip={() => forward(step, index, false)}
      />
    );
  })();

  return (
    <FlowPage
      label="Savings Review"
      context={`${product.entry.element.htsno} · ${product.entry.country.flag} ${product.entry.country.name}`}
      back="Back to Savings"
      onClose={onClose}
      scroller={scroller}
      progress={items.some((i) => i.option) ? { at: steps.indexOf(step) + 1, of: steps.length } : undefined}
      rail={
        items.some((i) => i.option) ? (
          <Rail
            steps={steps}
            step={step}
            done={(s) => (s === "intro" ? true : s === "summary" ? false : !group(s).some(open))}
            onGo={go}
          />
        ) : undefined
      }
    >
      {/* Questions and the summary sit at the top, so moving between them never shifts the
          page; the intro is centred */}
      <div
        key={`${step}-${step === "origin" && gate ? "gate" : ""}`}
        className={`flex flex-1 flex-col ${step === "intro" || loading ? "justify-center" : "justify-start"}`}
      >
        {body}
      </div>
    </FlowPage>
  );
};
