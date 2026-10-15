"use client";

import { useMemo } from "react";
import * as tt from "@/components/ui/styles/tracker";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import { NEWS_DOTS as DOTS, newsToneOf as toneOf } from "../news/tone";
import { todayIso } from "../../duty-calculator/lib/format";
import { shortDate } from "../../duty-calculator/rate-history/format";
import { tariffNews } from "./lib/news";
import { useTariffUpdates } from "./useTariffUpdates";
import { matchLabel, useImportMatches } from "../news/useImportMatches";

// The tariff news tape across the top of the Overview, as pills with a colored dot: the latest
// tariff actions from /tariff-updates (proclamations, Federal Register notices, CBP guidance,
// USTR, HTS revisions), newest first, each opening its update; then tariffs coming into effect
// soon, from the verified tariff data. Color is meaning: red a new or higher tariff, green one
// lifted, amber a heads-up, cobalt the rest.

const PILL = "flex h-9 shrink-0 items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3.5 text-sm";
// Coming tariffs from the engine, at most this many, after the latest actions
const COMING = 3;
const ACTIONS = 8;

export const NewsTape = () => {
  const today = todayIso();
  const coming = useMemo(() => tariffNews(today).filter((n) => n.date > today).slice(0, COMING), [today]);
  const updates = useTariffUpdates();
  const matches = useImportMatches(updates);
  const date = (iso: string) => shortDate(iso.slice(0, 10), iso.slice(0, 4) !== today.slice(0, 4));

  if (!coming.length && !updates?.length) return null;
  return (
    <div aria-label="Tariff news" className="flex items-center gap-2 overflow-x-auto px-1 pb-1">
      <span className="shrink-0 pr-1 text-xs font-bold uppercase tracking-wider text-base-content/60">Tariff news</span>
      {(updates ?? []).slice(0, ACTIONS).map((u) => (
        <a
          key={u.slug}
          href={`/tariff-updates/${u.slug}`}
          target="_blank"
          rel="noopener"
          title={u.title}
          className={`${PILL} transition-colors hover:border-base-content/20 hover:bg-tt-soft`}
        >
          <span className={`h-2 w-2 shrink-0 rounded-full ${DOTS[toneOf(u.kind)]}`} aria-hidden />
          <b className="shrink-0 font-semibold text-base-content">{AUTHORITIES[u.authority] ?? u.authority}</b>
          <span className="max-w-[22rem] truncate text-base-content/70">{u.title}</span>
          <span className="shrink-0 text-base-content/50">· {date(u.last_activity_at)}</span>
          {(() => {
            const m = matches.get(u.slug);
            if (!m || m.confirmed + m.likely === 0) return null;
            const label = matchLabel(m);
            return <span className={`${tt.chip(label.tone)} shrink-0`}>{label.text}</span>;
          })()}
        </a>
      ))}
      {coming.length > 0 && <span className="shrink-0 pl-2 pr-1 text-xs font-bold uppercase tracking-wider text-base-content/60">Coming</span>}
      {coming.map((n) => (
        <span key={`${n.tag}-${n.date}`} className={PILL} title="From the verified tariff data">
          <span className={`h-2 w-2 rounded-full ${DOTS[n.tone]}`} aria-hidden />
          <b className="font-semibold text-base-content">{n.tag}</b>
          <span className="text-base-content/70">
            {n.text} · {date(n.date)}
          </span>
        </span>
      ))}
      {updates && updates.length > 0 && (
        <a href="/tariff-updates" target="_blank" rel="noopener" className={`${PILL} font-semibold text-primary hover:bg-tt-soft`}>
          All updates
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </a>
      )}
    </div>
  );
};
