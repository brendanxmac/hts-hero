import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import {
  ANNUAL_DISCOUNT,
  LOWEST_PER_IMPORT,
  REVERSE_TRIAL,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  formatPerImport,
  formatPrice,
  launchPricingActive,
} from "@/components/pricing-calculator/lib/pricing";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { FREE_FOREVER_SHORT, LAUNCH_PITCH, SAVINGS_AUDITS_INCLUDED } from "@/components/ui/marketing/comingSoon";
import { TRACKER_FEATURES, TRACKER_TRIAL_FEATURES } from "@/components/pricing-calculator/tariff-pricing/plans";

const Features = ({ items, dark = false }: { items: string[]; dark?: boolean }) => (
  <ul className="flex flex-col gap-3">
    {items.map((f) => (
      <li key={f} className={`flex gap-2.5 text-sm ${dark ? "text-base-content/70" : "text-base-content/70"}`}>
        <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-primary" : "text-primary"}`} aria-hidden />
        {f}
      </li>
    ))}
  </ul>
);

// The Tracker's plans in brief: what every account gets free (the 14-day reverse trial, then the
// free plan forever), then every paid tier (monthly only
// while TRACKER_ANNUAL_ENABLED is off), with the full estimator one click away
export const MonitorPricing = () => (
  <section id="pricing" className={`${mk.band} scroll-mt-6`} aria-labelledby="pricing-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Pricing" title={`Free for ${REVERSE_TRIAL.days} Days. Then Pay as Your Catalog Grows.`} id="pricing-title" center>
        Every new account gets the whole Tariff Tracker free for {REVERSE_TRIAL.days} days, on up to {REVERSE_TRIAL.imports} imports, with
        no credit card and nothing to start: the 14 days begin when you add your imports. After that, {FREE_FOREVER_SHORT} stay free, forever. To keep alerts
        and impact checks on your imports, pick a plan for the size of your catalog.
      </SectionIntro>

      <div className="mx-auto mt-14 grid grid-cols-1 max-w-5xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <article className={`${mk.card} flex flex-col p-8`} aria-labelledby="plan-free-title">
          <h3 id="plan-free-title" className={mk.h3}>
            Free {REVERSE_TRIAL.days}-Day Trial
          </h3>
          <p className={`${mk.small} mt-1`}>Every new account, from your first imports. No credit card.</p>
          <p className="mt-6 text-5xl font-bold tracking-tight text-base-content">$0</p>
          <div className="mt-8 flex-1">
            <Features items={TRACKER_TRIAL_FEATURES} />
          </div>
          <Link href={config.auth.loginUrl} className={`${mk.buttonSecondary} mt-8 w-full`}>
            Start your free {REVERSE_TRIAL.days}-day trial
          </Link>
        </article>

        <article className="relative flex flex-col overflow-hidden hts-tracker-on-dark rounded-3xl bg-base-200 p-8 text-base-content" aria-labelledby="plan-tracker-title">
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h3 id="plan-tracker-title" className="text-xl font-semibold">
                Tariff Tracker
              </h3>
              <p className="mt-1 text-sm text-base-content/60">
                Every tariff on your imports, tracked · as low as {formatPrice(LOWEST_PER_IMPORT)} per import, per month
              </p>
            </div>
            <span className="rounded-full bg-success px-3 py-1 text-xs font-semibold text-success-content">
              {launchPricingActive() ? "Launch pricing" : "Upgrade any time"}
            </span>
          </div>
          <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {TRACKER_TIERS.map((t) => (
              <div key={t.maxPairs} className="flex flex-col-reverse rounded-xl bg-base-100 p-3 ring-1 ring-base-300">
                <dt className="text-xs text-base-content/60">up to {t.maxPairs} imports</dt>
                <dd className="text-xl font-bold tabular-nums">
                  {formatPrice(t.price)}
                  <span className="text-sm font-normal text-base-content/60">/mo</span>
                  <span className="block text-xs font-normal text-base-content/60">{formatPerImport(t)}</span>
                </dd>
              </div>
            ))}
            <div className="flex flex-col-reverse rounded-xl bg-base-100 p-3 ring-1 ring-base-300">
              <dt className="text-xs text-base-content/60">{TRACKER_MAX_LISTED_PAIRS}+ imports</dt>
              <dd className="text-lg font-bold text-primary">Let&apos;s talk</dd>
            </div>
          </dl>
          <div className="relative mt-8 flex-1">
            <Features items={TRACKER_FEATURES} dark />
          </div>
          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <Link href={config.auth.loginUrl} className={mk.buttonOnDark}>
              Try it free for {REVERSE_TRIAL.days} days <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pricing-calculator#estimate" className="text-sm font-semibold text-primary hover:text-primary">
              Estimate your price
            </Link>
          </div>
          {launchPricingActive() && (
            <p className="relative mt-4 text-sm text-base-content/60">
              {LAUNCH_PITCH}
            </p>
          )}
        </article>
      </div>
      <p className={`${mk.small} mx-auto mt-6 max-w-5xl text-center`}>
        An import is one HTS code from one country of origin. Prices in USD;{" "}
        {TRACKER_ANNUAL_ENABLED ? `save ${ANNUAL_DISCOUNT * 100}% with annual billing.` : "billed monthly."} {SAVINGS_AUDITS_INCLUDED} The{" "}
        <Link href="/duty-calculator" className={mk.link}>
          Tariff Calculator
        </Link>{" "}
        stays free and unlimited for everyone.
      </p>
    </div>
  </section>
);
