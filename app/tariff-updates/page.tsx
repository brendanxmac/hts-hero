import { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, RssIcon } from "@heroicons/react/20/solid"
import config from "@/config"
import { renderSchemaJsonLd } from "@/libs/seo"
import { getPublishedUpdates } from "@/libs/tariff-updates/public"
import { THEME } from "@/components/ui/theme"
import { trackerDisplay, trackerSans } from "@/components/ui/font"
import { FaqList } from "@/components/ui/FaqList"
import { SectionHeader } from "@/components/ui/SectionHeader"
import * as mk from "@/components/ui/marketing/styles"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { UpdatesList } from "@/components/tariff-updates/UpdatesList"
import { formatDay } from "@/components/tariff-updates/labels"
import { SOURCE_LIST, UPDATES_DEFINITION, UPDATES_FAQS } from "@/components/tariff-updates/content"

// Every published tariff update, newest first. Static, refreshed every 15 minutes like the
// sources behind it.
export const revalidate = 900

const URL = `https://${config.domainName}/tariff-updates`
const TITLE = "Latest US Tariff Updates: Every New Tariff Action | HTS Hero"
const DESCRIPTION =
  "Every new US tariff action from the White House, Federal Register, CBP and USTR, summarized in plain English and followed into the HTS. Checked every 15 minutes."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: "Latest US Tariff Updates", description: DESCRIPTION, url: URL, siteName: "HTS Hero", type: "website" },
  twitter: { card: "summary_large_image", title: "Latest US Tariff Updates", description: DESCRIPTION },
  alternates: { canonical: "/tariff-updates", types: { "application/rss+xml": "/tariff-updates/feed.xml" } },
}

export default async function TariffUpdatesPage() {
  const updates = await getPublishedUpdates()
  const latest = updates[0]?.last_activity_at
  const since = updates.length ? updates.map((u) => u.first_seen_at).sort()[0] : null

  return (
    <div className={`${THEME} hts-tracker ${trackerSans.className} ${trackerDisplay.variable} flex w-full flex-1 flex-col bg-base-200`}>
      {renderSchemaJsonLd({
        "@type": "CollectionPage",
        name: "Latest US Tariff Updates",
        url: URL,
        description: UPDATES_DEFINITION,
        ...(latest ? { dateModified: latest } : {}),
        publisher: { "@type": "Organization", name: "HTS Hero", url: `https://${config.domainName}` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: updates.slice(0, 50).map((u, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${URL}/${u.slug}`,
            name: u.title,
          })),
        },
      })}
      {renderSchemaJsonLd({
        "@type": "FAQPage",
        mainEntity: UPDATES_FAQS.map(({ question, answer }) => ({
          "@type": "Question",
          name: question,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      })}
      {renderSchemaJsonLd({
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "HTS Hero", item: `https://${config.domainName}` },
          { "@type": "ListItem", position: 2, name: "Tariff updates", item: URL },
        ],
      })}

      <div className={`${mk.container} flex flex-col gap-16 pb-20 pt-10`}>
        <header className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="flex max-w-3xl flex-col gap-4">
            <span className={tt.eyebrow("primary")}>US tariff updates</span>
            <h1 className={`${tt.display} text-4xl font-semibold leading-tight text-base-content sm:text-5xl`}>Latest US Tariff Updates</h1>
            <p className="text-lg leading-relaxed text-base-content/70">{UPDATES_DEFINITION}</p>
          </div>
          <div className={`${tt.panel} flex flex-col gap-4 p-6`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={tt.metric}>{updates.length}</div>
                <div className="text-xs text-base-content/60">tariff actions{since ? ` since ${formatDay(since)}` : ""}</div>
              </div>
              <div>
                <div className={tt.metric}>{SOURCE_LIST.length}</div>
                <div className="text-xs text-base-content/60">official sources, checked every 15 minutes</div>
              </div>
            </div>
            {latest && <p className="text-sm text-base-content/70">Latest update: {formatDay(latest)}</p>}
            <a href="/tariff-updates/feed.xml" className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`}>
              <RssIcon className="h-4 w-4" aria-hidden />
              RSS feed
            </a>
          </div>
        </header>

        <UpdatesList updates={updates} />

        <section aria-labelledby="sources" className="flex flex-col gap-6">
          <SectionHeader kicker="Sources" title="Where these updates come from" titleId="sources">
            Official US government publications only. Each update links to every document it&apos;s based on.
          </SectionHeader>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOURCE_LIST.map((s) => (
              <li key={s.id} className={`${tt.panel} flex flex-col gap-2 p-6`}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={`${tt.title} hover:text-primary hover:underline underline-offset-4`}>
                  {s.label}
                </a>
                <p className="text-sm leading-relaxed text-base-content/70">{s.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${tt.panel} flex flex-wrap items-center justify-between gap-4 p-7`}>
          <div className="flex max-w-2xl flex-col gap-1">
            <h2 className={tt.title}>What does an update mean for your import?</h2>
            <p className="text-sm text-base-content/70">
              Enter an HTS code and country of origin to see every duty that applies today, line by line. Free, no account needed.
            </p>
          </div>
          <Link href="/duty-calculator" className={ui.button({ variant: "primary" })}>
            Open the Tariff Calculator
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        </section>

        <section aria-labelledby="faq" className="flex flex-col gap-6">
          <SectionHeader kicker="FAQ" title="About these tariff updates" titleId="faq" />
          <FaqList faqs={UPDATES_FAQS} />
        </section>
      </div>
    </div>
  )
}
