import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid"
import config from "@/config"
import { renderSchemaJsonLd } from "@/libs/seo"
import { SOURCES } from "@/libs/tariff-sources/types"
import { getPublishedUpdate, getPublishedUpdates, resolveHtsLinks, type PublicScope } from "@/libs/tariff-updates/public"
import { THEME } from "@/components/ui/theme"
import { mono, trackerDisplay, trackerSans } from "@/components/ui/font"
import * as mk from "@/components/ui/marketing/styles"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { AuthorityChip, Countries } from "@/components/tariff-updates/UpdatesList"
import { DigestButton } from "@/components/tariff-digest/DigestButton"
import { AffectedCheck } from "@/components/tariff-updates/AffectedCheck"
import { authorityLabel, formatDay, kindLabel, STAGE_LABELS } from "@/components/tariff-updates/labels"

// One tariff update: what changed in plain English, the official documents that moved it along,
// and what it covers (countries, products, HTS codes, linked to their pages).
// When the update's scope was read from its PDFs (or set in review), the page shows that: every
// code covered and carved out (added and removed, for a coverage change), its Chapter 99 headings
// and the documents the codes came from. Otherwise, the codes its sources' text named.
// Laid out to be read a section at a time, every box the page's full width on one background: a
// header with the facts in a strip, then the codes first (by heading, with "See if you or your
// clients are affected": AffectedCheck), the calculator's change, the documents behind it, the
// email sign-up and related updates.

export const revalidate = 3600

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return []
}

const SITE = `https://${config.domainName}`

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

// A list of codes, every one shown
const CodeList = ({ codes, links }: { codes: string[]; links: Record<string, string | null> }) => (
  <div className="flex flex-wrap gap-1.5">
    {codes.map((code) => (
      <HtsCode key={code} code={code} href={links[code]} />
    ))}
  </div>
)

// A long list of codes, every one shown, in rows by heading (its first four digits), so it can be
// scanned: "7304 (12)" then its codes. A short one stays a single list.
const GROUP_FROM = 12
const GroupedCodes = ({ codes, links }: { codes: string[]; links: Record<string, string | null> }) => {
  if (codes.length < GROUP_FROM) return <CodeList codes={codes} links={links} />
  const groups = new Map<string, string[]>()
  for (const code of codes) {
    const digits = code.replace(/\D/g, "")
    const key = digits.length >= 4 ? digits.slice(0, 4) : digits || code
    groups.set(key, [...(groups.get(key) ?? []), code])
  }
  if (groups.size < 2) return <CodeList codes={codes} links={links} />
  return (
    <ul className="flex flex-col divide-y divide-base-300 rounded-lg border border-base-300">
      {Array.from(groups.entries()).map(([heading, group]) => (
        <li key={heading} className="grid gap-x-5 gap-y-2 px-4 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-baseline">
          <span className="flex items-baseline gap-1.5">
            <span className={`${mono.className} text-sm font-semibold text-base-content`}>{heading}</span>
            <span className="text-xs text-base-content/50">({group.length})</span>
          </span>
          <CodeList codes={group} links={links} />
        </li>
      ))}
    </ul>
  )
}

// "https://www.whitehouse.gov/wp-content/uploads/2026/09/ANNEX-I-AUTO.pdf" → "ANNEX-I-AUTO.pdf", "whitehouse.gov"
const documentLabel = (url: string) => {
  try {
    const { hostname, pathname } = new URL(url)
    return { name: decodeURIComponent(pathname.split("/").filter(Boolean).pop() ?? hostname), host: hostname.replace(/^www\./, "") }
  } catch {
    return { name: url, host: "" }
  }
}

// A section's heading, what it is, and an action on the right (wraps under on a narrow screen)
const SectionHead = ({ id, title, note, action }: { id: string; title: React.ReactNode; note?: React.ReactNode; action?: React.ReactNode }) => (
  <div className="flex flex-col gap-4 border-b border-base-300 pb-5 lg:flex-row lg:items-start lg:justify-between">
    <div className="flex min-w-0 flex-col gap-1">
      <h2 id={id} className={tt.title}>
        {title}
      </h2>
      {note && <p className="text-sm text-base-content/60">{note}</p>}
    </div>
    {action && <div className="flex shrink-0 flex-col items-start gap-1.5 lg:items-end">{action}</div>}
  </div>
)

// What the update covers, from its scope
const Coverage = ({ scope, kind, links, slug }: { scope: PublicScope; kind: string; links: Record<string, string | null>; slug: string }) => {
  const change = kind === "scope_change"
  const groups = [
    { label: change ? "Added to the duty" : "Covered", codes: scope.codes.filter((c) => c.trim().toUpperCase() !== "ALL"), tone: "primary" as const },
    { label: change ? "Removed from the duty" : "Carved out", codes: scope.excludedCodes, tone: "neutral" as const },
  ].filter((g) => g.codes.length)
  const everything = scope.codes.some((c) => c.trim().toUpperCase() === "ALL")
  return (
    <section aria-labelledby="coverage" className={`${tt.panel} ${tt.panelPad} flex scroll-mt-6 flex-col gap-6`}>
      <SectionHead
        id="coverage"
        title="What it covers"
        note={
          <>
            {everything ? "Every product of the countries named, except the codes carved out below. " : ""}
            HTS codes as listed in the official documents. A heading or subheading covers every code under it.
          </>
        }
        action={<AffectedCheck slug={slug} />}
      />
      {scope.headings.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={tt.eyebrow()}>Chapter 99 {scope.headings.length === 1 ? "heading" : "headings"}</span>
          <CodeList codes={scope.headings} links={links} />
        </div>
      )}
      {groups.map((g) => (
        <div key={g.label} className="flex flex-col gap-2">
          <span className={tt.eyebrow(g.tone)}>
            {g.label} ({g.codes.length})
          </span>
          <GroupedCodes codes={g.codes} links={links} />
        </div>
      ))}
      {scope.conditional.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className={tt.eyebrow()}>May be exempt</span>
          <ul className="flex flex-col gap-3">
            {scope.conditional.map((c) => (
              <li key={c.condition} className="flex flex-col gap-1.5 rounded-lg bg-tt-soft p-4">
                <span className="text-sm text-base-content/80">{c.condition.charAt(0).toUpperCase() + c.condition.slice(1)}</span>
                <CodeList codes={c.codes} links={links} />
              </li>
            ))}
          </ul>
        </div>
      )}
      {scope.documents.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-base-300 pt-5">
          <span className={tt.eyebrow()}>Where these codes come from</span>
          <ul className="flex flex-col gap-1.5">
            {Array.from(new Set(scope.documents)).map((url) => {
              const { name, host } = documentLabel(url)
              return (
                <li key={url} className="text-sm">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-base-content hover:text-primary hover:underline underline-offset-4">
                    {name}
                    <ArrowTopRightOnSquareIcon className="ml-1 inline h-3.5 w-3.5 text-base-content/40" aria-hidden />
                  </a>
                  {host && <span className="ml-2 text-xs text-base-content/60">{host}</span>}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}

export default async function TariffUpdatePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const found = await getPublishedUpdate(params.slug)
  if (!found) notFound()
  const { update, sources, scope, revisionEntry } = found
  const htsLinks = await resolveHtsLinks(
    scope ? [...scope.headings, ...scope.codes, ...scope.excludedCodes, ...scope.conditional.flatMap((c) => c.codes)] : update.hts_codes
  )
  const related = (await getPublishedUpdates()).filter((u) => u.authority === update.authority && u.slug !== update.slug).slice(0, 4)
  const url = `${SITE}/tariff-updates/${update.slug}`
  const named = !scope && update.hts_codes.length > 0
  const official = sources.at(-1)

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
        isBasedOn: Array.from(new Set([...sources.map((s) => s.url), ...(scope?.documents ?? [])])),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: SITE },
          { "@type": "ListItem", position: 2, name: "Tariff updates", item: `${SITE}/tariff-updates` },
          { "@type": "ListItem", position: 3, name: update.title, item: url },
        ],
      })}

      {/* The header, across the page (the page's own color): what happened, then its facts in a strip */}
      <header className="w-full">
        <div className={`${mk.container} flex flex-col gap-8 pb-2 pt-6`}>
          <nav aria-label="Breadcrumb" className="text-sm text-base-content/60">
            <Link href="/tariff-updates" className="text-base-content/70 underline-offset-4 hover:text-primary hover:underline">
              Tariff updates
            </Link>
            <span aria-hidden className="mx-1.5">/</span>
            <span>{authorityLabel(update.authority)}</span>
          </nav>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <AuthorityChip authority={update.authority} />
              <span className={tt.chip("primary")}>{STAGE_LABELS[update.stage]}</span>
              <span className="text-sm text-base-content/60">Updated {formatDay(update.last_activity_at)}</span>
            </div>
            <h1 className={`${tt.display} text-3xl font-semibold leading-tight text-base-content sm:text-4xl sm:leading-[1.15]`}>{update.title}</h1>
            <p className="text-lg leading-relaxed text-base-content/80">{update.summary}</p>
            {update.countries.length > 0 && (
              <p className="text-sm">
                <span className="font-semibold text-base-content">Countries: </span>
                <Countries codes={update.countries} max={30} className="text-base-content" />
              </p>
            )}
            {/* The official source: the newest document behind it, the one that moved it to where it is */}
            {official && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-1">
                <a href={official.url} target="_blank" rel="noopener noreferrer" className={ui.button({ variant: "secondary" })}>
                  Read the official {official.doc_type ? official.doc_type.toLowerCase() : "source"}
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 text-base-content/50" aria-hidden />
                </a>
                <span className="text-sm text-base-content/60">
                  {SOURCES[official.source].label} · {formatDay(official.published_at)}
                </span>
              </div>
            )}
          </div>

          <section aria-labelledby="facts" className={`${tt.panel} ${tt.panelPad} flex flex-col gap-5`}>
            <SectionHead id="facts" title="At a Glance" />
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-flow-col lg:auto-cols-fr lg:grid-cols-none lg:gap-0 lg:divide-x lg:divide-base-300">
              {facts.map((f) => (
                <div key={f.label} className="flex min-w-0 flex-col gap-1.5 lg:px-6 lg:first:pl-0 lg:last:pr-0">
                  <dt className={tt.eyebrow()}>{f.label}</dt>
                  <dd className={`${tt.display} text-lg font-semibold leading-snug text-base-content`}>{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </header>

      <div className={`${mk.container} flex flex-col gap-6 pb-20 pt-6`}>
        {scope && <Coverage scope={scope} kind={update.kind} links={htsLinks} slug={update.slug} />}

        {named && (
          <section aria-labelledby="codes" className={`${tt.panel} ${tt.panelPad} flex scroll-mt-6 flex-col gap-5`}>
            <SectionHead
              id="codes"
              title={`HTS Codes Mentioned (${update.hts_codes.length})`}
              note="The codes the official documents behind this update name, by heading."
              action={<AffectedCheck slug={update.slug} />}
            />
            <GroupedCodes codes={update.hts_codes} links={htsLinks} />
          </section>
        )}

        {revisionEntry && (
          <section aria-labelledby="calculator-changes" className={`${tt.panel} flex scroll-mt-6 flex-col gap-2 border-l-4 border-l-primary p-6`}>
            <h2 id="calculator-changes" className={tt.eyebrow("primary")}>
              In HTS Hero&apos;s calculator
            </h2>
            <p className="text-sm leading-relaxed text-base-content/80">{revisionEntry.summary}</p>
            <Link href="/duty-calculator/changelog" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
              Calculator changelog, {formatDay(revisionEntry.entry_date)}
            </Link>
          </section>
        )}

        <section aria-labelledby="timeline" className={`${tt.panel} ${tt.panelPad} flex scroll-mt-6 flex-col gap-6`}>
          <SectionHead id="timeline" title="How we got here" note="Every official document behind this update, oldest first." />

          <ol className="flex flex-col">
            {sources.map((s, i) => (
              <li key={`${s.url}-${i}`} className="relative flex gap-4 pb-6 last:pb-0">
                {/* The line down to the next step */}
                {i < sources.length - 1 && <span className="absolute left-[7px] top-5 h-full w-px bg-base-300" aria-hidden />}
                {/* Only one so far: a dashed line on to what comes next */}
                {sources.length === 1 && <span className="absolute left-[7px] top-5 h-full border-l border-dashed border-base-300" aria-hidden />}
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
            {/* A single document reads as the whole story without this: say it's the first, and
                  that later ones will follow here */}
            {sources.length <= 1 && (
              <li className="relative flex gap-4">
                <span className="relative mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-dashed border-base-300 bg-base-100" aria-hidden />
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-base-content/50">What comes next</span>
                  <p className="text-sm text-base-content/70">
                    {sources.length
                      ? "This is the first official document on this update so far. Any that follow, like a final notice or CBP guidance, will be added here as they're published."
                      : "No official documents yet. They'll be added here as they're published."}
                  </p>
                </div>
              </li>
            )}
          </ol>
        </section>

        <section aria-labelledby="subscribe" className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex flex-col gap-1">
            <h2 id="subscribe" className={tt.title}>
              Get Tariff News in Your Inbox
            </h2>
            <p className="text-sm text-base-content/70">Every new US tariff action, in plain English, as it happens or weekly. Free.</p>
          </div>
          <DigestButton source="update-page" className="self-start sm:self-center" />
        </section>

        {related.length > 0 && (
          <section aria-labelledby="related" className="flex scroll-mt-6 flex-col gap-4 pt-4">
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
