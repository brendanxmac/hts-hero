import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import type { HubSummary } from "@/libs/country-pages/allCountries";
import { IMPORT_SOURCE } from "@/libs/country-pages/importStats";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CountryLinks } from "../country/CountryLinks";
import { CountriesTable, HubRow } from "./CountriesTable";

// /duty-calculator/countries: what goods from every country of origin face, in one table, with
// the facts an answer engine needs above it. Everything is server-rendered.

const Stat = ({ value, label, note }: { value: string | number; label: string; note: string }) => (
  <div className={`${ui.card} px-5 py-4`}>
    <div className={ui.label}>{label}</div>
    <div className={`${ui.metric.secondary} mt-1.5`}>{value}</div>
    <div className={`${ui.bodySm} mt-1.5`}>{note}</div>
  </div>
);

export function CountriesHub({
  rows,
  summary,
  lead,
  faqs,
  verifiedThrough,
  asOfLabel,
}: {
  rows: HubRow[];
  summary: HubSummary;
  lead: string;
  faqs: { question: string; answer: string }[];
  verifiedThrough: string;
  asOfLabel: string;
}) {
  return (
    <>
      <header className="w-full border-b border-base-300">
        <div className={`${ui.container} flex flex-col gap-4 pb-8 pt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
            <Link href="/duty-calculator" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
              Duty Calculator
            </Link>
            <span aria-hidden="true" className="mx-1.5">/</span>
            <span className="text-base-content" aria-current="page">Tariffs by country</span>
          </nav>
          <span className={ui.kicker}>All {summary.total} countries of origin</span>
          <h1 className={`${ui.display} max-w-4xl`}>US tariffs by country</h1>
          <p className={`${ui.lead} max-w-4xl`}>{lead}</p>
          <p className={ui.caption}>
            Rates verified through {verifiedThrough}. Import values from the{" "}
            <a href={IMPORT_SOURCE.url} rel="noopener" className={ui.link}>
              US Census Bureau
            </a>
            . Page updated {asOfLabel}.
          </p>
          <div>
            <Link href="/duty-calculator" className={ui.button({ variant: "primary" })}>
              Calculate duty for a product
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>

      <div className={`${ui.container} flex flex-col gap-16 py-10 sm:gap-20`}>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Summary">
          <Stat value={summary.forcedLabor.count} label="Forced-labor tariff" note="Countries paying Section 301 forced-labor duties since July 24, 2026" />
          <Stat
            value={summary.countrySpecific.length}
            label="Tariffs of their own"
            note={summary.countrySpecific.map((r) => r.name).join(", ") || "None"}
          />
          <Stat value={summary.withPreferences} label="Trade agreements" note="Countries that can claim a US trade agreement or preference program" />
          <Stat value={summary.none.length} label="No added tariff" note="Countries paying only the base rate and Section 232" />
        </section>

        <section id="table" className={ui.section}>
          <SectionHeader kicker="Every country" title="What goods from each country face">
            Sorted by US imports. Countries with their own page link to it; the rest open the calculator set to that
            country. Rows link by country code, for example <a href="#vn" className={ui.link}>#vn</a>.
          </SectionHeader>
          <CountriesTable rows={rows} />
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SectionHeader kicker="FAQ" title="Questions">
              More in the <Link href="/duty-calculator/faq" className={ui.link}>calculator FAQ</Link>.
            </SectionHeader>
          </div>
          <FaqList faqs={faqs} openFirst />
        </section>

        <section className={ui.section}>
          <SectionHeader kicker="By country" title="Tariff calculators by country">
            The largest sources of US imports have their own page: their tariffs, what common products pay, and the
            calculator set to that country.
          </SectionHeader>
          <CountryLinks showAll={false} />
        </section>
      </div>
    </>
  );
}
