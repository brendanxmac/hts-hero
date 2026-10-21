"use client";

import { ReactNode } from "react";
import {
  ArrowRightIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
  GlobeAmericasIcon,
  MagnifyingGlassCircleIcon,
  ReceiptPercentIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SAVINGS_AUDITS_LABEL } from "@/libs/tariff-tracker/features";
import { useTrackerAccess } from "../access/accessContext";
import { useInsights } from "../insights/InsightsContext";
import { wholeDollars } from "../insights/teasers";
import { useTracker } from "../TrackerContext";
import { useTrackerNav } from "./TrackerNav";

// Savings and Audits before they launch (DESIGN_SYSTEM.md §15 "Coming soon"): a page that sells
// what's coming, not a placeholder. A hero card (what it does, in one promise, with the launch
// label and the one action: sign up to have it on day one, or turn on alerts meanwhile), what it
// would mean for the user's own imports in numbers where we have them, how it works in three steps,
// what it checks, an example finding (marked as an example), and who does what (we find, flag and
// explain; the broker decides and files). Every saving is potential: "could", "up to", "may".
// productKey: on one import's tab, the numbers are that import's.

type Kind = "savings" | "audits";

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

const ICON = "h-5 w-5";
const COLS: Record<number, string> = { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3" };

const CONTENT: Record<
  Kind,
  {
    icon: ReactNode;
    eyebrow: string;
    title: string;
    promise: string;
    steps: { title: string; body: string }[];
    features: Feature[];
    exampleTitle: string;
    broker: string;
  }
> = {
  savings: {
    icon: <ReceiptPercentIcon className="h-6 w-6" />,
    eyebrow: "Automatic savings detection",
    title: "Every Way You Could Pay Less Duty, Found for You",
    promise:
      "We'll check every import against every trade program, exemption and country of origin, work out what each could take off the duty on your own shipments, and tell you exactly what it would take to qualify.",
    steps: [
      { title: "We check every import", body: "Each one, against every trade program, Chapter 99 exclusion and exemption, and every country that ships it to the US." },
      { title: "We rank what could save the most", body: "Each option worked out on your own shipment: the duty today, the duty with it, and the difference, biggest first." },
      { title: "You see what it takes", body: "What your goods would need to qualify, the documents involved, and the questions to take to your broker or supplier." },
    ],
    features: [
      { icon: <TagIcon className={ICON} />, title: "Trade programs", body: "USMCA, free trade agreements and preference programs your goods may qualify for from the countries they already come from." },
      { icon: <DocumentTextIcon className={ICON} />, title: "Exclusions and exemptions", body: "Section 301 product exclusions, Section 232 content exemptions and other Chapter 99 provisions that could lower or remove a tariff." },
      { icon: <GlobeAmericasIcon className={ICON} />, title: "Cheaper countries of origin", body: "Countries that already ship each product to the US at a lower rate, with how much they ship, from Census trade data." },
      { icon: <ScaleIcon className={ICON} />, title: "Questions that change the rate", body: "The details about your goods (what they're made of, where they were melted or assembled) that decide which tariffs apply." },
      { icon: <SparklesIcon className={ICON} />, title: "New chances as rules change", body: "When a new exclusion or program lands, we check it against your imports and tell you if it could apply." },
      { icon: <CheckBadgeIcon className={ICON} />, title: "Track what you act on", body: "Mark each option as checking, secured or ruled out, so your list stays a to-do list, not a pile of maybes." },
    ],
    exampleTitle: "A Finding, as You'd See It",
    broker:
      "We find the options, work out what each could save and explain what it takes. You and your broker decide whether your goods qualify, and your broker claims it on your entries.",
  },
  audits: {
    icon: <ClipboardDocumentCheckIcon className="h-6 w-6" />,
    eyebrow: "Automatic entry auditing",
    title: "Every Entry Checked Against the Rate That Applied That Day",
    promise:
      "Upload your entry summaries and we'll check every line against the tariffs in force on its entry date, flag where you may have overpaid or underpaid, and give you a clear report to take to your broker, with the deadlines that matter.",
    steps: [
      { title: "Upload your entry summaries", body: "Drop in your CBP Form 7501s or an ACE report. We read every entry, line by line." },
      { title: "We check every line", body: "Each line against the duty in force on its entry date: base rate, every Chapter 99 tariff, exclusions in effect that day, and fees." },
      { title: "You get a clear report", body: "Potential overpayments and underpayments, why each one looks off, and the dates to raise it with your broker by." },
    ],
    features: [
      { icon: <DocumentArrowUpIcon className={ICON} />, title: "Reads your 7501s", body: "Entry numbers, dates, lines, HTS codes, values and the duty paid, read from the forms you already have." },
      { icon: <CalendarDaysIcon className={ICON} />, title: "The rate on the day", body: "Tariffs change often. We use the exact rates in force on each entry date, not today's." },
      { icon: <MagnifyingGlassCircleIcon className={ICON} />, title: "Missed exclusions", body: "Lines that paid a tariff an exclusion or exemption in force that day may have removed." },
      { icon: <ShieldCheckIcon className={ICON} />, title: "Underpayments too", body: "Lines that look underpaid, so you can fix them with your broker before CBP finds them." },
      { icon: <CalendarDaysIcon className={ICON} />, title: "Deadlines in view", body: "When each entry liquidates, and the windows to correct it, so nothing worth raising runs out." },
      { icon: <DocumentTextIcon className={ICON} />, title: "A report for your broker", body: "Every flagged line with the rate paid, the rate we found and why, ready to share." },
    ],
    exampleTitle: "A Flagged Entry, as You'd See It",
    broker:
      "We flag lines that look off and explain why, on the HTS code as entered. Your broker reviews them and decides whether to file a correction. We never file anything for you.",
  },
};

// An example finding: clearly marked, with made-up numbers on a real kind of case
const Example = ({ kind }: { kind: Kind }) =>
  kind === "savings" ? (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={`${mono.className} text-sm font-semibold text-base-content`}>7326.90.86.88 · China</span>
          <span className={tt.caption}>Other articles of iron or steel</span>
        </div>
        <span className={tt.chip("success")}>Could save up to $2,500 per shipment</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Today", "77.9%", "text-base-content"],
          ["With the exclusion", "52.9%", "text-success"],
          ["Difference", "−25%", "text-success"],
        ].map(([k, v, c]) => (
          <div key={k} className={`${tt.tile} flex flex-col gap-0.5 px-4 py-3`}>
            <span className={tt.caption}>{k}</span>
            <span className={`${tt.metricSm} ${c}`}>{v}</span>
          </div>
        ))}
      </div>
      <dl className="m-0 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
        <dt className={tt.caption}>Option</dt>
        <dd className="m-0 text-base-content">Section 301 product exclusion (9903.88.69)</dd>
        <dt className={tt.caption}>It would need</dt>
        <dd className="m-0 text-base-content/80">Your goods to match the exclusion&apos;s written product description</dd>
        <dt className={tt.caption}>Next step</dt>
        <dd className="m-0 text-base-content/80">Compare your spec sheet with the description, then ask your broker to claim it</dd>
      </dl>
    </div>
  ) : (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={`${mono.className} text-sm font-semibold text-base-content`}>Entry 123-4567890-1 · Line 3</span>
          <span className={tt.caption}>Entered Mar 3, 2026 · 8481.80.90.50 · China · $40,000</span>
        </div>
        <span className={tt.chip("success")}>Potential overpayment up to $3,000</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Duty paid", "32.5%", "text-base-content"],
          ["Rate in force that day", "25%", "text-success"],
          ["Difference", "−7.5%", "text-success"],
        ].map(([k, v, c]) => (
          <div key={k} className={`${tt.tile} flex flex-col gap-0.5 px-4 py-3`}>
            <span className={tt.caption}>{k}</span>
            <span className={`${tt.metricSm} ${c}`}>{v}</span>
          </div>
        ))}
      </div>
      <dl className="m-0 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[9rem_minmax(0,1fr)]">
        <dt className={tt.caption}>Why it&apos;s flagged</dt>
        <dd className="m-0 text-base-content/80">A tariff was paid at a rate that had already been lowered by its entry date</dd>
        <dt className={tt.caption}>Deadline</dt>
        <dd className="m-0 text-base-content/80">Liquidates around Jan 11, 2027: raise it with your broker before then</dd>
        <dt className={tt.caption}>Next step</dt>
        <dd className="m-0 text-base-content/80">Share the report with your broker, who decides whether to correct the entry</dd>
      </dl>
    </div>
  );

// What it would mean for the user's own imports, in numbers we already have
const useNumbers = (kind: Kind, productKey?: string) => {
  const insights = useInsights();
  const { items } = useTracker();
  const scope = productKey ? insights.products.filter((p) => p.key === productKey) : insights.products;
  const imports = productKey ? 1 : items.length;
  const out: { value: string; label: string }[] = [];
  if (!imports) return out;
  if (kind === "savings") {
    const best = scope.map((p) => insights.lockedBest.get(p.key) ?? Math.max(0, ...(insights.savings.get(p.key) ?? []).map((s) => s.usd)));
    const found = best.filter((usd) => usd > 0.5);
    if (found.length) {
      out.push({ value: `Up to ${wholeDollars(Math.max(...found))}`, label: productKey ? "it could save per shipment, from the best option we've spotted" : "the most one import could save per shipment, from what we've spotted so far" });
      if (!productKey) out.push({ value: `${found.length} of ${imports}`, label: "of your imports have at least one option worth checking" });
    }
    out.push({ value: productKey ? "1 import" : `${imports} ${imports === 1 ? "import" : "imports"}`, label: "checked automatically against every program, exemption and origin, the day it launches" });
  } else {
    const changes = insights.changes.filter((c) => !productKey || c.product.key === productKey);
    const hit = new Set(changes.map((c) => c.product.key)).size;
    if (changes.length) {
      out.push({ value: `${changes.length}`, label: `tariff ${changes.length === 1 ? "change" : "changes"} hit ${productKey ? "this import" : `${hit} of your imports`} in the last 12 months` });
      out.push(
        productKey
          ? { value: `${changes.length + 1}`, label: "different rates it was charged at in 12 months, depending on the entry date" }
          : { value: `${hit} of ${imports}`, label: "of your imports changed rate in 12 months: their entries are the ones most worth checking" },
      );
    }
    out.push({ value: productKey ? "Every entry" : `${imports} ${imports === 1 ? "import" : "imports"}`, label: "audited automatically, every entry of each, the day it launches" });
  }
  return out.slice(0, 3);
};

export const ComingSoon = ({ kind, productKey }: { kind: Kind; productKey?: string }) => {
  const c = CONTENT[kind];
  const { signedIn, unlock, unlockLabel, loading } = useTrackerAccess();
  const { openTab } = useTrackerNav();
  const numbers = useNumbers(kind, productKey);

  return (
    <div className="flex flex-col gap-module">
      {/* The promise */}
      <section className={`${tt.panel} relative overflow-hidden`} aria-labelledby={`tt-soon-${kind}`}>
        {/* A soft wash of the brand color behind the top, so the page reads as an event, not a notice */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary/10 to-transparent" aria-hidden />
        <div className="relative flex flex-col gap-5 px-6 py-7 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-content" aria-hidden>
              {c.icon}
            </span>
            <span className={tt.eyebrow("primary")}>{c.eyebrow}</span>
            <span className={tt.chip("primary")}>{SAVINGS_AUDITS_LABEL}</span>
            <span className={tt.chip()}>Included in every Tracker plan</span>
          </div>
          <div className="flex max-w-3xl flex-col gap-3">
            <h2 id={`tt-soon-${kind}`} className={`${tt.display} m-0 text-3xl font-semibold leading-tight tracking-tight text-base-content`}>
              {c.title}
            </h2>
            <p className="m-0 text-base leading-relaxed text-base-content/75">{c.promise}</p>
          </div>
          {!loading && (
            <div className="flex flex-wrap items-center gap-3">
              {signedIn ? (
                <>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckBadgeIcon className="h-5 w-5" aria-hidden />
                    You&apos;re set: it switches on for your imports the day it launches
                  </span>
                  <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openTab("alerts")}>
                    <BellAlertIcon className="h-4 w-4" aria-hidden />
                    Meanwhile, check your alerts
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className={ui.button({ variant: "primary" })} onClick={() => unlock("tracking")}>
                    {unlockLabel}
                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                  </button>
                  <span className="text-sm text-base-content/70">Free, and it runs on your imports from day one.</span>
                </>
              )}
            </div>
          )}
        </div>
        {/* What it would mean for these imports */}
        {numbers.length > 0 && (
          <div className={`relative grid divide-y divide-base-300 border-t border-base-300 sm:divide-x sm:divide-y-0 ${COLS[numbers.length]}`}>
            {numbers.map((n) => (
              <div key={n.label} className="flex flex-col gap-1 px-6 py-5 sm:px-8">
                <span className={`${tt.metric} text-primary`}>{n.value}</span>
                <span className={tt.caption}>{n.label}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works: a real sequence, so it's numbered */}
      <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`} aria-labelledby={`tt-soon-how-${kind}`}>
        <h3 id={`tt-soon-how-${kind}`} className={`${tt.moduleTitle} m-0`}>
          How It Will Work
        </h3>
        <ol className="m-0 grid list-none gap-6 p-0 md:grid-cols-3">
          {c.steps.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-2">
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-content">{i + 1}</span>
                {i < c.steps.length - 1 && <span className="hidden h-px flex-1 bg-base-300 md:block" aria-hidden />}
              </span>
              <span className={tt.sectionTitle}>{s.title}</span>
              <span className={tt.body}>{s.body}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* What it checks, and an example of what it finds */}
      <div className="grid gap-module xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`} aria-labelledby={`tt-soon-what-${kind}`}>
          <h3 id={`tt-soon-what-${kind}`} className={`${tt.moduleTitle} m-0`}>
            What It Will Check
          </h3>
          <ul className="m-0 grid list-none gap-x-6 gap-y-5 p-0 sm:grid-cols-2">
            {c.features.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                  {f.icon}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className={tt.sectionTitle}>{f.title}</span>
                  <span className={tt.body}>{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`} aria-labelledby={`tt-soon-example-${kind}`}>
          <div className="flex items-center justify-between gap-3">
            <h3 id={`tt-soon-example-${kind}`} className={`${tt.moduleTitle} m-0`}>
              {c.exampleTitle}
            </h3>
            <span className={tt.chip()}>Example</span>
          </div>
          <Example kind={kind} />
          <p className={`${tt.caption} m-0 mt-auto border-t border-base-300 pt-4`}>{c.broker}</p>
        </section>
      </div>
    </div>
  );
};
