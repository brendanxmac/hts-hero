"use client";

import { useState } from "react";
import { BanknotesIcon } from "@heroicons/react/20/solid";
import { AUDIT_TIERS, ANNUAL_DISCOUNT, Billing, formatPrice, monthlyRate } from "@/components/pricing-calculator/lib/pricing";
import { SectionIntro } from "@/components/ui/marketing";
import { DarkBillingSwitch, DemoRow, GuaranteeBox, PlanCards, type SalesPlan } from "@/components/ui/marketing/PlanPricing";
import * as mk from "@/components/ui/marketing/styles";
import { bookCallHref } from "@/libs/book-call";
import type { AuditExample } from "@/libs/tariff-audit-example";
import { AUDIT_GUARANTEE, AUDIT_GUARANTEE_DETAIL } from "../lib/copy";
import { SIGN_UP_TO_AUDIT } from "../lib/links";

// The Tariff Audits plans (AUDIT_TIERS, PRICING.md's value ladder), the same cards and logic as
// /tariff-alerts (PlanPricing): four side by side, all paid, none highlighted, named like the alerts
// plans. Each audits the same imports, for the same users, as the alerts plan of its name, and
// includes it. One flagged entry against a year of Starter sits above the plans; more than the
// largest plan, and firms managing importer clients, lead to a call under them, and the guarantee
// sits under everything. No cut of what's recovered, ever.

// What a plan includes, after its imports and users. A plan only lists what it has
const included = (plan: SalesPlan): string[] => [
  `Includes Tariff Alerts ${plan.name}`,
  "Audit every entry at its entry date's rates",
  "Find overpaid and underpaid duty",
  "See savings you may qualify for",
  ...(plan.teams ? ["Slack & Microsoft Teams integration"] : []),
  "Keep 100% of what you recover",
];

const LARGEST = AUDIT_TIERS[AUDIT_TIERS.length - 1].maxPairs;

const LARGE_CATALOG_HREF = bookCallHref({
  source: "tariff-audit",
  campaign: "large-catalog",
  context: `Importer with more than ${LARGEST} imports, from the Tariff Audits pricing (htshero.com/tariff-audit)`,
});
const PARTNERS_HREF = bookCallHref({
  source: "tariff-audit",
  campaign: "partners",
  context: "Customs broker, 3PL or freight forwarder managing importer clients, from the Tariff Audits pricing (htshero.com/tariff-audit)",
});

export const AuditPricing = ({ example }: { example: AuditExample | null }) => {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <section id="pricing" className={mk.band} aria-labelledby="pricing-title">
      <div className="mx-auto w-full max-w-[84rem] px-6 lg:px-8">
        <SectionIntro eyebrow="" title={`One Audit Could Save You Thousands`} id="pricing-title" center>
          Pay a flat monthly price all your imports, never a cut of anything you get back. Cancel anytime.
        </SectionIntro>

        <div className="mt-6">
          <div className="mb-8 flex justify-center">
            <DarkBillingSwitch billing={billing} onChange={setBilling} />
          </div>

          <PlanCards product="Tariff Audits" plans={AUDIT_TIERS} billing={billing} features={included} href={SIGN_UP_TO_AUDIT} guarantee={AUDIT_GUARANTEE} />

          {/* More than the largest plan, and firms managing importer clients. Each link says which, so
              it's on the booking. The historical-audit row is off for now, 2026-10-28 */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DemoRow title={`More than ${LARGEST} imports?`} text="Volume pricing for large catalogs." href={LARGE_CATALOG_HREF} />
            <DemoRow title="Broker, 3PL or forwarder?" text="Audit every client's entries from one account." href={PARTNERS_HREF} />
          </div>

          <GuaranteeBox title={AUDIT_GUARANTEE} text={AUDIT_GUARANTEE_DETAIL} />

          <p className={`${mk.small} mt-6 text-center`}>
            An import is one HTS code from one country of origin. Prices in USD; annual billing saves {ANNUAL_DISCOUNT * 100}%.
          </p>
        </div>
      </div>
    </section>
  );
};
