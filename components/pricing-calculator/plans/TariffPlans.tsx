import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BillingSwitch, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { LINKS } from "../lib/links";
import { Billing, FREE_TRACKED_PAIRS, TRACKER_TIERS, TRIAL_DAYS, TRIAL_PAIRS } from "../lib/pricing";
import { CALCULATOR_FEATURES, TRACKER_FEATURES } from "../tariff-pricing/plans";
import { CoverageGrid } from "./CoverageGrid";
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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <SectionIntro eyebrow="Tariffs" title="Look up any tariff free. Pay to watch your own." id="tariffs-title">
        The Tariff Calculator is free for everyone. The{" "}
        <Link href="/tariff-monitor" className={mk.link}>
          Tariff Tracker
        </Link>{" "}
        watches your catalog, audits your entries and finds savings, and it&apos;s free for {FREE_TRACKED_PAIRS} products.
      </SectionIntro>
      <div className="shrink-0">
        <BillingSwitch billing={billing} onChange={onBillingChange} />
      </div>
    </div>

    <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PlanCard
        id="plan-tariff-calculator"
        name="Tariff Calculator"
        badge="Free"
        description="For anyone who needs the exact duty on an import, with the reasons behind it."
        price={<PlanPrice listPrice={0} billing={billing} unit="" note="Free. No account needed." />}
        features={CALCULATOR_FEATURES}
        cta={
          <Link href={LINKS.calculator} className={`${mk.buttonSecondary} h-14 w-full text-lg`}>
            Open the calculator
          </Link>
        }
      >
        <CoverageGrid />
      </PlanCard>
      <PlanCard
        id="plan-tariff-tracker"
        name="Tariff Tracker"
        badge={`${TRIAL_DAYS}-day free trial`}
        dark
        description="For importers who need to know the moment a tariff change hits their products, and what they overpaid."
        price={
          <PlanPrice
            listPrice={TRACKER_TIERS[0].price}
            billing={billing}
            prefix="From"
            note={`Free for ${FREE_TRACKED_PAIRS} products. Try up to ${TRIAL_PAIRS} free for ${TRIAL_DAYS} days.`}
            dark
          />
        }
        features={TRACKER_FEATURES}
        cta={
          <Link href={LINKS.signUp} className={`${mk.buttonOnDark} h-14 w-full text-lg`}>
            Start your free trial <ArrowRightIcon className="h-5 w-5" aria-hidden />
          </Link>
        }
      >
        <TrackerTierTable billing={billing} />
      </PlanCard>
    </div>
  </section>
);
