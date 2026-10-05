"use client";

import * as ui from "@/components/ui/styles";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
  const bestValue = <span className={ui.badge("success")}>Best value</span>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className={ui.fieldLabel}>
          Who&apos;s classifying?
        </span>
        <SegmentedControl
          label="Who's classifying"
          options={AUDIENCES}
          value={input.audience}
          onChange={(audience: ClassifyAudience) => onChange({ audience })}
          size="sm"
        />
      </div>

      {input.audience === "individual" ? (
        <div role="radiogroup" aria-label="Classify plan" className="grid gap-3 sm:grid-cols-2">
          {(["starter", "pro"] as const).map((id) => (
            <OptionCard
              key={id}
              title={CLASSIFY_PLANS[id].name}
              price={<>{rate(CLASSIFY_PLANS[id].price)}<span className={ui.caption}> /mo</span></>}
              detail={CLASSIFY_PLANS[id].features[0]}
              badge={id === "pro" ? <span className={ui.badge("primary")}>Most popular</span> : undefined}
              selected={input.individualPlan === id}
              onSelect={() => onChange({ individualPlan: id })}
            />
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="classify-seats" className={ui.fieldLabel}>
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
              price={<>{rate(CLASSIFY_PLANS.team.price)}<span className={ui.caption}> /mo for your team</span></>}
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
                  <span className={ui.caption}>
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

          <p className={ui.caption}>
            The team workspace is for teams classifying at least {TEAM_MIN_CLASSIFICATIONS} products a month.
            From {TEAM_BREAK_EVEN_SEATS} people, it costs less than a license each.
          </p>
        </>
      )}
    </>
  );
};
