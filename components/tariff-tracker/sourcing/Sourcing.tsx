"use client";

import { useMemo, useState } from "react";
import { ArrowTrendingDownIcon, ArrowTrendingUpIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { TableStandIn } from "@/components/ui/stand-ins";
import { CENSUS_NOTICE, formatImportValue, useUsImportsFor } from "@/components/duty-calculator/lib/usImports";
import { AccountGate } from "../access/AccountGate";
import { formatRate } from "../formatRate";
import { useInsights } from "../insights/InsightsContext";
import { InsightsProgress } from "../insights/InsightsProgress";
import { sourcingTeaser, wholeDollars } from "../insights/teasers";
import { BeyondPlanTeaser } from "../plan/BeyondPlanTeaser";
import { sectionBySlug } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { StatRow } from "../shell/StatRow";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { SourcingOption, sourcingIdeas } from "./ideas";

// The Sourcing tab: for each product, the countries that pay less duty than its origin and
// already ship it to the US (Census imports), and the countries that could supply the most of the
// catalog for less. A row opens the product, whose Analysis has every origin.

const PAGE = 50;
const OPTIONS_SHOWN = 3;
const COUNTRIES_SHOWN = 8;

const Trend = ({ value, prior }: { value: number; prior: number }) => {
  if (prior <= 0) return <span className="text-base-content/60">new</span>;
  const trend = (value - prior) / prior;
  const Icon = trend >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  return (
    <span className={`inline-flex items-center gap-0.5 ${trend >= 0 ? "text-success" : "text-base-content/60"}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {Math.abs(Math.round(trend * 100))}%
    </span>
  );
};

const Option = ({ option }: { option: SourcingOption }) => (
  <li className="flex flex-wrap items-baseline gap-x-2 text-sm">
    <span className="font-medium text-base-content">
      <span aria-hidden className="mr-1">
        {option.country.flag}
      </span>
      {option.country.name}
    </span>
    <span className="font-semibold text-success">{formatRate(option.pct)}</span>
    <span className="text-xs text-base-content/60">
      {option.agreement ? `with ${option.agreement} · ` : ""}
      ships {formatImportValue(option.value)} · <Trend value={option.value} prior={option.prior} />
    </span>
  </li>
);

const SourcingReport = () => {
  const insights = useInsights();
  const nav = useTrackerNav();
  const [shown, setShown] = useState(PAGE);
  const codes = useMemo(() => insights.products.map((p) => p.entry.element.htsno), [insights.products]);
  const imports = useUsImportsFor(codes);
  const sourcing = useMemo(
    () => sourcingIdeas(insights.products, insights.origins, imports.byCode),
    [insights.products, insights.origins, imports.byCode]
  );
  const year = Array.from(imports.byCode.values()).find(Boolean)?.year;
  const top = sourcing.countries[0];

  return (
    <div className="flex flex-col gap-4">
      <InsightsProgress label="Checking origins" />
      <StatRow
        stats={[
          {
            label: "Potential savings",
            value: wholeDollars(sourcing.usd),
            note: "Up to, per shipment, moving each product",
            tone: "success",
          },
          {
            label: "Products with a cheaper proven origin",
            value: sourcing.ideas.length.toLocaleString("en-US"),
            note: `Of ${insights.products.length.toLocaleString("en-US")} covered by your plan`,
          },
          {
            label: "Top country",
            value: top ? `${top.country.flag} ${top.country.name}` : "—",
            note: top ? `Ships ${top.products.toLocaleString("en-US")} of your products for less` : "None yet",
          },
          {
            label: "Without import figures",
            value: sourcing.withoutFigures.toLocaleString("en-US"),
            note: "Codes Census has no figures for",
          },
        ]}
      />
      <BeyondPlanTeaser />

      {sourcing.countries.length > 0 && (
        <section className={ui.card} aria-labelledby="tt-sourcing-countries">
          <div className="flex flex-col gap-0.5 px-5 pb-3 pt-5">
            <h2 id="tt-sourcing-countries" className={ui.cardTitle}>
              Countries that already make your products for less
            </h2>
            <p className={ui.caption}>
              Each already ships these products to the US and pays less duty on them than your current origins. One
              country covering several products can mean fewer suppliers to qualify.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead className="border-y border-base-300 bg-base-200">
                <tr>
                  <th scope="col" className={`${ui.label} px-5 py-2.5 text-left`}>Country</th>
                  <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Your products it ships for less</th>
                  <th scope="col" className={`${ui.label} px-5 py-2.5 text-right`}>Up to, one shipment of each</th>
                </tr>
              </thead>
              <tbody>
                {sourcing.countries.slice(0, COUNTRIES_SHOWN).map((c) => (
                  <tr key={c.country.code} className="border-b border-base-300 last:border-0">
                    <th scope="row" className="px-5 py-2.5 text-left font-medium text-base-content">
                      <span aria-hidden className="mr-2">
                        {c.country.flag}
                      </span>
                      {c.country.name}
                    </th>
                    <td className="px-4 py-2.5 text-right">{c.products.toLocaleString("en-US")}</td>
                    <td className="px-5 py-2.5 text-right font-semibold text-success">{wholeDollars(c.usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {sourcing.ideas.length ? (
        <div className={ui.card}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead className="bg-base-200">
                <tr>
                  <th scope="col" className={`${ui.label} px-5 py-2.5 text-left sm:px-6`}>Product</th>
                  <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Rate now</th>
                  <th scope="col" className={`${ui.label} px-4 py-2.5 text-left`}>
                    Cheaper origins that ship it to the US{year ? `, ${year}` : ""}
                  </th>
                  <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Up to, per shipment</th>
                  <th scope="col" className="px-5 py-2.5 sm:px-6">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sourcing.ideas.slice(0, shown).map(({ product, options, best }) => (
                  <tr
                    key={product.key}
                    className="cursor-pointer border-t border-base-300 align-top hover:bg-base-200/60"
                    onClick={() => nav.openProduct(product.key)}
                  >
                    <th scope="row" className="max-w-xs px-5 py-3 text-left font-normal sm:px-6">
                      <span className={`${mono.className} block text-sm font-semibold text-base-content`}>{product.entry.element.htsno}</span>
                      <span className="block truncate text-xs text-base-content/60" title={product.description}>
                        {product.description}
                      </span>
                      <span className="block text-xs text-base-content/60">
                        From {product.entry.country.flag} {product.entry.country.name}
                      </span>
                    </th>
                    <td className="px-4 py-3 text-right">{formatRate(product.totalPct)}</td>
                    <td className="px-4 py-3">
                      <ul className="flex flex-col gap-1">
                        {options.slice(0, OPTIONS_SHOWN).map((o) => (
                          <Option key={o.country.code} option={o} />
                        ))}
                      </ul>
                      {options.length > OPTIONS_SHOWN && (
                        <span className="mt-1 block text-xs text-base-content/60">
                          +{options.length - OPTIONS_SHOWN} more in the product&apos;s Analysis
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-base-content">{wholeDollars(best.usd)}</span>
                      <span className="block text-xs text-base-content/60">
                        −{formatRate(best.pts)} from {best.country.name}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right sm:px-6">
                      <button
                        type="button"
                        className={ui.button({ variant: "ghost", size: "sm", icon: true })}
                        onClick={(e) => {
                          e.stopPropagation();
                          nav.openProduct(product.key);
                        }}
                      >
                        <ChevronRightIcon className="h-4 w-4" aria-hidden />
                        <span className="sr-only">Open {product.entry.element.htsno}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sourcing.ideas.length > shown && (
            <div className={`${ui.cardFooter} flex justify-center`}>
              <button type="button" className={ui.button({ size: "sm" })} onClick={() => setShown((n) => n + PAGE)}>
                Show more ({(sourcing.ideas.length - shown).toLocaleString("en-US")} left)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`${ui.card} p-6`}>
          <p className={ui.bodySm}>
            {insights.savingsReady && imports.ready
              ? "None of the countries that ship your products to the US pays less duty than your current origins."
              : "Looking for cheaper origins…"}
          </p>
        </div>
      )}

      <p className={ui.caption}>
        Rates include the trade agreement each country could claim, where one lowers it; the goods must meet its rules of
        origin. A new country of origin needs the goods to be made there (substantial transformation), not only shipped
        from there. US imports are general imports by HTS code from the U.S. Census Bureau. {CENSUS_NOTICE}
      </p>
    </div>
  );
};

export const Sourcing = () => {
  const { items, loading } = useTracker();
  const insights = useInsights();
  const section = sectionBySlug("sourcing")!;
  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} />;
  if (!items.length) {
    return (
      <NeedsProducts
        title="Add products to find cheaper origins"
        body="Sourcing finds the countries that pay less duty on each of your products and already ship them to the US."
      />
    );
  }
  return (
    <AccountGate
      feature="sourcing"
      page="tracker"
      title="Find cheaper countries that already make your products"
      teaser={sourcingTeaser(insights) ?? "Checking every origin for your products…"}
      points={section.planned}
      preview={<TableStandIn />}
      minHeight="min-h-[28rem]"
    >
      <SourcingReport />
    </AccountGate>
  );
};
