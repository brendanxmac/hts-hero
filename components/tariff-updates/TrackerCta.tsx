import Link from "next/link"
import { ArrowRightIcon, BellAlertIcon, CheckIcon } from "@heroicons/react/20/solid"
import { mono } from "@/components/ui/font"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"

// The Tariff Tracker's offer beside tariff news: the updates, matched to the reader's own imports.
// Free, so the ask is an account, and it opens straight on adding imports. Two sizes: a row in the
// /tariff-updates list, and a card on an HTS code page (named for the code, with what an alert
// looks like), inverted from the page so it stands out.

const HREF = "/tariff-tracker?tab=catalog&add=paste"

export function TrackerCtaRow() {
  return (
    <div className="flex flex-col gap-4 border-b border-base-300 bg-primary/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
          <BellAlertIcon className="h-5 w-5" />
        </span>
        <p className="m-0 self-center text-base font-semibold text-base-content">Get alerted the moment a new tariff update affects any of your imports</p>
      </div>
      <Link href={HREF} className={`${ui.button({ variant: "primary" })} shrink-0 self-start sm:self-center`}>
        Track my imports free
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  )
}

const POINTS = [
  "Every new US tariff action checked against your imports, every 15 minutes",
  "An alert with the rate before and after, by email, Slack or Teams",
  "Potential savings and entry audits on the same imports",
]

export function TrackerCtaFeature({ htsno }: { htsno: string }) {
  return (
    // Inverted from the page (dark on a light page, light on a dark one), so it stands out; theme
    // classes inside follow (.hts-tracker-inverse)
    <section
      aria-labelledby="tracker-cta"
      className={`${tt.panel} hts-tracker-inverse grid gap-8 overflow-hidden border-transparent p-7 text-base-content lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:p-9`}
    >
      <div className="flex flex-col gap-4">
        <span className={`${tt.eyebrow("primary")} flex items-center gap-2`}>
          <BellAlertIcon className="h-4 w-4" aria-hidden />
          Tariff alerts, free
        </span>
        <h2 id="tracker-cta" className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content sm:text-3xl`}>
          Know the moment an update hits <span className={`${mono.className} text-primary`}>{htsno}</span>
        </h2>
        <p className="m-0 text-base leading-relaxed text-base-content/70">
          Add it, with your country of origin, to the free Tariff Tracker. When a new tariff action affects it, you hear about it first, with exactly what
          changes.
        </p>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-base-content/80">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {point}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Link href={HREF} className={ui.button({ variant: "primary" })}>
            Track my imports free
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <span className="text-xs text-base-content/60">Free account · Alerts on up to 10 imports</span>
        </div>
      </div>

      {/* What an alert looks like: an example, labeled as one */}
      <div className="rounded-2xl bg-tt-soft p-5" aria-label="An example tariff alert">
        <div className="flex flex-col gap-3 rounded-xl border border-base-300 border-l-4 border-l-error bg-base-100 p-4 shadow-sm">
          <span className={tt.eyebrow()}>Example alert</span>
          <p className={`${tt.display} m-0 text-sm font-semibold leading-snug text-base-content`}>New tariff action affects 1 of your imports</p>
          <div className="flex items-center justify-between gap-3 border-t border-base-300 pt-3">
            <span className="flex min-w-0 flex-col">
              <span className={`${mono.className} text-sm font-semibold text-base-content`}>{htsno}</span>
              <span className="text-xs text-base-content/60">from your country of origin</span>
            </span>
            <span className="shrink-0 text-sm tabular-nums">
              <span className="text-base-content/50">25% → </span>
              <span className="font-semibold text-error">35%</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
