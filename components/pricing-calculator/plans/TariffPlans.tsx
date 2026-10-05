import Link from "next/link";
import * as ui from "@/components/ui/styles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LINKS } from "../lib/links";
import { Billing, TARIFF_CALCULATOR_PRICE, TRACKER_TIERS } from "../lib/pricing";
import { BillingToggle } from "./BillingToggle";
import { CoverageGrid } from "./CoverageGrid";
import { PlanCard } from "./PlanCard";
import { PriceTag } from "./PriceTag";
import { TrackerTierTable } from "./TrackerTierTable";

const CALCULATOR_FEATURES = [
  "Every tariff, exemption and fee for any HTS code and country of origin",
  "Section 232, 301 and 122 tariffs, trade preferences, MPF and HMF, itemized",
  "Compare countries and see how a duty changed over time",
];

const TRACKER_FEATURES = [
  "Includes the Tariff Calculator",
  "Paste or upload your catalog as CSV",
  "The current duty for every product, in one report",
  "See which products a tariff change hits, and by how much",
  "Export reports to share with your team",
];

export const TariffPlans = ({
  billing,
  onBillingChange,
}: {
  billing: Billing;
  onBillingChange: (billing: Billing) => void;
}) => (
  <section id="tariffs" className={ui.section} aria-labelledby="tariffs-title">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <SectionHeader kicker="Tariffs" title="Know every duty before it costs you" titleId="tariffs-title">
        Look up the landed duty on a single import, or keep your whole catalog
        under watch as tariffs change.
      </SectionHeader>
      <BillingToggle billing={billing} onChange={onBillingChange} />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <PlanCard
        id="plan-tariff-calculator"
        name="Tariff Calculator"
        description="For anyone who needs the exact duty on an import, with the reasons behind it."
        price={<PriceTag listPrice={TARIFF_CALCULATOR_PRICE} billing={billing} />}
        features={CALCULATOR_FEATURES}
        cta={
          <Link href={LINKS.calculator} className={`${ui.button({ size: "lg" })} w-full`}>
            Open the calculator
          </Link>
        }
      >
        <CoverageGrid />
      </PlanCard>
      <PlanCard
        id="plan-tariff-tracker"
        name="Tariff Tracker"
        badge="Priced by catalog size"
        featured
        description="For importers who need to know the moment a tariff change hits their products."
        price={<PriceTag listPrice={TRACKER_TIERS[0].price} billing={billing} prefix="From" />}
        features={TRACKER_FEATURES}
        cta={
          <a href={LINKS.estimate} className={`${ui.button({ variant: "primary", size: "lg" })} w-full`}>
            Price your catalog
          </a>
        }
      >
        <TrackerTierTable billing={billing} />
      </PlanCard>
    </div>
  </section>
);
