import Link from "next/link";
import { UsersIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LINKS, contactLink } from "../lib/links";
import {
  Billing,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  ClassifyPlanId,
  TEAM_MIN_CLASSIFICATIONS,
  formatPrice,
  monthlyRate,
} from "../lib/pricing";
import { PlanCard } from "./PlanCard";
import { PriceTag } from "./PriceTag";

const PLAN_ORDER: ClassifyPlanId[] = ["starter", "pro", "team"];

export const ClassifyPlans = ({ billing }: { billing: Billing }) => (
  <section id="classification" className={ui.section} aria-labelledby="classification-title">
    <SectionHeader kicker="Classification" title="Classifications you can defend" titleId="classification-title">
      Build audit-ready HTS classifications backed by the legal notes and CROSS
      rulings, for one person or a whole compliance team.
    </SectionHeader>

    <div className="grid gap-6 lg:grid-cols-3">
      {PLAN_ORDER.map((id) => {
        const plan = CLASSIFY_PLANS[id];
        const isTeam = id === "team";
        const isFeatured = id === "pro";
        return (
          <PlanCard
            key={id}
            id={`plan-classify-${id}`}
            name={plan.name}
            description={plan.description}
            badge={isFeatured ? "Most popular" : isTeam ? "Shared workspace" : undefined}
            featured={isFeatured}
            price={
              <PriceTag
                listPrice={plan.price}
                billing={billing}
                unit={isTeam ? "/mo for your team" : "/mo"}
              />
            }
            features={plan.features}
            cta={
              isTeam ? (
                <a href={contactLink("Classify Team")} className={`${ui.button({ size: "lg" })} w-full`}>
                  Talk to us
                </a>
              ) : (
                <Link
                  href={LINKS.classify}
                  className={`${ui.button({ variant: isFeatured ? "primary" : "secondary", size: "lg" })} w-full`}
                >
                  Start with {plan.name}
                </Link>
              )
            }
          />
        );
      })}
    </div>

    <p className={ui.caption}>
      The Team plan is for teams classifying at least {TEAM_MIN_CLASSIFICATIONS} products a month.
    </p>

    {/* Licenses: for teams that want separate accounts rather than a shared workspace */}
    <div className={`${ui.card} flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between`}>
      <div className="flex gap-4">
        <UsersIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div className="flex flex-col gap-1">
          <h3 className={ui.cardTitle}>Separate licenses for your team</h3>
          <p className={`${ui.bodySm} max-w-2xl`}>
            Give each person their own Classify account at a per-person rate.
            No shared workspace or approvals, just one invoice.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        <p className="whitespace-nowrap">
          <span className="text-2xl font-semibold tabular-nums text-base-content">
            {formatPrice(monthlyRate(CLASSIFY_LICENSE_PRICE, billing))}
          </span>
          <span className={ui.bodySm}> /person/mo</span>
        </p>
        <a href={LINKS.estimate} className={ui.button()}>
          Price your team
        </a>
      </div>
    </div>
  </section>
);
