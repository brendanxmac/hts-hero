"use client";

import { useMemo, useState } from "react";
import { ExclamationTriangleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { useHts } from "@/contexts/HtsContext";
import { RailField } from "@/components/duty-calculator/calculator/RailField";
import { HtsCodeField } from "@/components/duty-calculator/fields/HtsCodeField";
import { CENSUS_NOTICE } from "@/components/duty-calculator/lib/census";
import { TariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import { describePath, productFromFinder } from "@/components/tariff-tracker/report";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { mono } from "@/components/ui/font";
import { Modules } from "@/components/ui/Module";
import { Switch } from "@/components/ui/Switch";
import { TableStandIn } from "@/components/ui/stand-ins";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import governance from "@/libs/sourcing/governance.json";
import { uflpaSector } from "@/libs/sourcing/flags";
import transit from "@/libs/sourcing/transit.json";
import { AccountGate } from "../../access/AccountGate";
import { Countries } from "@/constants/countries";
import { useTracker } from "../../TrackerContext";
import { usd } from "./bits";
import { CostCapacityChart } from "./CostCapacityChart";
import { CountriesTable } from "./CountriesTable";
import { CountryDetail, CountryDialog } from "./CountryProfile";
import type { SourcingRow } from "./model";
import { LandedCost } from "./LandedCost";
import { MarketStats } from "./MarketStats";
import { SourcingLoading } from "./Loading";
import { Shortlist } from "./Shortlist";
import { useSourcing, useTrade } from "./useSourcing";
import { OtherCodes } from "./OtherCodes";
import { coverageOf, usConfidence } from "./coverage";
import { DataCoverage } from "./DataCoverage";
import { RelatedCodes, relatedCodesOf, useRelatedCodes } from "./RelatedCodes";
import { CrossSources, useCrossSources } from "./CrossSources";

// Find a Source: enter an HTS code and see where to source it from. Every country's landed cost
// (duty from the engine plus the freight Census records), whether it really makes the product
// (Atlas world exports and Export Focus), how reliable it is and how far (World Bank governance,
// compliance flags, transit time), ranked one metric at a time. Everything
// is a share of the goods' value, so there's no origin or value to enter: the rates are worked out
// on a standard shipment (SHIPMENT), with the quantity a typical US import of that value would be
// (Census's average unit value for the code), so duties per unit or per kg come out as a realistic %.

// The country the product stands on (every country's rate is worked out whatever it is)
const STAND_IN = Countries.find((c) => c.code === "CN")!;
const SHIPMENT = 10_000;
// Units when Census has no unit value for the code
const DEFAULT_UNITS = 1_000;

// What the page shows besides the code: each country's best trade agreement or not
export interface FinderOptions {
  withAgreements: boolean;
}

// The fields across the top of the page's header card
export const FinderInputs = ({ f, options, onOptions }: { f: TariffFinder; options: FinderOptions; onOptions: (o: FinderOptions) => void }) => (
  <div className="flex flex-col gap-3 px-5 py-4 sm:px-6">
    {f.loading ? (
      <div className={`${ui.skeleton} h-14 w-full`} />
    ) : (
      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,28rem)_auto] [&_input]:text-sm" data-density="compact">
        <RailField
          label="HTS code"
          htmlFor="sf-hts"
          action={
            <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-xs`} onClick={() => f.openExplore()}>
              <MagnifyingGlassIcon className="h-3 w-3" />
              Search
            </button>
          }
        >
          <HtsCodeField id="sf-hts" selectedElement={f.selectedElement} onSelect={(el) => f.selectElement(el, "sourcing")} autoFocus={!f.codeParam} hidePath />
        </RailField>
        <Switch
          label="Include trade programs"
          checked={options.withAgreements}
          onChange={(withAgreements) => onOptions({ ...options, withAgreements })}
          title="Use each country's best trade agreement rate, where the goods could qualify"
          className="pb-2"
        />
      </div>
    )}
  </div>
);

// Before a code is picked: the user's own imports to start from
const StartHere = ({ f }: { f: TariffFinder }) => {
  const { products } = useTracker();
  // Each code once (the same product from two countries is one search here)
  const picks = products.filter((p, i) => products.findIndex((q) => q.entry.element.htsno === p.entry.element.htsno) === i).slice(0, 8);
  return (
    <div className={`${tt.panel} flex flex-col gap-4 p-6`}>
      <div className="flex flex-col gap-1">
        <h2 className={tt.title}>Where Should You Source It From?</h2>
        <p className={tt.body}>
          Enter an HTS code to rank every country on landed cost, proven production, reliability and transit time, with the sources behind each figure.
        </p>
      </div>
      {picks.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={tt.eyebrow()}>From your imports</span>
          <div className="flex flex-wrap gap-2">
            {picks.map((p) => (
              <button
                key={p.key}
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-base-300 px-3 py-1.5 text-sm hover:bg-tt-soft"
                onClick={() => f.selectElement(p.entry.element, "sourcing_import")}
              >
                <span className={`${mono.className} font-semibold`}>{p.entry.element.htsno}</span>
                <span className="max-w-56 truncate text-base-content/60">{p.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Sources = ({ capacity, months, level }: { capacity: { year: number; source: string; url: string } | null; months: string[]; level: string | null }) => (
  <footer className={`${tt.caption} flex flex-col gap-2 px-1 leading-relaxed`}>
    <p className="m-0">
      <strong className="font-semibold text-base-content/70">How this works.</strong> Landed cost is the duty from each country as a share of the goods&apos; value (our tariff engine, today&apos;s rates;
      a duty per unit or per kg is taken at the average US import price for the code) plus freight and insurance as a share of value. Each country gets a score out of 100 for each of four things, ranked one at a time (there&apos;s no overall score): capacity (its exports of this product, Export Focus and what the US already buys of it from there), reliability (World Bank governance less any
      compliance flags), speed (transit time to the US) and cost (landed cost). It&apos;s a starting point for a shortlist, not a verdict: a new country of origin needs the goods made there
      (substantial transformation), not only shipped from there, and trade agreement rates need their rules of origin met. Savings are potential.
    </p>
    <p className="m-0">
      <strong className="font-semibold text-base-content/70">Sources.</strong> US imports, freight and insurance, mode of transport and ports of entry: U.S. Census Bureau, international trade data
      {months.length ? `, ${months[0]} to ${months[months.length - 1]}` : ""}
      {level === "HS6" ? " (every code in the 6-digit subheading)" : level === "HS8" ? " (every code under the first 8 digits)" : ""}. {CENSUS_NOTICE} World exports and Export Focus:{" "}
      <a className={ui.link} href={capacity?.url ?? "https://doi.org/10.7910/DVN/FTUUJU"} target="_blank" rel="noreferrer">
        Harvard Growth Lab, Atlas of Economic Complexity
      </a>{" "}
      (HS 2022{capacity ? `, ${capacity.year}` : ""}, CC0); Export Focus is revealed comparative advantage (RCA), worked out from it. Governance:{" "}
      <a className={ui.link} href={governance.wgi.url} target="_blank" rel="noreferrer">
        World Bank Worldwide Governance Indicators
      </a>{" "}
      ({governance.wgi.year}, CC BY 4.0). Logistics:{" "}
      <a className={ui.link} href={governance.lpi.url} target="_blank" rel="noreferrer">
        World Bank Logistics Performance Index
      </a>{" "}
      ({governance.lpi.edition}, CC BY 4.0). Transit time: our estimate from sea distances (
      <a className={ui.link} href={transit.url} target="_blank" rel="noreferrer">
        searoute
      </a>
      , Eurostat&apos;s maritime network) at {transit.knots} knots, before port time. Flags: OFAC, DHS (UFLPA), HTS General Note 3(b) and the AD/CVD cases we track from Commerce.
    </p>
  </footer>
);

const Results = ({ f, options }: { f: TariffFinder; options: FinderOptions }) => {
  const { withAgreements } = options;
  const { htsElements } = useHts();
  const code = f.selectedElement ? htsCodeDigitsOnly(f.selectedElement.htsno) : null;
  const trade = useTrade(code?.length === 10 ? code : null);
  // A standard shipment's units at the code's own average US import price, when Census counts its units
  const exact = trade.data?.exact;
  const units = exact && exact.qty > 0 && exact.conVal > 0 ? Math.max(1, Math.round((SHIPMENT * exact.qty) / exact.conVal)) : DEFAULT_UNITS;
  const product = useMemo(
    () => productFromFinder({ ...f, country: STAND_IN, countries: [STAND_IN], customsValue: SHIPMENT, quantity: units }, htsElements),
    // Only what the rates depend on
    [f.selectedElement, units, htsElements]
  );
  // Other sources on who supplies it (the Atlas's country-to-country data, EU imports)
  const cross = useCrossSources(code);
  const s = useSourcing(code, trade.ready ? product : null, trade, withAgreements, cross?.bilateral ?? null);
  // A country picked anywhere on the page (Top Sources, the chart, the landed costs, the table),
  // open in a dialog, for the product it was picked on
  const [picked, setPicked] = useState<{ product: string; country: string } | null>(null);
  const selected = picked && picked.product === product?.key ? picked.country : null;
  const selectedRow = s.rows.find((r) => r.country.code === selected) ?? null;
  const sector = product ? uflpaSector(product.entry.element.htsno) : null;
  const coverage = useMemo(() => coverageOf(s.rows), [s.rows]);
  const confidence = useMemo(() => usConfidence(s.trade), [s.trade]);
  // The other codes this product's AD/CVD cases name, and what the US imported under each
  const relatedCases = useMemo(() => (code ? relatedCodesOf(s.adcvdCases, code) : []), [s.adcvdCases, code]);
  const related = useRelatedCodes(relatedCases.map(([c]) => c));
  // Thin US data for the code: the context (related codes, other sources) comes first, under the
  // warning, rather than at the foot of the page
  const contextFirst = confidence.level === "thin" || coverage.thin;
  const context = (
    <>
      {related && <RelatedCodes related={related} cases={new Map(relatedCases)} />}
      {cross && <CrossSources data={cross} trade={s.trade} world={s.capacity?.entry ?? null} />}
    </>
  );
  const path = f.selectedElement ? describePath(f.selectedElement, htsElements) : [];

  if (!product) return null;
  const select = (code: string) => setPicked({ product: product.key, country: code });
  // A country's full detail, for the dialog
  const detail = (row: SourcingRow) => (
    <CountryDetail
      row={row}
      months={s.trade?.months ?? []}
      unit={s.trade?.unit ?? null}
      capacityYears={s.capacity ? { year: s.capacity.file.year, prior: s.capacity.file.prior } : null}
      districtYear={s.trade?.districtYear ?? null}
      totalMonthly={s.trade?.total.monthly}
      cases={s.adcvdCases}
      confidence={confidence}
      destinations={cross?.bilateral?.e[row.country.code] ? { years: cross.bilateral.years, ...cross.bilateral.e[row.country.code] } : null}
    />
  );

  return (
    <Modules>
      <div className="flex flex-col gap-1 px-1">
        <p className={`${tt.caption} m-0`}>
          <span className={`${mono.className} font-semibold text-base-content`}>{product.entry.element.htsno}</span>
          {path.length ? ` · ${path.join(" › ")}` : ""}
        </p>
      </div>
      {!s.ready ? (
        <SourcingLoading
          steps={[
            { label: "US imports of this product (Census)", done: trade.ready },
            { label: "World exports of its 6-digit group (Atlas)", done: s.capacityReady },
            { label: "Duty on it from every country", done: s.rows.length > 0 },
            { label: "AD/CVD cases on it", done: s.adcvdReady },
          ]}
        />
      ) : (
        <>
          <MarketStats trade={s.trade} capacity={s.capacity} rows={s.rows} cases={s.adcvdCases} />
          <DataCoverage
            coverage={coverage}
            trade={s.trade}
            capacity={s.capacity ? { year: s.capacity.file.year, entry: s.capacity.entry } : null}
            cases={s.adcvdCases}
            months={s.trade?.months ?? []}
            related={related ?? []}
          />
          {s.trade && <OtherCodes trade={s.trade} />}
          {contextFirst && context}

          {sector && (
            <div className={`${ui.notice("warning")} flex items-start gap-3`} role="note">
              <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <p className="m-0 text-sm">
                <strong>UFLPA high-priority sector ({sector}).</strong> Whichever country you pick, goods made wholly or partly with inputs from Xinjiang are presumed barred under the Uyghur
                Forced Labor Prevention Act, so plan to trace the supply chain back to raw materials.{" "}
                <a className={ui.link} href="https://www.dhs.gov/uflpa" target="_blank" rel="noreferrer">
                  DHS guidance
                </a>
              </p>
            </div>
          )}

          <Shortlist rows={s.rows} onSelect={select} confidence={confidence} />

          <div className="grid grid-cols-1 gap-module xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            {s.capacity?.entry ? (
              <CostCapacityChart rows={s.rows} selected={selected} onSelect={select} />
            ) : (
              <div className={`${tt.panel} p-6`}>
                <p className={tt.body}>No world export figures for this product&apos;s subheading.</p>
              </div>
            )}
            <LandedCost rows={s.rows} selected={selected} onSelect={select} />
          </div>

          <CountryDialog row={selectedRow} onClose={() => setPicked(null)}>
            {selectedRow && detail(selectedRow)}
          </CountryDialog>

          <CountriesTable rows={s.rows} selected={selected} onSelect={select} />
          {!contextFirst && context}

          {s.trade && (
            <p className={`${tt.caption} m-0 px-1`}>
              The US imported {usd(s.trade.total.last.value)} of this in the 12 months to {s.trade.months[s.trade.months.length - 1]}
              {s.trade.total.prior > 0 ? `, ${s.trade.total.last.value >= s.trade.total.prior ? "up" : "down"} ${Math.round(Math.abs(s.trade.total.last.value / s.trade.total.prior - 1) * 100)}% on the year before` : ""}.
            </p>
          )}
          <Sources capacity={s.capacity?.file ?? null} months={s.trade?.months ?? []} level={s.trade?.level ?? null} />
        </>
      )}
    </Modules>
  );
};

export const SourcingFinder = ({ f, options }: { f: TariffFinder; options: FinderOptions }) =>
  f.selectedElement ? (
    <AccountGate
      feature="sourcing"
      page="tracker"
      title="See Where to Source Any Product"
      teaser="Every country ranked on landed cost, proven production, reliability and transit time."
      preview={<TableStandIn />}
      minHeight="min-h-112"
    >
      <Results f={f} options={options} />
    </AccountGate>
  ) : (
    <StartHere f={f} />
  );
