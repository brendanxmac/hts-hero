"use client";

import { useMemo } from "react";
import { useInsights } from "../../insights/InsightsContext";
import { SavingKind } from "../../insights/savings";
import { Opportunity, useOpportunities } from "../../opportunities/OpportunitiesContext";
import { optionId, productOptions, SavingOption } from "../../opportunities/options";
import { TrackedProduct } from "../../report";
import { useTracker } from "../../TrackerContext";

// A product's savings options, each with its tracked opportunity, then tracked ones whose option is
// gone, in the order the review goes through them: trade programs, exemptions, other origins, then
// tracked earlier. Shared by the Savings tab and the savings review (SavingsReview).

export type ListItem = { option?: SavingOption; opportunity?: Opportunity; id: string };

// An exemption's name: what its first heading covers ("Donations", from "Section 301 Brazil
// Exemption: Donations"), or its title
export const exemptionName = (option: SavingOption) => {
  const name = option.headings?.find((h) => h.name)?.name ?? "";
  return name.split(": ").slice(1).join(": ") || name || option.title;
};

// An option's short name, as the review and the Savings tab show it
export const itemName = ({ option, opportunity }: ListItem) =>
  option?.kind === "origin" ? option.setup.country.name : option?.kind === "exemption" ? exemptionName(option) : (option?.title ?? opportunity?.title ?? "");

export const KIND_ORDER: SavingKind[] = ["program", "exemption", "origin"];

// Still to review: an option nobody has accepted or rejected yet
export const undecided = (i: ListItem) => !!i.option && (!i.opportunity || i.opportunity.status === "found");

export const useSavingsItems = (product: TrackedProduct) => {
  const insights = useInsights();
  const { itemFor } = useTracker();
  const { opportunities } = useOpportunities();
  const imports = insights.importsFor(product.entry.element.htsno);
  const costs = insights.origins.get(product.key);
  const shipmentsPerYear = itemFor(product.key)?.shipmentsPerYear ?? 1;

  // Once the code's Census figures are in (null when it has none)
  const options = useMemo(() => (imports === undefined ? [] : productOptions(product, costs, imports)), [product, costs, imports]);
  const mine = useMemo(() => opportunities.filter((o) => o.productKey === product.key), [opportunities, product.key]);
  const items: ListItem[] = useMemo(() => {
    const byId = new Map(mine.map((o) => [optionId(o.kind, o.optionRef), o]));
    const live = options.map((option) => ({ id: option.id, option, opportunity: byId.get(option.id) }));
    const ids = new Set(options.map((o) => o.id));
    const past = mine.filter((o) => !ids.has(optionId(o.kind, o.optionRef))).map((o) => ({ id: optionId(o.kind, o.optionRef), opportunity: o }));
    const order = (i: ListItem) => (i.option ? KIND_ORDER.indexOf(i.option.kind) : 3);
    return [...live, ...past].sort((a, b) => order(a) - order(b));
  }, [options, mine]);

  return { items, imports, shipmentsPerYear, loading: imports === undefined };
};
