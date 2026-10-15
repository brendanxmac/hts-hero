"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CENSUS_NOTICE } from "../../../duty-calculator/lib/census";
import { useInsights } from "../../insights/InsightsContext";
import { useOpportunities } from "../../opportunities/OpportunitiesContext";
import { Measure, MEASURES } from "../../opportunities/measure";
import { REVIEW_LABELS } from "../../opportunities/review";
import { optionId, productOptions } from "../../opportunities/options";
import { RuleOutAll } from "../../opportunities/RuleOutAll";
import { TrackedProduct } from "../../report";
import { useTracker } from "../../TrackerContext";
import { FreeChecksNotice } from "../../access/FreeChecksNotice";
import { LockedSavings } from "./LockedSavings";
import { ListItem, OptionList } from "./OptionList";
import { OptionReview } from "./OptionReview";
import { ShipmentsPerYearField } from "./ShipmentsPerYearField";

// A product's Savings tab: once its savings are unlocked (a savings check, or a plan: PRICING.md),
// every way to pay less on it: the options down one side (under the %/$ switch), and the open one
// beside them, to review against today and accept or reject, then secure (OptionReview). Amounts
// show as percentages of the value first, or in dollars. Under the quick wins, and under sourcing it
// elsewhere, the way to rule that group out. Origins come from Census first (the catalog's
// figures, loaded with the insights). Securing one applies it to the catalog and keeps the record
// (opportunities/).

const SavingsExplorer = ({ product }: { product: TrackedProduct }) => {
  const insights = useInsights();
  const { itemFor } = useTracker();
  const { opportunities } = useOpportunities();
  const imports = insights.importsFor(product.entry.element.htsno);
  const [measure, setMeasure] = useState<Measure>("pct");
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
  // After a rejection, on to the next option still to review (the list wraps round)
  const next = () => {
    const at = listed.findIndex((i) => i.id === selectedId);
    const after = [...listed.slice(at + 1), ...listed.slice(0, at)].find(undecided);
    if (after) select(after.id);
  };
  const review = insights.review.get(product.key) ?? "to_review";
  const toReview = items.filter(undecided).length;

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
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className={`${tt.title} m-0`}>Ways to save</h2>
                <SegmentedControl<Measure> label="Show amounts as" options={MEASURES} value={measure} onChange={setMeasure} size="sm" />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs text-base-content/60">
                  <span className={tt.chip(REVIEW_LABELS[review].tone)}>{REVIEW_LABELS[review].label}</span>
                  {toReview > 0 ? `${toReview} to review` : "All reviewed"}
                </span>
                {measure === "usd" && (
                  <span className="flex items-center gap-2 text-xs text-base-content/60">
                    Shipments a year <ShipmentsPerYearField productKey={product.key} />
                  </span>
                )}
              </div>
            </div>
            <OptionList
              items={items}
              selectedId={selectedId}
              imports={imports}
              customsValue={product.customsValue}
              todayPct={product.totalPct}
              measure={measure}
              onSelect={select}
              afterQuickWins={<RuleOutAll scope="quick" product={product} items={items} />}
              afterSourcing={<RuleOutAll scope="sourcing" product={product} items={items} />}
            />
          </div>
          <div ref={detail} className="scroll-mt-4">
            {selected && (
              <OptionReview
                key={selected.id}
                product={product}
                option={selected.option}
                opportunity={selected.opportunity}
                imports={imports}
                shipmentsPerYear={shipmentsPerYear}
                measure={measure}
                onRejected={next}
              />
            )}
          </div>
        </div>
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
