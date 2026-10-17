"use client";

import { ReactNode } from "react";
import { AccountGate } from "@/components/tariff-tracker/access/AccountGate";
import { CardRow } from "@/components/ui/Card";
import * as ui from "@/components/ui/styles";
import { DetailsLink, Headline, Moved, OverviewTab, PartHeader, PayLess, pct, RateSources, Watch } from "./parts";
import { Overview } from "./useOverview";

// The Overview tab: everything about this tariff at a high level, on one page, before the detail
// tabs. On /duty-calculator, and as the first tab of an import's page in the Tracker. On top, side
// by side: the rate, big, with its story in plain English, and where the rate comes from (each
// tariff with why it applies). Under it, could you pay less, full width with its two halves side
// by side (exemptions and savings, to the Duty tab; other countries to source from, to Compare),
// then its duty history beside news about it. Signed out, could you pay less and the news are
// blurred behind a free account's teaser. Sections of the results box, never cards inside it.

const COLUMN = `${ui.cardSection} flex min-w-0 flex-col gap-4 !py-5`;

// Signed out, the parts that need a free account show blurred, with a teaser from this import's
// own numbers and the sign-up (AccountGate, the accepted blur: DESIGN_SYSTEM §10.5)
const Gate = ({ title, teaser, points, children }: { title: string; teaser: string; points: string[]; children: ReactNode }) => (
  <AccountGate feature="overview" page="calculator_overview" title={title} teaser={teaser} points={points} preview={children} minHeight="min-h-[18rem]" framed={false}>
    {children}
  </AccountGate>
);

const PAY_LESS_POINTS = [
  "Exemptions and trade programs that could lower this duty",
  "Cheaper countries that already ship this to the US, with their rates",
];

const NEWS_POINTS = ["Tariff actions that name this product or its country", "Exemptions that depend on answers about your goods"];

// Savings are always "could"
const payLessTeaser = (o: Overview) => {
  const ways = o.savings.length + (o.cheaper?.length ?? 0);
  const best = Math.max(o.savings[0]?.pct ?? 0, o.cheaper?.[0] ? o.ratePct - o.cheaper[0].pct : 0);
  return ways && best > 0.005
    ? `This duty could be up to ${pct(best)} lower: ${ways} ${ways === 1 ? "way" : "ways"} to check.`
    : "See every way this duty could be lower.";
};

const newsTeaser = (o: Overview) =>
  o.news?.length ? `${o.news.length} recent tariff ${o.news.length === 1 ? "update names" : "updates name"} this product or country.` : "Know when tariff news touches this import.";

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
        <Gate title="See How You Could Pay Less, Free" teaser={payLessTeaser(o)} points={PAY_LESS_POINTS}>
          <PayLess o={o} onSavings={openAdjustments} onSourcing={() => onOpenTab("compare")} wide />
        </Gate>
      </section>
      <CardRow className="lg:grid-cols-2">
        <section className={COLUMN}>
          <PartHeader title="Duty History" hint="This import's duty rate over time" />
          <Moved o={o} />
          <div className="mt-auto">
            <DetailsLink label="See the full history" onClick={() => onOpenTab("history")} />
          </div>
        </section>
        <section className={COLUMN}>
          <PartHeader title="News About This Import" hint="Recent tariff news that may touch this import" />
          <Gate title="See the News About This Import, Free" teaser={newsTeaser(o)} points={NEWS_POINTS}>
            <div className="flex flex-col gap-4">
              <Watch o={o} />
              <a href="/tariff-updates" target="_blank" rel="noopener" className={`${ui.link} text-sm`}>
                All tariff news
              </a>
            </div>
          </Gate>
        </section>
      </CardRow>
    </>
  );
};
