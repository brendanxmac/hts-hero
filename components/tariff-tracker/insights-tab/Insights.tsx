"use client";

import { ChartStandIn } from "@/components/ui/stand-ins";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { AccountGate } from "../access/AccountGate";
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
import { catalogScale, InsightsInput, SCALE_NOTES } from "./lib/data";
import { useInsightsInput } from "./shared";

// The Insights tab: what the user's own imports teach them, free with an account. The insights
// are picked for the catalog's size: a handful of imports are each explained, dozens are grouped,
// hundreds are ranked and concentrated. Charts of a group (a tariff, a country, a chapter) open
// Your Imports filtered to it. Separate from Rate history for now; the two may merge.

const SCALE_LABELS = { few: "1–4 imports", some: "5–49 imports", many: "50+ imports" };

const ReadyMade = ({ input }: { input: InsightsInput }) => {
  const scale = catalogScale(input.products.length);
  const pair = "grid items-start gap-4 xl:grid-cols-2";
  return (
    <div className="flex flex-col gap-4">
      <Takeaways input={input} scale={scale} />
      {scale === "few" ? (
        <>
          <MostExposed input={input} scale={scale} />
          <div className={pair}>
            <ImportsOverTime input={input} />
            <DutySources input={input} scale={scale} />
          </div>
          <div className={pair}>
            <LastTwelveMonths input={input} />
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
  const scale = catalogScale(input.products.length);

  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 flex items-center gap-2 text-sm text-base-content/70">
        <span className={tt.chip("primary")}>Tuned for {SCALE_LABELS[scale]}</span>
        <span>{SCALE_NOTES[scale]}</span>
      </p>
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
      minHeight="min-h-[28rem]"
    >
      <InsightsReport />
    </AccountGate>
  );
};
