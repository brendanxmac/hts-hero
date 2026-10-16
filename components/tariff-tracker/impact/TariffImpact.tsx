"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { StatStrip } from "@/components/ui/StatStrip";
import { Countries } from "@/constants/countries";
import { STAGE_LABELS } from "@/components/tariff-updates/labels";
import { AUTHORITIES, KINDS } from "@/libs/tariff-updates/types";
import type { ImportImpact } from "@/libs/tariff-updates/impactOf";
import { todayIso } from "../../duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { newsToneOf } from "../news/tone";
import { useImportMatches } from "../news/useImportMatches";
import { useTariffUpdates, type TrackerUpdate } from "../overview/useTariffUpdates";
import { sectionBySlug, TRACKER_PATH } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { SectionHeader } from "../shell/SectionPage";
import { useTracker } from "../TrackerContext";
import { ActionList } from "./ActionList";
import { OriginBars, RateShift, type OriginRow, type ShiftRow } from "./ImpactCharts";
import { ImpactImports, type Show } from "./ImpactImports";
import { day, groupOf, GROUP_ORDER, GROUPS, rateChange, relativeDays, signedRate } from "./format";
import { useReviewList, type ImpactCheck } from "./useReviewList";
import { useUpdateImpact } from "./useUpdateImpact";

// Tariff Impacts: pick any tariff action and see exactly which of your imports it hits. The
// actions down the left (ActionList); the open one on the right as one card: what it is, then the answer for the catalog
// as a stat strip like the Overview's. Under it, the imports it affects laid out like Your imports,
// then the rates it moves and the countries it lands on. Worked out live with the code the
// alerts use, so it's where an alert's link lands (?tab=impact&update=slug) and where the admin
// checks an action before approving its alerts (actions still in review show for the admin only).

const byCode = new Map(Countries.map((c) => [c.code, c]));
const countryLabel = (codes: string[]) => {
  if (codes.includes("ALL")) return "All countries";
  const names = codes.map((c) => byCode.get(c)?.name ?? c);
  return names.length > 4 ? `${names.slice(0, 4).join(", ")} and ${names.length - 4} more` : names.join(", ");
};

const urlFor = (slug: string) => `${TRACKER_PATH}?tab=impact&update=${encodeURIComponent(slug)}`;

// The action, and what it does to the catalog
const ActionCard = ({ update, check, today, impacts, total }: { update: TrackerUpdate; check?: ImpactCheck; today: string; impacts: ImportImpact[] | null; total: number }) => {
  const { products } = useTracker();
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [update.id]);
  const effective = update.effective_on;
  const upcoming = !!effective && effective > today;
  const tone = newsToneOf(update.kind);

  const confirmed = (impacts ?? []).filter((i) => i.level === "confirmed");
  const likely = (impacts ?? []).filter((i) => i.level === "likely").length;
  // The changes in the duty rate it confirms: on average, and the biggest
  const rated = confirmed.filter((i) => i.beforePct !== null && i.afterPct !== null && Math.abs(rateChange(i)) > 0.005);
  const average = rated.reduce((sum, i) => sum + rateChange(i), 0) / Math.max(1, rated.length);
  const biggest = rated.reduce<ImportImpact | null>((top, i) => (!top || Math.abs(rateChange(i)) > Math.abs(rateChange(top)) ? i : top), null);
  const biggestProduct = biggest ? products.find((p) => p.key === biggest.key) : null;
  const ups = rated.filter((i) => rateChange(i) > 0).length;
  const downs = rated.length - ups;
  const pending = impacts === null;
  const meta = [update.countries.length ? countryLabel(update.countries) : null, update.products].filter(Boolean).join(" · ");
  const long = update.summary.length > 240;

  return (
    <section className={`${tt.panel} overflow-hidden`} aria-labelledby="tt-impact-title">
      <div className="flex flex-col gap-3 px-6 py-5">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-2">
            <span className={tt.eyebrow(tone)}>
              {AUTHORITIES[update.authority] ?? update.authority} · {KINDS[update.kind] ?? update.kind} · {STAGE_LABELS[update.stage]}
            </span>
            <h2 id="tt-impact-title" className={`${tt.display} text-xl font-semibold leading-snug text-base-content`}>
              {update.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {check && (
              <a href={`/tariff-sources?update=${update.id}`} target="_blank" rel="noopener" className={ui.button({ variant: "ghost", size: "sm" })}>
                Review alerts
              </a>
            )}
            <a href={`/tariff-updates/${update.slug}`} target="_blank" rel="noopener" className={ui.button({ variant: "secondary", size: "sm" })}>
              Full update
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
        <p className={`text-sm leading-relaxed text-base-content/75 ${more ? "" : "line-clamp-2"}`}>{update.summary}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/60">
          {meta && <span className="line-clamp-1 max-w-3xl">{meta}</span>}
          {long && (
            <button type="button" className={`${ui.link} text-sm`} onClick={() => setMore((m) => !m)}>
              {more ? "Show less" : "Read the full summary"}
            </button>
          )}
          {check?.inReview && <span className="font-semibold text-warning">In review: users don&apos;t see it yet</span>}
          {check?.eligible && !check.inReview && (
            <span className={`font-semibold ${check.approvedAt ? "text-success" : "text-warning"}`}>
              {check.approvedAt ? `Alerts sent ${day(check.approvedAt, false)} to ${check.alerted ?? 0} accounts` : "Alerts not approved yet"}
            </span>
          )}
        </div>
      </div>
      <StatStrip
        framed={false}
        label="What it does to your imports"
        className="border-t border-base-300"
        stats={[
          {
            label: "Rate change",
            info: "The average change in duty rate on the imports this action changes: each one's rate from the day it takes effect, minus the day before. Imports where it only adds a new Chapter 99 number at the same rate aren't counted.",
            value: pending ? "…" : rated.length ? signedRate(average) : confirmed.length ? "None" : "—",
            tone: average > 0.005 ? "error" : average < -0.005 ? "success" : undefined,
            note: pending
              ? "Checking your imports"
              : rated.length
                ? ups && downs
                  ? `Average: ${ups} up, ${downs} down`
                  : `Average of ${rated.length}`
                : confirmed.length
                  ? "New Chapter 99 numbers, same rates"
                  : likely
                    ? "Confirmed once it's in the HTS"
                    : "Nothing it changes",
          },
          {
            label: "Imports hit",
            info: "Your imports this action affects. Confirmed: the duty engine applies it to them. May apply: its scope names their code and country, before the change is in the HTS. Imports that only share a country it names aren't counted.",
            value: pending ? (
              "…"
            ) : (
              <>
                {confirmed.length + likely}
                <span className="text-base font-medium text-base-content/50"> of {total.toLocaleString("en-US")}</span>
              </>
            ),
            note: pending ? "" : likely ? `${confirmed.length} confirmed · ${likely} may apply` : "All confirmed",
          },
          {
            label: "Biggest change",
            info: "The import whose duty rate this action moves the most, up or down, and by how much.",
            value: pending ? "…" : biggest ? signedRate(rateChange(biggest)) : "—",
            tone: biggest ? (rateChange(biggest) > 0 ? "error" : "success") : undefined,
            note: biggest && biggestProduct ? `${biggestProduct.entry.element.htsno} · ${biggestProduct.entry.country.code}` : "Confirmed imports only",
          },
          {
            label: upcoming ? "Takes effect" : "In effect",
            info: "The date the action applies from, to goods entered on or after it, as the official notice sets it.",
            value: effective ? day(effective) : "Not set",
            tone: upcoming ? "primary" : undefined,
            note: effective ? relativeDays(effective, today) : "No date announced yet",
          },
        ]}
      />
    </section>
  );
};

export const TariffImpact = () => {
  const params = useSearchParams();
  const { items, products, loading } = useTracker();
  const { signedIn } = useTrackerAccess();
  const published = useTariffUpdates("all");
  const review = useReviewList(signedIn);
  const today = todayIso();
  const section = sectionBySlug("impact")!;

  // Every action but HTS revisions (they only confirm the actions they carry out); the admin's
  // actions still in review mixed in by date
  const updates = useMemo(() => {
    if (!published) return null;
    const all = [...published, ...(review?.pending ?? [])].filter((u) => u.kind !== "hts_revision");
    const seen = new Set<string>();
    return all.filter((u) => !seen.has(u.id) && !!seen.add(u.id)).sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at));
  }, [published, review]);

  const matches = useImportMatches(updates);
  const hits = useMemo(() => {
    const out = new Set<string>();
    matches.forEach((m, slug) => m.confirmed + m.likely > 0 && out.add(slug));
    return out;
  }, [matches]);
  const inReview = useMemo(() => new Set((review?.pending ?? []).map((u) => u.id)), [review]);

  const requested = params.get("update");
  const slug = useMemo(() => {
    if (!updates?.length) return null;
    if (requested && updates.some((u) => u.slug === requested)) return requested;
    // The latest action that hits the catalog, else the latest
    return updates.find((u) => hits.has(u.slug))?.slug ?? updates[0].slug;
  }, [updates, requested, hits]);
  const update = updates?.find((u) => u.slug === slug) ?? null;
  const select = (next: string) => {
    if (next !== slug) window.history.pushState(null, "", urlFor(next));
  };

  const { impacts, progress } = useUpdateImpact(update);
  const [country, setCountry] = useState<string | null>(null);
  const [show, setShow] = useState<Show>("affected");
  useEffect(() => {
    setCountry(null);
    setShow("affected");
  }, [slug]);
  const showImports = () => document.getElementById("tt-impact-imports-list")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const byKey = useMemo(() => new Map(products.map((p) => [p.key, p])), [products]);
  const shifts: ShiftRow[] = useMemo(
    () =>
      (impacts ?? [])
        .filter((i) => i.level === "confirmed" && i.reason !== "ban" && i.beforePct !== null && i.afterPct !== null && Math.abs(i.afterPct - i.beforePct) > 0.001)
        .sort((a, b) => Math.abs(rateChange(b)) - Math.abs(rateChange(a)))
        .map((i) => {
          const p = byKey.get(i.key)!;
          return { key: i.key, label: p.entry.element.htsno, sub: p.entry.country.name, before: i.beforePct!, after: i.afterPct!, group: groupOf(i) };
        }),
    [impacts, byKey]
  );
  const origins: OriginRow[] = useMemo(() => {
    const rows = new Map<string, OriginRow & { changed: number }>();
    for (const i of impacts ?? []) {
      if (i.level === "possible") continue;
      const p = byKey.get(i.key);
      if (!p) continue;
      const c = p.entry.country;
      const row = rows.get(c.code) ?? { code: c.code, name: c.name, flag: c.flag, counts: {}, ratePct: 0, changed: 0 };
      const g = groupOf(i);
      row.counts[g] = (row.counts[g] ?? 0) + 1;
      if (i.level === "confirmed" && i.beforePct !== null && i.afterPct !== null) {
        // A running average of the change in rate on its confirmed imports
        row.ratePct = (row.ratePct * row.changed + rateChange(i)) / (row.changed + 1);
        row.changed++;
      }
      rows.set(c.code, row);
    }
    return Array.from(rows.values()).sort((a, b) => Math.abs(b.ratePct) - Math.abs(a.ratePct) || Object.values(b.counts).reduce((s, n) => s + n, 0) - Object.values(a.counts).reduce((s, n) => s + n, 0));
  }, [impacts, byKey]);

  const header = <SectionHeader section={section} />;

  if (!loading && !items.length)
    return (
      <>
        {header}
        <NeedsProducts
          title="See What Every Tariff Action Does to Your Imports"
          body="Add your imports, then pick any tariff action: you'll see which of them it hits, the rate before and after, and what it adds to each shipment."
        />
      </>
    );

  return (
    <>
      {header}
      <div className="grid gap-4 xl:grid-cols-[19.5rem_minmax(0,1fr)] xl:items-start">
        {updates ? (
          <ActionList updates={updates} selected={slug} matches={matches} inReview={inReview} today={today} onPick={select} />
        ) : (
          <div className={`${ui.skeleton} h-[36rem] w-full`} />
        )}
        <div className="flex min-w-0 flex-col gap-4">
          {!update ? (
            <div className={`${ui.skeleton} h-64 w-full`} />
          ) : (
            <>
              <ActionCard update={update} check={review?.checks[update.id]} today={today} impacts={impacts} total={products.length} />
              {!impacts ? (
                <section className={`${tt.panel} flex flex-col gap-3 px-6 py-5`} aria-busy="true">
                  <p className="text-sm text-base-content/70">
                    Working out each import&apos;s duty the day before and the day it takes effect
                    {products.length > 40 ? ` (${Math.round(progress * products.length).toLocaleString("en-US")} of ${products.length.toLocaleString("en-US")})` : ""}…
                  </p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-tt-soft">
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(4, progress * 100)}%` }} />
                  </div>
                </section>
              ) : (
                <>
                  <ImpactImports impacts={impacts} effective={update.effective_on} today={today} country={country} onClearCountry={() => setCountry(null)} show={show} onShow={setShow} />
                  {(shifts.length > 2 || origins.length > 1) && (
                    <div className={`grid gap-4 ${shifts.length > 2 && origins.length > 1 ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""}`}>
                      {shifts.length > 2 && (
                        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-impact-shift">
                          <div>
                            <h2 id="tt-impact-shift" className={tt.title}>
                              Rate Before and After
                            </h2>
                            <p className={tt.subtitle}>Each import whose rate it moves, the biggest change first</p>
                          </div>
                          <RateShift rows={shifts} onPick={showImports} />
                        </section>
                      )}
                      {origins.length > 1 && (
                        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-impact-origins">
                          <div>
                            <h2 id="tt-impact-origins" className={tt.title}>
                              Where It Lands
                            </h2>
                            <p className={tt.subtitle}>Your affected imports by country of origin, and the average change in their rate</p>
                          </div>
                          <OriginBars
                            rows={origins}
                            onPick={(c) => {
                              setCountry(c);
                              showImports();
                            }}
                          />
                          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-base-content/70">
                            {GROUP_ORDER.filter((g) => origins.some((o) => o.counts[g])).map((g) => (
                              <li key={g} className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full" style={{ background: GROUPS[g].mark }} aria-hidden />
                                {GROUPS[g].label}
                              </li>
                            ))}
                          </ul>
                        </section>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};
