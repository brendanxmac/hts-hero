import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import { FeatureList } from "../plans/FeatureList";

// One plan in the tariff pricing section. On desktop its five parts sit on the section grid's
// shared rows (subgrid), so names, prices, allowances, buttons and features line up across
// cards however long each one runs. The featured plan gets a primary outline, not a fill.
export const TierCard = ({
  id,
  name,
  description,
  badge,
  featured = false,
  price,
  allowanceLabel,
  allowance,
  allowanceNote,
  cta,
  featuresLabel,
  features,
}: {
  id: string;
  name: string;
  description: string;
  badge?: string;
  featured?: boolean;
  price: ReactNode;
  allowanceLabel: string;
  // What the plan allows each month: a fixed value, or the Pro card's tier picker
  allowance: ReactNode;
  allowanceNote: ReactNode;
  cta: ReactNode;
  featuresLabel: string;
  features: string[];
}) => (
  <article
    id={id}
    aria-labelledby={`${id}-title`}
    className={`${ui.card} flex flex-col lg:row-span-5 lg:grid lg:grid-rows-subgrid lg:gap-0 ${featured ? "ring-2 ring-primary" : ""}`}
  >
    <div className="flex flex-col gap-1.5 px-6 pt-6">
      <div className="flex items-center justify-between gap-3">
        <h3 id={`${id}-title`} className="text-lg font-semibold text-base-content">
          {name}
        </h3>
        {badge && <span className={ui.badge(featured ? "primary" : "neutral")}>{badge}</span>}
      </div>
      <p className={ui.bodySm}>{description}</p>
    </div>

    <div className="px-6 pt-6">{price}</div>

    <div className="flex flex-col gap-2 px-6 pt-6">
      <span className={ui.label}>{allowanceLabel}</span>
      {allowance}
      <p className={ui.caption} aria-live="polite">
        {allowanceNote}
      </p>
    </div>

    <div className="px-6 pt-6">{cta}</div>

    <div className="mx-6 mt-6 flex flex-col gap-3 border-t border-base-300 py-6">
      <span className={ui.label}>{featuresLabel}</span>
      <FeatureList features={features} />
    </div>
  </article>
);
