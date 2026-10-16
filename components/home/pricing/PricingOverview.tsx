"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import config from "@/config";
import { BillingSwitch, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { darkBand, display, moneyButtonMd } from "../lib/theme";
import {
  Billing,
  CLASSIFY_PLANS,
  TRACKER_MAX_LISTED_PAIRS,
  TRACKER_TIERS,
  TRIAL_ALLOWANCE,
  formatPrice,
  monthlyRate,
} from "@/components/pricing-calculator/lib/pricing";

// Pricing at a glance: what's free (the calculator and the Tracker's usage-based trial), and the
// Tariff Tracker priced by catalog size, with a tier picker and the annual discount. Below the cards, a worked example of how a catalog is counted
// (one import per HTS code + country of origin), then classification as its own line. Every number
// comes from the price list (PRICING.md).

const FREE_INCLUDES = [
  "Tariff Calculator: unlimited lookups, no account",
  "Tariff Tracker: upload your whole catalog, with rate history and sourcing",
  `Savings checks on ${TRIAL_ALLOWANCE.savingsChecks} imports and ${TRIAL_ALLOWANCE.auditChecks} audit checks`,
  `Alerts on ${TRIAL_ALLOWANCE.alertImports} imports`,
  "Works in AI assistants over MCP",
];

const TRACKER_INCLUDES = [
  "Alerts by email, in-app, Slack and Teams",
  "Rate history for every product",
  "Entry audit: overpaid and underpaid duty",
  "Savings from other origins and programs",
  "CSV catalog upload and team reports",
];

type Tier = { label: string; pairs: number | null; price: number | null };
const TIERS: Tier[] = [
  ...TRACKER_TIERS.map((t) => ({ label: `${t.maxPairs}`, pairs: t.maxPairs, price: t.price })),
  { label: `${TRACKER_MAX_LISTED_PAIRS}+`, pairs: null, price: null },
];

// Theme classes only, so the same list reads right on the dark card
const Includes = ({ items }: { items: string[] }) => (
  <ul className="flex flex-col gap-3.5">
    {items.map((i) => (
      <li key={i} className="flex gap-3 text-base text-base-content/70">
        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/15">
          <CheckIcon className="h-3.5 w-3.5 text-success" aria-hidden />
        </span>
        {i}
      </li>
    ))}
  </ul>
);

// A small upload, counted: four shipments, three imports
export const PricingOverview = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [tier, setTier] = useState<Tier>(TIERS[0]);
  const price = tier.price === null ? null : monthlyRate(tier.price, billing);

  return (
    <section id="pricing" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="home-pricing-title">
      <div className={mk.container}>
        <div className="flex flex-col items-center gap-8">
          <SectionIntro eyebrow="Pricing" title="Pricing that matches your imports" id="home-pricing-title" center>
            No demo, no sales call and no contract. Start free, no credit card.
          </SectionIntro>
          <BillingSwitch billing={billing} onChange={setBilling} />
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Free */}
          <article className="flex flex-col rounded-3xl border border-base-300 bg-base-100 p-8 shadow-sm sm:p-10" aria-labelledby="price-free-title">
            <h3 id="price-free-title" className="text-2xl font-semibold [font-family:var(--font-tracker-display)] text-base-content">
              Free
            </h3>
            <p className="mt-1 text-base-content/70">Everything you need to look up a tariff, today.</p>
            <p className="mt-8 flex items-baseline gap-2">
              <span className="text-7xl font-semibold [font-family:var(--font-tracker-display)] tracking-tight text-base-content">$0</span>
            </p>
            <div className="mt-8 flex-1 border-t border-base-300 pt-8">
              <Includes items={FREE_INCLUDES} />
            </div>
            <Link href="/duty-calculator" className={`${mk.buttonSecondary} mt-10 h-14 w-full text-lg`}>
              Calculate a duty free
            </Link>
          </article>

          {/* Tariff Tracker */}
          <article className={`relative flex flex-col overflow-hidden rounded-3xl p-8 sm:p-10 ${darkBand}`} aria-labelledby="price-tracker-title">
            <div className="relative flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 id="price-tracker-title" className={`${display} text-2xl font-semibold`}>
                  Tariff Tracker
                </h3>
                <p className="mt-1 text-base-content/70">Your whole catalog watched, audited and optimized.</p>
              </div>
              <span className="rounded-full bg-success px-3.5 py-1.5 text-sm font-bold text-success-content">Free to start</span>
            </div>

            <div className="relative mt-8 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <p className="flex items-baseline gap-2" aria-live="polite">
                  {price === null ? (
                    <span className={`${display} text-6xl font-semibold tracking-tight`}>Let&apos;s talk</span>
                  ) : (
                    <>
                      <span className={`${display} text-7xl font-semibold tracking-tight`}>{formatPrice(price)}</span>
                      <span className="text-lg text-base-content/60">/mo</span>
                    </>
                  )}
                </p>
                {billing === "monthly" && tier.price !== null && (
                  <button
                    type="button"
                    onClick={() => setBilling("annual")}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1.5 text-sm font-semibold text-success ring-1 ring-success/30 transition-colors hover:bg-success/25"
                  >
                    Save {formatPrice((tier.price - monthlyRate(tier.price, "annual")) * 12)}/yr with annual billing
                  </button>
                )}
                <p className="mt-2 text-sm text-base-content/60">
                  {tier.pairs === null
                    ? `Over ${TRACKER_MAX_LISTED_PAIRS} imports, priced to your catalog`
                    : `Up to ${tier.pairs} imports${billing === "annual" && price !== null ? ` · ${formatPrice(price * 12)} billed yearly` : ""}`}
                </p>

                <p className="mt-8 text-xs font-bold uppercase tracking-wider text-base-content/60">Imports covered</p>
                <div className="mt-3 grid grid-cols-5 gap-1 rounded-full bg-tt-side-card p-1" role="radiogroup" aria-label="Imports to cover">
                  {TIERS.map((t) => {
                    const active = t.label === tier.label;
                    return (
                      <button
                        key={t.label}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setTier(t)}
                        className={`rounded-full px-2 py-2.5 text-center transition-colors ${active ? "bg-base-content text-base-100" : "text-base-content/70 hover:text-base-content"}`}
                      >
                        <span className="block text-lg font-bold tabular-nums">{t.label}</span>
                        {/* <span className={`block text-xs ${active ? "text-base-content/60" : "text-base-content/60"}`}>
                          {t.price === null ? "custom" : `${formatPrice(monthlyRate(t.price, billing))}/mo`}
                        </span> */}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-base-content/60">
                  1 import = 1 HTS code from 1 country of origin.{" "}
                  <a href="#faq" className="font-semibold text-primary underline-offset-4 hover:underline">
                    How we count
                  </a>
                </p>
              </div>
              <Includes items={TRACKER_INCLUDES} />
            </div>

            <div className="relative mt-10 flex flex-wrap items-center gap-5">
              {tier.pairs === null ? (
                <a href={`mailto:${config.resend.supportEmail}?subject=${encodeURIComponent("Tariff Tracker for a large catalog")}`} className={`${moneyButtonMd} h-14 px-8 text-lg`}>
                  Talk to us <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </a>
              ) : (
                <Link href={config.auth.loginUrl} className={`${moneyButtonMd} h-14 px-8 text-lg`}>
                  Start free <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </Link>
              )}
              <span className="text-sm text-base-content/60">No credit card. Check {TRIAL_ALLOWANCE.savingsChecks} imports for savings free.</span>
            </div>
          </article>
        </div>


        <Link
          href="/classify#pricing"
          className="group mx-auto mt-6 flex max-w-6xl flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-6 transition-colors hover:border-teal-300 sm:flex-row sm:items-center sm:justify-between sm:px-10"
        >
          <span className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-tt-soft text-base-content/70">
              <MagnifyingGlassIcon className="h-6 w-6" aria-hidden />
            </span>
            <span>
              <span className="block text-lg font-bold text-base-content">Classification assistant</span>
              <span className="text-base-content/70">Audit-ready HTS classifications, backed by legal notes and CROSS rulings</span>
            </span>
          </span>
          <span className="flex items-center gap-4">
            <span className="text-2xl font-semibold [font-family:var(--font-tracker-display)] text-base-content">
              From {formatPrice(monthlyRate(CLASSIFY_PLANS.starter.price, billing))}
              <span className="text-base font-medium text-base-content/60">/mo</span>
            </span>
            <ArrowRightIcon className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </Link>

        <p className="mt-8 text-center">
          <Link href="/pricing-calculator" className={mk.link}>
            See every plan and estimate your price
          </Link>
        </p>
      </div>
    </section>
  );
};
