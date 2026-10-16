"use client";

import { ReactNode, useMemo, useState } from "react";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import { formatRate } from "../formatRate";
import { day, groupOf, GROUPS, rateChange, signedRate, type ImpactGroup } from "../impact/format";
import { useUpdateImpact } from "../impact/useUpdateImpact";
import { NEWS_DOTS, newsToneOf } from "../news/tone";
import { useImportMatches, type ImportMatch } from "../news/useImportMatches";
import { sectionUrl, type SectionSlug } from "../sections";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { useTariffHealth } from "./TariffHealth";
import { useTariffUpdates, type TrackerUpdate } from "./useTariffUpdates";

// The Overview's summaries of the Tracker's other pages (DESIGN_SYSTEM §15): Tariff health, the
// latest tariff impacts on the user's imports and the latest tariff news, side by side. Each is the
// headline and a little detail, with a way into the page that has the rest.

const openImpact = (slug: string) => window.history.pushState(null, "", `${sectionUrl("impact")}&update=${encodeURIComponent(slug)}`);

// A box's frame: its title, the link to its page, then what it shows
const SummaryBox = ({ id, title, page, link, children }: { id: string; title: string; page: SectionSlug; link: string; children: ReactNode }) => {
  const { openTab } = useTrackerNav();
  return (
    <section className={`${tt.panel} flex flex-col`} aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-5 lg:px-6">
        <h2 id={id} className={tt.title}>
          {title}
        </h2>
        <button type="button" className={`${ui.link} inline-flex items-center gap-1 text-sm font-semibold`} onClick={() => openTab(page)}>
          {link}
          <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 lg:px-6">{children}</div>
    </section>
  );
};

// ── Tariff health: the score and the three shares behind it ──

export const HealthSummary = () => {
  const h = useTariffHealth();
  const rows = [
    { label: "Alerts on", pct: h.alertsPct, bar: "bg-primary" },
    { label: "Savings reviewed", pct: h.savingsPct, bar: "bg-success" },
    { label: "Entries audited", pct: h.auditPct, bar: "bg-primary" },
  ];
  return (
    <SummaryBox id="tt-health-summary" title="Tariff health" page="health" link="Open">
      <p className="m-0 flex items-baseline gap-2" aria-label={`Tariff health ${h.overall}%`}>
        <span className={`${tt.metric} ${h.overall >= 80 ? "text-success" : "text-primary"}`}>{h.overall}%</span>
        <span className="text-sm text-base-content/60">overall</span>
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-col gap-1.5">
            <span className="flex items-baseline justify-between text-sm">
              <span className="text-base-content/70">{r.label}</span>
              <span className="font-semibold tabular-nums text-base-content">{r.pct}%</span>
            </span>
            <span className="block h-2 w-full overflow-hidden rounded-full bg-tt-soft" aria-hidden>
              {/* Runtime width (DESIGN_SYSTEM §10) */}
              <span className={`block h-full rounded-full ${r.bar}`} style={{ width: `${Math.max(r.pct, r.pct > 0 ? 3 : 0)}%` }} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-4 text-xs text-base-content/60">The share of your {h.imports.toLocaleString("en-US")} imports at each, and their average.</p>
    </SummaryBox>
  );
};

// ── Tariff impacts: the latest actions that hit the user's imports, one at a time ──

const hits = (m?: ImportMatch) => !!m && m.confirmed + m.likely > 0;

export const ImpactsSummary = () => {
  const updates = useTariffUpdates("all");
  const matches = useImportMatches(updates);
  const { products } = useTracker();
  const latest = useMemo(() => (updates ?? []).filter((u) => u.kind !== "hts_revision" && hits(matches.get(u.slug))).slice(0, 5), [updates, matches]);
  const [at, setAt] = useState(0);
  const current: TrackerUpdate | null = latest[Math.min(at, latest.length - 1)] ?? null;
  const { impacts } = useUpdateImpact(current);
  const byKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);
  const order: Record<ImpactGroup, number> = { up: 0, down: 1, same: 2, likely: 3, possible: 4 };
  const shown = (impacts ?? [])
    .filter((i) => i.level !== "possible" && byKey.has(i.key))
    .sort((a, b) => order[groupOf(a)] - order[groupOf(b)] || Math.abs(rateChange(b)) - Math.abs(rateChange(a)));

  return (
    <SummaryBox id="tt-impacts-summary" title="Tariff impacts" page="impact" link="All impacts">
      {!updates ? (
        <div className={`${ui.skeleton} h-40 w-full`} />
      ) : !current ? (
        <p className="text-sm text-base-content/70">No recent tariff action hits your imports. Pick any action on the Tariff Impacts page to check it against them.</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3">
            <span className={tt.eyebrow(newsToneOf(current.kind))}>
              {AUTHORITIES[current.authority] ?? current.authority} · {day(current.last_activity_at, false)}
            </span>
            {latest.length > 1 && (
              <span className="flex items-center gap-1 text-xs tabular-nums text-base-content/60">
                <button type="button" className={ui.button({ variant: "ghost", size: "sm", icon: true })} aria-label="Newer" disabled={at === 0} onClick={() => setAt((n) => n - 1)}>
                  <ChevronLeftIcon className="h-4 w-4" aria-hidden />
                </button>
                {at + 1} of {latest.length}
                <button
                  type="button"
                  className={ui.button({ variant: "ghost", size: "sm", icon: true })}
                  aria-label="Older"
                  disabled={at >= latest.length - 1}
                  onClick={() => setAt((n) => n + 1)}
                >
                  <ChevronRightIcon className="h-4 w-4" aria-hidden />
                </button>
              </span>
            )}
          </div>
          <button type="button" className="mt-1 text-left" onClick={() => openImpact(current.slug)}>
            <span className="line-clamp-2 text-sm font-semibold leading-snug text-base-content hover:text-primary">{current.title}</span>
          </button>
          {!impacts ? (
            <div className={`${ui.skeleton} mt-3 h-24 w-full`} />
          ) : (
            <ul className="mt-3 flex flex-col">
              {shown.slice(0, 3).map((i) => {
                const p = byKey.get(i.key)!;
                const g = groupOf(i);
                return (
                  <li key={i.key} className="flex items-center justify-between gap-3 border-t border-base-300 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: GROUPS[g].mark }} aria-hidden />
                      <span className="font-semibold tabular-nums text-base-content">{p.entry.element.htsno}</span>
                      <span className="truncate text-base-content/60">
                        {p.entry.country.flag} {p.entry.country.name}
                      </span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {i.level === "likely" ? (
                        <span className="text-warning">May apply</span>
                      ) : Math.abs(rateChange(i)) > 0.005 ? (
                        <>
                          <span className="text-base-content/50">{formatRate(i.beforePct!)} → </span>
                          <span className={`font-semibold ${g === "up" ? "text-error" : "text-success"}`}>{formatRate(i.afterPct!)}</span>
                        </>
                      ) : (
                        <span className="text-base-content/60">Same rate</span>
                      )}
                    </span>
                  </li>
                );
              })}
              {shown.length > 3 && <li className="border-t border-base-300 pt-2 text-xs text-base-content/60">and {shown.length - 3} more of your imports</li>}
            </ul>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            {impacts && (
              <span className="text-xs text-base-content/60">
                {(() => {
                  const changed = shown.filter((i) => i.level === "confirmed" && Math.abs(rateChange(i)) > 0.005);
                  const avg = changed.reduce((sum, i) => sum + rateChange(i), 0) / Math.max(1, changed.length);
                  return changed.length ? `Average rate change ${signedRate(avg)}` : `${shown.length} of your imports`;
                })()}
              </span>
            )}
            <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => openImpact(current.slug)}>
              See the details
            </button>
          </div>
        </>
      )}
    </SummaryBox>
  );
};

// ── Tariff news: the latest actions ──

export const NewsSummary = () => {
  const updates = useTariffUpdates("recent");
  const matches = useImportMatches(updates);
  const { openTab } = useTrackerNav();
  return (
    <SummaryBox id="tt-news-summary" title="Tariff news" page="news" link="All news">
      {!updates ? (
        <div className={`${ui.skeleton} h-40 w-full`} />
      ) : !updates.length ? (
        <p className="text-sm text-base-content/70">No new US tariff actions in the last few weeks.</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {updates.slice(0, 5).map((u) => {
            const m = matches.get(u.slug);
            return (
              <li key={u.id}>
                <button
                  type="button"
                  className="flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left hover:bg-tt-soft"
                  onClick={() => (u.kind === "hts_revision" ? openTab("news") : openImpact(u.slug))}
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
