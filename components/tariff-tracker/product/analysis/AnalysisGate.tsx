"use client";

import { ReactNode, useMemo } from "react";
import { formatPct } from "@/components/duty-calculator/lib/format";
import { UsImports, useUsImports } from "@/components/duty-calculator/lib/usImports";
import { useUser } from "@/contexts/UserContext";
import { AccountGate } from "../../access/AccountGate";
import { TrackedProduct } from "../../report";
import { analysisFacts, originRates } from "./analysis";

// Compare's view of every origin needs a free account (PRICING.md). Signed out, the teaser is worked out
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

// The gate's pitch, short: sourcing insight, from the product itself. How many origins pay less
// (and, from Census imports, how many of those already ship it to the US) and how low it goes,
// without naming them (the account answers that).
const pitchFor = (product: TrackedProduct, imports: UsImports | null): { teaser: ReactNode; points: string[] } => {
  const facts = analysisFacts(originRates(product), "agreements");
  const cheaper = facts.cheaper.length;
  // The cheaper ones that already ship it to the US (Census): proven suppliers, not just rates
  const proven = imports ? facts.cheaper.filter((r) => (imports.byCountry.get(r.country.code)?.value ?? 0) > 0).length : 0;
  const pct = (n: number) => formatPct(Math.round(n * 10) / 10);
  if (!cheaper)
    return {
      teaser: <>See how {product.entry.country.name} compares with every other country you could source from.</>,
      points: [],
    };
  return {
    teaser: (
      <>
        <span className="block text-base">Find a cheaper country to source this from.</span>
        <span className="mt-1 block font-normal text-base-content/80">
          {proven > 0 ? (
            <>
              <b className="text-base-content">{proven}</b> {proven === 1 ? "country already ships" : "countries already ship"} this to the US and{" "}
              {proven === 1 ? "pays" : "pay"} less duty than {product.entry.country.name}, some as low as <b className="text-success">{pct(facts.lowest.pct)}</b>.
            </>
          ) : (
            <>
              {cheaper} {cheaper === 1 ? "country pays" : "countries pay"} less duty than {product.entry.country.name}, some as low as{" "}
              <b className="text-success">{pct(facts.lowest.pct)}</b>.
            </>
          )}
        </span>
      </>
    ),
    points: [],
  };
};

// The account gate over the parts of Compare that cover every origin (the full list, the map,
// the insights): signed out, the real content blurred under the pitch, worked out from the
// product itself
export const AnalysisGate = ({ product, page, children }: { product: TrackedProduct; page: string; children: ReactNode }) => {
  const { user, isLoading } = useUser();
  const imports = useUsImports(user || isLoading ? undefined : product.entry.element.htsno);
  const pitch = useMemo(() => (user || isLoading ? null : pitchFor(product, imports)), [user, isLoading, product, imports]);
  return (
    <AccountGate
      feature="analysis"
      page={page}
      title="Get Advanced Comparisons, 100% Free"
      teaser={pitch?.teaser}
      points={pitch?.points ?? []}
      // The real content, blurred: what they'd unlock is the best pitch for it
      preview={children}
      minHeight="min-h-[30rem]"
    >
      {children}
    </AccountGate>
  );
};
