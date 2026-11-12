"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { AdjustmentsHorizontalIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { NewsTopicsFields, type NewsPreferencesValue, type NewsTopics } from "@/components/tariff-updates/NewsPreferencesFields";
import { matchesNews } from "@/libs/tariff-updates/newsMatch";
import { Countries } from "@/constants/countries";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import { namedByUpdate } from "@/libs/tariff-updates/match";
import { NEWS_DOTS, newsToneOf } from "../news/tone";
import type { ImportMatch } from "../news/useImportMatches";
import type { TrackerUpdate } from "../overview/useTariffUpdates";
import { useTrackerAccess } from "../access/accessContext";
import { day } from "./format";

// The tariff actions to pick from, down the left of Tariff Updates' News (DESIGN_SYSTEM §15): which
// ones (Needs Review, Affect You, Upcoming, All; each explained under the filters), a search, the
// laws and countries followed, then the actions by month, newest first. All and Upcoming show the
// news the user follows: their news settings to start with (what their news emails send), which
// they can change to browse, save as their settings, or drop for all news. Needs Review and Affect
// You are about their own imports, so they never hide any. Each is its title and one quiet line (law, date, and what it
// does to the user's imports in the color of it); the open one is marked with a cobalt bar. The
// list scrolls on its own beside the page and keeps the open action in view.

type Filter = "review" | "mine" | "upcoming" | "all";

const COUNTRY_NAMES = new Map(Countries.map((c) => [c.code, c.name]));

// The filters, and what each means
const FILTERS: { id: Filter; label: string; hint: string }[] = [
  { id: "review", label: "Needs Review", hint: "Recent actions that may affect your imports with alerts on, and you haven't reviewed yet." },
  { id: "mine", label: "Affect You", hint: "Every action that affects or may affect your imports: to review, reviewed, and past ones." },
  { id: "upcoming", label: "Upcoming", hint: "Actions still to take effect, the soonest first." },
  { id: "all", label: "All", hint: "Every US tariff action for the laws and countries you follow, newest first. Search by product, code, country or law." },
];

const LAW_NAMES = AUTHORITIES as Record<string, string>;

// "Section 232, Section 301 · China, Mexico"; none picked: all (AD/CVD only when picked)
const topicsLabel = (t: NewsTopics) =>
  `${t.authorities.length ? t.authorities.map((a) => LAW_NAMES[a] ?? a).join(", ") : "All laws but AD/CVD"} · ${
    t.countries.length ? t.countries.map((c) => COUNTRY_NAMES.get(c) ?? c).join(", ") : "all countries"
  }`;

const sameTopics = (a: NewsTopics, b: NewsTopics) =>
  [...a.authorities].sort().join() === [...b.authorities].sort().join() && [...a.countries].sort().join() === [...b.countries].sort().join();

// The laws and countries the list follows: the user's news settings to start with, null for all
// news (signed out, or dropped)
const useFollowed = () => {
  const { signedIn } = useTrackerAccess();
  const [saved, setSaved] = useState<NewsPreferencesValue | null>(null);
  const [topics, setTopics] = useState<NewsTopics | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/tracker/news")
      .then((r) => (r.ok ? r.json() : null))
      .then((p: NewsPreferencesValue | null) => {
        if (!p) return;
        setSaved(p);
        setTopics({ authorities: p.authorities, countries: p.countries });
      })
      .catch(() => {});
  }, [signedIn]);
  const save = async () => {
    if (!saved || !topics) return;
    setSaving(true);
    try {
      const next = { ...saved, ...topics };
      const response = await fetch("/api/tracker/news", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
      if (!response.ok) throw new Error((await response.json().catch(() => ({}))).error ?? "Couldn't save");
      setSaved(next);
      toast.success("Saved: your news emails follow these too");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setSaving(false);
    }
  };
  return { saved, topics, setTopics, save, saving, differs: !!saved && !!topics && !sameTopics(saved, topics) };
};

// What the list follows, in a line, and the way to change it
const Followed = ({ followed }: { followed: ReturnType<typeof useFollowed> }) => {
  const { saved, topics, setTopics, save, saving, differs } = followed;
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-tt-soft px-3.5 py-2.5">
      <div className="flex items-start gap-2">
        <span className="min-w-0 flex-1 text-xs text-base-content/70">
          <span className="font-semibold text-base-content">{topics ? (differs ? "Showing: " : "Your news: ") : "Showing: "}</span>
          {topics ? topicsLabel(topics) : "every law and country"}
        </span>
        <button type="button" className={`${ui.link} inline-flex shrink-0 items-center gap-1 text-xs font-semibold`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <AdjustmentsHorizontalIcon className="h-3.5 w-3.5" aria-hidden />
          {open ? "Done" : "Change"}
        </button>
      </div>
      {open && (
        <div className="flex flex-col gap-4 border-t border-base-300 pt-3">
          <NewsTopicsFields value={topics ?? { authorities: [], countries: [] }} onChange={setTopics} />
          <div className="flex flex-wrap gap-2">
            {differs && (
              <button type="button" className={ui.button({ variant: "primary", size: "sm" })} disabled={saving} onClick={save}>
                {saving ? "Saving…" : "Save as my news settings"}
              </button>
            )}
            {saved && (differs || !topics) && (
              <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={() => setTopics({ authorities: saved.authorities, countries: saved.countries })}>
                Back to my settings
              </button>
            )}
            {topics && (
              <button type="button" className={ui.button({ variant: "ghost", size: "sm" })} onClick={() => setTopics(null)}>
                Show all news
              </button>
            )}
          </div>
          {differs && <p className={`${tt.caption} m-0`}>Saving changes which tariff news your emails send too.</p>}
        </div>
      )}
    </div>
  );
};

const monthOf = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

// What it does to the user's imports, in a few words and the color of it
const effectOn = (m: ImportMatch | undefined) => {
  if (!m || m.confirmed + m.likely === 0) return null;
  if (m.confirmed) return { text: `Hit ${m.confirmed + m.likely} of your imports`, tone: m.deltaUsd < -0.5 ? "text-success" : "text-error" };
  return { text: `May affect ${m.likely} of your imports`, tone: "text-warning" };
};

export const ActionList = ({
  updates,
  selected,
  matches,
  inReview,
  today,
  onPick,
  isNew,
  toReview,
  reviewed,
}: {
  updates: TrackerUpdate[];
  selected: string | null;
  matches: Map<string, ImportMatch>;
  // The admin's actions still in review
  inReview: Set<string>;
  today: string;
  onPick: (slug: string) => void;
  // First seen since the user last looked
  isNew: (u: TrackerUpdate) => boolean;
  // Impact checks still to review, and those reviewed (by slug)
  toReview: Set<string>;
  reviewed: Set<string>;
}) => {
  const hits = (u: TrackerUpdate) => !!effectOn(matches.get(u.slug));
  // HTS revisions take effect on a date too, but carry out actions already listed
  const upcoming = (u: TrackerUpdate) => u.kind !== "hts_revision" && !!u.effective_on && u.effective_on > today;
  const mine = updates.filter(hits).length;
  // Counts where they're the user's own (Needs Review, Affect You); they'd crowd the tabs elsewhere
  const counts: Record<Filter, number | undefined> = { review: toReview.size, mine, upcoming: undefined, all: undefined };
  // ?list=all (the weekly digest's "see all"): open on All
  const fromLink = useSearchParams().get("list") === "all";
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const followed = useFollowed();
  const { topics } = followed;
  // Open on the actions that hit the catalog, once that's known, unless the user picked a filter
  const [chose, setChose] = useState(fromLink);
  useEffect(() => {
    if (!chose && toReview.size) setFilter("review");
    else if (!chose && mine) setFilter("mine");
  }, [mine, chose, toReview.size]);

  // The codes under the Chapter 99 headings of actions that name only headings (match.ts), so a
  // search for a code finds them too: worked out once a search is typed
  const searching = query.trim().length > 0;
  const headingCodes = useMemo(() => {
    const out = new Map<string, string>();
    if (!searching) return out;
    for (const u of updates) {
      const codes = namedByUpdate(u).children.flatMap((h) => h.codes);
      if (codes.length) out.set(u.slug, `${codes.join(" ")} ${codes.map((c) => c.replace(/\D/g, "")).join(" ")}`);
    }
    return out;
  }, [updates, searching]);

  const months = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const groups: { month: string; updates: TrackerUpdate[] }[] = [];
    // Upcoming: the soonest to take effect first, by the month it does; the rest newest first
    const soonest = filter === "upcoming";
    const ordered = soonest ? [...updates].sort((a, b) => (a.effective_on ?? "").localeCompare(b.effective_on ?? "")) : updates;
    for (const u of ordered) {
      if (filter === "mine" && !hits(u)) continue;
      if (filter === "review" && !toReview.has(u.slug)) continue;
      if (filter === "upcoming" && !upcoming(u)) continue;
      if ((filter === "all" || filter === "upcoming") && topics && !matchesNews(u, topics)) continue;
      const countries = u.countries.map((c) => COUNTRY_NAMES.get(c) ?? c).join(" ");
      const text = `${u.title} ${u.summary} ${u.products ?? ""} ${u.hts_codes.join(" ")} ${headingCodes.get(u.slug) ?? ""} ${countries} ${AUTHORITIES[u.authority] ?? ""}`.toLowerCase();
      if (!words.every((w) => text.includes(w))) continue;
      const month = soonest ? `Takes effect in ${monthOf(u.effective_on!)}` : monthOf(u.last_activity_at);
      if (groups[groups.length - 1]?.month !== month) groups.push({ month, updates: [] });
      groups[groups.length - 1].updates.push(u);
    }
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updates, filter, query, matches, today, toReview, topics, headingCodes]);

  // Keep the open action in view (opened from a link, or the list filtered around it)
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // The list's own scroll only, never the page's
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>("[aria-current='true']");
    if (!list || !item) return;
    const top = item.offsetTop - list.offsetTop;
    if (top < list.scrollTop + 40 || top + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = Math.max(0, top - list.clientHeight / 3);
  }, [selected, filter]);

  return (
    <aside className={`${tt.panel} flex flex-col overflow-hidden xl:sticky xl:top-4 xl:h-[calc(100vh-2rem)]`} aria-label="Tariff actions">
      <div className="flex flex-col gap-3 border-b border-base-300 px-4 pb-4 pt-5">
        <div className="flex items-baseline justify-between px-1">
          <h2 className={tt.title}>Tariff News</h2>
          <span className="text-sm tabular-nums text-base-content/60">{updates.length}</span>
        </div>
        {/* Which actions, and what the open one means */}
        <div className="flex flex-col gap-2">
          <SegmentedControl
            label="Which actions"
            size="sm"
            fullWidth
            options={FILTERS.map((f) => ({ id: f.id, label: f.label, count: counts[f.id] || undefined, title: f.hint }))}
            value={filter}
            onChange={(v) => {
              setChose(true);
              setFilter(v as Filter);
            }}
          />
          <p className={`${tt.caption} m-0 px-1`}>{FILTERS.find((f) => f.id === filter)!.hint}</p>
        </div>
        {(filter === "all" || filter === "upcoming") && <Followed followed={followed} />}
        <label className="relative">
          <span className="sr-only">Search tariff actions</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/50" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search actions"
            className="h-9 w-full rounded-full border border-base-300 bg-tt-soft pl-10 pr-3 text-sm text-base-content placeholder:text-base-content/50 focus:border-primary focus:bg-base-100 focus:outline-hidden"
          />
        </label>
      </div>
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto pb-2">
        {months.map(({ month, updates: monthUpdates }) => (
          <section key={month} aria-label={month}>
            <h3 className="sticky top-0 z-10 bg-base-100/95 px-5 pb-1.5 pt-4 text-xs font-bold uppercase tracking-wider text-base-content/60 backdrop-blur-xs">{month}</h3>
            <ul>
              {monthUpdates.map((u) => {
                const active = u.slug === selected;
                const effect = effectOn(matches.get(u.slug));
                const soon = upcoming(u);
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => onPick(u.slug)}
                      aria-current={active ? "true" : undefined}
                      className={`relative flex w-full gap-3 px-5 py-3 text-left transition-colors ${active ? "bg-primary/[0.07]" : "hover:bg-tt-soft"}`}
                    >
                      {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary" aria-hidden />}
                      <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${NEWS_DOTS[newsToneOf(u.kind)]}`} aria-hidden />
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className={`line-clamp-2 text-sm font-semibold leading-snug ${active ? "text-primary" : "text-base-content"}`}>
                          {isNew(u) && <span className={`${tt.chip("error")} mr-1.5 align-[1px]`}>New</span>}
                          {u.title}
                        </span>
                        <span className="text-xs text-base-content/60">
                          {AUTHORITIES[u.authority] ?? u.authority} · {day(u.last_activity_at, false)}
                          {soon && <span className="font-semibold text-warning"> · From {day(u.effective_on!, false)}</span>}
                          {inReview.has(u.id) && <span className="font-semibold text-warning"> · In review</span>}
                        </span>
                        {effect && (
                          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className={`text-xs font-semibold ${effect.tone}`}>{effect.text}</span>
                            {toReview.has(u.slug) ? (
                              <span className={tt.chip("warning")}>To review</span>
                            ) : reviewed.has(u.slug) ? (
                              <span className={tt.chip("success")}>Reviewed</span>
                            ) : null}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {!months.length && (
          <p className="px-5 py-8 text-sm text-base-content/60">
            {filter === "review" ? "Every impact check is reviewed." : filter === "mine" ? "No recent action hits your imports." : filter === "upcoming" ? "Nothing announced is still to take effect." : topics ? "No news for what you follow matches." : "No actions match."}
          </p>
        )}
      </div>
    </aside>
  );
};
