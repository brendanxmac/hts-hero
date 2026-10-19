"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowTopRightOnSquareIcon, LockClosedIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { StatStrip } from "@/components/ui/StatStrip";
import { AUTHORITIES, KINDS } from "@/libs/tariff-updates/types";
import type { ImportImpact } from "@/libs/tariff-updates/impactOf";
import { todayIso } from "../../duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { newsToneOf } from "../news/tone";
import { useImportMatches } from "../news/useImportMatches";
import { useTariffUpdates, type TrackerUpdate } from "../overview/useTariffUpdates";
import { markNewsSeen, newsSeenAt } from "../overview/useTariffUpdates";
import { TRACKER_PATH } from "../sections";
import { useTrackerNav } from "../shell/TrackerNav";
import { useTracker } from "../TrackerContext";
import { ActionList } from "./ActionList";
import { ActionScope } from "./ActionScope";
import { StageTimeline } from "./StageTimeline";
import { useActionReviews } from "./reviews";
import { OriginBars, RateShift, type OriginRow, type ShiftRow } from "./ImpactCharts";
import { ImpactImports } from "./ImpactImports";
import { day, groupOf, GROUP_ORDER, GROUPS, rateChange, signedRate } from "./format";
import { useReviewList, type ImpactCheck } from "./useReviewList";
import { useUpdateImpact } from "./useUpdateImpact";

// The Tariff Actions view of Tariff Changes (it was Tariff News and Tariff Impacts): every US tariff
// action, and exactly which of your imports the open one hits. The
// actions down the left (ActionList); the open one on the right as one card: what it is, then the answer for the catalog
// as a stat strip like the Overview's. Under it, the imports it affects laid out like Your imports,
// then the rates it moves and the countries it lands on. Worked out live with the code the
// alerts use, so it's where an alert's link lands (?tab=impact&update=slug) and where the admin
// checks an action before approving its alerts (actions still in review show for the admin only).

const urlFor = (slug: string) => `${TRACKER_PATH}?tab=changes&update=${encodeURIComponent(slug)}`;

// Before there are imports to check an action against: the way to add them
const AddImportsNote = () => {
  const { openTab } = useTrackerNav();
  return (
    <div className="flex flex-col gap-3 border-t border-base-300 px-6 py-5 sm:flex-row sm:items-center">
      <p className={`${tt.body} m-0 flex-1`}>Add your imports to see which of them each action hits, with the rate before and after.</p>
      <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={() => openTab("catalog")}>
        Add my imports
      </button>
    </div>
  );
};

// The action, and what it does to the catalog
const ActionCard = ({ update, check, today, impacts, total, hasImports }: { update: TrackerUpdate; check?: ImpactCheck; today: string; impacts: ImportImpact[] | null; total: number; hasImports: boolean }) => {
  const { products } = useTracker();
  const [more, setMore] = useState(false);
  // Whether the two-line summary is cut off, so "Read the full summary" shows only when there's more
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const [cut, setCut] = useState(false);
  useEffect(() => setMore(false), [update.id]);
  useLayoutEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const measure = () => setCut(el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update.id, more]);
  const tone = newsToneOf(update.kind);
  const adcvd = update.kind === "ad_cvd" || update.authority === "ad_cvd";

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

  return (
    <section className={`${tt.panel} overflow-hidden`} aria-labelledby="tt-impact-title">
      {/* What it is on the left; where it stands on the right, as a timeline */}
      <div className="grid gap-x-8 gap-y-5 px-6 py-5 2xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-start justify-between gap-6">
          <div className="flex min-w-0 flex-col gap-2">
            <span className={tt.eyebrow(tone)}>
              {/* The authority and the kind, each once (an AD/CVD action's kind is also "AD/CVD"); its stage is in the timeline */}
              {Array.from(new Set([AUTHORITIES[update.authority] ?? update.authority, KINDS[update.kind] ?? update.kind])).join(" · ")}
            </span>
            <h2 id="tt-impact-title" className={`${tt.display} text-xl font-semibold leading-snug text-base-content`}>
              {update.title}
            </h2>
          </div>
          {check && (
            <a href={`/tariff-sources?update=${update.id}`} target="_blank" rel="noopener" className={`${ui.button({ variant: "ghost", size: "sm" })} shrink-0`}>
              Review alerts
            </a>
          )}
        </div>
        <p ref={summaryRef} className={`m-0 text-sm leading-relaxed text-base-content/75 ${more ? "" : "line-clamp-4"}`}>
          {update.summary}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-base-content/60">
          {/* The official notice, where the action was announced */}
          <a href={`/tariff-updates/${update.slug}`} target="_blank" rel="noopener" className={ui.button({ variant: "secondary", size: "sm" })}>
            Read the announcement
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
          </a>
          {(cut || more) && (
            <button type="button" className={`${ui.link} text-sm`} onClick={() => setMore((m) => !m)}>
              {more ? "Show less" : "Read the full summary"}
            </button>
          )}
          {check?.inReview && <span className="font-semibold text-warning">In review: users don&apos;t see it yet</span>}
          {update.effective_on && update.kind === "hts_revision" && <span>In the HTS from {day(update.effective_on)}</span>}
          {check?.eligible && !check.inReview && (
            <span className={`font-semibold ${check.approvedAt ? "text-success" : "text-warning"}`}>
              {check.approvedAt ? `Alerts sent ${day(check.approvedAt, false)} to ${check.alerted ?? 0} accounts` : "Alerts not approved yet"}
            </span>
          )}
        </div>
      </div>
      <div className="border-t border-base-300 pt-5 2xl:border-l 2xl:border-t-0 2xl:pl-8 2xl:pt-0">
        <StageTimeline update={update} today={today} />
      </div>
      </div>
      {update.kind !== "hts_revision" && <ActionScope update={update} />}
      {update.kind === "hts_revision" ? (
        <p className={`${tt.body} m-0 border-t border-base-300 px-6 py-5`}>
          An HTS revision puts tariff actions into the tariff schedule. Each action it carries out is listed on its own, with what it does to your imports.
        </p>
      ) : !hasImports ? (
        <AddImportsNote />
      ) : (
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
                    ? adcvd
                      ? "Depends on the case: what the goods are, who made them"
                      : "Confirmed once it's in the HTS"
                    : "Nothing it changes",
          },
          {
            label: "Imports hit",
            info: adcvd
              ? "Your imports whose code and country the case's scope names. Whether a deposit applies depends on what the goods are and who made them; AD/CVD duties are set case by case and are never in the HTS. Imports that only share a country it names aren't counted."
              : "Your imports this action affects. Confirmed: the duty engine applies it to them. May apply: its scope names their code and country, before the change is in the HTS. Imports that only share a country it names aren't counted.",
            value: pending ? (
              "…"
            ) : (
              <>
                {confirmed.length + likely}
                <span className="text-base font-medium text-base-content/60"> of {total.toLocaleString("en-US")}</span>
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
        ]}
      />
      )}
    </section>
  );
};

// What the action also hits outside the imports tracked: a count, and the way to track them
const UntrackedHits = ({ count }: { count: number }) => {
  const { signedIn, access, openUpgrade, unlock, unlockLabel } = useTrackerAccess();
  const imports = `${count.toLocaleString("en-US")} ${count === 1 ? "import" : "imports"}`;
  return (
    <section role="status" className={`${ui.notice("primary")} flex flex-col gap-3 sm:flex-row sm:items-center`}>
      <LockClosedIcon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className={`${ui.bodySm} flex-1`}>
        <span className="font-semibold text-base-content">It also hits {imports} you&apos;re not tracking.</span>{" "}
        {signedIn
          ? access.pairLimit > 0
            ? `Your plan tracks ${access.pairLimit.toLocaleString("en-US")} imports. Track more to see how it hits each one.`
            : "Impact checks on your own imports come with a Tracker plan. Pick one to see how it hits each import."
          : "Create a free account to track your imports and see how it hits each one."}
      </p>
      <button
        type="button"
        className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`}
        onClick={() => (signedIn ? openUpgrade("tracking") : unlock("tracking"))}
      >
        {signedIn ? "Track more imports" : unlockLabel}
      </button>
    </section>
  );
};

export const TariffImpact = () => {
  const params = useSearchParams();
  const { items, products, loading, trackedKeys } = useTracker();
  const { signedIn } = useTrackerAccess();
  const published = useTariffUpdates("all");
  const review = useReviewList(signedIn);
  const today = todayIso();
  // What counted as new when the view opened, before it's marked seen (clears the sidebar's "new")
  const [seenAt] = useState(() => newsSeenAt());
  useEffect(() => {
    markNewsSeen();
  }, []);

  // Every action, HTS revisions too (they only confirm the actions they carry out, so they're never
  // checked against the imports); the admin's actions still in review mixed in by date
  const updates = useMemo(() => {
    if (!published) return null;
    const all = [...published, ...(review?.pending ?? [])];
    const seen = new Set<string>();
    return all.filter((u) => !seen.has(u.id) && !!seen.add(u.id)).sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at));
  }, [published, review]);

  const matches = useImportMatches(updates);
  const reviews = useActionReviews();
  const toReview = useMemo(() => new Set(reviews.outstanding.map((a) => a.update.slug)), [reviews.outstanding]);
  const reviewedSlugs = useMemo(() => new Set(reviews.due.filter((a) => !toReview.has(a.update.slug)).map((a) => a.update.slug)), [reviews.due, toReview]);
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

  const { impacts, progress, untracked } = useUpdateImpact(update && update.kind !== "hts_revision" && items.length ? update : null);
  const checked = !!update && update.kind !== "hts_revision" && items.length > 0;
  const [country, setCountry] = useState<string | null>(null);
  useEffect(() => {
    setCountry(null);
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

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[27rem_minmax(0,1fr)] xl:items-start">
        {updates ? (
          <ActionList updates={updates} selected={slug} matches={matches} inReview={inReview} today={today} onPick={select} isNew={(u) => !!seenAt && u.first_seen_at > seenAt} toReview={toReview} reviewed={reviewedSlugs} />
        ) : (
          <div className={`${ui.skeleton} h-144 w-full`} />
        )}
        {/* As tall as the list beside it, the last card filling the rest, so no ground shows under it */}
        <div className="flex min-w-0 flex-col gap-4 xl:min-h-[calc(100vh-2rem)] xl:[&>:last-child]:flex-1">
          {!update ? (
            <div className={`${ui.skeleton} h-64 w-full`} />
          ) : (
            <>
              <ActionCard update={update} check={review?.checks[update.id]} today={today} impacts={impacts} total={Math.min(trackedKeys.size, products.length)} hasImports={loading || items.length > 0} />
              {!checked ? null : !impacts ? (
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
                  {untracked > 0 && <UntrackedHits count={untracked} />}
                  <ImpactImports
                    checking={trackedKeys.size > 0}
                    review={(() => {
                      // The imports to mark: those it affects or may affect, as worked out here and as matched
                      const keys = Array.from(
                        new Set([
                          ...impacts.filter((i) => i.level !== "possible").map((i) => i.key),
                          ...(reviews.due.find((a) => a.update.slug === update.slug)?.keys ?? []),
                        ])
                      );
                      return keys.length
                        ? { on: reviews.reviewedOn(update.slug, keys), mark: (on: boolean) => reviews.mark(update.slug, keys, on) }
                        : null;
                    })()}
                    update={update} impacts={impacts} today={today} country={country} onClearCountry={() => setCountry(null)} />
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
