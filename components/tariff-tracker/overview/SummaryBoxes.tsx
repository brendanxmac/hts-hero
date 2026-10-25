"use client";

import { ReactNode } from "react";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { InfoTip } from "@/components/ui/InfoTip";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import { day } from "../impact/format";
import { NEWS_DOTS, newsToneOf } from "../news/tone";
import { useImportMatches, type ImportMatch } from "../news/useImportMatches";
import { TRACKER_PATH, type SectionSlug } from "../sections";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTariffUpdates } from "./useTariffUpdates";

// Home's summary of the latest tariff actions (DESIGN_SYSTEM §15): the headline and a little
// detail, with a way into Tariff Changes, which has the rest.

const openAction = (slug: string) => window.history.pushState(null, "", `${TRACKER_PATH}?tab=changes&update=${encodeURIComponent(slug)}`);
const hits = (m?: ImportMatch) => !!m && m.confirmed + m.likely > 0;

// A box's frame: its title (Title Case) with an (i) that explains it, the link to its page, then
// what it shows
const SummaryBox = ({
  id,
  title,
  info,
  page,
  link,
  children,
}: {
  id: string;
  title: string;
  info: ReactNode;
  page?: SectionSlug;
  link?: string;
  children: ReactNode;
}) => {
  const { openTab } = useTrackerNav();
  return (
    <section className={`${tt.panel} flex h-full flex-col`} aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 lg:px-6">
        <span className="flex items-center gap-2">
          <h2 id={id} className={tt.title}>
            {title}
          </h2>
          <InfoTip label={`About ${title}`}>{info}</InfoTip>
        </span>
        {page && link && (
          <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-sm font-semibold`} onClick={() => openTab(page)}>
            {link}
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
      {/* Fills the card; in a row of fixed height, what doesn't fit is cut at the card's foot */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-5 lg:px-6">{children}</div>
    </section>
  );
};

// ── Tariff news: the latest actions ──

export const NewsSummary = () => {
  const updates = useTariffUpdates("recent");
  const matches = useImportMatches(updates);
  return (
    <SummaryBox
      id="tt-news-summary"
      title="Latest Tariff Actions"
      info="The newest US tariff actions from the White House, the Federal Register, CBP, USTR and the USITC, checked every hour. Open one to see what it does to your imports."
      page="changes"
      link="All actions"
    >
      {!updates ? (
        <div className={`${ui.skeleton} h-40 w-full`} />
      ) : !updates.length ? (
        <p className="text-sm text-base-content/70">No new US tariff actions in the last few weeks.</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {updates.slice(0, 8).map((u) => {
            const m = matches.get(u.slug);
            return (
              <li key={u.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-tt-soft"
                  onClick={() => openAction(u.slug)}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NEWS_DOTS[newsToneOf(u.kind)]}`} aria-hidden />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="line-clamp-1 text-sm font-semibold text-base-content">{u.title}</span>
                    <span className="text-xs text-base-content/60">
                      {AUTHORITIES[u.authority] ?? u.authority} · {day(u.last_activity_at, false)}
                      {hits(m) && <span className={`font-semibold ${m!.confirmed ? "text-error" : "text-warning"}`}> · Hits {m!.confirmed + m!.likely} of your imports</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </SummaryBox>
  );
};
