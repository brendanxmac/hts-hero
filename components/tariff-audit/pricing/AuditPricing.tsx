"use client";

import { useState } from "react";
import { ALERT_TIERS, AUDIT_TIERS, ANNUAL_DISCOUNT, Billing, formatPrice, monthlyRate } from "@/components/pricing-calculator/lib/pricing";
import { SectionIntro } from "@/components/ui/marketing";
import { bestPlanFor, DarkBillingSwitch, DemoRow, GuaranteeBox, PlanCards, ProductsSlider, type SalesPlan } from "@/components/ui/marketing/PlanPricing";
import * as mk from "@/components/ui/marketing/styles";
import { bookCallHref } from "@/libs/book-call";
import type { AuditExample } from "@/libs/tariff-audit-example";
import { AUDIT_GUARANTEE, AUDIT_GUARANTEE_DETAIL } from "../lib/copy";
import { SIGN_UP_TO_AUDIT } from "../lib/links";

// The Tariff Audits plans (AUDIT_TIERS, PRICING.md's value ladder), the same cards and logic as
// /tariff-alerts (PlanPricing): four side by side, all paid, the one that fits the visitor's products highlighted, named like the alerts
// plans. Each audits the same imports, for the same users, as the alerts plan of its name, and
// includes it. Each plan says it can pay for itself with one flagged entry, when the engine's example
// entry would cover its whole year; more than the largest plan, and firms managing importer clients,
// lead to a call under them, and the guarantee sits under everything. No cut of what's recovered, ever.

// What the alerts plan of the same name costs on its own, at this billing, so the bundle shows its worth
const alertsValue = (plan: SalesPlan, billing: Billing) => {
  const alerts = ALERT_TIERS.find((t) => t.name === plan.name);
  return alerts ? formatPrice(monthlyRate(alerts.price, billing)) : "";
};

// What a plan includes, after its imports and users. A plan only lists what it has
export const auditsIncluded = (plan: SalesPlan, billing: Billing): string[] => [
  "Find overpaid & underpaid duty",
  "Keep 100% of what you recover",
  "Discover additional savings",
  `Get New Tariff Alerts`,
];

const LARGEST = AUDIT_TIERS[AUDIT_TIERS.length - 1].maxPairs;

const LARGE_CATALOG_HREF = bookCallHref({
  source: "tariff-audit",
  campaign: "large-catalog",
  context: `Importer with more than ${LARGEST} products, from the Tariff Audits pricing (htshero.com/tariff-audit)`,
});
const PARTNERS_HREF = bookCallHref({
  source: "tariff-audit",
  campaign: "partners",
  context: "Customs broker, 3PL or freight forwarder managing importer clients, from the Tariff Audits pricing (htshero.com/tariff-audit)",
});

export const AuditPricing = ({ example }: { example: AuditExample | null }) => {
  const [billing, setBilling] = useState<Billing>("annual");
  const [products, setProducts] = useState(25);
  const best = bestPlanFor(AUDIT_TIERS, products);
  // "Pays for itself" only where it's true of the example: one flagged entry covers the plan's year

  return (
    <section id="pricing" className={mk.band} aria-labelledby="pricing-title">
      <div className="mx-auto w-full max-w-[84rem] px-6 lg:px-8">
        <SectionIntro eyebrow="" title={`Less than $5 Per Product`} id="pricing-title" center>
          Pay a flat monthly price for all your products, never a cut of anything you get back.
        </SectionIntro>

        <div className="mt-6">
          {/* Billing, and how many products: the slider highlights the plan that fits */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            <ProductsSlider plans={AUDIT_TIERS} products={products} onChange={setProducts} />
            <DarkBillingSwitch billing={billing} onChange={setBilling} />
          </div>

          <PlanCards product="Tariff Audits" plans={AUDIT_TIERS} billing={billing} features={auditsIncluded} href={SIGN_UP_TO_AUDIT} lead={(p) => `Unlimited audits on ${p.maxPairs} products`} guarantee={AUDIT_GUARANTEE} best={best} products={products} />

          {/* More than the largest plan, and firms managing importer clients. Each link says which, so
              it's on the booking. The historical-audit row is off for now, 2026-10-28 */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DemoRow title={`More than ${LARGEST} products?`} text="Volume pricing for large catalogs." href={LARGE_CATALOG_HREF} best={best === null} />
            <DemoRow title="Broker, 3PL or forwarder?" text="Audit every client's entries from one account." href={PARTNERS_HREF} />
          </div>

          <GuaranteeBox title={AUDIT_GUARANTEE} text={AUDIT_GUARANTEE_DETAIL} />

          <p className={`${mk.small} mt-6 text-center`}>
            A product is one HTS code from one country of origin. Prices in USD; annual billing saves {ANNUAL_DISCOUNT * 100}%.
          </p>
        </div>
      </div>
    </section>
  );
};
