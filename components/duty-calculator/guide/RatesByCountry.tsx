import { DutyCalculatorContent } from "@/libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "@/libs/hts-duty-summary";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { CountryRateCharts } from "../country-rate-charts";
import { matrixFacts, pctOf, roundedPct } from "./matrixFacts";

// Today's total rate on common imports from the largest source countries, with the headline
// facts above the charts.

const Fact = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className={`${mk.card} min-w-0 px-6 py-5`}>
    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 skin:text-base-content/60">{label}</div>
    <div className="mt-2 text-3xl font-bold tracking-tight tabular-nums text-slate-900 skin:text-base-content sm:text-4xl">{value}</div>
    <div className="mt-2 text-sm text-slate-600 skin:text-base-content/70">{note}</div>
  </div>
);

export const RatesByCountry = ({ content }: { content: DutyCalculatorContent }) => {
  const { matrix, asOf, revisionTitle } = content;
  const facts = matrixFacts(matrix);
  return (
    <section id="tariff-rates-by-country" className={`${mk.band} scroll-mt-6`}>
      <div className={`${mk.container} flex flex-col gap-10`}>
        <SectionIntro eyebrow="Rates by country" title="US Tariff Rates by Country">
          Total US import duty, base rate plus every additional tariff, on goods entered{" "}
          {formatSummaryDate(asOf)} from the {matrix.rows.length} largest sources of US imports.
          The same product can pay very different rates depending on where it&apos;s made.
        </SectionIntro>

        {facts && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Fact
              label="Highest average rate"
              value={roundedPct(facts.highest.average)}
              note={`${facts.highest.country.flag} ${facts.highest.country.name}, across these products`}
            />
            <Fact
              label="Lowest average rate"
              value={roundedPct(facts.lowest.average)}
              note={`${facts.lowest.country.flag} ${facts.lowest.country.name}, across these products`}
            />
            {facts.widest && (
              <Fact
                label="Widest gap for one product"
                value={`${formatDutyPct(facts.widest.min.pct)} – ${formatDutyPct(facts.widest.max.pct)}`}
                note={`${facts.widest.product.label}: ${facts.widest.min.country.name} vs ${facts.widest.max.country.name}`}
              />
            )}
          </div>
        )}

        {/* The charts bring their own cards */}
        <div className="min-w-0">
          <CountryRateCharts
            products={matrix.products}
            rows={matrix.rows.map((row) => ({
              code: row.country.code,
              name: row.country.name,
              flag: row.country.flag,
              values: row.cells.map((c) => pctOf(c.total)),
              labels: row.cells.map((c) => c.total),
              preferences: row.cells.map((c) => c.preference),
            }))}
            footnote={
              <>
                General rates (Column 2 where it applies), before customs fees and any antidumping or
                countervailing duties, with tariff data verified through {revisionTitle}. Green figures
                are the total when the goods qualify for that trade preference. Some tariffs and
                exemptions depend on details such as metal content, which the calculator asks about.
              </>
            }
          />
        </div>
      </div>
    </section>
  );
};
