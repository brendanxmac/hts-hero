import { TRY_IT_FREE } from "@/components/pricing-calculator/lib/pricing";
import Link from "next/link"
import { ArrowRightIcon, BellAlertIcon, CheckIcon } from "@heroicons/react/20/solid"
import { formatPct } from "@/components/duty-calculator/lib/format"
import { mono } from "@/components/ui/font"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { LOWEST_PER_IMPORT, REVERSE_TRIAL, formatPrice } from "@/components/pricing-calculator/lib/pricing"

// The Tariff Tracker's offer beside tariff news: the updates, matched to the reader's own imports.
// Free for 14 days (REVERSE_TRIAL), then Tariff News alerts free forever, so the ask is an account, and
// it opens straight on adding imports. A card on an HTS code page (named for the code, with what an
// alert looks like), inverted from the page so it stands out. The /tariff-updates pages have
// TariffAlertsBanner above the header instead.

const HREF = "/tariff-tracker?tab=catalog&add=paste"

const POINTS = [
  "Every entry audited for duty you may have overpaid",
  "Every new US tariff action checked against your imports, every hour",
  "An alert with the rate before and after, by email, Slack or Teams",
  "AD/CVD alerts when an import may fall under a case",
]

// The example alert starts from the code's real duty today (the page's estimate), plus a made-up
// 10% tariff, labeled as an example
const EXAMPLE_ADDED = 10
const rate = (pct: number) => formatPct(Math.round(pct * 100) / 100)

export function TrackerCtaFeature({ htsno, today }: { htsno: string; today?: { pct: number; country: string } | null }) {
  const before = today?.pct ?? 25
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
          Eliminate taiff overpayments &amp; surprises
        </span>
        <h2 id="tracker-cta" className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content sm:text-3xl sm:leading-9`}>
          Know the moment a tariff update hits <span className={`${mono.className} text-primary`}>{htsno}</span>
        </h2>
        <p className="m-0 text-base leading-relaxed text-base-content/70">
          Add it, with your country of origin, to the Tariff Tracker, free for {REVERSE_TRIAL.days} days. It flags duty you may have overpaid on your entries,
          and when a new tariff action affects it, you hear about it first, with exactly what changes.
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
            {TRY_IT_FREE}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
          <span className="text-xs text-base-content/60">
            No credit card · Plans as low as {formatPrice(LOWEST_PER_IMPORT)} per import, per month · Tariff News alerts free, forever
          </span>
        </div>
      </div>

      {/* What an alert looks like: an example, labeled as one */}
      <div className="rounded-2xl bg-tt-soft p-5" aria-label="An example tariff alert">
        <div className="flex flex-col gap-3 rounded-xl border border-base-300 border-l-4 border-l-error bg-base-100 p-4 shadow-xs">
          <span className={tt.eyebrow()}>Example alert</span>
          <p className={`${tt.display} m-0 text-sm font-semibold leading-snug text-base-content`}>New tariff action affects 1 of your imports</p>
          <div className="flex items-center justify-between gap-3 border-t border-base-300 pt-3">
            <span className="flex min-w-0 flex-col">
              <span className={`${mono.className} text-sm font-semibold text-base-content`}>{htsno}</span>
              <span className="text-xs text-base-content/60">from {today?.country ?? "your country of origin"}</span>
            </span>
            <span className="shrink-0 text-sm tabular-nums">
              <span className="text-base-content/50">{rate(before)} → </span>
              <span className="font-semibold text-error">{rate(before + EXAMPLE_ADDED)}</span>
            </span>
          </div>
          <p className="m-0 text-xs text-base-content/50">
            {today ? `Its rate today, if a new ${EXAMPLE_ADDED}% tariff were added` : `If a new ${EXAMPLE_ADDED}% tariff were added`}
          </p>
        </div>
      </div>
    </section>
  )
}
