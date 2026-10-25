"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CENSUS_NOTICE } from "../../../duty-calculator/lib/census";
import { useInsights } from "../../insights/InsightsContext";
import { useOpportunities } from "../../opportunities/OpportunitiesContext";
import { Measure } from "../../opportunities/measure";
import { REVIEW_LABELS } from "../../opportunities/review";
import { optionId, productOptions } from "../../opportunities/options";
import { OpportunityStatus } from "../../opportunities/statuses";
import { RuleOutAll } from "../../opportunities/RuleOutAll";
import { TrackedProduct } from "../../report";
import { useTracker } from "../../TrackerContext";
import { FreeChecksNotice } from "../../access/FreeChecksNotice";
import { LockedSavings } from "./LockedSavings";
import { exemptionName, ListItem, OptionList } from "./OptionList";
import { keyIsElsewhere, OptionReview } from "./OptionReview";

// A product's Savings tab: once its savings are unlocked (a savings check, or a plan: PRICING.md),
// every way to pay less on it: the options down one side (under the %/$ switch), and the open one
// beside them, one question each to answer No or Yes, then secure (OptionReview). Amounts
// show as percentages of the value first, or in dollars. Under the quick wins, and under sourcing it
// elsewhere, the way to rule that group out. Origins come from Census first (the catalog's
// figures, loaded with the insights). Securing one applies it to the catalog and keeps the record
// (opportunities/).

// A key in the keyboard hint
const KEY = "rounded border border-base-300 bg-base-100 px-1.5 font-sans text-[11px] font-semibold leading-4 text-base-content/70";

// An option's short name, as the rail shows it
const itemName = ({ option, opportunity }: ListItem) =>
  option?.kind === "origin" ? option.setup.country.name : option?.kind === "exemption" ? exemptionName(option) : (option?.title ?? opportunity?.title ?? "");

const SavingsExplorer = ({ product }: { product: TrackedProduct }) => {
  const insights = useInsights();
  const { itemFor } = useTracker();
  const { opportunities, setStatus } = useOpportunities();
  const imports = insights.importsFor(product.entry.element.htsno);
  // The Savings tab speaks in rates only: what comes off the rate, never dollars
  const measure: Measure = "pct";
  const shipmentsPerYear = itemFor(product.key)?.shipmentsPerYear ?? 1;
  const costs = insights.origins.get(product.key);

  // Once the code's Census figures are in (null when it has none)
  const options = useMemo(() => (imports === undefined ? [] : productOptions(product, costs, imports)), [product, costs, imports]);
  const mine = useMemo(() => opportunities.filter((o) => o.productKey === product.key), [opportunities, product.key]);
  // The options, each with its tracked opportunity, then tracked ones whose option is gone
  const items: ListItem[] = useMemo(() => {
    const byId = new Map(mine.map((o) => [optionId(o.kind, o.optionRef), o]));
    const live = options.map((option) => ({ id: option.id, option, opportunity: byId.get(option.id) }));
    const ids = new Set(options.map((o) => o.id));
    const past = mine.filter((o) => !ids.has(optionId(o.kind, o.optionRef))).map((o) => ({ id: optionId(o.kind, o.optionRef), opportunity: o }));
    return [...live, ...past];
  }, [options, mine]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Picking one far down the list brings its review into view
  const detail = useRef<HTMLDivElement>(null);
  const select = (id: string) => {
    setSelectedId(id);
    if ((detail.current?.getBoundingClientRect().top ?? 0) < 0) detail.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  // Still to review: an option nobody has accepted or rejected yet
  const undecided = (i: ListItem) => !!i.option && (!i.opportunity || i.opportunity.status === "found");
  // The items in the list's order: trade programs, exemptions, other origins, then tracked earlier
  const listed = useMemo(() => {
    const order = (i: ListItem) => (i.option ? ["program", "exemption", "origin"].indexOf(i.option.kind) : 3);
    return [...items].sort((a, b) => order(a) - order(b));
  }, [items]);
  // Opens on the first option still to review, or the first one
  useEffect(() => {
    if (!selectedId && listed.length) setSelectedId((listed.find(undecided) ?? listed[0]).id);
  }, [listed, selectedId]);
  const selected = items.find((i) => i.id === selectedId);
  // After a Yes or a No, on to the next option still to review (the list wraps round); with none
  // left, the one just answered stays open
  const next = () => {
    const at = listed.findIndex((i) => i.id === selectedId);
    const after = [...listed.slice(at + 1), ...listed.slice(0, at)].find(undecided);
    if (after) select(after.id);
  };
  // Up and down arrows step through the list (not while typing, or in a dialog)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== "ArrowDown" && e.key !== "ArrowUp") || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      if (keyIsElsewhere(e)) return;
      const at = listed.findIndex((i) => i.id === selectedId);
      const to = listed[at + (e.key === "ArrowDown" ? 1 : -1)];
      if (!to) return;
      e.preventDefault();
      select(to.id);
      document.getElementById(`savings-option-${to.id}`)?.scrollIntoView({ block: "nearest" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  // The latest items, for an Undo pressed after they've changed
  const latest = useRef(items);
  useEffect(() => {
    latest.current = items;
  }, [items]);
  const undo = async (id: string) => {
    const opportunity = latest.current.find((i) => i.id === id)?.opportunity;
    if (opportunity && (await setStatus(opportunity, "found", null))) select(id);
    else toast.error("Couldn't undo this. Please try again.");
  };
  const answered = (to: OpportunityStatus) => {
    const item = selected;
    next();
    if (!item) return;
    toast(
      (t) => (
        <span className="flex items-center gap-3 text-sm">
          <span>
            {to === "researching" ? "Pursuing" : "Ruled out"}: <span className="font-semibold">{itemName(item)}</span>
          </span>
          <button
            type="button"
            className={ui.link}
            onClick={() => {
              toast.dismiss(t.id);
              undo(item.id);
            }}
          >
            Undo
          </button>
        </span>
      ),
      { id: "savings-decided", duration: 6000 }
    );
  };
  const review = insights.review.get(product.key) ?? "to_review";
  const toReview = items.filter(undecided).length;
  const reviewable = items.filter((i) => i.option).length;
  const decided = reviewable - toReview;

  return (
    <div className="flex flex-col gap-4">
      {imports === undefined ? (
        <div className={`${ui.skeleton} h-72 w-full`} aria-busy="true" />
      ) : items.length === 0 ? (
        <div className={`${ui.card} p-6`}>
          <p className={ui.bodySm}>
            No trade program, exemption or cheaper country of origin would lower the duty on this import today. We&apos;ll keep checking as tariffs change.
          </p>
        </div>
      ) : (
        // One box: the options down a soft rail on the left, the one picked on the right
        <section className={`${tt.panel} grid xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]`} aria-label="Possible savings options">
          <div className="flex flex-col gap-5 border-b border-base-300 p-3 pb-5 xl:border-b-0 xl:border-r">
            <div className="flex flex-col gap-3 px-3 pt-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className={`${tt.title} m-0 whitespace-nowrap`}>Possible Savings Options</h2>
              </div>
              {/* How far the review has got */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className={tt.chip(REVIEW_LABELS[review].tone)}>{REVIEW_LABELS[review].label}</span>
                  <span className="tabular-nums text-base-content/60">{toReview > 0 ? `${decided} of ${reviewable} decided` : "All decided"}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-base-300" aria-hidden>
                  {/* Runtime width (DESIGN_SYSTEM §10) */}
                  <div className="h-full rounded-full bg-success transition-[width]" style={{ width: `${reviewable ? (decided / reviewable) * 100 : 100}%` }} />
                </div>
                {/* The keyboard way through */}
                <p className="m-0 hidden items-center gap-1.5 text-xs text-base-content/60 sm:flex">
                  <kbd className={KEY}>↑</kbd>
                  <kbd className={KEY}>↓</kbd>
                  to move
                  <span aria-hidden>·</span>
                  <kbd className={KEY}>Y</kbd>
                  <kbd className={KEY}>N</kbd>
                  to answer
                </p>
              </div>
            </div>
            <OptionList
              items={listed}
              selectedId={selectedId}
              imports={imports}
              customsValue={product.customsValue}
              measure={measure}
              onSelect={select}
              afterQuickWins={<RuleOutAll scope="quick" product={product} items={items} />}
              afterSourcing={<RuleOutAll scope="sourcing" product={product} items={items} />}
            />
          </div>
          <div ref={detail} className="min-w-0 scroll-mt-4 p-6 lg:p-7">
            {selected && (
              <OptionReview
                key={selected.id}
                product={product}
                option={selected.option}
                opportunity={selected.opportunity}
                imports={imports}
                shipmentsPerYear={shipmentsPerYear}
                measure={measure}
                onDecided={answered}
              />
            )}
          </div>
        </section>
      )}
      {imports && <p className={ui.caption}>Import figures: U.S. Census Bureau. {CENSUS_NOTICE}</p>}
    </div>
  );
};

export const ProductSavings = ({ product }: { product: TrackedProduct }) => {
  const { unlocked } = useInsights();
  return (
    <div className="flex flex-col gap-4">
      <FreeChecksNotice kind="savings" />
      {unlocked.has(product.key) ? <SavingsExplorer product={product} /> : <LockedSavings product={product} />}
    </div>
  );
};
