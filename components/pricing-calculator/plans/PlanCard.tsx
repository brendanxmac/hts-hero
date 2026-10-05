import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import { FeatureList } from "./FeatureList";

// One plan: its name and pitch, its price, what's included and a call to action.
// The featured plan is marked by a primary outline and badge, not a tinted fill.
export const PlanCard = ({
  id,
  name,
  description,
  price,
  features,
  cta,
  badge,
  featured = false,
  children,
}: {
  id?: string;
  name: string;
  description: string;
  price: ReactNode;
  features: string[];
  cta: ReactNode;
  badge?: string;
  featured?: boolean;
  // Anything between the price and the features, like a tier table
  children?: ReactNode;
}) => (
  <article
    id={id}
    aria-labelledby={id ? `${id}-title` : undefined}
    className={`${ui.card} flex flex-col ${featured ? "ring-2 ring-primary" : ""}`}
  >
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <h3 id={id ? `${id}-title` : undefined} className="text-lg font-semibold text-base-content">
            {name}
          </h3>
          {badge && <span className={ui.badge(featured ? "primary" : "neutral")}>{badge}</span>}
        </div>
        <p className={ui.bodySm}>{description}</p>
      </div>
      {price}
      {children}
      <div className="border-t border-base-300 pt-5">
        <FeatureList features={features} />
      </div>
    </div>
    <div className="px-6 pb-6">{cta}</div>
  </article>
);
