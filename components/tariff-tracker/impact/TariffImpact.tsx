"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowTopRightOnSquareIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Countries } from "@/constants/countries";
import { STAGE_LABELS } from "@/components/tariff-updates/labels";
import { AUTHORITIES, KINDS } from "@/libs/tariff-updates/types";
import type { ImportImpact } from "@/libs/tariff-updates/impactOf";
import { todayIso } from "../../duty-calculator/lib/format";
import { useTrackerAccess } from "../access/accessContext";
import { NEWS_DOTS, newsToneOf } from "../news/tone";
import { matchLabel, useImportMatches } from "../news/useImportMatches";
import { useTariffUpdates, type TrackerUpdate } from "../overview/useTariffUpdates";
import { TRACKER_PATH } from "../sections";
import { NeedsProducts } from "../shell/NeedsProducts";
import { useTracker } from "../TrackerContext";
import { CatalogShare, OriginBars, RateShift, type OriginRow, type ShiftRow } from "./ImpactCharts";
import { ImpactImports, type Show } from "./ImpactImports";
import { day, groupOf, GROUP_ORDER, GROUPS, money, relativeDays, type ImpactGroup } from "./format";
import { useReviewList, type ImpactCheck } from "./useReviewList";
import { useUpdateImpact } from "./useUpdateImpact";

// Tariff impact: pick any tariff action and see exactly which of your imports it hits. The
// actions on the left (the ones that hit your imports first to hand, upcoming ones marked); the
// picked one on the right: what it is, the verdict for your catalog, the rates it moves and the
// countries it lands on, then every import it affects or may affect, each open to its duty line
// by line. Worked out live with the code the alerts use, so it's where an alert's link lands
// (?tab=impact&update=slug) and where the admin checks an action before approving its alert
// (updates still in review show for the admin only).

type Filter = "mine" | "upcoming" | "all";

const byCode = new Map(Countries.map((c) => [c.code, c]));
const countryLabel = (codes: string[]) => {
  if (codes.includes("ALL")) return "All countries";
  const names = codes.map((c) => byCode.get(c)?.name ?? c);
  return names.length > 5 ? `${names.slice(0, 5).join(", ")} and ${names.length - 5} more` : names.join(", ");
};

const urlFor = (slug: string) => `${TRACKER_PATH}?tab=impact&update=${encodeURIComponent(slug)}`;

// ── The actions ──

const Picker = ({
  updates,
  selected,
  onSelect,
  checks,
  today,
}: {
  updates: TrackerUpdate[];
  selected: string | null;
  onSelect: (slug: string) => void;
  checks: Record<string, ImpactCheck> | null;
  today: string;
}) => {
  const matches = useImportMatches(updates);
  const { items } = useTracker();
  const hits = (u: TrackerUpdate) => {
    const m = matches.get(u.slug);
    return !!m && m.confirmed + m.likely > 0;
  };
  const upcoming = (u: TrackerUpdate) => !!u.effective_on && u.effective_on > today;
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const mine = updates.filter(hits).length;
  // Start on the actions that hit the catalog, once that's known
  const [chose, setChose] = useState(false);
  useEffect(() => {
    if (!chose && mine) setFilter("mine");
  }, [mine, chose]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return updates.filter((u) => {
      if (filter === "mine" && !hits(u)) return false;
      if (filter === "upcoming" && !upcoming(u)) return false;
      const text = `${u.title} ${u.summary} ${u.products ?? ""} ${u.hts_codes.join(" ")} ${AUTHORITIES[u.authority] ?? ""}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updates, filter, query, matches]);

  return (
    <aside className={`${tt.panel} flex flex-col overflow-hidden xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)]`} aria-label="Tariff actions">
      <div className="flex flex-col gap-3 border-b border-base-300 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className={tt.title}>Tariff actions</h2>
          <span className="text-xs text-base-content/60 tabular-nums">{updates.length}</span>
        </div>
        <SegmentedControl
          label="Which actions"
          size="sm"
          fullWidth
          options={[
            { id: "mine", label: "Hit my imports", count: items.length ? mine : undefined },
            { id: "upcoming", label: "Upcoming", count: updates.filter(upcoming).length },
            { id: "all", label: "All" },
          ]}
          value={filter}
          onChange={(v) => {
            setChose(true);
            setFilter(v as Filter);
          }}
        />
        <label className="relative">
          <span className="sr-only">Search tariff actions</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product, code, law or country"
            className="h-9 w-full rounded-full border border-base-300 bg-base-100 pl-9 pr-3 text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none"
          />
        </label>
      </div>
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-tt-soft p-2">
        {shown.map((u) => {
          const m = matches.get(u.slug);
          const label = m && m.confirmed + m.likely > 0 ? matchLabel(m) : null;
          const check = checks?.[u.id];
          const active = u.slug === selected;
          return (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => onSelect(u.slug)}
                aria-current={active ? "true" : undefined}
                className={`relative flex w-full flex-col gap-1.5 overflow-hidden rounded-xl px-3.5 py-3 text-left transition-colors ${
                  active ? "bg-base-100 shadow-sm ring-2 ring-inset ring-primary" : "hover:bg-base-100"
                }`}
              >
                <span className="flex flex-wrap items-center gap-1.5 text-xs text-base-content/60">
                  <span className={`h-2 w-2 rounded-full ${NEWS_DOTS[newsToneOf(u.kind)]}`} aria-hidden />
                  <span className="font-semibold text-base-content/80">{AUTHORITIES[u.authority] ?? u.authority}</span>
                  <span>· {day(u.last_activity_at)}</span>
                  {upcoming(u) && <span className={tt.chip("warning")}>From {day(u.effective_on!, false)}</span>}
                  {check?.inReview && <span className={tt.chip("warning")}>In review</span>}
                  {check?.hidden && <span className={tt.chip()}>Hidden</span>}
                </span>
                {active && <span className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />}
                <span className={`line-clamp-2 text-sm font-semibold leading-snug ${active ? "text-primary" : "text-base-content"}`}>{u.title}</span>
                {(label || (check && check.eligible)) && (
                  <span className="flex flex-wrap items-center gap-1.5">
                    {label && <span className={tt.chip(label.tone)}>{label.text}</span>}
                    {check?.eligible && !check.inReview && (
                      <span className={tt.chip(check.approvedAt ? "success" : "neutral")}>{check.approvedAt ? `Alerted ${check.alerted ?? 0}` : "Not approved"}</span>
                    )}
                  </span>
                )}
              </button>
            </li>
          );
        })}
        {!shown.length && <li className="px-3 py-6 text-sm text-base-content/60">No actions match.</li>}
      </ul>
    </aside>
  );
};

// ── The picked action ──

const TONE_PANEL: Record<"error" | "success" | "warning" | "primary" | "neutral", string> = {
  error: "border-error/30 bg-error/[0.06]",
  success: "border-success/30 bg-success/[0.07]",
  warning: "border-warning/30 bg-warning/[0.07]",
  primary: "border-primary/25 bg-primary/[0.05]",
  neutral: "border-base-300 bg-base-100",
};

const TONE_TEXT = { error: "text-error", success: "text-success", warning: "text-warning", primary: "text-primary", neutral: "text-base-content" } as const;

const UpdateHeader = ({ update, check, today }: { update: TrackerUpdate; check?: ImpactCheck; today: string }) => {
  const tone = newsToneOf(update.kind);
  const effective = update.effective_on;
  const upcoming = !!effective && effective > today;
  const [more, setMore] = useState(false);
  useEffect(() => setMore(false), [update.id]);
  return (
    <section className={`${tt.panel} flex flex-col gap-3 px-6 py-5`} aria-labelledby="tt-impact-title">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white ${NEWS_DOTS[tone]}`}>
          {AUTHORITIES[update.authority] ?? update.authority}
        </span>
        <span className={tt.chip()}>{KINDS[update.kind] ?? update.kind}</span>
        <span className={tt.chip("primary")}>● {STAGE_LABELS[update.stage]}</span>
        {check?.inReview && <span className={tt.chip("warning")}>In review: users don&apos;t see it yet</span>}
        {check?.hidden && <span className={tt.chip()}>Hidden</span>}
        {check?.eligible && !check.inReview && (
          <span className={tt.chip(check.approvedAt ? "success" : "warning")}>
            {check.approvedAt ? `Alerts sent ${day(check.approvedAt, false)} · ${check.alerted ?? 0} accounts` : "Alerts not approved yet"}
          </span>
        )}
        <span className="ml-auto flex flex-wrap gap-2">
          {check && (
            <a href={`/tariff-sources?update=${update.id}`} target="_blank" rel="noopener" className={ui.button({ variant: "ghost", size: "sm" })}>
              Review its alerts
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
          <a href={`/tariff-updates/${update.slug}`} target="_blank" rel="noopener" className={ui.button({ variant: "secondary", size: "sm" })}>
            Full update and sources
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
          </a>
        </span>
      </div>
      <h2 id="tt-impact-title" className={`${tt.display} text-[1.375rem] font-semibold leading-snug text-base-content`}>
        {update.title}
      </h2>
      <p className={`text-sm leading-relaxed text-base-content/75 ${more ? "" : "line-clamp-2"}`}>
        {update.summary}{" "}
      </p>
      {update.summary.length > 220 && (
        <button type="button" className={`${ui.link} -mt-2 self-start text-xs`} onClick={() => setMore((m) => !m)}>
          {more ? "Less" : "Read more"}
        </button>
      )}
      <dl className="flex flex-wrap gap-x-8 gap-y-2 border-t border-base-300 pt-3 text-sm">
        <div className="flex items-baseline gap-2">
          <dt className={tt.eyebrow(upcoming ? "warning" : "neutral")}>{upcoming ? "Takes effect" : "In effect"}</dt>
          <dd className={`font-semibold ${upcoming ? "text-warning" : "text-base-content"}`}>
            {effective ? `${day(effective)} · ${relativeDays(effective, today)}` : "Not set yet"}
          </dd>
        </div>
        <div className="flex min-w-0 items-baseline gap-2">
          <dt className={tt.eyebrow()}>Countries</dt>
          <dd className="truncate font-semibold text-base-content">{update.countries.length ? countryLabel(update.countries) : "Any"}</dd>
        </div>
        {(update.products || update.hts_codes.length > 0) && (
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <dt className={tt.eyebrow()}>Covers</dt>
            <dd className="line-clamp-1 text-base-content" title={update.products ?? undefined}>
              {update.products ?? update.hts_codes.slice(0, 6).join(", ")}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
};

// The answer for the catalog: one sentence and the one number that matters, the counts (each
// filters the list below), and the catalog split by what it does
const Verdict = ({
  impacts,
  total,
  effective,
  today,
  show,
  onShow,
}: {
  impacts: ImportImpact[];
  total: number;
  effective: string | null;
  today: string;
  show: Show;
  onShow: (show: Show) => void;
}) => {
  const { itemFor } = useTracker();
  const counts = Object.fromEntries(GROUP_ORDER.map((g) => [g, 0])) as Record<ImpactGroup, number>;
  impacts.forEach((i) => counts[groupOf(i)]++);
  const confirmed = impacts.filter((i) => i.level === "confirmed");
  const net = confirmed.reduce((sum, i) => sum + (i.deltaUsd ?? 0), 0);
  const yearly = confirmed.reduce((sum, i) => sum + (i.deltaUsd ?? 0) * Math.max(1, itemFor(i.key)?.shipmentsPerYear ?? 1), 0);
  const hasYears = confirmed.some((i) => (itemFor(i.key)?.shipmentsPerYear ?? 1) > 1);
  const future = !!effective && effective > today;
  const likely = counts.likely;

  const headline = confirmed.length
    ? `${future ? "Will change" : "Changes"} the duty on ${confirmed.length} of your ${total.toLocaleString("en-US")} imports`
    : likely
      ? `May affect ${likely} of your ${total.toLocaleString("en-US")} imports`
      : counts.possible
        ? `Covers the countries of ${counts.possible} of your imports, not their codes`
        : "None of your imports are affected";
  const tone = confirmed.length ? (net > 0.5 ? "error" : net < -0.5 ? "success" : "primary") : likely ? "warning" : "neutral";
  const sub = confirmed.length
    ? `${future ? `From ${day(effective!)}` : "One shipment of each, at your values"}${likely ? `. It may also apply to ${likely} more.` : "."}`
    : likely
      ? "Its scope names their codes and countries. We'll confirm the exact duty once it's in the HTS, and alert you."
      : counts.possible
        ? "Worth a look if any of them could fall under it."
        : "Nothing in your catalog falls under it.";

  const pills: { id: Show; n: number; label: string; detail?: string; group: ImpactGroup }[] = [
    {
      id: "confirmed",
      n: confirmed.length,
      label: "confirmed",
      detail: [counts.up && `${counts.up} up`, counts.down && `${counts.down} down`, counts.same && `${counts.same} same duty`].filter(Boolean).join(" · "),
      group: counts.up ? "up" : counts.down ? "down" : "same",
    },
    { id: "likely", n: likely, label: "may apply", group: "likely" },
    { id: "possible", n: counts.possible, label: "country only", group: "possible" },
  ];

  return (
    <section className={`flex flex-col gap-4 rounded-lg border px-6 py-5 ${TONE_PANEL[tone]}`} aria-labelledby="tt-impact-verdict">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className={tt.eyebrow(tone)}>Impact on your imports</span>
          <h2 id="tt-impact-verdict" className={`${tt.display} text-xl font-semibold leading-snug text-base-content`}>
            {headline}
          </h2>
          <p className="text-sm text-base-content/70">{sub}</p>
        </div>
        {confirmed.length > 0 && (
          <div className="flex flex-col items-end">
            <span className={`${tt.metricLg} ${TONE_TEXT[tone]}`}>{Math.abs(net) > 0.5 ? money(net, true) : "Same duty"}</span>
            <span className="text-xs font-semibold text-base-content/60">
              {Math.abs(net) > 0.5 ? (hasYears ? `per shipment · ${money(yearly, true)} a year` : "in duty per shipment") : "new Chapter 99 numbers to report"}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {pills.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.n}
            onClick={() => onShow(show === p.id ? "affected" : p.id)}
            aria-pressed={show === p.id}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors disabled:opacity-40 ${
              show === p.id ? "border-base-content/40 bg-base-100 shadow-sm" : "border-base-300 bg-base-100/70 hover:bg-base-100"
            }`}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: GROUPS[p.group].mark }} aria-hidden />
            <span className={`${tt.display} font-semibold tabular-nums text-base-content`}>{p.n}</span>
            <span className="text-base-content/70">{p.label}</span>
            {p.detail && <span className="text-xs text-base-content/50">{p.detail}</span>}
          </button>
        ))}
        <span className="ml-auto text-xs text-base-content/60">{(total - impacts.length).toLocaleString("en-US")} not affected</span>
      </div>
      <CatalogShare counts={counts} total={total} legend={false} />
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

  // Every action but HTS revisions (they only confirm the actions they carry out); the admin's
  // updates still in review mixed in by date
  const updates = useMemo(() => {
    if (!published) return null;
    const all = [...published, ...(review?.pending ?? [])].filter((u) => u.kind !== "hts_revision");
    const seen = new Set<string>();
    return all.filter((u) => !seen.has(u.id) && !!seen.add(u.id)).sort((a, b) => b.last_activity_at.localeCompare(a.last_activity_at));
  }, [published, review]);

  const matches = useImportMatches(updates);
  const requested = params.get("update");
  const slug = useMemo(() => {
    if (!updates?.length) return null;
    if (requested && updates.some((u) => u.slug === requested)) return requested;
    // The latest action that hits the catalog, else the latest
    return updates.find((u) => {
      const m = matches.get(u.slug);
      return !!m && m.confirmed + m.likely > 0;
    })?.slug ?? updates[0].slug;
  }, [updates, requested, matches]);
  const update = updates?.find((u) => u.slug === slug) ?? null;
  const select = (next: string) => {
    if (next !== slug) window.history.pushState(null, "", urlFor(next));
    window.scrollTo({ top: 0, behavior: "smooth" });
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
        .sort((a, b) => Math.abs(b.deltaUsd ?? 0) - Math.abs(a.deltaUsd ?? 0))
        .map((i) => {
          const p = byKey.get(i.key)!;
          return { key: i.key, label: p.description, sub: `${p.entry.element.htsno} · ${p.entry.country.code}`, before: i.beforePct!, after: i.afterPct!, deltaUsd: i.deltaUsd ?? 0, group: groupOf(i) };
        }),
    [impacts, byKey]
  );
  const origins: OriginRow[] = useMemo(() => {
    const rows = new Map<string, OriginRow>();
    for (const i of impacts ?? []) {
      if (i.level === "possible") continue;
      const p = byKey.get(i.key);
      if (!p) continue;
      const c = p.entry.country;
      const row = rows.get(c.code) ?? { code: c.code, name: c.name, flag: c.flag, counts: {}, deltaUsd: 0 };
      const g = groupOf(i);
      row.counts[g] = (row.counts[g] ?? 0) + 1;
      row.deltaUsd += i.level === "confirmed" ? (i.deltaUsd ?? 0) : 0;
      rows.set(c.code, row);
    }
    return Array.from(rows.values()).sort((a, b) => Math.abs(b.deltaUsd) - Math.abs(a.deltaUsd) || Object.values(b.counts).reduce((s, n) => s + n, 0) - Object.values(a.counts).reduce((s, n) => s + n, 0));
  }, [impacts, byKey]);

  if (!loading && !items.length)
    return (
      <NeedsProducts
        title="See what every tariff action does to your imports"
        body="Add your imports, then pick any tariff action: you'll see which of them it hits, the rate before and after, and what it adds to each shipment."
      />
    );

  return (
    <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)] xl:items-start">
      {updates ? <Picker updates={updates} selected={slug} onSelect={select} checks={review?.checks ?? null} today={today} /> : <div className={`${ui.skeleton} h-[36rem] w-full`} />}

      <div className="flex min-w-0 flex-col gap-4">
        {!update ? (
          <div className={`${ui.skeleton} h-64 w-full`} />
        ) : (
          <>
            <UpdateHeader update={update} check={review?.checks[update.id]} today={today} />
            {!impacts ? (
              <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-3`} aria-busy="true">
                <span className={tt.eyebrow("primary")}>Checking your imports</span>
                <p className="text-sm text-base-content/70">
                  Working out every import&apos;s duty the day before and the day it takes effect
                  {products.length > 40 ? ` (${Math.round(progress * products.length).toLocaleString("en-US")} of ${products.length.toLocaleString("en-US")})` : ""}…
                </p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-tt-soft">
                  <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(4, progress * 100)}%` }} />
                </div>
              </section>
            ) : (
              <>
                <Verdict
                  impacts={impacts}
                  total={products.length}
                  effective={update.effective_on}
                  today={today}
                  show={show}
                  onShow={setShow}
                />
                {impacts.length > 0 && (
                  <ImpactImports impacts={impacts} effective={update.effective_on} today={today} country={country} onClearCountry={() => setCountry(null)} show={show} onShow={setShow} />
                )}
                {(shifts.length > 0 || origins.length > 0) && (
                  <div className={`grid gap-4 ${shifts.length && origins.length ? "xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""}`}>
                    {shifts.length > 0 && (
                      <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-impact-shift">
                        <div>
                          <h2 id="tt-impact-shift" className={tt.title}>
                            Rate before and after
                          </h2>
                          <p className={tt.subtitle}>Each import whose duty rate it moves, biggest change in dollars first. Select one to see it below.</p>
                        </div>
                        <RateShift
                          rows={shifts}
                          onPick={() => {
                            showImports();
                          }}
                        />
                      </section>
                    )}
                    {origins.length > 0 && (
                      <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`} aria-labelledby="tt-impact-origins">
                        <div>
                          <h2 id="tt-impact-origins" className={tt.title}>
                            Where it lands
                          </h2>
                          <p className={tt.subtitle}>Your affected imports by country of origin, and the change per shipment from each.</p>
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
                <p className="px-1 text-xs leading-relaxed text-base-content/60">
                  Confirmed changes come from the duty engine: each import worked out the day before and the day the action takes effect, on its saved value.
                  &quot;May apply&quot; means the action&apos;s scope names the import&apos;s code and country, before the change is in the HTS. The same check
                  decides who gets an alert.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
