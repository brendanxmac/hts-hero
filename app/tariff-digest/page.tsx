import { Metadata } from "next"
import config from "@/config"
import { renderSchemaJsonLd } from "@/libs/seo"
import { getPublishedUpdates, type PublicUpdate } from "@/libs/tariff-updates/public"
import { addDays } from "@/tariffs/engine-v2/history"
import { todayIsoDate } from "@/tariffs/engine-v2/dates"
import { darkBand } from "@/components/home/lib/theme"
import { CountUp } from "@/components/ui/marketing/CountUp"
import { Reveal } from "@/components/ui/marketing/Reveal"
import { DigestForm } from "@/components/tariff-digest/DigestForm"
import { InboxPreview } from "@/components/tariff-digest/InboxPreview"
import { UpdateReel } from "@/components/tariff-digest/UpdateReel"
import { display, shortDay, toItems, varied } from "@/components/tariff-digest/parts"

// The Weekly Tariff Digest's sign-up page, made to do one thing: get an email address. Dark and
// quiet, big type, and the real thing on show: the hero's reel and the inbox preview are the
// latest published tariff actions, the numbers count the real feed. Every form is the same weekly
// digest of every law and country; the Tuesday after their first digest, subscribers get the
// Tariff Alerts offer by email (libs/email/digest-followup.ts).

// Static, refreshed hourly so the reel, the preview and the numbers stay current
export const revalidate = 3600

const PATH = "/tariff-digest"
const URL = `https://${config.domainName}${PATH}`
const TITLE = "Weekly Tariff Digest: Every US Tariff Change, Every Monday | HTS Hero"
const DESCRIPTION =
  "A free weekly email of every new US tariff action: new tariffs, rate changes, exclusions and deadlines, for which goods and countries, and from when, with links to the official documents."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: "The Weekly Tariff Digest", description: DESCRIPTION, url: URL, siteName: "HTS Hero", type: "website" },
  twitter: { card: "summary_large_image", title: "The Weekly Tariff Digest by HTS Hero", description: DESCRIPTION },
  alternates: { canonical: PATH },
}

// Where every number and update comes from, officially
const SOURCES = "the White House, USTR, the Federal Register, CBP and the USITC"
const SOURCE_COUNT = 6

const INSIDE = [
  { n: "01", title: "What changed", body: "Each action in plain English: a new tariff, a higher rate, an exclusion, a pause." },
  { n: "02", title: "Who it hits", body: "The goods, the HTS codes and the countries it covers." },
  { n: "03", title: "When it lands", body: "How far it has got, from announced to in the HTS, and the day it takes effect." },
  { n: "04", title: "Where it came from", body: "A link to the official document behind it, every time." },
]

const REEL_SIZE = 12
const PREVIEW_SIZE = 4
const RECENT_DAYS = 90
const MIN_STAT = 3
const UPCOMING_DAYS = 60

// The digest preview: last week's updates when there were a few (as Monday's email would have
// them), else the latest
const previewOf = (updates: PublicUpdate[], today: string) => {
  const from = addDays(today, -7)
  const lastWeek = updates.filter((u) => u.last_activity_at.slice(0, 10) >= from && u.kind !== "hts_revision")
  const period = `${shortDay(from)} – ${shortDay(addDays(today, -1))}`
  if (lastWeek.length >= 3) return { items: varied(lastWeek, PREVIEW_SIZE), heading: `${lastWeek.length} US tariff updates last week`, period }
  return { items: varied(updates, PREVIEW_SIZE), heading: "The latest US tariff updates", period }
}

export default async function TariffDigestPage() {
  const published = await getPublishedUpdates().catch((): PublicUpdate[] => [])
  const today = todayIsoDate()
  const news = published.filter((u) => u.kind !== "hts_revision")
  const reel = toItems(varied(news, REEL_SIZE))
  const preview = previewOf(news, today)
  const since = (iso: string) => news.filter((u) => u.first_seen_at.slice(0, 10) >= iso).length
  const recent = since(addDays(today, -RECENT_DAYS))
  const thisYear = since(`${today.slice(0, 4)}-01-01`)
  const upcoming = news.filter((u) => u.effective_on && u.effective_on > today && u.effective_on <= addDays(today, UPCOMING_DAYS)).length
  // Only figures big enough to make the point; the sources always show
  const stats = [
    { value: recent, label: `US tariff actions in the last ${RECENT_DAYS} days` },
    { value: thisYear, label: `US tariff actions so far in ${today.slice(0, 4)}` },
    { value: upcoming, label: `Changes taking effect in the next ${UPCOMING_DAYS} days` },
  ]
    .filter((s) => s.value >= MIN_STAT)
    .slice(0, 2)
    .concat({ value: SOURCE_COUNT, label: "Official sources checked every hour" })

  return (
    <main className={`${darkBand} w-full flex-1 shrink-0 overflow-hidden`}>
      {renderSchemaJsonLd({
        "@type": "WebPage",
        name: "The Weekly Tariff Digest",
        url: URL,
        description: DESCRIPTION,
        publisher: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
      })}

      {/* Act one: the promise and the form, with the week's actions drifting past */}
      <section className="relative lg:flex lg:min-h-[calc(100svh-80px)] lg:items-center">
        <div className="mx-auto grid w-full max-w-(--breakpoint-xl) grid-cols-1 gap-16 px-6 pb-24 pt-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center lg:px-8 lg:py-16">
          <div className="min-w-0">
            <p className="dg-rise m-0 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              The Weekly Tariff Digest
            </p>
            <h1 className={`${display} m-0 mt-8 text-5xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-6xl xl:text-[4.25rem]`}>
              <span className="dg-rise block" style={{ ["--dg-delay" as string]: "120ms" }}>
                Every US tariff change.
              </span>
              <span className="dg-rise block text-base-content/45" style={{ ["--dg-delay" as string]: "260ms" }}>
                One email. Every Monday.
              </span>
            </h1>
            <p className="dg-rise m-0 mt-8 max-w-2xl text-lg leading-relaxed text-base-content/70 sm:text-xl" style={{ ["--dg-delay" as string]: "420ms" }}>
              New tariffs, rate changes, exclusions and deadlines from the week before. All in plain English, and with the official
              document behind each one.
            </p>
            <div className="dg-rise mt-10 max-w-2xl" style={{ ["--dg-delay" as string]: "560ms" }}>
              <DigestForm source="tariff-digest-hero" autoFocus />
            </div>
            <p className="dg-rise m-0 mt-12 max-w-2xl text-sm leading-relaxed text-base-content/45" style={{ ["--dg-delay" as string]: "700ms" }}>
              Straight from {SOURCES}, checked every hour.
            </p>
          </div>
          <div className="dg-rise hidden min-w-0 lg:block" style={{ ["--dg-delay" as string]: "300ms" }}>
            <UpdateReel items={reel} />
          </div>
        </div>
      </section>

      {/* Act two: what lands in the inbox, with the real week in it */}
      {preview.items.length > 0 && (
        <section className="border-t border-base-content/10">
          <div className="mx-auto grid w-full max-w-(--breakpoint-xl) grid-cols-1 gap-16 px-6 py-28 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-8 lg:py-36">
            <div className="min-w-0">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.2em] text-primary">Inside every issue</p>
              <h2 className={`${display} m-0 mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl`}>
                Five minutes on Monday.
                <span className="block text-base-content/45">Nothing missed all week.</span>
              </h2>
              <ol className="m-0 mt-12 flex list-none flex-col gap-8 p-0">
                {INSIDE.map((p) => (
                  <li key={p.n} className="flex gap-6">
                    <span className={`${display} w-8 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-primary`}>{p.n}</span>
                    <div>
                      <p className={`${display} m-0 text-lg font-semibold`}>{p.title}</p>
                      <p className="m-0 mt-1 text-base leading-relaxed text-base-content/60">{p.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <Reveal className="min-w-0">
              <InboxPreview items={toItems(preview.items)} heading={preview.heading} period={preview.period} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Act three: how much moves, in the real feed's numbers */}
      <section className="border-t border-base-content/10">
        <div className="mx-auto w-full max-w-(--breakpoint-xl) px-6 py-24 lg:px-8 lg:py-28">
          <p className={`${display} m-0 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl`}>
            US tariffs now change by the week. <span className="text-base-content/45">The digest keeps up so you don&apos;t have to.</span>
          </p>
          <dl className={`m-0 mt-16 grid grid-cols-1 gap-12 ${stats.length === 3 ? "sm:grid-cols-3" : stats.length === 2 ? "sm:grid-cols-2" : ""}`}>
            {stats.map((s) => (
              <div key={s.label} className="border-t border-base-content/15 pt-6">
                <dd className={`${display} m-0 text-6xl font-semibold tracking-tight lg:text-7xl`}>
                  <CountUp to={s.value} />
                </dd>
                <dt className="mt-3 text-base text-base-content/60">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* The close: one line, the form again */}
      <section className="border-t border-base-content/10">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-6 py-32 text-center lg:py-44">
          <h2 className={`${display} m-0 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl`}>
            More Tariffs Are Coming.
            <span className="block text-base-content/45">Get Notified When They Do.</span>
          </h2>
          <p className="m-0 mt-8 max-w-xl text-lg leading-relaxed text-base-content/70">
            For importers, brokers and trade teams who&apos;d rather start the week knowing every US tariff change than find out at entry.
          </p>
          <div className="mt-12 w-full max-w-2xl text-left">
            <DigestForm source="tariff-digest-closing" />
          </div>
        </div>
      </section>
    </main>
  )
}
