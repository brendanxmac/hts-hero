"use client";

import { ReactNode, useState } from "react";
import {
  AdjustmentsHorizontalIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import { useCardClass } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { CalculationResult } from "@/tariffs/engine-v2/types";
import { formatMoney, formatPct } from "../lib/format";
import { summarySections } from "../lib/summary";
import { TariffFinder } from "../lib/useTariffFinder";
import { useCanSeeWhy } from "./WhyGate";

// The duty breakdown explained in plain English (summarySections), shown on request from the
// results' header (ExplainToggle, "Summarize") above the totals: what's owed in one sentence, what you pay line
// by line beside it, then every other section (exemptions at work, the user's adjustments, what
// was ruled out, what could change it) as a card of its own, each with a few items and the rest
// on request. It all takes a free account (the "why" is the product's edge), and isn't rendered
// for anyone signed out: "Summarize", in the results' header, opens the pitch instead.

const pct = (n: number) => formatPct(Math.round(n * 100) / 100);

// Items a section card shows before "+N more"
const SHOWN = 3;

const SECTION_STYLES: Record<string, { icon: ReactNode; tone: string }> = {
  "What you pay": { icon: <BanknotesIcon className="h-4 w-4" />, tone: "bg-primary/10 text-primary" },
  "Exemptions at work": { icon: <CheckBadgeIcon className="h-4 w-4" />, tone: "bg-success/10 text-success" },
  "Your adjustments": { icon: <AdjustmentsHorizontalIcon className="h-4 w-4" />, tone: "bg-primary/10 text-primary" },
  "Checked, not applied": { icon: <MagnifyingGlassIcon className="h-4 w-4" />, tone: "bg-base-content/10 text-base-content/70" },
  "What could change it": { icon: <ArrowsRightLeftIcon className="h-4 w-4" />, tone: "bg-warning/10 text-warning" },
};

const STYLE_FALLBACK = { icon: <SparklesIcon className="h-4 w-4" />, tone: "bg-primary/10 text-primary" };

// One section: its icon and title, then its items, a few at a time
const Section = ({ title, items, all = false }: { title: string; items: string[]; all?: boolean }) => {
  const [open, setOpen] = useState(all);
  const style = SECTION_STYLES[title] ?? STYLE_FALLBACK;
  const shown = open ? items : items.slice(0, SHOWN);
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h5 className="flex items-center gap-2 text-sm font-semibold text-base-content">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${style.tone}`} aria-hidden>
          {style.icon}
        </span>
        {title}
      </h5>
      <ul className="flex flex-col gap-1.5 pl-9 text-sm leading-relaxed text-base-content/80">
        {shown.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {items.length > SHOWN && !all && (
        <button type="button" className="ml-9 self-start text-xs font-semibold text-primary hover:underline" aria-expanded={open} onClick={() => setOpen((x) => !x)}>
          {open ? "Show less" : `+${items.length - SHOWN} more`}
        </button>
      )}
    </div>
  );
};

// "Summarize": the button that shows and hides it, in the results' header beside the main action.
// Nothing for anyone who can't see the explanation (signed out, the header's own "Summarize"
// opens the pitch).
export const ExplainToggle = ({ open, onToggle }: { open: boolean; onToggle: () => void }) => {
  const { canSee, loading } = useCanSeeWhy();
  if (loading || !canSee) return null;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={open}
      className={`${ui.button({ variant: open ? "primary" : "secondary", size: "sm" })} shrink-0`}
    >
      <SparklesIcon className="h-4 w-4" aria-hidden />
      Summarize
    </button>
  );
};

export const DutySummary = ({
  f,
  result,
  bestSaving,
  onClose,
}: {
  f: TariffFinder;
  result: CalculationResult;
  bestSaving: number;
  onClose?: () => void;
}) => {
  const cardClass = useCardClass();
  const { canSee, loading } = useCanSeeWhy();
  if (loading || !canSee) return null;
  const sections = summarySections(f, result, bestSaving);
  const [pay, ...rest] = sections;
  const rate = f.customsValue > 0 ? (result.totalDuty / f.customsValue) * 100 : 0;
  const strong = (text: string) => <span className="font-semibold text-base-content">{text}</span>;

  return (
    <section className={`${cardClass} flex flex-col gap-5 px-5 py-5 sm:px-6`} aria-labelledby="duty-summary-title">
      <div className="flex items-start justify-between gap-3">
        <h3 id="duty-summary-title" className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <SparklesIcon className="h-3.5 w-3.5" aria-hidden />
          In plain English
        </h3>
        {onClose && (
          <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} onClick={onClose}>
            <XMarkIcon className="h-4 w-4" aria-hidden />
            <span className="sr-only">Hide the explanation</span>
          </button>
        )}
      </div>
      <p className="-mt-2 text-lg leading-relaxed text-base-content/80">
        {f.country?.name ?? "These"} goods under {strong(result.htsCode)} owe {strong(formatMoney(result.totalDuty))} in duty on{" "}
        {formatMoney(f.customsValue)} ({strong(pct(rate))}), plus {formatMoney(result.totalFees)} in customs fees:{" "}
        {strong(formatMoney(result.totalDuty + result.totalFees))} due at entry.
      </p>
      <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {pay && (
          <div className="rounded-2xl bg-base-200/60 p-4">
            <Section title={pay.title} items={pay.items} all />
          </div>
        )}
        <div className="grid content-start gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {rest.map((s) => (
            <Section key={s.title} title={s.title} items={s.items} />
          ))}
        </div>
      </div>
    </section>
  );
};
