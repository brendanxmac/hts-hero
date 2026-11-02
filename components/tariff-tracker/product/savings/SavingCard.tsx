"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { CheckCircleIcon, CheckIcon, ChevronDownIcon, ReceiptPercentIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { formatDate } from "../../../duty-calculator/lib/format";
import { UsImports } from "../../../duty-calculator/lib/usImportsData";
import { formatRate } from "../../formatRate";
import { useApplyOption } from "../../opportunities/apply";
import { useOpportunities } from "../../opportunities/OpportunitiesContext";
import { OpportunityStatus } from "../../opportunities/statuses";
import { TrackedProduct } from "../../report";
import { applyText, Compare, History, KINDS, Move, NEXT, PATH } from "./OptionReview";
import { itemName, ListItem } from "./useSavingsItems";
import { WhatItTakes } from "./WhatItTakes";

// A saving being pursued, on the Savings tab once it's answered Yes in the review: its name, the rate
// before and after and what comes off, where it's got to on the way to secured, and the one move
// that's next. What it takes, the comparison with today and its history open under it. Securing it
// applies it to the catalog (opportunities/). Savings are only ever potential.

// What it takes off the rate, in %, and the rate with it
export const rateWith = (product: TrackedProduct, item: ListItem) => {
  const after = item.option?.ratePct ?? item.opportunity?.rateAfter ?? product.totalPct;
  const before = item.option ? product.totalPct : (item.opportunity?.rateBefore ?? product.totalPct);
  return { before, after, off: before - after };
};

export const SavingCard = ({ product, item, imports }: { product: TrackedProduct; item: ListItem; imports: UsImports | null }) => {
  const { setStatus, eventsFor } = useOpportunities();
  const apply = useApplyOption();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<OpportunityStatus | null>(null);
  const [open, setOpen] = useState(false);
  const { option } = item;
  const opportunity = item.opportunity!;
  const kind = option?.kind ?? opportunity.kind;
  const here = PATH.findIndex((p) => p.status === opportunity.status);
  const next = NEXT[opportunity.status];
  const { before, after, off } = rateWith(product, item);
  const events = eventsFor(opportunity.id);

  const move = async (to: OpportunityStatus) => {
    setBusy(true);
    const applied = to === "secured" && option ? apply(option, product) : undefined;
    const ok = await setStatus(opportunity, to, null, applied);
    setBusy(false);
    if (!ok) return toast.error("Couldn't save this. Please try again.");
    if (applied) toast.success("Secured and applied to your imports.");
    setPending(null);
  };

  return (
    <article className={`${tt.panel} flex flex-col`} aria-label={itemName(item)}>
      <div className="flex flex-col gap-5 p-5 lg:p-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${option?.kind === "origin" ? "bg-tt-soft text-lg" : "bg-success/10 text-success"}`} aria-hidden>
              {option?.kind === "origin" ? option.setup.country.flag : <ReceiptPercentIcon className="h-5 w-5" />}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-base font-semibold text-base-content">{itemName(item)}</span>
              <span className="text-sm text-base-content/60">
                {KINDS[kind].label} · {formatRate(before)} → {formatRate(after)}
              </span>
            </div>
          </div>
          <span className="flex shrink-0 flex-col items-end">
            <span className={`${tt.metricSm} !text-success`}>−{formatRate(off)}</span>
            <span className="text-xs text-base-content/60">if you qualify</span>
          </span>
        </header>

        {/* Where it's got to */}
        <ol className="m-0 grid list-none grid-cols-3 gap-2 p-0" aria-label="Progress">
          {PATH.map((p, i) => (
            <li key={p.status} className="flex flex-col gap-2">
              <span className={`h-1.5 rounded-full ${i < here ? "bg-success" : i === here ? "bg-primary" : "bg-base-300"}`} aria-hidden />
              <span className={`flex items-center gap-1 text-xs font-semibold ${i === here ? "text-base-content" : i < here ? "text-success" : "text-base-content/50"}`}>
                {i < here && <CheckCircleIcon className="h-3.5 w-3.5" aria-hidden />}
                {p.label}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* The next move */}
      {next && (
        <div className="flex flex-col gap-3 border-t border-base-300 px-5 py-4 lg:px-6">
          {pending ? (
            <Move to={pending} busy={busy} onConfirm={() => move(pending)} onCancel={() => setPending(null)}>
              {pending === "secured" && option && (
                <p className="m-0 flex items-start gap-2 text-sm text-base-content/70">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Securing it {applyText(option, product)}. The change is kept in its history.
                </p>
              )}
            </Move>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-base-content/70">
                <span className="font-semibold text-base-content">Next:</span> {next.title.charAt(0).toLowerCase() + next.title.slice(1)}
              </span>
              <span className="flex items-center gap-2">
                <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
                  Details
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <button
                  type="button"
                  className={ui.button({ variant: "primary", size: "sm" })}
                  disabled={busy || (next.move === "secured" && !option)}
                  onClick={() => setPending(next.move)}
                >
                  {next.button}
                </button>
              </span>
            </div>
          )}
        </div>
      )}

      {open && (
        <div className="flex flex-col gap-6 border-t border-base-300 bg-tt-soft/40 px-5 py-5 lg:px-6">
          <p className="m-0 text-sm text-base-content/75">{next?.detail}</p>
          <div className="flex flex-col gap-3">
            <h3 className={tt.sectionTitle}>What It Takes</h3>
            <WhatItTakes kind={kind} current={opportunity.status === "in_progress" ? 1 : 0} />
          </div>
          {option && <Compare product={product} option={option} imports={imports} measure="pct" />}
          {events.length > 0 && <History events={events} />}
          <div className="flex flex-wrap items-center gap-4 border-t border-base-300 pt-4">
            {next?.move !== "secured" && option && (
              <button type="button" className={`${ui.link} text-sm`} onClick={() => setPending("secured")}>
                Already secured
              </button>
            )}
            <button type="button" className={`${ui.link} text-sm`} onClick={() => setPending("not_eligible")}>
              Rule it out
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

// A secured saving: one quiet row
export const SecuredRow = ({ product, item }: { product: TrackedProduct; item: ListItem }) => {
  const { before, after } = rateWith(product, item);
  const at = item.opportunity?.securedAt ?? item.opportunity?.updatedAt;
  return (
    <li className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />
        <span className="truncate font-medium text-base-content">{itemName(item)}</span>
      </span>
      <span className="shrink-0 tabular-nums text-base-content/60">
        {formatRate(before)} → {formatRate(after)}
        {at ? ` · ${formatDate(at.slice(0, 10))}` : ""}
      </span>
    </li>
  );
};
