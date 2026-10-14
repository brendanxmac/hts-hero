"use client";

import { ReactNode } from "react";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import { wholeDollars } from "../../insights/teasers";
import { SUPPLY_NOTES } from "../../insights/savings";
import { formatSaving, Measure } from "../../opportunities/measure";
import { TrackedProduct } from "../../report";
import { Opportunity } from "../../opportunities/OpportunitiesContext";
import { OpportunityTracker } from "../../opportunities/OpportunityTracker";
import { currentSetup, SavingOption } from "../../opportunities/options";
import { RequirementsPanel } from "../../opportunities/RequirementsPanel";
import { SetupComparison } from "../../opportunities/SetupComparison";

// One way to save, guided in three steps: how it compares with today (side by side, with what it
// saves), then what it takes to secure and where the user has got to with it, next to each other
// on wide screens.

const Step = ({ number, title, aside, children }: { number: number; title: string; aside?: ReactNode; children: ReactNode }) => (
  <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-label={title}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-base-content text-xs font-bold text-base-100">{number}</span>
        <h3 className={tt.title}>{title}</h3>
      </div>
      {aside}
    </div>
    {children}
  </section>
);

export const OptionDetail = ({
  product,
  option,
  opportunity,
  shipmentsPerYear,
  measure,
}: {
  product: TrackedProduct;
  option?: SavingOption;
  opportunity?: Opportunity;
  shipmentsPerYear: number;
  measure: Measure;
}) => {
  const kind = option?.kind ?? opportunity?.kind ?? "program";
  const usd = option?.usd ?? opportunity?.usdPerShipment ?? 0;
  const savedUsd = option ? option.usd : opportunity ? ((opportunity.rateBefore - opportunity.rateAfter) / 100) * product.customsValue : 0;

  // What it saves, beside the comparison's title
  const worth = (option || opportunity) && (
    <div className="text-right">
      <span className={`${tt.metricSm} text-success`}>{formatSaving(measure === "pct" ? savedUsd : usd, product.customsValue, measure)}</span>
      <span className="block text-xs text-base-content/60">
        {measure === "pct"
          ? `off the rate${kind === "exemption" ? ", if it applies" : ", if you qualify"}`
          : `less per shipment · ${wholeDollars(usd * shipmentsPerYear)} a year`}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {option?.supply && option.supply !== "proven" && (
        <p className={`${ui.notice("warning")} text-sm`}>
          <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
          {SUPPLY_NOTES[option.supply]}.{" "}
          {option.supply === "unproven"
            ? "The US didn't import this product from here last year, so find out whether a supplier can make it before counting on it. It isn't counted in your totals."
            : "Census has no import figures for this code, so this is on duty alone: check that suppliers there can make it."}
        </p>
      )}

      {option ? (
        <Step number={1} title="Compare it with today" aside={worth}>
          {option.kind === "exemption" && (
            <div className="flex flex-col gap-1.5">
              <p className={`${tt.subtitle} m-0`}>{option.detail}</p>
              {(option.headings ?? []).map((h) => (
                <p key={h.code} className="m-0 flex flex-wrap items-baseline gap-2 text-sm">
                  <span className={`${mono.className} font-semibold text-base-content`}>{h.code}</span>
                  {h.name && <span className="text-base-content/70">{h.name}</span>}
                </p>
              ))}
            </div>
          )}
          <SetupComparison
            customsValue={product.customsValue}
            shipmentsPerYear={shipmentsPerYear}
            measure={measure}
            setups={[
              { id: "today", label: "What you pay", setup: currentSetup(product), result: product.result, baseline: true },
              { id: option.id, label: option.title, setup: option.setup, result: option.result },
            ]}
          />
        </Step>
      ) : (
        <div className={`${ui.notice("primary")} flex items-center justify-between gap-4 text-sm`}>
          <span>{opportunity?.title}: applied to your catalog, so this product pays it today.</span>
          {worth}
        </div>
      )}

      <div className="grid items-start gap-4 min-[1440px]:grid-cols-2">
        <Step number={option ? 2 : 1} title="What it takes">
          <RequirementsPanel kind={kind} />
        </Step>
        <Step number={option ? 3 : 2} title="Track it">
          <OpportunityTracker key={option?.id ?? opportunity?.id} product={product} option={option} opportunity={opportunity} />
        </Step>
      </div>
    </div>
  );
};
