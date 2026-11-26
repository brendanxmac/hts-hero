import Link from "next/link";
import { ArrowRightIcon, CalendarDaysIcon, CheckIcon, EnvelopeIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import * as mk from "@/components/ui/marketing/styles";
import type { MediaKitData, Row } from "@/libs/media-kit/types";
import { atLeast, exact, longDate, multiple, percent, shortDate } from "./format";
import { WeeklyBars } from "./WeeklyBars";

// The media kit: HTS Hero's audience, shown to a would-be sponsor, affiliate or data partner so they
// can tell whether it's worth paying for. Every number comes from MediaKitData (live or a dated
// snapshot) and is rounded down; the footer says where each came from and when.

const CONTACT_EMAIL = config.resend.supportEmail;
const CONTACT_SUBJECT = "Partnering with HTS Hero";

const lastFull = <T extends { partial?: boolean }>(weeks: T[]) => [...weeks].reverse().find((w) => !w.partial) ?? weeks[weeks.length - 1];

// Weeks from the first that reached `min`: the chart starts where the site started being found, not
// at months of single digits (which would make any growth multiple look inflated)
const fromFirst = <T,>(weeks: T[], value: (w: T) => number, min: number) => {
  const i = weeks.findIndex((w) => value(w) >= min);
  return i < 0 ? weeks : weeks.slice(i);
};

// Searches with a product or country in them ("tariffs from turkey to usa"), not bare codes
const isPlainWords = (q: string) => /[a-z]{3,}/i.test(q) && !/^\s*(hs|hts)?\s*code?\s*[\d.]+\s*$/i.test(q);

const shareOf = (rows: Row[], label: string) => {
  const total = rows.reduce((s, r) => s + r.clicks, 0);
  const row = rows.find((r) => r.label === label);
  return total && row ? row.clicks / total : 0;
};

const Stat = ({ value, label, note }: { value: string; label: string; note?: string }) => (
  <div className="flex flex-col gap-1 px-6 py-6">
    <span className={`${mk.h3} text-4xl font-bold tabular-nums tracking-tight sm:text-[2.75rem]`}>{value}</span>
    <span className="text-sm font-semibold text-slate-900 skin:text-base-content">{label}</span>
    {note && <span className={mk.small}>{note}</span>}
  </div>
);

const ShareBars = ({ rows, total }: { rows: { label: string; share: number; value?: string }[]; total?: string }) => (
  <ul className="m-0 flex list-none flex-col gap-3 p-0">
    {rows.map((r) => (
      <li key={r.label}>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="truncate font-medium text-slate-800 skin:text-base-content">{r.label}</span>
          <span className="shrink-0 tabular-nums text-slate-500 skin:text-base-content/60">{r.value ?? percent(r.share)}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 skin:bg-tt-soft" aria-hidden>
          <div className="h-full rounded-full bg-teal-500 skin:bg-primary" style={{ width: `${Math.max(r.share * 100, 1)}%` }} />
        </div>
      </li>
    ))}
    {total && <li className={mk.small}>{total}</li>}
  </ul>
);

const SearchChips = ({ title, rows }: { title: string; rows: Row[] }) => (
  <div>
    <p className="text-sm font-semibold text-slate-800 skin:text-base-content">{title}</p>
    <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0">
      {rows.map((q) => (
        <li key={q.label} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 skin:border-base-300 skin:bg-tt-soft skin:text-base-content/80">
          {q.label} <span className="ml-1 tabular-nums text-slate-400 skin:text-base-content/50">{atLeast(q.impressions)}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ContactButtons = ({ dark = false }: { dark?: boolean }) => (
  <div className="flex flex-col gap-3 sm:flex-row">
    <a href={config.bookCallUrl} target="_blank" rel="noopener noreferrer" className={dark ? mk.buttonOnDark : mk.buttonPrimary}>
      <CalendarDaysIcon className="h-5 w-5" aria-hidden /> Book a 15-minute call
    </a>
    <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(CONTACT_SUBJECT)}`} className={dark ? mk.buttonGhostDark : mk.buttonSecondary}>
      <EnvelopeIcon className="h-5 w-5" aria-hidden /> {CONTACT_EMAIL}
    </a>
  </div>
);

export const MediaKit = ({ data }: { data: MediaKitData }) => {
  const { search, ai, audience, site } = data;
  const growth = search.prev28 ? multiple(search.last28.clicks, search.prev28.clicks) : null;
  const week = lastFull(audience.weekly);
  const aiWeek = ai ? lastFull(ai.weekly) : null;
  const deviceTotal = search.devices.reduce((s, d) => s + d.clicks, 0);
  const desktop = deviceTotal ? (search.devices.find((d) => d.label.toLowerCase() === "desktop")?.clicks ?? 0) / deviceTotal : 0;
  const us = audience.countries.find((c) => c.label === "United States")?.share ?? 0;
  const countryShare = shareOf(search.pageGroups, "Country tariff calculators");
  const groupTotal = search.pageGroups.reduce((s, r) => s + r.clicks, 0);
  // The most-seen searches, which are mostly HTS and Chapter 99 codes, and the most-clicked searches in
  // plain words, which show what people are trying to do
  const bySeen = [...search.topQueries].sort((a, b) => b.impressions - a.impressions);
  const codeSearches = bySeen.filter((q) => !isPlainWords(q.label)).slice(0, 8);
  const wordSearches = search.topQueries.filter((q) => isPlainWords(q.label)).slice(0, 8);
  const searchWeeks = fromFirst(search.weekly, (w) => w.clicks, 20);
  const aiWeeks = ai ? fromFirst(ai.weekly, (w) => w.impressions, 500) : [];
  const firstWeek = searchWeeks[0];
  const lastWeek = lastFull(search.weekly);
  const weeklyGrowth = firstWeek && lastWeek ? multiple(lastWeek.clicks, Math.max(firstWeek.clicks, 1)) : null;
  // Below a few hundred, a subscriber count undersells the slot; the copy says it's new instead
  const digestCount = site.digestSubscribers !== null && site.digestSubscribers >= 250 ? site.digestSubscribers : null;

  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {/* Hero */}
      <header className={`${mk.bandTint} border-b border-slate-200`}>
        <div className={`${mk.container} pb-16 pt-16 lg:pb-20 lg:pt-20`}>
          <p className={mk.eyebrow}>Partner with HTS Hero</p>
          <h1 className={`${mk.display} mt-4 max-w-4xl`}>Reach US Importers the Moment They Price a Shipment</h1>
          <p className={`${mk.lead} mt-6 max-w-3xl`}>
            Importers, ecommerce sellers and sourcing teams use HTS Hero to look up the US duty on what they buy abroad. Put your
            company next to that answer, when they&apos;re deciding where to source, how to pay their supplier and how to ship.
          </p>
          <div className="mt-10">
            <ContactButtons />
          </div>
        </div>

        <div className={`${mk.container} pb-16`}>
          <div className={`${mk.card} grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-y-0 skin:divide-base-300`}>
            <Stat
              value={atLeast(search.last28.clicks)}
              label="Visits from Google, last 28 days"
              note={growth ? `${growth} the 28 days before` : undefined}
            />
            <Stat value={atLeast(search.last28.impressions)} label="Google search appearances, last 28 days" note={`Average position ${search.last28.position.toFixed(1)}`} />
            <Stat value={atLeast(week.visitors)} label="Visitors a week" note={`${atLeast(week.pageViews)} page views, week of ${shortDate(week.week)}`} />
            {aiWeek ? (
              <Stat value={atLeast(aiWeek.impressions)} label="Google AI answers a week" note="Times we appear in AI Overviews and AI Mode" />
            ) : (
              <Stat value={atLeast(week.calculatorResults)} label="Duty results a week" note="Calculations people ran" />
            )}
          </div>
        </div>
      </header>

      {/* Growth */}
      <section className={mk.band} aria-labelledby="growth-title">
        <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:items-center`}>
          <div>
            <p className={mk.eyebrow}>Growth</p>
            <h2 id="growth-title" className={`${mk.h2} mt-3`}>
              {weeklyGrowth ? `${weeklyGrowth} More Visits From Google Since Early ${monthOf(firstWeek.week)}` : "Growing Every Week"}
            </h2>
            <p className={`${mk.body} mt-5`}>
              Visits from Google search, week by week. HTS Hero ranks on page one for country-to-US tariff searches and thousands of HTS
              codes, and new pages are added every week.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {[
                `${site.countryPages} country tariff calculators ("Vietnam to US tariff calculator")`,
                `${atLeast(site.htsPages)} HTS code pages with duty rates by country`,
                `${site.programHubs} guides to US tariff programs (Section 232, 301, IEEPA and more)`,
                site.tariffUpdates ? `${atLeast(site.tariffUpdates)} plain-English tariff news articles` : "A tariff news feed checked every hour",
              ].map((item) => (
                <li key={item} className={`${mk.body} flex gap-2.5`}>
                  <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-teal-600 skin:text-primary" aria-hidden /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${mk.card} p-6 sm:p-8`}>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h3 className={mk.h3}>Visits from Google, by week</h3>
              <span className={mk.small}>Google Search Console</span>
            </div>
            <WeeklyBars name="Visits from Google" bars={searchWeeks.map((w) => ({ label: shortDate(w.week), value: w.clicks, partial: w.partial }))} />
            {searchWeeks.some((w) => w.partial) && <p className={`${mk.small} mt-3`}>* Week in progress</p>}
          </div>
        </div>
      </section>

      {/* AI */}
      {ai && aiWeek && (
        <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="ai-title">
          <div className={`${mk.container} grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-center`}>
            <div className={`${mk.card} order-2 p-6 sm:p-8 lg:order-1`}>
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h3 className={mk.h3}>Appearances in Google AI answers, by week</h3>
                <span className={mk.small}>Google Search Console</span>
              </div>
              <WeeklyBars name="AI answer appearances" bars={aiWeeks.map((w) => ({ label: shortDate(w.week), value: w.impressions, partial: w.partial }))} />
            </div>
            <div className="order-1 lg:order-2">
              <p className={mk.eyebrow}>AI search</p>
              <h2 id="ai-title" className={`${mk.h2} mt-3`}>Cited Where Importers Ask AI</h2>
              <p className={`${mk.body} mt-5`}>
                Google&apos;s AI Overviews and AI Mode show HTS Hero {atLeast(aiWeek.impressions)} times a week as a source for tariff
                questions. As more importers ask AI instead of searching, that&apos;s where the audience is heading, and we&apos;re already
                there.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Audience */}
      <section className={mk.band} aria-labelledby="audience-title">
        <div className={mk.container}>
          <div className="max-w-3xl">
            <p className={mk.eyebrow}>The audience</p>
            <h2 id="audience-title" className={`${mk.h2} mt-3`}>People About to Import Something</h2>
            <p className={`${mk.lead} mt-5`}>
              Visitors come with a product and a country in mind: &ldquo;what will the duty be if I import this from Vietnam?&rdquo; Most look it
              up on a desktop at work, and many run more than one calculation per visit.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className={`${mk.card} p-6`}>
              <h3 className={mk.h3}>Where they are</h3>
              <p className={`${mk.small} mt-1`}>
                Share of {audience.countryBasis}, {us ? `${percent(us)} in the US` : "by country"}
              </p>
              <div className="mt-6">
                <ShareBars rows={audience.countries.slice(0, 8).map((c) => ({ label: c.label, share: c.share }))} />
              </div>
              <p className={`${mk.small} mt-5`}>Outside the US, they&apos;re mostly in countries that sell to the US: Canada, Brazil, China, the UK and Germany lead.</p>
            </div>

            <div className={`${mk.card} p-6`}>
              <h3 className={mk.h3}>What they look at</h3>
              <p className={`${mk.small} mt-1`}>Share of visits from Google, {search.breakdownPeriod}</p>
              <div className="mt-6">
                <ShareBars
                  rows={search.pageGroups
                    .filter((g) => g.clicks > 0)
                    .slice(0, 7)
                    .map((g) => ({ label: g.label, share: groupTotal ? g.clicks / groupTotal : 0 }))}
                />
              </div>
            </div>

            <div className={`${mk.card} flex flex-col gap-6 p-6`}>
              <div>
                <h3 className={mk.h3}>How they use it</h3>
                <p className={`${mk.small} mt-1`}>Week of {shortDate(week.week)}</p>
              </div>
              <dl className="m-0 grid grid-cols-1 gap-5">
                {[
                  { value: atLeast(week.calculatorResults), label: "Duty calculations run" },
                  { value: atLeast(week.pageViews), label: "Page views" },
                  { value: desktop ? percent(desktop) : null, label: "Of Google visits on a desktop, mostly at work" },
                ]
                  .filter((d) => d.value)
                  .map((d) => (
                    <div key={d.label} className="border-b border-slate-200 pb-5 last:border-0 last:pb-0 skin:border-base-300">
                      <dt className={`${mk.h3} text-3xl font-bold tabular-nums`}>{d.value}</dt>
                      <dd className={`${mk.small} m-0 mt-1`}>{d.label}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>

          <div className={`${mk.card} mt-6 p-6`}>
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className={mk.h3}>Searches we show up for</h3>
              <span className={mk.small}>Most-seen searches, {search.breakdownPeriod}, not counting searches for our name</span>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <SearchChips title="Tariff codes, most seen" rows={codeSearches} />
              <SearchChips title="Plain-word searches, most clicked" rows={wordSearches} />
            </div>
            <p className={`${mk.small} mt-4`}>
              Numbers are how often each search showed HTS Hero. Google hides most individual searches, so these are examples.
            </p>
          </div>
        </div>
      </section>

      {/* Placements */}
      <section className={`${mk.band} ${mk.bandMuted}`} aria-labelledby="placements-title">
        <div className={mk.container}>
          <div className="max-w-3xl">
            <p className={mk.eyebrow}>Where your brand appears</p>
            <h2 id="placements-title" className={`${mk.h2} mt-3`}>Placements Built Around the Next Step</h2>
            <p className={`${mk.lead} mt-5`}>
              Once someone knows the duty, the next questions are where to source, how to pay the supplier, how to ship and how to cover
              the bond. Your offer sits right there, clearly labelled as a partner.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                name: "Next Steps for This Import",
                where: "Under every duty calculator result",
                reach: `${atLeast(week.calculatorResults)} duty results a week`,
                body: "A short box under the result with up to 3 partners, each matched to the import: sourcing for the country, paying the supplier, shipping it.",
              },
              {
                name: "Featured Partner by Country",
                where: `On the ${site.countryPages} country tariff calculator pages`,
                reach: countryShare ? `${percent(countryShare)} of all visits from Google` : "Our most-visited pages",
                body: 'One partner per category on pages like "Vietnam to US tariff calculator": suppliers, inspection, freight or payments for that country.',
              },
              {
                name: "Tariff Digest Sponsor",
                where: "In the Tariff Digest emails",
                reach: digestCount ? `${atLeast(digestCount)} subscribers` : "A new list, growing every week",
                body: "Every new US tariff action in plain English, weekly or as it happens. One sponsor per issue, at the top.",
              },
              {
                name: "Data and API Partners",
                where: "For platforms, research and analytics teams",
                reach: "Full US duty stack by HTS code and country, with history",
                body: "License HTS Hero's tariff data: every Chapter 99 tariff with its source and dates, rate history, and a structured feed of every new tariff action.",
              },
            ].map((p) => (
              <article key={p.name} className={`${mk.card} flex flex-col p-6 sm:p-7`}>
                <p className={`${mk.small} font-semibold uppercase tracking-wider`}>{p.where}</p>
                <h3 className={`${mk.h3} mt-2 text-2xl`}>{p.name}</h3>
                <p className={`${mk.body} mt-3 flex-1`}>{p.body}</p>
                <p className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800 skin:bg-primary/10 skin:text-primary">
                  {p.reach}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`${mk.card} p-6 sm:p-7`}>
              <h3 className={mk.h3}>A Good Fit If You Offer</h3>
              <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  "Supplier sourcing",
                  "Inspection and quality control",
                  "International payments and FX",
                  "Inventory and trade financing",
                  "Freight and fulfilment",
                  "Customs bonds",
                  "Trade and inventory software",
                  "Ecommerce tools for importers",
                ].map((item) => (
                  <li key={item} className={`${mk.body} flex gap-2.5`}>
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-teal-600 skin:text-primary" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${mk.card} p-6 sm:p-7`}>
              <h3 className={mk.h3}>How We Work</h3>
              <ul className="mt-5 flex flex-col gap-2.5">
                {[
                  "One partner per category, so you're never next to a competitor",
                  "Clearly labelled as a partner; we never pass it off as our own advice",
                  "A flat monthly fee, month to month, or an affiliate arrangement",
                  "Placements only where they help the importer's next step",
                ].map((item) => (
                  <li key={item} className={`${mk.body} flex gap-2.5`}>
                    <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-teal-600 skin:text-primary" aria-hidden /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className={`${mk.band} ${mk.bandDark}`} aria-labelledby="contact-title">
        <div className={`${mk.container} flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between`}>
          <div className="max-w-2xl">
            <h2 id="contact-title" className={mk.h2Dark}>
              Put Your Company in Front of Importers
            </h2>
            <p className={`${mk.leadDark} mt-5`}>Tell us what you offer and we&apos;ll suggest the placement that fits, with the numbers behind it.</p>
          </div>
          <ContactButtons dark />
        </div>
      </section>

      {/* Sources */}
      <footer className="border-t border-slate-200 py-10 skin:border-base-300">
        <div className={`${mk.container} flex flex-col gap-2`}>
          <p className={mk.small}>
            Search: Google Search Console, through {longDate(search.asOf)}
            {ai ? `; AI answers through ${longDate(ai.asOf)}` : ""}. Audience: Mixpanel, bot traffic filtered, week of {shortDate(week.week)}
            {audience.source === "snapshot" ? ` (as of ${longDate(audience.asOf)})` : ""}. Every number is rounded down.
          </p>
          <p className={mk.small}>
            Search figures to the day: {exact(search.last28.clicks)} visits and {exact(search.last28.impressions)} appearances from{" "}
            {longDate(addDays(search.asOf, -27))} to {longDate(search.asOf)}.{" "}
            <Link href="/duty-calculator" className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:underline skin:text-primary">
              See the calculator <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
};

const monthOf = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleString("en-US", { month: "long", timeZone: "UTC" });

const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
