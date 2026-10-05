import { DutyCalculatorContent } from "@/libs/duty-calculator-content";
import { formatDutyPct, formatSummaryDate } from "@/libs/hts-duty-summary";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CountryRateCharts } from "../country-rate-charts";
import { matrixFacts, pctOf, roundedPct } from "./matrixFacts";

// Today's total rate on common imports from the largest source countries, with the headline
// facts above the charts.

const Fact = ({ label, value, note }: { label: string; value: string; note: string }) => (
  <div className="rounded-lg border border-base-300 bg-base-200 px-5 py-4">
    <div className="text-sm font-medium text-base-content/60">{label}</div>
    <div className={`${ui.metric.secondary} mt-1.5`}>{value}</div>
    <div className="mt-1.5 text-sm text-base-content/70">{note}</div>
  </div>
);

export const RatesByCountry = ({ content }: { content: DutyCalculatorContent }) => {
  const { matrix, asOf, revisionTitle } = content;
  const facts = matrixFacts(matrix);
  return (
    <section id="tariff-rates-by-country" className={ui.section}>
      <SectionHeader kicker="Rates by country" title="US Tariff Rates by Country">
        Total US import duty, base rate plus every additional tariff, on goods entered{" "}
        {formatSummaryDate(asOf)} from the {matrix.rows.length} largest sources of US imports.
        The same product can pay very different rates depending on where it&apos;s made.
      </SectionHeader>

      {facts && (
        <div className="grid gap-3 sm:grid-cols-3">
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
    </section>
  );
};
