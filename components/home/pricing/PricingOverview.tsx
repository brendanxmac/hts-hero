"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, CheckIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import { bestPlanFor, DarkBillingSwitch, DemoRow, PlanCard, ProductsSlider } from "@/components/ui/marketing/PlanPricing";
import * as mk from "@/components/ui/marketing/styles";
import {
  ALERT_TIERS,
  ANNUAL_DISCOUNT,
  AUDIT_TIERS,
  REVERSE_TRIAL,
  Billing,
  CLASSIFY_PLANS,
  formatPrice,
  monthlyRate,
} from "@/components/pricing-calculator/lib/pricing";
import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import { alertsIncluded } from "@/components/tariff-alerts/pricing/AlertsPricing";
import { auditsIncluded } from "@/components/tariff-audit/pricing/AuditPricing";
import { GUARANTEE } from "@/components/tariff-alerts/lib/copy";
import { AUDIT_GUARANTEE } from "@/components/tariff-audit/lib/copy";
import { SIGN_UP_TO_AUDIT } from "@/components/tariff-audit/lib/links";
import { bookCallHref } from "@/libs/book-call";
import { entryHref, type EntryPoint } from "@/libs/signup-onboarding";

// Pricing at a glance, in the sales pages' look (PlanPricing): the products slider and the billing
// switch, then three cards. Free (the calculator and tracking); Duty Guard, each
// at the plan that fits the slider's products (the same plans, prices and features as /tariff-alerts and
// /duty-audit). Past the largest plan, the cards hold at it and the large-catalog row lights up.
// Classification stays as a row under them (Managed has its own section below). Every number comes from PRICING.md.

const FREE_INCLUDES = [
  "Unlimited duty lookups, no account",
  "Every tariff, exemption and fee, line by line",
  "Track unlimited products with a free account",
  "Rate history and exports on every product",
  "AD/CVD check on any product",
];

const LARGEST = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs;

const LARGE_CATALOG_HREF = bookCallHref({
  source: "home",
  campaign: "large-catalog",
  context: `Importer with more than ${LARGEST} products, from the homepage pricing (htshero.com)`,
});

// Free: the calculator and tracking, in the plan cards' look, with no plan to pick
const FreeCard = ({ entry }: { entry: EntryPoint }) => (
  <article className="flex flex-col rounded-3xl bg-tt-soft p-7 shadow-xl shadow-base-content/5 ring-1 ring-base-content/15 transition-all hover:-translate-y-1 hover:shadow-2xl hover:ring-primary/50" aria-labelledby="plan-free">
    <h3 id="plan-free" className="text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">
      Free
    </h3>

    <p className="mt-6 flex items-baseline gap-2">
      <span className="text-5xl font-bold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">$0</span>
      <span className="text-sm font-medium text-base-content/60">/ mo</span>
    </p>
    <p className="mt-3 text-base text-base-content/70">
      <span className="font-bold text-success">Duty Calculator</span> and <span className="font-bold text-success">Tracking</span>
    </p>

    <ul className="mt-6 flex flex-col gap-3 border-t border-base-content/15 pt-6">
      {FREE_INCLUDES.map((text) => (
        <li key={text} className="flex gap-2.5 text-sm text-base-content/80">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
          {text}
        </li>
      ))}
    </ul>

    <div className="mt-auto pt-8">
      <a
        href={entryHref(entry)}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-content transition-colors hover:bg-primary/90"
      >
        Track My Products Free <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </a>
      <Link href="/duty-calculator" className="mt-2.5 block text-center text-xs font-semibold text-base-content/60 hover:text-base-content hover:underline">
        Or look up a duty, no account
      </Link>
    </div>
  </article>
);

// The three cards: Free, then Duty Guard at the plan that fits the slider's
// products, the large-catalog row under them. Past the largest plan, the cards hold at it and the row
// lights up.
export const PricingCards = ({ billing, products, entry = "hero" }: { billing: Billing; products: number; entry?: EntryPoint }) => {
  const fits = bestPlanFor(ALERT_TIERS, products);
  const alerts = ALERT_TIERS.find((t) => t.maxPairs === fits) ?? ALERT_TIERS[ALERT_TIERS.length - 1];
  const audits = AUDIT_TIERS.find((t) => t.maxPairs === fits) ?? AUDIT_TIERS[AUDIT_TIERS.length - 1];
  return (
    <>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <FreeCard entry={entry} />
        <PlanCard
          product="Duty Guard Essentials"
          plan={alerts}
          billing={billing}
          features={alertsIncluded()}
          href={entry === "hero" ? TRY_FREE_HREF : entryHref(entry)}
          lead={`Alerts on up to ${alerts.maxPairs} products`}
          guarantee={GUARANTEE}
          productOnly
          trialDays={REVERSE_TRIAL.days}
        />
        <PlanCard
          product="Duty Guard Pro"
          plan={audits}
          billing={billing}
          features={auditsIncluded(audits, billing)}
          href={entry === "hero" ? SIGN_UP_TO_AUDIT : entryHref(entry)}
          lead={`Unlimited audits on ${audits.maxPairs} products`}
          guarantee={AUDIT_GUARANTEE}
          productOnly
          trialDays={REVERSE_TRIAL.days}
        />
      </div>
      <div className="mt-5">
        <DemoRow title={`More Than ${LARGEST} Products?`} text="Volume pricing for large catalogs." href={LARGE_CATALOG_HREF} best={fits === null} />
      </div>
    </>
  );
};

export const PricingOverview = () => {
  const [billing, setBilling] = useState<Billing>("annual");
  const [products, setProducts] = useState(25);
  return (
    <section id="pricing" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="home-pricing-title">
      <div className="mx-auto w-full max-w-6xl px-6 lg:px-8">
        <SectionIntro eyebrow="Pricing" title="Pricing That Fits Your Products" id="home-pricing-title" center>
          No demo, no sales call and no contract. Pick how many products you have.
        </SectionIntro>

        <div className="mt-10">
          {/* How many products, and billing */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <ProductsSlider plans={ALERT_TIERS} products={products} onChange={setProducts} />
            <DarkBillingSwitch billing={billing} onChange={setBilling} />
          </div>

          <PricingCards billing={billing} products={products} />

          <p className={`${mk.small} mt-6 text-center`}>
            A product is one HTS code from one country of origin. Prices in USD; annual billing saves {ANNUAL_DISCOUNT * 100}%.
          </p>
        </div>

        <Link
          href="/classify#pricing"
          className="group mt-10 flex flex-col gap-4 rounded-3xl border border-base-300 bg-base-100 p-6 transition-colors hover:border-teal-300 sm:flex-row sm:items-center sm:justify-between sm:px-10"
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

      </div>
    </section>
  );
};
