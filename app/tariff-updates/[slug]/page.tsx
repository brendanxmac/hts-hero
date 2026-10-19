import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRightIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import config from "@/config"
import { renderSchemaJsonLd } from "@/libs/seo"
import { SOURCES } from "@/libs/tariff-sources/types"
import { getPublishedUpdate, getPublishedUpdates, resolveHtsLinks, stagesReached } from "@/libs/tariff-updates/public"
import { stagesFor } from "@/libs/tariff-updates/types"
import { THEME } from "@/components/ui/theme"
import { mono, trackerDisplay, trackerSans } from "@/components/ui/font"
import * as mk from "@/components/ui/marketing/styles"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { AuthorityChip, Countries } from "@/components/tariff-updates/UpdatesList"
import { SubscribeForm } from "@/components/tariff-updates/SubscribeForm"
import { authorityLabel, formatDay, kindLabel, STAGE_DETAIL, STAGE_LABELS } from "@/components/tariff-updates/labels"

// One tariff update: what changed in plain English, the stages it has reached with the official
// document for each, and what it covers (countries, products, HTS codes, linked to their pages).

export const revalidate = 900

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

const SITE = `https://${config.domainName}`
const HTS_SHOWN = 40

const clip = (text: string, max: number) => (text.length <= max ? text : `${text.slice(0, text.lastIndexOf(" ", max - 1))}…`)

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const found = await getPublishedUpdate(params.slug)
  if (!found) return {}
  const { update, indexable } = found
  const description = clip(update.summary, 158)
  return {
    ...(indexable ? {} : { robots: { index: false, follow: true } }),
    title: `${clip(update.title, 70)} | HTS Hero`,
    description,
    openGraph: { title: update.title, description, url: `${SITE}/tariff-updates/${update.slug}`, siteName: "HTS Hero", type: "article" },
    twitter: { card: "summary_large_image", title: update.title, description },
    alternates: { canonical: `/tariff-updates/${update.slug}` },
  }
}

const HtsCode = ({ code, href }: { code: string; href: string | null }) => {
  const className = `${mono.className} rounded-full bg-tt-soft px-2.5 py-1 text-xs text-base-content`
  return href ? (
    <Link href={href} className={`${className} hover:text-primary`}>
      {code}
    </Link>
  ) : (
    <span className={className}>{code}</span>
  )
}

export default async function TariffUpdatePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const found = await getPublishedUpdate(params.slug)
  if (!found) notFound()
  const { update, sources, revisionEntry } = found
  const reached = stagesReached(sources)
  const htsLinks = await resolveHtsLinks(update.hts_codes)
  const related = (await getPublishedUpdates()).filter((u) => u.authority === update.authority && u.slug !== update.slug).slice(0, 4)
  const url = `${SITE}/tariff-updates/${update.slug}`

  const facts = [
    { label: "Law", value: authorityLabel(update.authority) },
    { label: "Kind", value: kindLabel(update.kind) },
    { label: "Effective", value: update.effective_on ? formatDay(update.effective_on) : "Not set yet" },
    { label: "Latest stage", value: STAGE_LABELS[update.stage] },
    ...(update.products ? [{ label: "Covers", value: update.products }] : []),
  ]

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex w-full flex-1 flex-col bg-base-200`}>
      {renderSchemaJsonLd({
        "@type": "Article",
        headline: update.title,
        description: update.summary,
        url,
        datePublished: update.first_seen_at,
        dateModified: update.last_activity_at,
        author: { "@type": "Organization", name: "HTS Hero", url: SITE },
        publisher: { "@type": "Organization", name: "HTS Hero", url: SITE },
        isBasedOn: sources.map((s) => s.url),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: SITE },
          { "@type": "ListItem", position: 2, name: "Tariff updates", item: `${SITE}/tariff-updates` },
          { "@type": "ListItem", position: 3, name: update.title, item: url },
        ],
      })}

      <div className={`${mk.container} flex flex-col gap-10 pb-20 pt-6`}>
        <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
          <Link href="/tariff-updates" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
            Tariff updates
          </Link>
          <span aria-hidden className="mx-1.5">/</span>
          <span>{authorityLabel(update.authority)}</span>
        </nav>

        <header className="flex max-w-4xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <AuthorityChip authority={update.authority} />
            <span className={tt.chip("primary")}>{STAGE_LABELS[update.stage]}</span>
            <span className="text-sm text-base-content/60">Updated {formatDay(update.last_activity_at)}</span>
          </div>
          <h1 className={`${tt.display} text-3xl font-semibold leading-tight text-base-content sm:text-4xl sm:leading-10`}>{update.title}</h1>
          <p className="text-lg leading-relaxed text-base-content/80">{update.summary}</p>
          {update.countries.length > 0 && (
            <p className="text-sm">
              <span className="font-semibold text-base-content">Countries: </span>
              <Countries codes={update.countries} max={30} />
            </p>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-labelledby="timeline" className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`}>
            <div className="flex flex-col gap-1">
              <h2 id="timeline" className={tt.title}>
                How we got here
              </h2>
              <p className="text-sm text-base-content/60">Every official document behind this update, oldest first.</p>
            </div>
            <ol className="flex flex-col">
              {sources.map((s, i) => (
                <li key={`${s.url}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                  {/* The line down to the next step */}
                  {i < sources.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-base-300" aria-hidden />}
                  <span className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary bg-base-100" aria-hidden />
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                      <span className="font-bold uppercase tracking-wider text-primary">{s.stage ? STAGE_LABELS[s.stage] : "Source"}</span>
                      <span className="text-base-content/60">
                        {formatDay(s.published_at)} · {SOURCES[s.source].label}
                        {s.doc_type ? ` · ${s.doc_type}` : ""}
                      </span>
                    </div>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-base-content hover:text-primary hover:underline underline-offset-4">
                      {s.title}
                      <ArrowTopRightOnSquareIcon className="ml-1 inline h-3.5 w-3.5 text-base-content/40" aria-hidden />
                    </a>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex flex-col gap-2 border-t border-base-300 pt-5">
              <span className={tt.eyebrow()}>Stages</span>
              <ol className="flex flex-wrap gap-2">
                {stagesFor(update).map((stage) => (
                  <li
                    key={stage}
                    title={STAGE_DETAIL[stage]}
                    className={reached.includes(stage) ? tt.chip("primary") : `${tt.chip()} opacity-60`}
                  >
                    {reached.includes(stage) ? "✓ " : ""}
                    {STAGE_LABELS[stage]}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <aside className="flex min-w-0 flex-col gap-4">
            <section aria-labelledby="facts" className={`${tt.panel} p-6`}>
              <h2 id="facts" className={`${tt.eyebrow()} mb-3`}>
                At a glance
              </h2>
              <dl className="flex flex-col gap-3 text-sm">
                {facts.map((f) => (
                  <div key={f.label} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-base-content/60">{f.label}</dt>
                    <dd className="font-medium text-base-content">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {update.hts_codes.length > 0 && (
              <section aria-labelledby="codes" className={`${tt.panel} p-6`}>
                <h2 id="codes" className={`${tt.eyebrow()} mb-3`}>
                  HTS codes named ({update.hts_codes.length})
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {update.hts_codes.slice(0, HTS_SHOWN).map((code) => (
                    <HtsCode key={code} code={code} href={htsLinks[code]} />
                  ))}
                </div>
                {update.hts_codes.length > HTS_SHOWN && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-semibold text-primary">Show all {update.hts_codes.length}</summary>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {update.hts_codes.slice(HTS_SHOWN).map((code) => (
                        <HtsCode key={code} code={code} href={htsLinks[code]} />
                      ))}
                    </div>
                  </details>
                )}
              </section>
            )}

            {revisionEntry && (
              <section aria-labelledby="calculator-changes" className={`${tt.panel} flex flex-col gap-2 p-6`}>
                <h2 id="calculator-changes" className={tt.eyebrow("primary")}>
                  In HTS Hero&apos;s calculator
                </h2>
                <p className="text-sm leading-relaxed text-base-content/80">{revisionEntry.summary}</p>
                <Link href="/duty-calculator/changelog" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
                  Calculator changelog, {formatDay(revisionEntry.entry_date)}
                </Link>
              </section>
            )}

            <section aria-labelledby="subscribe" className={`${tt.panel} flex flex-col gap-3 p-6`}>
              <h2 id="subscribe" className={tt.title}>
                Get the next one by email
              </h2>
              <p className="text-sm text-base-content/70">Every new US tariff action, in plain English, as it happens or weekly. Free.</p>
              <SubscribeForm source="update-page" compact />
            </section>

            <section className={`${tt.panel} flex flex-col gap-3 p-6`}>
              <h2 className={tt.title}>Check your import</h2>
              <p className="text-sm text-base-content/70">See every duty on your HTS code and country of origin today, line by line. Free.</p>
              <Link href="/duty-calculator" className={`${ui.button({ variant: "primary" })} self-start`}>
                Open the Tariff Calculator
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            </section>
          </aside>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related" className="flex flex-col gap-4">
            <h2 id="related" className={tt.title}>
              More {authorityLabel(update.authority)} updates
            </h2>
            <ul className="grid gap-4 md:grid-cols-2">
              {related.map((u) => (
                <li key={u.slug} className={`${tt.panel} flex flex-col gap-2 p-6`}>
                  <span className="text-xs text-base-content/60">{formatDay(u.last_activity_at)}</span>
                  <Link href={`/tariff-updates/${u.slug}`} className="font-semibold text-base-content hover:text-primary hover:underline underline-offset-4">
                    {u.title}
                  </Link>
                  <p className="line-clamp-2 text-sm text-base-content/70">{u.summary}</p>
                </li>
              ))}
            </ul>
            <Link href="/tariff-updates" className={`${ui.button({ variant: "secondary" })} self-start`}>
              All tariff updates
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
