import { Suspense } from "react";
import Link from "next/link";
import type { CountryPage } from "@/libs/country-pages/countries";
import type { CountryTariffs, ExampleDuty } from "@/libs/country-pages/countryTariffs";
import { CtaPanel } from "@/components/blog";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { TariffFinderPage } from "../calculator";
import { CountryExamples } from "./CountryExamples";
import { CountryLinks } from "./CountryLinks";
import { CountryTariffTables } from "./CountryTariffTables";
import { ExampleComparison, importSentence, tariffSummary, titleName } from "./countryCopy";
import { IMPORT_SOURCE, ImportFacts } from "@/libs/country-pages/importStats";

// /duty-calculator/[country]: the calculator with the country chosen, then what that country's
// goods pay and why. Everything below the calculator is server-rendered for search engines.
export function CountryCalculatorPage({
  country,
  tariffs,
  examples,
  faqs,
  verifiedThrough,
  asOfLabel,
  facts,
  comparison,
}: {
  country: CountryPage;
  tariffs: CountryTariffs;
  examples: ExampleDuty[];
  faqs: { question: string; answer: string }[];
  verifiedThrough: string;
  asOfLabel: string;
  facts: ImportFacts | null;
  comparison: ExampleComparison | null;
}) {
  const name = titleName(country);
  const path = `/duty-calculator/${country.slug}`;
  return (
    <>
      <header className="w-full border-b border-base-300">
        <div className={`${ui.container} flex flex-col gap-4 pb-8 pt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
            <Link href="/duty-calculator" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
              Duty Calculator
            </Link>
            <span aria-hidden="true" className="mx-1.5">/</span>
            <span className="text-base-content" aria-current="page">{name}</span>
          </nav>
          <span className={ui.kicker}>{name} to US</span>
          <h1 className={`${ui.display} max-w-4xl`}>{name} to US tariff calculator</h1>
          <p className={`${ui.lead} max-w-3xl`}>{tariffSummary(country, tariffs)}</p>
          {facts && (
            <p className={`${ui.body} max-w-3xl`}>
              {importSentence(country, facts)}{" "}
              <a href={IMPORT_SOURCE.url} rel="noopener" className={ui.link}>
                Source: US Census Bureau
              </a>
              .
            </p>
          )}
          <p className={ui.caption}>
            Rates verified through {verifiedThrough}. Page updated {asOfLabel}.
          </p>
        </div>
      </header>

      <div className="pt-6">
        <BreadcrumbsProvider>
          <Suspense fallback={<div className={`${ui.container}`}><div className={`${ui.card} h-64`} /></div>}>
            <TariffFinderPage defaultCountry={country.code} path={path} />
          </Suspense>
        </BreadcrumbsProvider>
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding} flex flex-col gap-16 sm:gap-20`}>
          <section className={ui.section}>
            <SectionHeader kicker="Tariffs" title={`US tariffs on goods from ${country.name}`}>
              The Chapter 99 tariffs written for {country.name}, in force on {asOfLabel}, from the same data as the calculator.
            </SectionHeader>
            <CountryTariffTables tariffs={tariffs} countryName={country.name} />
          </section>

          {examples.length > 0 && (
            <section className={ui.section}>
              <SectionHeader kicker="Examples" title={`What common products from ${country.name} pay`}>
                {comparison ? `The same products from ${comparison.name} alongside, for comparison.` : null}
              </SectionHeader>
              <CountryExamples examples={examples} calculatorPath={path} countryName={name} comparison={comparison} />
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
            <div className="lg:sticky lg:top-6 lg:self-start">
              <SectionHeader kicker="FAQ" title="Questions">
                More in the <Link href="/duty-calculator/faq" className={ui.link}>calculator FAQ</Link>.
              </SectionHeader>
            </div>
            <FaqList faqs={faqs} openFirst />
          </section>

          <section className={ui.section}>
            <SectionHeader kicker="Other countries" title="Tariff calculators by country" />
            <CountryLinks current={country.slug} />
          </section>
        </div>
      </div>

      <div className={ui.band}>
        <div className={`${ui.container} ${ui.bandPadding}`}>
          <CtaPanel kind="tracker" />
        </div>
      </div>
    </>
  );
}
