"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LINKS, contactLink } from "../lib/links";
import { ANNUAL_DISCOUNT, Billing, FREE_MONTHLY_CALCULATIONS, TARIFF_CALCULATOR_PRICE } from "../lib/pricing";
import { BillingToggle } from "../plans/BillingToggle";
import { PriceTag } from "../plans/PriceTag";
import { FREE_FEATURES, PRO_FEATURES, STARTER_FEATURES, TRACKER_OPTIONS, TrackerOption } from "./plans";
import { TierCard } from "./TierCard";
import { TrackerTierPicker } from "./TrackerTierPicker";

// A fixed allowance, drawn on the same inset track as the Pro card's tier picker so the
// three cards read as one set
const Allowance = ({ value, unit }: { value: string; unit?: string }) => (
  <div className="flex h-14 items-center gap-1.5 rounded-lg bg-base-200 px-4 ring-1 ring-inset ring-base-300">
    <span className="text-lg font-semibold tabular-nums text-base-content">{value}</span>
    {unit && <span className={ui.bodySm}>{unit}</span>}
  </div>
);

// Free, Starter (the Tariff Calculator) and Pro (the Tariff Tracker) side by side, with one
// billing toggle. Pro's price follows the tier picked on its card.
export const TariffPricing = () => {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [trackerOption, setTrackerOption] = useState<TrackerOption>(TRACKER_OPTIONS[0]);

  const isCustom = trackerOption.price === null;
  const isLowestTier = trackerOption.id === TRACKER_OPTIONS[0].id;
  const trackerNote = isCustom
    ? "We'll build a plan around your catalog."
    : `Up to ${trackerOption.maxPairs} pairs. A pair is one HTS code from one country of origin.`;

  return (
    <section id="pricing" className={ui.section} aria-labelledby="pricing-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader kicker="Pricing" title="Start free. Upgrade when your imports need it." titleId="pricing-title">
          Calculate duties for free, go unlimited with Starter, or put your whole
          catalog under watch with Pro.
        </SectionHeader>
        <BillingToggle billing={billing} onChange={setBilling} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:gap-y-0">
        <TierCard
          id="plan-free"
          name="Free"
          description="For a quick check on an import now and then."
          price={<PriceTag listPrice={0} billing={billing} note="Free forever" />}
          allowanceLabel="Duty calculations"
          allowance={<Allowance value={String(FREE_MONTHLY_CALCULATIONS)} unit="per month" />}
          allowanceNote="No credit card needed."
          cta={
            <button
              type="button"
              // Back up to the calculator. The page scrolls inside the layout, not the window.
              onClick={() => document.querySelector("main")?.scrollIntoView({ behavior: "smooth" })}
              className={`${ui.button({ size: "lg" })} w-full`}
            >
              Calculate for free
            </button>
          }
          featuresLabel="Every calculation includes"
          features={FREE_FEATURES}
        />

        <TierCard
          id="plan-starter"
          name="Starter"
          description="The Tariff Calculator, unlimited, for anyone pricing imports every week."
          price={<PriceTag listPrice={TARIFF_CALCULATOR_PRICE} billing={billing} />}
          allowanceLabel="Duty calculations"
          allowance={<Allowance value="Unlimited" />}
          allowanceNote="Calculate as often as you need."
          cta={
            <Link href={LINKS.signUp} className={`${ui.button({ size: "lg" })} w-full`}>
              Get Starter
            </Link>
          }
          featuresLabel="Everything in Free, plus"
          features={STARTER_FEATURES}
        />

        <TierCard
          id="plan-pro"
          name="Pro"
          badge="Tariff Tracker"
          featured
          description="Your whole catalog under watch, so you know the moment a tariff change hits."
          price={
            isCustom ? (
              <div>
                <span className={ui.metric.primary} aria-live="polite">
                  Let&apos;s talk
                </span>
                <p className={`${ui.caption} mt-2`}>Priced to fit your catalog</p>
              </div>
            ) : (
              <PriceTag
                listPrice={trackerOption.price ?? 0}
                billing={billing}
                prefix={isLowestTier ? "Starting at" : undefined}
              />
            )
          }
          allowanceLabel="HTS + country pairs"
          allowance={<TrackerTierPicker value={trackerOption} onChange={setTrackerOption} billing={billing} />}
          allowanceNote={trackerNote}
          cta={
            isCustom ? (
              <a
                href={contactLink("Tariff Tracker for a large catalog")}
                className={`${ui.button({ variant: "primary", size: "lg" })} w-full`}
              >
                Talk to us
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <Link href={LINKS.signUp} className={`${ui.button({ variant: "primary", size: "lg" })} w-full`}>
                Start tracking
                <ArrowRightIcon className="h-4 w-4" aria-hidden />
              </Link>
            )
          }
          featuresLabel="Everything in Starter, plus"
          features={PRO_FEATURES}
        />
      </div>

      <p className={ui.caption}>
        Prices in USD. Annual plans are billed once a year at {ANNUAL_DISCOUNT * 100}% off.{" "}
        <Link href="/pricing-calculator" className={ui.link}>
          See all plans and estimate your price
        </Link>
      </p>
    </section>
  );
};
