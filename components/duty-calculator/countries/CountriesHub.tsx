import Link from "next/link";
import type { HubSummary } from "@/libs/country-pages/allCountries";
import { IMPORT_SOURCE } from "@/libs/country-pages/importStats";
import { FaqList } from "@/components/ui/FaqList";
import { SectionHeader } from "@/components/ui/SectionHeader";
import * as ui from "@/components/ui/styles";
import { CountryLinks } from "../country/CountryLinks";
import { CountriesTable, HubRow } from "./CountriesTable";
import { CsvLink, HubButtons, HubCtaCards } from "./HubCtas";

// /duty-calculator/countries: what goods from every country of origin face. Answer first (the
// lead and key facts), then the table, the two next steps, every group of countries as its own
// heading and list, the FAQs and the sources. Everything is server-rendered.

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
  keyFacts,
  groups,
  faqs,
  sources,
  hrefs,
  csvHref,
  verifiedThrough,
  asOf,
  asOfLabel,
}: {
  rows: HubRow[];
  summary: HubSummary;
  lead: string;
  keyFacts: string[];
  groups: { id: string; title: string; note: string; names: string[]; details?: Record<string, string> }[];
  faqs: { question: string; answer: string }[];
  sources: { name: string; url: string | null }[];
  // Where each country's name links: its own page, or its row in the table
  hrefs: Record<string, string>;
  csvHref: string;
  verifiedThrough: string;
  asOf: string;
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
          <h1 className={`${ui.display} max-w-4xl`}>US tariffs by country, 2026</h1>
          <p className={`${ui.lead} max-w-4xl`}>{lead}</p>
          <p className={ui.caption}>
            Tariff rules verified through {verifiedThrough}. Updated <time dateTime={asOf}>{asOfLabel}</time>.
          </p>
          <HubButtons placement="top" />
        </div>
      </header>

      <div className={`${ui.container} flex flex-col gap-16 py-10 sm:gap-20`}>
        <section aria-labelledby="key-facts" className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12">
          <div className="flex flex-col gap-3">
            <h2 id="key-facts" className="text-2xl font-semibold tracking-tight text-base-content">
              Key facts, {asOfLabel}
            </h2>
            <ul className={`${ui.body} flex list-disc flex-col gap-2 pl-5`}>
              {keyFacts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
          <div className="grid content-start gap-3 sm:grid-cols-2" aria-label="Summary">
            <Stat value={summary.forcedLabor.count} label="Forced-labor tariff" note="Countries paying Section 301 forced-labor duties since July 24, 2026" />
            <Stat
              value={summary.countrySpecific.length}
              label="Tariffs of their own"
              note={summary.countrySpecific.map((r) => r.name).join(", ") || "None"}
            />
            <Stat value={summary.withPreferences} label="Trade agreements" note="Countries that can claim a US trade agreement or preference program" />
            <Stat value={summary.none.length} label="No added tariff" note="Countries paying only the base rate and Section 232" />
          </div>
        </section>

        <section id="table" className={ui.section}>
          <SectionHeader kicker="Every country" title="US tariffs by country of origin">
            Sorted by US imports. Countries with their own page link to it; the rest open the calculator set to that
            country. Each row has its own link by country code, for example <a href="#vn" className={ui.link}>#vn</a>.{" "}
            <CsvLink href={csvHref} />.
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
          <div className="grid gap-x-12 gap-y-10 lg:grid-cols-2">
            {groups.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-6 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-base-content">
                  {g.title} <span className="font-normal text-base-content/60">({g.names.length})</span>
                </h3>
                <p className={ui.bodySm}>{g.note}</p>
                <p className={`${ui.body} text-sm`}>
                  {g.names.map((name, i) => (
                    <span key={name}>
                      <a href={hrefs[name]} className="text-base-content/80 hover:text-primary hover:underline">
                        {name}
                      </a>
                      {g.details?.[name] ? ` (${g.details[name]})` : ""}
                      {i < g.names.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </p>
              </div>
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

        <section id="sources" className={ui.section}>
          <SectionHeader kicker="Sources" title="Where these numbers come from">
            Tariffs come from HTS Hero&rsquo;s engine, the same rules as the duty calculator, checked against each HTS
            revision. Import values come from the {IMPORT_SOURCE.name}.
          </SectionHeader>
          <ul className={`${ui.body} flex list-disc flex-col gap-1.5 pl-5`}>
            {[...sources, { name: IMPORT_SOURCE.name, url: IMPORT_SOURCE.url }].map((s) => (
              <li key={s.name}>
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
