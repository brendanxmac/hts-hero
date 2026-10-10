import Link from "next/link";
import type { HubSummary } from "@/libs/country-pages/allCountries";
import { IMPORT_SOURCE } from "@/libs/country-pages/importStats";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CountryLinks } from "../country/CountryLinks";
import { CountriesTable, HubRow } from "./CountriesTable";
import { GroupCard } from "./GroupCard";
import { HubGroup } from "./hubCopy";
import { CsvLink, HubButtons, HubCtaCards } from "./HubCtas";
import { HubOverview } from "./HubOverview";

// /duty-calculator/countries: what goods from every country of origin face. A short headline,
// then the key facts beside the overview, the table, the two next steps, every group of
// countries, the FAQs and the sources. Everything is server-rendered; long lists fold into
// disclosures and the table scrolls, so nothing leaves the page's HTML.

export function CountriesHub({
  rows,
  summary,
  subtitle,
  keyFacts,
  tiers,
  groups,
  faqs,
  sources,
  csvHref,
  verifiedThrough,
  asOf,
  asOfLabel,
}: {
  rows: HubRow[];
  summary: HubSummary;
  subtitle: string;
  keyFacts: { label: string; text: string }[];
  tiers: { label: string; count: number }[];
  groups: HubGroup[];
  faqs: { question: string; answer: string }[];
  sources: { name: string; url: string | null }[];
  csvHref: string;
  verifiedThrough: string;
  asOf: string;
  asOfLabel: string;
}) {
  return (
    <>
      <header className="w-full border-b border-base-300">
        <div className={`${ui.container} flex flex-col gap-3 pb-8 pt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
            <Link href="/duty-calculator" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
              Duty Calculator
            </Link>
            <span aria-hidden="true" className="mx-1.5">/</span>
            <span className="text-base-content" aria-current="page">Tariffs by country</span>
          </nav>
          <span className={ui.kicker}>All {summary.total} countries of origin</span>
          <h1 className={`${ui.display} max-w-4xl`}>US tariffs by country, 2026</h1>
          <p className={`${ui.lead} max-w-3xl`}>{subtitle}</p>
          <p className={ui.caption}>
            Tariff rules verified through {verifiedThrough} · Updated <time dateTime={asOf}>{asOfLabel}</time>
          </p>
          <div className="pt-2">
            <HubButtons placement="top" />
          </div>
        </div>
      </header>

      <div className={`${ui.container} flex flex-col gap-16 py-10 sm:gap-20`}>
        <section aria-labelledby="key-facts" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-4">
            <h2 id="key-facts" className={ui.sectionTitle}>
              Key facts
            </h2>
            {/* Each fact is a whole sentence (what answer engines quote); the label is for scanning */}
            <dl className="flex flex-col divide-y divide-base-300 border-y border-base-300">
              {keyFacts.map((f) => (
                <div key={f.label} className="grid gap-1 py-3 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-4">
                  <dt className={`${ui.label} pt-0.5`}>{f.label}</dt>
                  <dd className={ui.bodySm}>{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:pt-12">
            <HubOverview summary={summary} tiers={tiers} />
          </div>
        </section>

        <section id="table" className={ui.section}>
          <SectionHeader kicker="Every country" title="US tariffs by country of origin">
            Search, filter or sort all {summary.total} countries. <CsvLink href={csvHref} />.
          </SectionHeader>
          <CountriesTable rows={rows} asOf={asOf} asOfLabel={asOfLabel} />
        </section>

        <section aria-label="Next steps">
          <HubCtaCards placement="after-table" />
        </section>

        <section id="groups" className={ui.section}>
          <SectionHeader kicker="By tariff" title="Countries grouped by what they pay">
            Every country in each group, as of {asOfLabel}.
          </SectionHeader>
          <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SectionHeader kicker="FAQ" title="Questions">
              More in the <Link href="/duty-calculator/faq" className={ui.link}>calculator FAQ</Link>.
            </SectionHeader>
          </div>
          <FaqList faqs={faqs} openFirst />
        </section>

        <section id="sources" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
          <SectionHeader kicker="Sources" title="Where these numbers come from">
            Tariffs come from HTS Hero&rsquo;s engine, the same rules as the duty calculator, checked against each HTS
            revision.
          </SectionHeader>
          <ul className={`${ui.card} divide-y divide-base-300`}>
            {[...sources, { name: IMPORT_SOURCE.name, url: IMPORT_SOURCE.url }].map((s) => (
              <li key={s.name} className={`${ui.bodySm} px-5 py-3`}>
                {s.url ? (
                  <a href={s.url} rel="noopener" className={ui.link}>
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
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
