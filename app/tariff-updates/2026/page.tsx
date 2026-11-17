import { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon } from "@heroicons/react/20/solid"
import config from "@/config"
import { renderSchemaJsonLd } from "@/libs/seo"
import { resolveHtsLinks, type PublicUpdate } from "@/libs/tariff-updates/public"
import { getYearUpdates } from "@/libs/tariff-updates/year"
import { THEME } from "@/components/ui/theme"
import { trackerDisplay, trackerSans } from "@/components/ui/font"
import * as mk from "@/components/ui/marketing/styles"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { AuthorityChip } from "@/components/tariff-updates/UpdatesList"
import { DigestButton } from "@/components/tariff-digest/DigestButton"
import { countryOf, formatDay, kindLabel } from "@/components/tariff-updates/labels"
import { NEWS_DOTS, newsToneOf } from "@/components/tariff-tracker/news/tone"

// Every US tariff action of 2026 on one page: a dated log of the published updates, newest
// first, by month, with this week's actions on top. Dated and ordered by each update's latest
// activity, like /tariff-updates. HTS revisions the calculator changelog doesn't describe yet are
// left off (they're noindexed until then: libs/tariff-updates/year.ts).
// A plain crawlable list, no filters. Static, refreshed every hour like the feed.
// A static segment, so it wins over /tariff-updates/[slug] (no update has the slug "2026").

export const revalidate = 3600

const YEAR = 2026
const SITE = `https://${config.domainName}`
const URL = `${SITE}/tariff-updates/${YEAR}`
const TITLE = `Every US Tariff Change in ${YEAR}: Dated Timeline | HTS Hero`
const NAME = `Every US Tariff Change in ${YEAR}`

// How many codes and countries a row shows before "and N more"
const MAX_CODES = 6
const MAX_COUNTRIES = 4

const dayOf = (iso: string) => iso.slice(0, 10)
const utcDate = (day: string) => new Date(`${day}T12:00:00Z`)
const monthOf = (iso: string) => utcDate(dayOf(iso)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })
const monthId = (month: string) => `month-${month.toLowerCase().replace(/\s+/g, "-")}`
// "Nov 20", with the year when it isn't this one: "Jan 9, 2027"
const shortDay = (day: string) =>
  utcDate(day).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(day.startsWith(`${YEAR}-`) ? {} : { year: "numeric" }), timeZone: "UTC" })

// The Monday (YYYY-MM-DD) of the week a day falls in
const mondayOf = (day: string) => {
  const d = utcDate(day)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
const plusDays = (day: string, days: number) => {
  const d = utcDate(day)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

const summaryLine = (updates: PublicUpdate[]) => {
  const latest = updates[0]?.last_activity_at
  return latest
    ? `${updates.length} US tariff ${updates.length === 1 ? "action" : "actions"} so far in ${YEAR}, latest on ${formatDay(latest)}.`
    : `No US tariff actions published for ${YEAR} yet.`
}

export async function generateMetadata(): Promise<Metadata> {
  const updates = await getYearUpdates(YEAR)
  const description = `${summaryLine(updates)} Every new tariff, rate change, exclusion and pause from the White House, Federal Register, CBP and USTR.`
  return {
    title: TITLE,
    description,
    openGraph: { title: NAME, description, url: URL, siteName: "HTS Hero", type: "website" },
    twitter: { card: "summary_large_image", title: NAME, description },
    alternates: { canonical: `/tariff-updates/${YEAR}` },
  }
}

const KindTag = ({ update }: { update: PublicUpdate }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-base-content/70">
    <span className={`h-2 w-2 rounded-full ${NEWS_DOTS[newsToneOf(update.kind)]}`} aria-hidden />
    {kindLabel(update.kind)}
  </span>
)

const LogRow = ({ update, today, links }: { update: PublicUpdate; today: string; links: Record<string, string | null> }) => {
  const codes = update.hts_codes.slice(0, MAX_CODES)
  const countries = update.countries.slice(0, MAX_COUNTRIES)
  const upcoming = update.effective_on && update.effective_on > today ? update.effective_on : null
  return (
    <li className="grid gap-x-6 gap-y-2 px-6 py-5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
      <div className="text-sm text-base-content/60">
        <time dateTime={dayOf(update.last_activity_at)}>{formatDay(update.last_activity_at)}</time>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <AuthorityChip authority={update.authority} />
          <KindTag update={update} />
          {upcoming && <span className={tt.chip("primary")}>From {shortDay(upcoming)}</span>}
        </div>
        <h3 className="text-base font-semibold leading-snug text-base-content">
          <Link href={`/tariff-updates/${update.slug}`} className="hover:text-primary hover:underline underline-offset-4">
            {update.title}
          </Link>
        </h3>
        <p className="line-clamp-1 text-sm leading-relaxed text-base-content/70">{update.summary}</p>
        {(countries.length > 0 || codes.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {countries.map((c) => {
              const country = countryOf(c)
              return (
                <span key={c} className={tt.chip()}>
                  {`${country.flag} ${country.name}`.trim()}
                </span>
              )
            })}
            {update.countries.length > MAX_COUNTRIES && <span className="text-xs text-base-content/60">and {update.countries.length - MAX_COUNTRIES} more</span>}
            {codes.map((code) => {
              const href = links[code]
              return href ? (
                <Link key={code} href={href} className={`${tt.chip()} font-mono hover:border-primary hover:text-primary`}>
                  {code}
                </Link>
              ) : (
                <span key={code} className={`${tt.chip()} font-mono`}>
                  {code}
                </span>
              )
            })}
            {update.hts_codes.length > MAX_CODES && (
              <span className="text-xs text-base-content/60">
                and {update.hts_codes.length - MAX_CODES} more {update.hts_codes.length - MAX_CODES === 1 ? "code" : "codes"}
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export default async function TariffChanges2026Page() {
  const updates = await getYearUpdates(YEAR)
  const today = new Date().toISOString().slice(0, 10)
  const latest = updates[0]?.last_activity_at
  const links = await resolveHtsLinks(Array.from(new Set(updates.flatMap((u) => u.hts_codes.slice(0, MAX_CODES)))))

  // This week (Monday to Sunday); with nothing yet this week, the latest week that had actions
  const thisMonday = mondayOf(today)
  const weekMonday = updates.some((u) => mondayOf(dayOf(u.last_activity_at)) === thisMonday) ? thisMonday : latest ? mondayOf(dayOf(latest)) : null
  const week = weekMonday ? updates.filter((u) => mondayOf(dayOf(u.last_activity_at)) === weekMonday) : []
  const weekLabel = weekMonday ? `${shortDay(weekMonday)} to ${formatDay(plusDays(weekMonday, 6))}` : ""

  const months: { month: string; updates: PublicUpdate[] }[] = []
  for (const u of updates) {
    const month = monthOf(u.last_activity_at)
    if (months[months.length - 1]?.month !== month) months.push({ month, updates: [] })
    months[months.length - 1].updates.push(u)
  }

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex w-full flex-1 flex-col bg-base-200`}>
      {renderSchemaJsonLd({
        "@type": "CollectionPage",
        name: NAME,
        url: URL,
        description: summaryLine(updates),
        ...(latest ? { dateModified: latest } : {}),
        publisher: { "@type": "Organization", name: "HTS Hero", url: SITE },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: updates.length,
          itemListOrder: "https://schema.org/ItemListOrderDescending",
          itemListElement: updates.map((u, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Article",
              name: u.title,
              url: `${SITE}/tariff-updates/${u.slug}`,
              datePublished: u.first_seen_at,
              dateModified: u.last_activity_at,
            },
          })),
        },
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Tariff updates", item: `${SITE}/tariff-updates` },
          { "@type": "ListItem", position: 2, name: String(YEAR), item: URL },
        ],
      })}

      <div className={`${mk.container} flex flex-col gap-10 pb-20 pt-6`}>
        <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
          <Link href="/tariff-updates" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
            Tariff updates
          </Link>
          <span aria-hidden className="mx-1.5">/</span>
          <span>{YEAR}</span>
        </nav>

        {/* The title and the answer, and beside them the sign-up */}
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className={tt.eyebrow("primary")}>US Tariff Timeline {YEAR}</span>
            <h1 className={`${tt.display} text-4xl font-semibold leading-tight text-base-content sm:text-5xl sm:leading-none`}>{NAME}</h1>
            <p className="text-base leading-relaxed text-base-content/70">
              {summaryLine(updates)} Every new tariff, rate change, exclusion, pause and HTS change from the White House, Federal Register, CBP and USTR, newest first, each linked
              to its official documents.
            </p>
            {latest && (
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-base-content/60">
                <span>
                  Updated <time dateTime={dayOf(latest)}>{formatDay(latest)}</time>
                </span>
                <span aria-hidden>·</span>
                <span>Official sources checked every hour</span>
              </p>
            )}
          </div>
          <section aria-labelledby="subscribe" className={`${tt.panel} flex flex-col gap-3 p-6`}>
            <h2 id="subscribe" className={`${tt.title} m-0`}>
              Get Every Change by Email
            </h2>
            <p className="m-0 text-sm leading-relaxed text-base-content/70">A plain-English summary of each new tariff action with the official documents, as it happens or weekly. Free.</p>
            <DigestButton source="tariff-updates-2026" className="self-start" />
          </section>
        </header>

        {week.length > 0 && (
          <section aria-labelledby="this-week" className={`${tt.panel} overflow-clip`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-base-300 px-6 py-4">
              <h2 id="this-week" className={`${tt.title} m-0`}>
                {weekMonday === thisMonday ? "This Week" : "Latest Week"}
              </h2>
              <span className="text-sm text-base-content/60">
                {weekLabel} · {week.length} {week.length === 1 ? "action" : "actions"}
              </span>
            </div>
            <ul className="divide-y divide-base-300">
              {week.map((u) => (
                <LogRow key={u.slug} update={u} today={today} links={links} />
              ))}
            </ul>
          </section>
        )}

        {months.length > 0 ? (
          <div className="flex flex-col gap-4">
            {/* A jump list to each month */}
            <nav aria-label="Months" className="flex flex-wrap items-center gap-1.5">
              <span className={`${tt.eyebrow()} mr-1`}>Jump to</span>
              {months.map(({ month, updates: monthUpdates }) => (
                <a key={month} href={`#${monthId(month)}`} className={`${tt.chip()} hover:border-primary hover:text-primary`}>
                  {month.replace(` ${YEAR}`, "")}
                  <span className="ml-1 tabular-nums text-base-content/50">{monthUpdates.length}</span>
                </a>
              ))}
            </nav>

            <div className={`${tt.panel} overflow-clip`}>
              <div className="flex flex-wrap items-baseline gap-2 border-b border-base-300 px-6 py-4">
                <h2 className={`${tt.title} m-0`}>Every {YEAR} Tariff Change</h2>
                <span className="text-sm tabular-nums text-base-content/50">{updates.length}</span>
              </div>
              {months.map(({ month, updates: monthUpdates }) => (
                <section key={month} aria-labelledby={monthId(month)} className="scroll-mt-6">
                  <h2 id={monthId(month)} className={`${tt.eyebrow()} scroll-mt-6 border-b border-base-300 bg-tt-soft px-6 py-2.5`}>
                    {month}
                  </h2>
                  <ul className="divide-y divide-base-300 border-b border-base-300 last:border-b-0">
                    {monthUpdates.map((u) => (
                      <LogRow key={u.slug} update={u} today={today} links={links} />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        ) : (
          <p className={`${tt.panel} p-6 text-sm text-base-content/70`}>No tariff actions published for {YEAR} yet. New ones appear here within the hour.</p>
        )}

        <section className={`${tt.panel} flex flex-wrap items-center justify-between gap-4 p-7`}>
          <div className="flex max-w-2xl flex-col gap-1">
            <h2 className={tt.title}>What Do These Changes Mean for Your Import?</h2>
            <p className="text-sm text-base-content/70">
              Enter an HTS code and country of origin to see every duty that applies today, line by line. Free, no account needed.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/duty-calculator" className={ui.button({ variant: "primary" })}>
              Open the Tariff Calculator
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/tariff-updates" className={ui.button({ variant: "secondary" })}>
              All Tariff Updates
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
