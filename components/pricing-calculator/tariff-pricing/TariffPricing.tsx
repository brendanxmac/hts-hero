"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { BillingSwitch, SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { LINKS, contactLink } from "../lib/links";
import { ANNUAL_DISCOUNT, Billing, FREE_TRACKED_PAIRS, TRACKER_TIERS, TRIAL_DAYS, TRIAL_PAIRS } from "../lib/pricing";
import { PlanPrice } from "../plans/PlanPrice";
import { CALCULATOR_FEATURES, FREE_TRACKER_OPTION, TRACKER_FEATURES, TRACKER_PAID_ONLY_FEATURES, TRACKER_OPTIONS, TrackerOption } from "./plans";
import { TierCard } from "./TierCard";
import { TrackerTierPicker } from "./TrackerTierPicker";

// The pricing band on /duty-calculator: the free calculator and the Tariff Tracker side by side,
// with one billing switch. The Tracker card's picker runs from its free plan through the paid
// tiers, and the card's price, button and features follow the stop picked. See PRICING.md.
export const TariffPricing = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  // Opens on the lowest paid tier; the free plan is one stop to the left
  const [trackerOption, setTrackerOption] = useState<TrackerOption>(TRACKER_OPTIONS[1]);

  const isFree = trackerOption.id === FREE_TRACKER_OPTION.id;
  const isCustom = trackerOption.price === null;
  const isLowestTier = trackerOption.id === TRACKER_OPTIONS[1].id;
  const trackerNote = isCustom
    ? "We'll build a plan around your catalog."
    : isFree
      ? `Free for ${FREE_TRACKED_PAIRS} products. Try up to ${TRIAL_PAIRS} free for ${TRIAL_DAYS} days.`
      : `Up to ${trackerOption.maxPairs} products. A product is one HTS code from one country of origin.`;

  return (
    <section id="pricing" className={`${mk.band} ${mk.bandMuted} scroll-mt-20`} aria-labelledby="pricing-title">
      <div className={mk.container}>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro eyebrow="Pricing" title="Calculate for free. Unlock savings, alerts, and audits when you're ready." id="pricing-title">
            This calculator is free and unlimited. Put your own products under watch with the Tariff Tracker: free for{" "}
            {FREE_TRACKED_PAIRS}, with a {TRIAL_DAYS}-day trial of up to {TRIAL_PAIRS}.
          </SectionIntro>
          <div className="shrink-0">
            <BillingSwitch billing={billing} onChange={setBilling} />
          </div>
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
            badge={`${TRIAL_DAYS}-day free trial`}
            dark
            description="Your whole catalog under watch, your entries audited and your potential savings found."
            price={
              isCustom ? (
                <div>
                  <span className="text-6xl font-extrabold tracking-tight text-white" aria-live="polite">
                    Let&apos;s talk
                  </span>
                  <p className="mt-2 text-sm text-slate-400">Priced to fit your catalog</p>
                </div>
              ) : isFree ? (
                <PlanPrice listPrice={0} billing={billing} unit="" note="Free" dark />
              ) : (
                <PlanPrice
                  listPrice={trackerOption.price ?? TRACKER_TIERS[0].price}
                  billing={billing}
                  prefix={isLowestTier ? "From" : undefined}
                  dark
                />
              )
            }
            allowanceLabel="Products tracked"
            allowance={<TrackerTierPicker value={trackerOption} onChange={setTrackerOption} billing={billing} />}
            allowanceNote={trackerNote}
            cta={
              isCustom ? (
                <a href={contactLink("Tariff Tracker for a large catalog")} className={`${mk.buttonOnDark} h-14 w-full text-lg`}>
                  Talk to us
                  <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </a>
              ) : isFree ? (
                <Link href={LINKS.signUp} className={`${mk.buttonOnDark} h-14 w-full text-lg`}>
                  Start free
                  <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </Link>
              ) : (
                <Link href={LINKS.signUp} className={`${mk.buttonOnDark} h-14 w-full text-lg`}>
                  Start your free trial
                  <ArrowRightIcon className="h-5 w-5" aria-hidden />
                </Link>
              )
            }
            featuresLabel={isFree ? "Free plan includes" : "Every paid plan includes"}
            features={TRACKER_FEATURES}
            excludedFeatures={isFree ? TRACKER_PAID_ONLY_FEATURES : undefined}
          />
        </div>

        <p className={`${mk.small} mt-8`}>
          Prices in USD. Annual plans are billed once a year at {ANNUAL_DISCOUNT * 100}% off.{" "}
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
