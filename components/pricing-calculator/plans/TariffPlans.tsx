import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BillingSwitch, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { LINKS } from "../lib/links";
import { Billing, TRACKER_TIERS, TRIAL_ALLOWANCE } from "../lib/pricing";
import { CALCULATOR_FEATURES, TRACKER_FEATURES } from "../tariff-pricing/plans";
import { CoverageGrid } from "./CoverageGrid";
import { ManagedTeaser } from "./ManagedTeaser";
import { PlanCard } from "./PlanCard";
import { PlanPrice } from "./PlanPrice";
import { TrackerTierTable } from "./TrackerTierTable";

export const TariffPlans = ({
  billing,
  onBillingChange,
}: {
  billing: Billing;
  onBillingChange: (billing: Billing) => void;
}) => (
  <section id="tariffs" className="scroll-mt-24" aria-labelledby="tariffs-title">
    <div className="flex flex-col gap-8">
      <SectionIntro eyebrow="Tariffs" title="Monitor your imports and unlock savings." id="tariffs-title">
        The Tariff Calculator is free for everyone. The{" "}
        <Link href="/tariff-monitor" className={mk.link}>
          Tariff Tracker
        </Link>{" "}
        watches your catalog, audits your entries and finds savings, and it&apos;s free to start: check{" "}
        {TRIAL_ALLOWANCE.savingsChecks} imports for savings and get {TRIAL_ALLOWANCE.auditChecks} free audit checks.
      </SectionIntro>
      <div className="shrink-0">
        <BillingSwitch billing={billing} onChange={onBillingChange} />
      </div>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PlanCard
        id="plan-tariff-calculator"
        name="Tariff Calculator"
        badge="Free"
        compact
        description="For anyone who needs the exact duty on an import, with the reasons behind it."
        price={<PlanPrice listPrice={0} billing={billing} unit="" note="No account needed" compact />}
        features={CALCULATOR_FEATURES}
        cta={
          <Link href={LINKS.calculator} className={`${mk.buttonSecondary} h-12 px-6`}>
            Open the calculator
          </Link>
        }
      >
        <CoverageGrid />
      </PlanCard>
      <PlanCard
        id="plan-tariff-tracker"
        name="Tariff Tracker"
        badge="Free to start"
        dark
        compact
        description="For importers who need to know the moment a tariff change hits their products, and what they overpaid."
        price={
          <PlanPrice
            listPrice={TRACKER_TIERS[0].price}
            billing={billing}
            prefix="From"
            note="Start free, no credit card"
            dark
            compact
          />
        }
        features={TRACKER_FEATURES}
        cta={
          <Link href={LINKS.signUp} className={`${mk.buttonOnDark} h-12 px-6`}>
            Start free <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </Link>
        }
      >
        <TrackerTierTable billing={billing} />
      </PlanCard>
    </div>
    <ManagedTeaser />
  </section>
);
