"use client";

import { CardRow } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { DetailsLink, Headline, Moved, OverviewTab, PartHeader, PayLess, RateSources, Watch } from "./parts";
import { Overview } from "./useOverview";

// The Overview tab: everything about this tariff at a high level, on one page, before the detail
// tabs. On top, side by side: the answer (the rate, big, what it is on this shipment, three
// headline numbers) and where the rate comes from (each tariff with why it applies). Under it,
// could you pay less, full width with its two halves side by side (exemptions and savings, to the
// Duty tab; other countries to source from, to Compare), then how it has moved (History) beside
// what to watch (Tariff News). Sections of the results box, never cards inside it.

const COLUMN = `${ui.cardSection} flex min-w-0 flex-col gap-4 !py-5`;

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
  // The Duty tab, scrolled to Possible Adjustments (clear of the sticky site header)
  const openAdjustments = () => {
    onOpenTab("duty");
    window.setTimeout(() => {
      const el = document.getElementById("possible-adjustments");
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: "smooth" });
    }, 80);
  };
  return (
    <>
      <CardRow className="lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section className={`${ui.cardSection} !py-6`} aria-label="The answer">
          <Headline o={o} />
        </section>
        <section className={`${ui.cardSection} flex flex-col gap-4 !py-6`}>
          <PartHeader title="Where Your Rate Comes From" hint="Each tariff on this import, and why it applies" link={<DetailsLink label="Full breakdown" onClick={() => onOpenTab("duty")} />} />
          <RateSources o={o} colors={colors} canSee={canSee} onLocked={onLocked} />
        </section>
      </CardRow>
      <section className={COLUMN}>
        <PartHeader title="Could You Pay Less?" hint="Potential savings, if your goods qualify" />
        <PayLess o={o} onSavings={openAdjustments} onSourcing={() => onOpenTab("compare")} wide />
      </section>
      <CardRow className="lg:grid-cols-2">
        <section className={COLUMN}>
          <PartHeader title="How It's Moved" hint="This import's duty rate over time" />
          <Moved o={o} />
          <div className="mt-auto">
            <DetailsLink label="See the full history" onClick={() => onOpenTab("history")} />
          </div>
        </section>
        <section className={COLUMN}>
          <PartHeader title="What To Watch" hint="Recent tariff news that may touch this import" />
          <Watch o={o} />
          <a href="/tariff-updates" target="_blank" rel="noopener" className={`${ui.link} mt-auto text-sm`}>
            All tariff news
          </a>
        </section>
      </CardRow>
    </>
  );
};
