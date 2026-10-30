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
import { AUDIT_GUARANTEE } from "@/components/tariff-audit/lib/copy";
import { SIGN_UP_TO_AUDIT } from "@/components/tariff-audit/lib/links";
import { bookCallHref } from "@/libs/book-call";

// Pricing at a glance, in the sales pages' look (PlanPricing): the products slider and the billing
// switch, then three cards. The Tariff Calculator, free; Tariff Alerts and Duty Audits, each at the
// plan that fits the slider's products (the same plans, prices and features as /tariff-alerts and
// /duty-audits). Past the largest plan, the cards hold at it and the large-catalog row lights up.
// Classification stays as a row under them (Managed has its own section below). Every number comes from PRICING.md.

const CALCULATOR_INCLUDES = [
  "Duty for any HTS code and country of origin",
  "Base rate, Chapter 99 tariffs, exemptions and fees, line by line",
  "Trade programs like USMCA",
  "Unlimited lookups, no account",
  "AD/CVD cases that may cover it, with a free account",
];

const LARGEST = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs;

const LARGE_CATALOG_HREF = bookCallHref({
  source: "home",
  campaign: "large-catalog",
  context: `Importer with more than ${LARGEST} products, from the homepage pricing (htshero.com)`,
});

// The Tariff Calculator, free: the plan cards' look, with no plan to pick
const CalculatorCard = () => (
  <article className="flex flex-col rounded-3xl bg-tt-soft p-7 shadow-xl shadow-base-content/5 ring-1 ring-base-content/15 transition-all hover:-translate-y-1 hover:shadow-2xl hover:ring-primary/50" aria-labelledby="plan-calculator">
    <h3 id="plan-calculator" className="text-2xl font-semibold text-base-content [font-family:var(--font-tracker-display)]">
      Tariff Calculator
    </h3>

    <p className="mt-6 flex items-baseline gap-2">
      <span className="text-5xl font-bold tracking-tight text-base-content [font-family:var(--font-tracker-display)]">$0</span>
      <span className="text-sm font-medium text-base-content/60">/ mo</span>
    </p>
    <p className="mt-3 text-base text-base-content/70">
      <span className="font-bold text-success">Free</span> forever
    </p>

    <ul className="mt-6 flex flex-col gap-3 border-t border-base-content/15 pt-6">
      {CALCULATOR_INCLUDES.map((text) => (
        <li key={text} className="flex gap-2.5 text-sm text-base-content/80">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
          {text}
        </li>
      ))}
    </ul>

    <div className="mt-auto pt-8">
      <Link
        href="/duty-calculator"
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-content transition-colors hover:bg-primary/90"
      >
        Try Tariff Calculator <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </Link>
      <p className="mt-2.5 text-center text-xs text-base-content/60">No account needed</p>
    </div>
  </article>
);

export const PricingOverview = () => {
  const [billing, setBilling] = useState<Billing>("annual");
  const [products, setProducts] = useState(25);
  // The plan that fits, or the largest past it (the large-catalog row lights up instead)
  const fits = bestPlanFor(ALERT_TIERS, products);
  const alerts = ALERT_TIERS.find((t) => t.maxPairs === fits) ?? ALERT_TIERS[ALERT_TIERS.length - 1];
  const audits = AUDIT_TIERS.find((t) => t.maxPairs === fits) ?? AUDIT_TIERS[AUDIT_TIERS.length - 1];

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

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <CalculatorCard />
            <PlanCard
              product="Tariff Alerts"
              plan={alerts}
              billing={billing}
              features={alertsIncluded()}
              href={TRY_FREE_HREF}
              lead={`Alerts on up to ${alerts.maxPairs} products`}
              productOnly
              trialDays={REVERSE_TRIAL.days}
            />
            <PlanCard
              product="Duty Audits"
              plan={audits}
              billing={billing}
              features={auditsIncluded(audits, billing)}
              href={SIGN_UP_TO_AUDIT}
              lead={`Unlimited audits on ${audits.maxPairs} products`}
              guarantee={AUDIT_GUARANTEE}
              productOnly
              trialDays={REVERSE_TRIAL.days}
            />
          </div>

          <div className="mt-5">
            <DemoRow title={`More than ${LARGEST} products?`} text="Volume pricing for large catalogs." href={LARGE_CATALOG_HREF} best={fits === null} />
          </div>

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
