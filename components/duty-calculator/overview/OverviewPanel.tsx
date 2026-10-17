"use client";

import { CardRow } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { Answer, DetailsLink, Moved, OverviewTab, PartHeader, PayLess, Stats, Watch, Why } from "./parts";
import { Overview } from "./useOverview";

// The Overview tab: everything about this tariff at a high level, on one page, before the detail
// tabs. The answer with its big numbers and where the rate comes from, then four parts side by
// side, each with the way to its details: why each tariff applies (Duty), what could make it
// lower (Duty's Possible Adjustments, and Compare's cheaper origins), how it has moved (History)
// and what to watch (Tariff News). Sections of the results box, never cards inside it.

export const OverviewPanel = ({
  o,
  colors,
  canSee,
  onLocked,
  onOpenTab,
}: {
  o: Overview | null;
  colors: Record<string, string>;
  canSee: boolean;
  onLocked: () => void;
  onOpenTab: (tab: OverviewTab) => void;
}) => {
  if (!o) return <div className={`${ui.skeleton} m-5 h-96`} />;
  return (
    <>
      <div className={`${ui.cardSection} flex flex-col gap-6 !py-6`}>
        <Answer o={o} colors={colors} />
        <Stats o={o} />
      </div>
      <CardRow className="lg:grid-cols-2">
        <section className={`${ui.cardSection} flex flex-col gap-4 !py-5`}>
          <PartHeader title="Why You Pay It" hint="Each tariff on this import, in plain English" link={<DetailsLink label="Full breakdown" onClick={() => onOpenTab("duty")} />} />
          <Why o={o} colors={colors} canSee={canSee} onLocked={onLocked} />
        </section>
        <section className={`${ui.cardSection} flex flex-col gap-4 !py-5`}>
          <PartHeader title="Could You Pay Less?" hint="Potential savings, if your goods qualify" link={<DetailsLink label="Compare countries" onClick={() => onOpenTab("compare")} />} />
          <PayLess o={o} />
        </section>
      </CardRow>
      <CardRow className="lg:grid-cols-2">
        <section className={`${ui.cardSection} flex flex-col gap-4 !py-5`}>
          <PartHeader title="How It's Moved" hint="The duty rate on this import over time" link={<DetailsLink label="Full history" onClick={() => onOpenTab("history")} />} />
          <Moved o={o} />
        </section>
        <section className={`${ui.cardSection} flex flex-col gap-4 !py-5`}>
          <PartHeader
            title="What To Watch"
            hint="Recent tariff news that may touch this import"
            link={
              <a href="/tariff-updates" target="_blank" rel="noopener" className={`${ui.link} shrink-0 text-sm`}>
                All tariff news
              </a>
            }
          />
          <Watch o={o} />
        </section>
      </CardRow>
    </>
  );
};
