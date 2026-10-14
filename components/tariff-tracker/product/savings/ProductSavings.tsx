"use client";

import { useEffect, useMemo, useState } from "react";
import * as ui from "@/components/ui/styles";
import { CENSUS_NOTICE } from "../../../duty-calculator/lib/census";
import { useInsights } from "../../insights/InsightsContext";
import { useOpportunities } from "../../opportunities/OpportunitiesContext";
import { Measure } from "../../opportunities/measure";
import { optionId, productOptions } from "../../opportunities/options";
import { RuleOutAll } from "../../opportunities/RuleOutAll";
import { tallyOpportunities } from "../../opportunities/tallies";
import { TrackedProduct } from "../../report";
import { useTracker } from "../../TrackerContext";
import { LockedSavings } from "./LockedSavings";
import { OptionDetail } from "./OptionDetail";
import { ListItem, OptionList } from "./OptionList";
import { SavingsSummary } from "./SavingsSummary";

// A product's Savings tab: once its savings are unlocked (a savings check, or a plan: PRICING.md),
// a guided look at every way to pay less on it. A summary, the options on one side and the open
// one on the other: side by side with today, what it takes, and its progress. Amounts show as
// percentages of the value first, or in dollars. Under the quick wins, and under sourcing it
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
  const tally = useMemo(() => tallyOpportunities(mine, () => shipmentsPerYear), [mine, shipmentsPerYear]);
  const best = options.find((o) => o.counted);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedId && items.length) setSelectedId(items[0].id);
  }, [items, selectedId]);
  const selected = items.find((i) => i.id === selectedId);

  return (
    <div className="flex flex-col gap-4">
      <SavingsSummary review={insights.review.get(product.key) ?? "to_review"} product={product} best={best} options={options} shipmentsPerYear={shipmentsPerYear} tally={tally} measure={measure} onMeasure={setMeasure} />
      {imports === undefined ? (
        <div className={`${ui.skeleton} h-72 w-full`} aria-busy="true" />
      ) : items.length === 0 ? (
        <div className={`${ui.card} p-6`}>
          <p className={ui.bodySm}>
            No trade program, exemption or cheaper country of origin would lower the duty on this import today. We&apos;ll keep
            checking as tariffs change.
          </p>
        </div>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,23rem)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <OptionList
              items={items}
              selectedId={selectedId}
              imports={imports}
              customsValue={product.customsValue}
              todayPct={product.totalPct}
              measure={measure}
              onSelect={setSelectedId}
              afterQuickWins={<RuleOutAll scope="quick" product={product} items={items} />}
              afterSourcing={<RuleOutAll scope="sourcing" product={product} items={items} />}
            />
          </div>
          {selected && (
            <OptionDetail
              key={selected.id}
              product={product}
              option={selected.option}
              opportunity={selected.opportunity}
              shipmentsPerYear={shipmentsPerYear}
              measure={measure}
            />
          )}
        </div>
      )}
      {imports && <p className={ui.caption}>Import figures: U.S. Census Bureau. {CENSUS_NOTICE}</p>}
    </div>
  );
};

export const ProductSavings = ({ product }: { product: TrackedProduct }) => {
  const { unlocked } = useInsights();
  return unlocked.has(product.key) ? <SavingsExplorer product={product} /> : <LockedSavings product={product} />;
};
