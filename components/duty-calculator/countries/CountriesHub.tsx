import Link from "next/link";
import type { HubSummary } from "@/libs/country-pages/allCountries";
import { IMPORT_SOURCE } from "@/libs/country-pages/importStats";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { CountryLinks } from "../country/CountryLinks";
import { FaqDisclosures } from "../country/FaqDisclosures";
import { CountriesTable, HubRow } from "./CountriesTable";
import { GroupCard } from "./GroupCard";
import { HubGroup } from "./hubCopy";
import { CsvLink, HubButtons, HubCtaCards } from "./HubCtas";
import { HubOverview, HubStats } from "./HubOverview";

// /duty-calculator/countries: what goods from every country of origin face. A hero with the
// headline and the four counts, then the key facts beside the overview bar, the table, the two next steps, every group of
// countries, the FAQs and the sources. Everything is server-rendered; long lists fold into
// disclosures and the table scrolls, so nothing leaves the page's HTML. Bands alternate white
// and slate below the hero.

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
      <header className={`${mk.bandTint} relative overflow-hidden`}>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_24rem_at_85%_-10%,rgba(45,212,191,0.18),transparent)]"
        />
        <div
          className={`${mk.container} relative grid grid-cols-1 gap-12 pb-16 pt-8 sm:pb-24 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-end lg:gap-16`}
        >
          <div className="flex min-w-0 flex-col gap-5">
            <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
              <Link href="/duty-calculator" className="font-medium text-slate-600 underline-offset-4 hover:text-teal-700 hover:underline">
                Duty Calculator
              </Link>
              <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
              <span className="text-slate-900" aria-current="page">Tariffs by country</span>
            </nav>
            <span className={`${mk.eyebrow} mt-2 block`}>All {summary.total} countries of origin</span>
            <h1 className={`${mk.display} max-w-4xl`}>US tariffs by country, 2026</h1>
            <p className={`${mk.lead} max-w-3xl`}>{subtitle}</p>
            <p className="inline-flex w-fit max-w-full items-start gap-2 rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-1.5 text-sm text-slate-600 shadow-sm sm:items-center sm:rounded-full">
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 sm:mt-0" aria-hidden />
              <span>
                Tariff rules verified through {verifiedThrough} · Updated <time dateTime={asOf}>{asOfLabel}</time>
              </span>
            </p>
            <div className="pt-3">
              <HubButtons placement="top" />
            </div>
          </div>
          <HubStats summary={summary} />
        </div>
      </header>

      <section aria-labelledby="key-facts" className={`${mk.band} border-t border-slate-200`}>
        <div className={`${mk.container} grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16`}>
          <div className="flex flex-col gap-8">
            <h2 id="key-facts" className={mk.h2}>
              Key facts
            </h2>
            {/* Each fact is a whole sentence (what answer engines quote); the label is for scanning */}
            <dl className="flex flex-col divide-y divide-slate-200 border-y border-slate-200">
              {keyFacts.map((f) => (
                <div key={f.label} className="grid gap-1 py-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
                  <dt className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{f.label}</dt>
                  <dd className="text-base leading-relaxed text-slate-700">{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:pt-20">
            <HubOverview summary={summary} tiers={tiers} />
          </div>
        </div>
      </section>

      <section id="table" className={`${mk.band} ${mk.bandMuted} scroll-mt-6`}>
        <div className={mk.container}>
          <SectionIntro eyebrow="Every country" title="US tariffs by country of origin">
            Search, filter or sort all {summary.total} countries. <CsvLink href={csvHref} />.
          </SectionIntro>
          <div className="mt-10">
            <CountriesTable rows={rows} asOf={asOf} asOfLabel={asOfLabel} />
          </div>
        </div>
      </section>

      <section aria-label="Next steps" className={mk.band}>
        <div className={mk.container}>
          <HubCtaCards placement="after-table" />
        </div>
      </section>

      <section id="groups" className={`${mk.band} ${mk.bandMuted} scroll-mt-6`}>
        <div className={mk.container}>
          <SectionIntro eyebrow="By tariff" title="Countries grouped by what they pay">
            Every country in each group, as of {asOfLabel}.
          </SectionIntro>
          <div className="mt-10 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((g) => (
              <GroupCard key={g.id} group={g} />
            ))}
          </div>
        </div>
      </section>

      <section className={mk.band}>
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

      <section id="sources" className={`${mk.band} ${mk.bandMuted} scroll-mt-6`}>
        <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]`}>
          <SectionIntro eyebrow="Sources" title="Where these numbers come from">
            Tariffs come from HTS Hero&rsquo;s engine, the same rules as the duty calculator, checked against each HTS
            revision.
          </SectionIntro>
          <ul className={`${mk.card} min-w-0 divide-y divide-slate-100 self-start`}>
            {[...sources, { name: IMPORT_SOURCE.name, url: IMPORT_SOURCE.url }].map((s) => (
              <li key={s.name} className="break-words px-6 py-4 text-sm leading-relaxed text-slate-700">
                {s.url ? (
                  <a href={s.url} rel="noopener" className={mk.link}>
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={mk.band}>
        <div className={mk.container}>
          <SectionIntro eyebrow="By country" title="Tariff calculators by country">
            The largest sources of US imports have their own page: their tariffs, what common products pay, and the
            calculator set to that country.
          </SectionIntro>
          <div className="mt-10">
            <CountryLinks showAll={false} />
          </div>
        </div>
      </section>
    </>
  );
}
