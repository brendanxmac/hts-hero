"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BillingSwitch, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { LINKS, contactLink } from "../lib/links";
import { TRACKER_ANNUAL_ENABLED } from "@/libs/tariff-tracker/features";
import { ANNUAL_DISCOUNT, Billing, TRACKER_TIERS, TRIAL_ALLOWANCE } from "../lib/pricing";
import { PlanPrice } from "../plans/PlanPrice";
import { CALCULATOR_FEATURES, TRACKER_FEATURES, TRACKER_OPTIONS, TrackerOption } from "./plans";
import { TierCard } from "./TierCard";
import { TrackerTierPicker } from "./TrackerTierPicker";

// The pricing band on /duty-calculator: the free calculator and the Tariff Tracker side by side,
// with one billing switch (only while Tracker annual billing is on; MVP_TRIM.md). The Tracker card's
// picker runs through the paid tiers, and the card's price and button follow the stop picked; every
// account tracks a few imports free. See PRICING.md.
// The headline plan's button, in the Tracker's primary color on its dark card
const BUTTON_ON_DARK =
  "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-content transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50";

export const TariffPricing = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  // Opens on the lowest tier
  const [trackerOption, setTrackerOption] = useState<TrackerOption>(TRACKER_OPTIONS[0]);

  const isCustom = trackerOption.price === null;
  const isLowestTier = trackerOption.id === TRACKER_OPTIONS[0].id;
  const trackerNote = isCustom
    ? "We'll build a plan around your catalog."
    : `Up to ${trackerOption.maxPairs} imports. An import is one HTS code from one country of origin.`;

  return (
    <section id="pricing" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="pricing-title">
      <div className={mk.container}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro eyebrow="Pricing" title="Calculate for free. Track your imports when you're ready." id="pricing-title">
            This calculator is free and unlimited. Track your own imports with the Tariff Tracker and run impact checks to see
            exactly how each tariff action hits them: track {TRIAL_ALLOWANCE.alertImports} imports free. No credit card.
          </SectionIntro>
          {TRACKER_ANNUAL_ENABLED && (
            <div className="shrink-0">
              <BillingSwitch billing={billing} onChange={setBilling} />
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[5fr_7fr] lg:gap-y-0">
          <TierCard
            id="plan-calculator"
            name="Tariff Calculator"
            description="The exact duty on any import, with the reasons behind it."
            price={<PlanPrice listPrice={0} billing={billing} unit="" note="Free" />}
            cta={
              <a href="#calculator" className={`${mk.buttonSecondary} h-14 w-full text-lg`}>
                Calculate a duty
              </a>
            }
            featuresLabel="Every calculation includes"
            features={CALCULATOR_FEATURES}
          />

          <TierCard
            id="plan-tracker"
            name="Tariff Tracker"
            badge="Free to start"
            dark
            description="Every tariff on your imports tracked, with alerts and impact checks."
            price={
              isCustom ? (
                <div>
                  <span className="text-6xl font-extrabold tracking-tight text-base-content" aria-live="polite">
                    Let&apos;s talk
                  </span>
                  <p className="mt-2 text-sm text-base-content/60">Priced to fit your catalog</p>
                </div>
              ) : (
                <PlanPrice
                  listPrice={trackerOption.price ?? TRACKER_TIERS[0].price}
                  billing={billing}
                  prefix={isLowestTier ? "From" : undefined}
                  dark
                />
              )
            }
            allowanceLabel="Imports covered"
            allowance={<TrackerTierPicker value={trackerOption} onChange={setTrackerOption} billing={billing} />}
            allowanceNote={trackerNote}
            cta={
              isCustom ? (
                <a href={contactLink("Tariff Tracker for a large catalog")} className={`${BUTTON_ON_DARK}`}>
                  Talk to us
                  <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </a>
              ) : (
                <Link href={LINKS.signUp} className={`${BUTTON_ON_DARK}`}>
                  Start free
                  <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </Link>
              )
            }
            featuresLabel="Every paid plan includes"
            features={TRACKER_FEATURES}
          />
        </div>

        <p className={`${mk.small} mt-8`}>
          Prices in USD.{" "}
          {TRACKER_ANNUAL_ENABLED ? `Annual plans are billed once a year at ${ANNUAL_DISCOUNT * 100}% off. ` : "Tracker plans are billed monthly. "}
          <Link href="/tariff-monitor" className={mk.link}>
            See how the Tariff Tracker works
          </Link>{" "}
          or{" "}
          <Link href="/pricing-calculator" className={mk.link}>
            estimate your price
          </Link>
        </p>
      </div>
    </section>
  );
};
