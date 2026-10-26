import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { CountryPage } from "@/libs/country-pages/countries";
import type { CountryTariffs, ExampleDuty } from "@/libs/country-pages/countryTariffs";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { BreadcrumbsProvider } from "@/contexts/BreadcrumbsContext";
import { OFFER } from "@/components/home/lib/offer";
import { TariffFinderPage } from "../calculator";
import { CountryExamples } from "./CountryExamples";
import { CountryLinks } from "./CountryLinks";
import { CountryTariffTables } from "./CountryTariffTables";
import { FaqDisclosures } from "./FaqDisclosures";
import { ExampleComparison, tariffSummary, titleName } from "./countryCopy";
import { ImportFactsCard } from "./ImportFactsCard";
import { CountryTopImports } from "./CountryTopImports";
import { TOP_IMPORTS_PRIOR, TOP_IMPORTS_YEAR, type TopImport } from "@/libs/country-pages/topImports";
import type { ImportFacts } from "@/libs/country-pages/importStats";
import { COUNTRY_PRODUCTS } from "@/libs/country-pages/countryProducts";

// /duty-calculator/[country]: the heading and the calculator with the country chosen in one band,
// in the Tariff Tracker's look as on /duty-calculator, then what that country's goods pay and why.
// Everything below the calculator is server-rendered for search engines. Sections below the
// calculator alternate plain and soft bands. Follows light and dark with the site.
export function CountryCalculatorPage({
  country,
  tariffs,
  examples,
  faqs,
  asOfLabel,
  facts,
  comparison,
  topImports = [],
}: {
  country: CountryPage;
  tariffs: CountryTariffs;
  examples: ExampleDuty[];
  faqs: { question: string; answer: string }[];
  asOfLabel: string;
  facts: ImportFacts | null;
  comparison: ExampleComparison | null;
  // What the US imports most from this country (Census), with today's duty
  topImports?: TopImport[];
}) {
  const name = titleName(country);
  const path = `/duty-calculator/${country.slug}`;
  const hasExamples = examples.length > 0;
  const hasTopImports = topImports.length > 0;
  // The calculator's "Try an example" list: what the US imports most from this country (Census),
  // else the hand-picked list, else this page's example products
  const calculatorExamples = (
    hasTopImports
      ? topImports.slice(0, 5).map((t) => ({ code: t.htsno, label: t.label }))
      : COUNTRY_PRODUCTS[country.code] ?? examples.slice(0, 5).map((e) => ({ code: e.htsno, label: e.label }))
  ).map((p) => ({ code: p.code, country: country.code, label: p.label, origin: name }));
  // Tariffs is muted; each later band flips, so two of a kind never touch whichever are missing
  const topMuted = false;
  const examplesMuted = hasTopImports ? !topMuted : false;
  const faqMuted = hasExamples ? !examplesMuted : hasTopImports ? !topMuted : false;
  const band = (muted: boolean) => `${mk.band} ${muted ? mk.bandMuted : "bg-white skin:bg-base-100"}`;

  return (
    <>
      <BreadcrumbsProvider>
        <Suspense
          fallback={
            <div className={mk.container}>
              <div className="h-64 animate-pulse rounded-3xl bg-base-300 tracker:bg-tt-soft-high" />
            </div>
          }
        >
          <TariffFinderPage
            defaultCountry={country.code}
            path={path}
            examples={calculatorExamples.length > 0 ? calculatorExamples : undefined}
          >
            <header
              className={`${mk.container} grid grid-cols-1 gap-8 pb-8 pt-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:gap-16`}
            >
              <div className="flex min-w-0 flex-col gap-4">
                <h1 className="m-0 flex flex-col gap-3">
                  <span className={tt.eyebrow("primary")}>US Import Duty &amp; Tariff Calculator</span>
                  <span className={`${tt.display} max-w-4xl wrap-break-word text-4xl font-semibold leading-tight tracking-tight text-base-content sm:text-5xl sm:leading-none`}>
                    {name} to US Tariff Calculator
                  </span>
                </h1>
                <p className="m-0 max-w-3xl text-base leading-relaxed text-base-content/70 sm:text-lg sm:leading-7">{tariffSummary(country, tariffs)}</p>
              </div>
              {facts && <ImportFactsCard name={country.name} facts={facts} />}
            </header>
          </TariffFinderPage>
        </Suspense>
      </BreadcrumbsProvider>

      <section className={band(true)}>
        <div className={mk.container}>
          <SectionIntro eyebrow="Tariffs" title={`US tariffs on goods from ${country.name}`}>
            The Chapter 99 tariffs written for {country.name}, in force on {asOfLabel}, from the same data as the calculator.
          </SectionIntro>
          <div className="mt-10">
            <CountryTariffTables tariffs={tariffs} countryName={country.name} />
          </div>
        </div>
      </section>

      {hasTopImports && (
        <section className={band(topMuted)}>
          <div className={mk.container}>
            <SectionIntro eyebrow="US imports" title={`What the US imports most from ${country.name}`}>
              The products the US imported most from {country.name} in {TOP_IMPORTS_YEAR}, by HTS code, and the duty each pays today.
            </SectionIntro>
            <div className="mt-10">
              <CountryTopImports rows={topImports} countryName={country.name} calculatorPath={path} year={TOP_IMPORTS_YEAR} prior={TOP_IMPORTS_PRIOR} />
            </div>
          </div>
        </section>
      )}

      {hasExamples && (
        <section className={band(examplesMuted)}>
          <div className={mk.container}>
            <SectionIntro eyebrow="Examples" title={`What common products from ${country.name} pay`}>
              {comparison ? `The same products from ${comparison.name} alongside, for comparison.` : null}
            </SectionIntro>
            <div className="mt-10">
              <CountryExamples examples={examples} calculatorPath={path} countryName={name} comparison={comparison} />
            </div>
          </div>
        </section>
      )}

      <section className={band(faqMuted)}>
        <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}>
          <div className="lg:sticky lg:top-8 lg:self-start">
            <SectionIntro eyebrow="FAQ" title="Questions">
              More in the{" "}
              <Link href="/duty-calculator/faq" className={mk.link}>
                calculator FAQ
              </Link>
              .
            </SectionIntro>
          </div>
          <FaqDisclosures faqs={faqs} />
        </div>
      </section>

      <section className={band(!faqMuted)}>
        <div className={mk.container}>
          <SectionIntro eyebrow="Other countries" title="Tariff calculators by country" />
          <div className="mt-10">
            <CountryLinks current={country.slug} />
          </div>
        </div>
      </section>

      {/* The page-level call to action: watch this country's products in the Tariff Tracker */}
      <section className={mk.band} aria-label="Tariff Tracker">
        <div className={mk.container}>
          <div className="hts-tracker-on-dark relative flex flex-col items-center overflow-hidden rounded-3xl bg-tt-side px-6 py-16 text-center sm:px-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_0%,color-mix(in_oklab,var(--color-primary)_25%,transparent),transparent)]"
            />
            <div className="relative flex flex-col items-center">
              <p className={tt.eyebrow("primary")}>Tariff Tracker</p>
              <p className={`${tt.display} mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-base-content sm:text-5xl sm:leading-none`}>
                No overpayments or surprises on goods from <span className="text-primary">{name}</span>.
              </p>
              <p className="mt-5 max-w-3xl text-lg leading-relaxed text-base-content/70">
                Add your HTS codes once. HTS Hero audits your entries for duty you may have overpaid, checks every new tariff action
                against your products and tells you what changed.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <Link href={OFFER.href} className={`${ui.button({ variant: "primary" })} h-12 px-7 text-base`}>
                  {OFFER.cta}
                  <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </Link>
                <Link href="/tariff-monitor" className="font-semibold text-primary underline-offset-4 hover:underline">
                  How the Tariff Tracker works
                </Link>
              </div>
              <p className="mt-6 max-w-xl text-sm text-base-content/60">{OFFER.note}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
