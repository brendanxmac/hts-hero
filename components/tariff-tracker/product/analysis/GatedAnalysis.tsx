"use client";

import { useMemo } from "react";
import { SwarmStandIn } from "@/components/ui/stand-ins";
import { useUser } from "@/contexts/UserContext";
import { AccountGate } from "../../access/AccountGate";
import { TrackedProduct } from "../../report";
import { analysisFacts, originRates } from "./analysis";
import { AnalysisTab } from "./AnalysisTab";

// The Analysis, which needs a free account (PRICING.md). Signed out, the teaser is worked out
// from the product itself: how many origins pay less, without saying which.
export const teaserFor = (product: TrackedProduct) => {
  const rates = originRates(product);
  const facts = analysisFacts(rates, "standard");
  const origin = product.entry.country.name;
  const agreements = rates.filter((r) => r.agreement).length;
  const cheaper = facts.cheaper.length;
  const lead = cheaper
    ? `${cheaper} ${cheaper === 1 ? "country of origin pays" : "countries of origin pay"} less duty on this product than ${origin}.`
    : `${origin} already pays among the lowest duty on this product of ${facts.total} origins.`;
  return agreements ? `${lead} ${agreements} have a trade agreement that can lower it.` : lead;
};

export const GatedAnalysis = ({ product, page }: { product: TrackedProduct; page: string }) => {
  const { user, isLoading } = useUser();
  const teaser = useMemo(() => (user || isLoading ? null : teaserFor(product)), [user, isLoading, product]);
  return (
    <AccountGate
      feature="analysis"
      page={page}
      title="See this product's duty from every country"
      teaser={teaser}
      points={["Every origin ranked by duty, on a map", "Trade agreements that lower it", "Which rates have been stable, and which haven't"]}
      preview={<SwarmStandIn />}
      minHeight="min-h-[30rem]"
    >
      <AnalysisTab product={product} />
    </AccountGate>
  );
};
