"use client";

import { ChartStandIn } from "@/components/ui/stand-ins";
import * as ui from "@/components/ui/styles";
import { LockedPreview } from "@/components/ui/LockedPreview";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { AccountGate } from "../access/AccountGate";
import { useTrackerAccess } from "../access/accessContext";
import { trialState } from "../plan/trial";
import { InsightsProgress } from "../insights/InsightsProgress";
import { NeedsProducts } from "../shell/NeedsProducts";
import { sectionBySlug } from "../sections";
import { useTracker } from "../TrackerContext";
import { ChapterHeat } from "./builtins/ChapterHeat";
import { DutySources } from "./builtins/DutySources";
import { ImportsOverTime } from "./builtins/ImportsOverTime";
import { LastTwelveMonths } from "./builtins/LastTwelveMonths";
import { MostExposed } from "./builtins/MostExposed";
import { Origins } from "./builtins/Origins";
import { RateLadder } from "./builtins/RateLadder";
import { RecentlyHit } from "./builtins/RecentlyHit";
import { Takeaways } from "./builtins/Takeaways";
import { catalogScale, InsightsInput } from "./lib/data";
import { useInsightsInput } from "./shared";

// The Insights tab: what the user's own imports teach them, on the 14-day trial and paid plans
// (signed out, a free-account gate; after the trial, shown as lost). The insights
// are picked for the catalog's size: a handful of imports are each explained, dozens are grouped,
// hundreds are ranked and concentrated. Charts of a group (a tariff, a country, a chapter) open
// Your Imports filtered to it. Separate from Rate history for now; the two may merge.

const ReadyMade = ({ input }: { input: InsightsInput }) => {
  const scale = catalogScale(input.products.length);
  const pair = "grid gap-4 xl:grid-cols-2";
  return (
    <div className="flex flex-col gap-4">
      <Takeaways input={input} scale={scale} />
      {scale === "few" ? (
        <>
          <MostExposed input={input} scale={scale} />
          {/* Paired by height; the charts grow to end flush with their neighbour */}
          <div className={pair}>
            <DutySources input={input} scale={scale} />
            <LastTwelveMonths input={input} />
          </div>
          <div className={pair}>
            <ImportsOverTime input={input} />
            <RecentlyHit input={input} count={6} />
          </div>
        </>
      ) : (
        <>
          <div className={pair}>
            <DutySources input={input} scale={scale} />
            <LastTwelveMonths input={input} />
          </div>
          {scale === "many" && <ChapterHeat input={input} />}
          <div className={pair}>
            <MostExposed input={input} scale={scale} />
            <Origins input={input} />
          </div>
          <div className={pair}>
            <RecentlyHit input={input} />
            <RateLadder input={input} />
          </div>
        </>
      )}
    </div>
  );
};

const InsightsReport = () => {
  const input = useInsightsInput();

  return (
    <div className="flex flex-col gap-4">
      <InsightsProgress label="Going through the history of" />
      {!input.ready ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <div className={`${ui.skeleton} h-36 w-full`} />
          <div className="grid gap-4 xl:grid-cols-2">
            <div className={`${ui.skeleton} h-96`} />
            <div className={`${ui.skeleton} h-96`} />
          </div>
        </div>
      ) : (
        <ReadyMade input={input} />
      )}
    </div>
  );
};

export const Insights = () => {
  const { items, loading } = useTracker();
  const { access, openUpgrade } = useTrackerAccess();
  const section = sectionBySlug("insights")!;
  if (loading) return <div className={`${ui.skeleton} h-80 w-full`} />;
  if (!items.length) {
    return (
      <NeedsProducts
        title="Add Imports to See What They Teach You"
        body="Insights shows where your duty comes from, what moved it in the last year, and the imports and countries that matter most."
      />
    );
  }
  return (
    <AccountGate
      feature="insights"
      page="tracker"
      title="Learn What Drives the Duty on Your Imports"
      teaser={`Insights on your ${items.length.toLocaleString("en-US")} imports: where the duty comes from, and what changed.`}
      points={section.planned}
      preview={<ChartStandIn title="Where Your Duty Comes From" />}
      minHeight="min-h-112"
    >
      {trialState(access).ended ? (
        // Part of the 14-day trial and the paid plans (PRICING.md): after the trial, shown as lost
        <LockedPreview
          title="Insights Was Part of Your Free Trial"
          teaser={`Get back the insights on your ${items.length.toLocaleString("en-US")} imports: where the duty comes from, and what changed.`}
          points={section.planned}
          preview={<ChartStandIn title="Where Your Duty Comes From" />}
          minHeight="min-h-112"
          onShown={() => trackEvent(MixpanelEvent.LOCKED_FEATURE_VIEWED, { feature: "insights", reason: "plan", page: "tracker" })}
          cta={{
            label: "Get Insights back",
            onClick: () => {
              trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "insights", reason: "plan", page: "tracker" });
              openUpgrade("insights");
            },
          }}
          note="Cancel anytime. Your catalog stays free."
        />
      ) : (
        <InsightsReport />
      )}
    </AccountGate>
  );
};
