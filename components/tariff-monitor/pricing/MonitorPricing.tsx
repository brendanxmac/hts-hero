import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import {
  ANNUAL_DISCOUNT,
  FREE_TRACKED_PAIRS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_DAYS,
  TRIAL_PAIRS,
  formatPrice,
} from "@/components/pricing-calculator/lib/pricing";
import { TRACKER_FEATURES, TRACKER_FREE_FEATURES } from "@/components/pricing-calculator/tariff-pricing/plans";

const Features = ({ items, dark = false }: { items: string[]; dark?: boolean }) => (
  <ul className="flex flex-col gap-3">
    {items.map((f) => (
      <li key={f} className={`flex gap-2.5 text-sm ${dark ? "text-slate-200" : "text-slate-600"}`}>
        <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-teal-300" : "text-teal-600"}`} aria-hidden />
        {f}
      </li>
    ))}
  </ul>
);

// The Tracker's plans in brief: free, then every paid tier, with the full estimator one click away
export const MonitorPricing = () => (
  <section id="pricing" className={`${mk.band} scroll-mt-6`} aria-labelledby="pricing-title">
    <div className={mk.container}>
      <SectionIntro eyebrow="Pricing" title="Start free. Pay as your catalog grows." id="pricing-title" center>
        It&apos;s free for {FREE_TRACKED_PAIRS} products. Try the full Tracker for up to {TRIAL_PAIRS} free for {TRIAL_DAYS}{" "}
        days, then pick a plan for the size of your catalog.
      </SectionIntro>

      <div className="mx-auto mt-14 grid grid-cols-1 max-w-5xl gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <article className={`${mk.card} flex flex-col p-8`} aria-labelledby="plan-free-title">
          <h3 id="plan-free-title" className={mk.h3}>
            Free
          </h3>
          <p className={`${mk.small} mt-1`}>For the few products you import most</p>
          <p className="mt-6 text-5xl font-bold tracking-tight text-slate-900">$0</p>
          <div className="mt-8 flex-1">
            <Features items={TRACKER_FREE_FEATURES} />
          </div>
          <Link href={config.auth.loginUrl} className={`${mk.buttonSecondary} mt-8 w-full`}>
            Start free
          </Link>
        </article>

        <article className="relative flex flex-col overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-2xl shadow-slate-900/20" aria-labelledby="plan-tracker-title">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(30rem_16rem_at_100%_0%,rgba(45,212,191,0.22),transparent)]" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <h3 id="plan-tracker-title" className="text-xl font-semibold">
                Tariff Tracker
              </h3>
              <p className="mt-1 text-sm text-slate-400">Your whole catalog watched, audited and optimized</p>
            </div>
            <span className="rounded-full bg-teal-400/15 px-3 py-1 text-xs font-semibold text-teal-200 ring-1 ring-teal-300/30">
              {TRIAL_DAYS}-day free trial
            </span>
          </div>
          <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TRACKER_TIERS.map((t) => (
              <div key={t.maxPairs} className="flex flex-col-reverse rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                <dt className="text-xs text-slate-400">up to {t.maxPairs} pairs</dt>
                <dd className="text-2xl font-bold tabular-nums">
                  {formatPrice(t.price)}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </dd>
              </div>
            ))}
            <div className="flex flex-col-reverse rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <dt className="text-xs text-slate-400">{TRACKER_MAX_LISTED_PAIRS}+ pairs</dt>
              <dd className="text-xl font-bold text-teal-300">Let&apos;s talk</dd>
            </div>
          </dl>
          <div className="relative mt-8 flex-1">
            <Features items={TRACKER_FEATURES} dark />
          </div>
          <div className="relative mt-8 flex flex-wrap items-center gap-4">
            <Link href={config.auth.loginUrl} className={mk.buttonOnDark}>
              Start your free trial <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
            <Link href="/pricing-calculator#estimate" className="text-sm font-semibold text-teal-200 hover:text-teal-100">
              Estimate your price
            </Link>
          </div>
        </article>
      </div>
      <p className={`${mk.small} mx-auto mt-6 max-w-5xl text-center`}>
        A pair is one HTS code from one country of origin. Prices in USD; save {ANNUAL_DISCOUNT * 100}% with annual billing. The{" "}
        <Link href="/duty-calculator" className={mk.link}>
          Tariff Calculator
        </Link>{" "}
        stays free and unlimited for everyone.
      </p>
    </div>
  </section>
);
