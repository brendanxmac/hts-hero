"use client";

import { useState } from "react";
import { ClockIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import { DarkBillingSwitch, DemoRow, GuaranteeBox, PlanCards, type SalesPlan } from "@/components/ui/marketing/PlanPricing";
import * as mk from "@/components/ui/marketing/styles";
import { ALERT_TIERS, ANNUAL_DISCOUNT, Billing } from "@/components/pricing-calculator/lib/pricing";
import { TRY_FREE_HREF } from "@/components/tariff-tracker/access/signup";
import { bookCallHref } from "@/libs/book-call";
import { GUARANTEE, GUARANTEE_DETAIL } from "../lib/copy";

// The Tariff Alerts plans (ALERT_TIERS, PRICING.md's value ladder), as the shared plan cards
// (PlanPricing): four side by side, all paid, none highlighted. Each lists its imports and users
// first; Slack & Teams from Pro. More than the largest plan, and firms managing importer clients,
// lead to a demo under them; the guarantee sits under everything. The urgency is real: counted from
// the published updates.

export { DarkBillingSwitch };

// What a plan includes, after its imports and users. A plan only lists what it has
const included = (plan: SalesPlan): string[] => [
  "Alerts when new tariffs affect your imports",
  "See how each update affects your imports",
  "Antidumping and countervailing duty alerts",
  ...(plan.teams ? ["Slack & Microsoft Teams integration"] : []),
];

const LARGEST = ALERT_TIERS[ALERT_TIERS.length - 1].maxPairs;

const LARGE_CATALOG_HREF = bookCallHref({
  source: "tariff-alerts",
  campaign: "large-catalog",
  context: `Importer with more than ${LARGEST} imports, from the Tariff Alerts pricing (htshero.com/tariff-alerts)`,
});
const PARTNERS_HREF = bookCallHref({
  source: "tariff-alerts",
  campaign: "partners",
  context: "Customs broker, 3PL or freight forwarder managing importer clients, from the Tariff Alerts pricing (htshero.com/tariff-alerts)",
});

export const AlertsPricing = ({ urgency }: { urgency?: string | null }) => {
  const [billing, setBilling] = useState<Billing>("annual");

  return (
    <section id="pricing" className={`${mk.band} scroll-mt-6`} aria-labelledby="pricing-title">
      <div className={mk.container}>
        <SectionIntro eyebrow="" title="Less Than $1.00 Per Import" id="pricing-title" center>
          Pay for the imports you track, nothing else. Cancel anytime.
        </SectionIntro>

        {urgency && (
          <p className="mx-auto mt-8 flex w-fit max-w-3xl items-center gap-2.5 rounded-full bg-warning/10 px-5 py-2.5 text-sm font-medium text-base-content ring-1 ring-warning/30">
            <ClockIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
            {urgency}
          </p>
        )}

        <div className="mx-auto mt-10 max-w-6xl">
          <div className="mb-8 flex justify-center">
            <DarkBillingSwitch billing={billing} onChange={setBilling} />
          </div>

          <PlanCards product="Tariff Alerts" plans={ALERT_TIERS} billing={billing} features={included} href={TRY_FREE_HREF} />

          {/* More than the largest plan, and firms managing importer clients. Each demo link says which,
              so it's on the booking. */}
          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <DemoRow title={`More than ${LARGEST} imports?`} text="Volume pricing for large catalogs." href={LARGE_CATALOG_HREF} />
            <DemoRow title="Broker, 3PL or forwarder?" text="Monitor your clients import tariffs and send them branded alerts when they're affected by new tariffs" href={PARTNERS_HREF} />
          </div>

          <GuaranteeBox title={GUARANTEE} text={GUARANTEE_DETAIL} />

          <p className={`${mk.small} mt-6 text-center`}>
            An import is one HTS code from one country of origin. Prices in USD; annual billing saves {ANNUAL_DISCOUNT * 100}%.
          </p>
        </div>
      </div>
    </section>
  );
};
