import Link from "next/link";
import { UsersIcon } from "@heroicons/react/20/solid";
import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
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
import { PlanPrice } from "./PlanPrice";

const PLAN_ORDER: ClassifyPlanId[] = ["starter", "pro", "team"];

export const ClassifyPlans = ({ billing }: { billing: Billing }) => (
  <section id="classification" className="scroll-mt-24" aria-labelledby="classification-title">
    <SectionIntro eyebrow="Classification" title="Classifications you can defend" id="classification-title">
      Build audit-ready HTS classifications backed by the legal notes and CROSS rulings, for one person or a whole compliance
      team.
    </SectionIntro>

    <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              <PlanPrice
                listPrice={plan.price}
                billing={billing}
                note={
                  isTeam
                    ? billing === "annual"
                      ? `${formatPrice(monthlyRate(plan.price, billing) * 12)} billed yearly, for your whole team`
                      : "Billed monthly, for your whole team"
                    : undefined
                }
              />
            }
            features={plan.features}
            cta={
              isTeam ? (
                <a href={contactLink("Classify Team")} className={`${mk.buttonSecondary} h-14 w-full text-lg`}>
                  Talk to us
                </a>
              ) : (
                <Link href={LINKS.classify} className={`${isFeatured ? mk.buttonPrimary : mk.buttonSecondary} h-14 w-full text-lg`}>
                  Start with {plan.name}
                </Link>
              )
            }
          />
        );
      })}
    </div>

    <p className={`${mk.small} mt-4`}>The Team plan is for teams classifying at least {TEAM_MIN_CLASSIFICATIONS} products a month.</p>

    {/* Licenses: for teams that want separate accounts rather than a shared workspace */}
    <div className={`${mk.card} mt-6 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between`}>
      <div className="flex gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <UsersIcon className="h-6 w-6" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-slate-900">Separate licenses for your team</h3>
          <p className={`${mk.body} max-w-2xl`}>
            Give each person their own Classify account at a per-person rate. No shared workspace or approvals, just one
            invoice.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-5">
        <p className="whitespace-nowrap">
          <span className="text-3xl font-extrabold tabular-nums text-slate-900">
            {formatPrice(monthlyRate(CLASSIFY_LICENSE_PRICE, billing))}
          </span>
          <span className="text-slate-500"> /person/mo</span>
        </p>
        <a href={LINKS.estimate} className={mk.buttonSecondary}>
          Price your team
        </a>
      </div>
    </div>
  </section>
);
