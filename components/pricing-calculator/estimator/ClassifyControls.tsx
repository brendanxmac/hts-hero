"use client";

import * as mk from "@/components/ui/marketing/styles";
import {
  Billing,
  CLASSIFY_LICENSE_PRICE,
  CLASSIFY_PLANS,
  ClassifyAudience,
  EstimateInput,
  TEAM_BREAK_EVEN_SEATS,
  TEAM_MIN_CLASSIFICATIONS,
  formatPrice,
  monthlyRate,
} from "../lib/pricing";
import { MAX_SEATS, MIN_SEATS } from "../lib/estimateParams";
import { NumberStepper } from "./NumberStepper";
import { OptionCard } from "./OptionCard";

const AUDIENCES = [
  { id: "individual", label: "Just me" },
  { id: "team", label: "My team" },
] as const;

const badge = "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1";
const priceUnit = "text-sm font-medium text-slate-500";

type ClassifyInput = Pick<EstimateInput, "audience" | "individualPlan" | "seats" | "teamOption">;

// Who's classifying, and the plan that fits: Starter or Pro for one person; for a team, one
// shared workspace or a license per person
export const ClassifyControls = ({
  input,
  onChange,
  billing,
}: {
  input: ClassifyInput;
  onChange: (patch: Partial<ClassifyInput>) => void;
  billing: Billing;
}) => {
  const rate = (listPrice: number) => formatPrice(monthlyRate(listPrice, billing));
  const licensesTotal = input.seats * CLASSIFY_LICENSE_PRICE;
  const workspaceIsCheaper = CLASSIFY_PLANS.team.price < licensesTotal;
  const bestValue = <span className={`${badge} bg-emerald-50 text-emerald-700 ring-emerald-200`}>Best value</span>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={mk.fieldLabel}>
          Who&apos;s classifying?
        </span>
        <div
          role="radiogroup"
          aria-label="Who's classifying"
          className="inline-flex shrink-0 gap-1 rounded-full bg-slate-100 p-1 ring-1 ring-inset ring-slate-200"
        >
          {AUDIENCES.map((option) => {
            const active = option.id === input.audience;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onChange({ audience: option.id as ClassifyAudience })}
                className={`h-9 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60 ${
                  active ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {input.audience === "individual" ? (
        <div role="radiogroup" aria-label="Classify plan" className="grid gap-3 sm:grid-cols-2">
          {(["starter", "pro"] as const).map((id) => (
            <OptionCard
              key={id}
              title={CLASSIFY_PLANS[id].name}
              price={<>{rate(CLASSIFY_PLANS[id].price)}<span className={priceUnit}> /mo</span></>}
              detail={CLASSIFY_PLANS[id].features[0]}
              badge={id === "pro" ? <span className={`${badge} bg-teal-50 text-teal-700 ring-teal-200`}>Most popular</span> : undefined}
              selected={input.individualPlan === id}
              onSelect={() => onChange({ individualPlan: id })}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="classify-seats" className={mk.fieldLabel}>
              People on your team
            </label>
            <NumberStepper
              id="classify-seats"
              value={input.seats}
              onChange={(seats) => onChange({ seats })}
              min={MIN_SEATS}
              max={MAX_SEATS}
              unit="people"
            />
          </div>

          <div role="radiogroup" aria-label="Team plan" className="grid gap-3 sm:grid-cols-2">
            <OptionCard
              title="Team workspace"
              price={<>{rate(CLASSIFY_PLANS.team.price)}<span className={priceUnit}> /mo for your team</span></>}
              detail="Shared workspace, reviews and approvals, onboarding and training"
              badge={workspaceIsCheaper ? bestValue : undefined}
              selected={input.teamOption === "workspace"}
              onSelect={() => onChange({ teamOption: "workspace" })}
            />
            <OptionCard
              title="Separate licenses"
              price={
                <>
                  {rate(licensesTotal)}
                  <span className={priceUnit}>
                    {" "}/mo · {input.seats} × {rate(CLASSIFY_LICENSE_PRICE)}
                  </span>
                </>
              }
              detail="A Classify account for each person, without the shared workspace"
              badge={workspaceIsCheaper ? undefined : bestValue}
              selected={input.teamOption === "licenses"}
              onSelect={() => onChange({ teamOption: "licenses" })}
            />
          </div>

          <p className={`${mk.small} leading-relaxed`}>
            The team workspace is for teams classifying at least {TEAM_MIN_CLASSIFICATIONS} products a month.
            From {TEAM_BREAK_EVEN_SEATS} people, it costs less than a license each.
          </p>
        </>
      )}
    </>
  );
};
