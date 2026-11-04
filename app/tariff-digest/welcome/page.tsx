import { Metadata } from "next"
import { ArrowRightIcon, CheckIcon, EnvelopeIcon } from "@heroicons/react/20/solid"
import { getAlertExample, type AlertExample } from "@/libs/tariff-alerts-example"
import { nextDigestDay } from "@/libs/email/subscribers"
import { ALERT_TIERS, REVERSE_TRIAL, formatPrice } from "@/components/pricing-calculator/lib/pricing"
import { darkBand } from "@/components/home/lib/theme"
import * as cta from "@/components/ui/marketing/cta"
import * as mk from "@/components/ui/marketing/styles"
import { EntryCta } from "@/components/onboarding/EntryCta"
import { AlertCard } from "@/components/tariff-alerts/hero/AlertCard"
import { display, shortDay } from "@/components/tariff-digest/parts"

// Where a subscriber lands once they're on the list: from the Confirm button in their email (the
// confirm route, ?s=confirmed, &f=instant for news as it happens), or from the sign-up form when the
// address was already subscribed (?s=already_subscribed). Two parts, nothing else: a short dark
// header that says plainly they're subscribed, then the next step up from a
// weekly digest of every tariff: Tariff Alerts on their own imports or their clients', as Duty
// Guard's free trial (REVERSE_TRIAL), in /tariff-alerts' own look with its alert card
// (components/tariff-alerts/hero/AlertCard). The button is the trial sign-up (entry
// digest_welcome), which onboards them on the Alerts step. Not for search.

export const metadata: Metadata = {
  title: "You're Subscribed to the Weekly Tariff Digest | HTS Hero",
  description: "You'll get every US tariff change each Monday. Tariff Alerts tells you the moment one hits your imports or your clients'.",
  robots: { index: false, follow: false },
}

type Status = "confirmed" | "already_subscribed"

const CTA_LABEL = `Get Alerts for Your Imports or Clients`
const PROMISES = [`Free for ${REVERSE_TRIAL.days} days`, "No credit card required", "Set up in 30 seconds"]

export default async function DigestWelcomePage({ searchParams }: { searchParams: Promise<{ s?: string; f?: string }> }) {
  const { s, f } = await searchParams
  const status: Status = s === "already_subscribed" ? s : "confirmed"
  const instant = f === "instant"
  const example = await getAlertExample().catch((): AlertExample | null => null)
  const monday = `Monday, ${shortDay(nextDigestDay())}`
  const already = status === "already_subscribed"

  return (
    <main className={`${mk.page} w-full flex-1 shrink-0`}>
      {/* They're subscribed: said once, big and plain */}
      <section className={`${darkBand} border-b border-base-content/10`}>
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-10 text-center lg:pb-24 lg:pt-14">
          <span className="dg-rise flex h-20 w-20 items-center justify-center rounded-full bg-success text-success-content">
            <CheckIcon className="h-11 w-11" aria-hidden />
          </span>
          <h1 className={`${display} dg-rise m-0 mt-8 text-5xl font-semibold leading-[1.04] tracking-tight sm:text-6xl`} style={{ ["--dg-delay" as string]: "120ms" }}>
            {already ? "You're all set." : "You're subscribed!"}
          </h1>
          <p className="dg-rise m-0 mt-5 text-xl leading-relaxed text-base-content/70" style={{ ["--dg-delay" as string]: "240ms" }}>
            {instant
              ? "Each new US tariff action comes to your inbox the moment it moves."
              : already
                ? `You're already on the list. Your next Weekly Tariff Digest arrives ${monday}.`
                : `Your first Weekly Tariff Digest arrives ${monday}.`}
          </p>
          {/* {!already && (
            <p
              className="dg-rise m-0 mt-8 inline-flex items-center gap-2.5 rounded-full border border-base-content/15 px-5 py-2.5 text-sm text-base-content/80"
              style={{ ["--dg-delay" as string]: "360ms" }}
            >
              <EnvelopeIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              We&apos;ve sent a welcome email to your inbox.
            </p>
          )} */}
        </div>
      </section>

      {/* The next step, in /tariff-alerts' look */}
      <section className={mk.bandTint}>
        <div className={`${mk.container} grid grid-cols-1 gap-14 py-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:py-24`}>
          <div className="min-w-0">
            <p className={`${mk.eyebrow} m-0`}>Your next step · Tariff Alerts</p>
            <h2 className={`${mk.display} m-0 mt-4`}>Want alerts when tariffs affect your imports or your clients?</h2>
            <p className={`${mk.lead} m-0 mt-6`}>
              The digest tells you every change. Tariff Alerts tells you which ones hit your imports, or your clients&apos;, with the duty rate before and after on each product.
            </p>
            <div className="mt-10">
              <EntryCta page="tariff-digest" entry="digest_welcome" section="hero" label={CTA_LABEL} className={`${cta.button} w-full sm:w-auto`}>
                {CTA_LABEL}
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </EntryCta>
            </div>
            <ul className="m-0 mt-6 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
              {PROMISES.map((p) => (
                <li key={p} className={`${mk.small} flex items-center gap-1.5`}>
                  <CheckIcon className="h-4 w-4 text-success" aria-hidden /> {p}
                </li>
              ))}
            </ul>
            <p className={`${mk.small} m-0 mt-8`}>Plans from {formatPrice(ALERT_TIERS[0].price)} a month after the trial. Cancel anytime.</p>
          </div>
          {example && <AlertCard example={example} />}
        </div>
      </section>
    </main>
  )
}
