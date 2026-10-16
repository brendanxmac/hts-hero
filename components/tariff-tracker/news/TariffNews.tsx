"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowTopRightOnSquareIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Countries } from "@/constants/countries";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";
import { AUTHORITIES, KINDS, STAGE_ORDER, type Authority } from "@/libs/tariff-updates/types";
import { STAGE_LABELS } from "@/components/tariff-updates/labels";
import { useTrackerAccess } from "../access/accessContext";
import { useTracker } from "../TrackerContext";
import { sectionUrl } from "../sections";
import { markNewsSeen, newsSeenAt, useTariffUpdates, type TrackerUpdate } from "../overview/useTariffUpdates";
import { NEWS_DOTS, newsToneOf } from "./tone";
import { matchLabel, useImportMatches, type ImportMatch } from "./useImportMatches";

// Tariff news: every US tariff action from /tariff-updates, in the Tracker. Newest first by month,
// filterable to the countries the user imports from, by law and by words. A row opens in place
// (summary, where it stands, what it covers) with the full update a click away. Beside it, how to
// get them by email. Opening the tab clears the sidebar's "new".

type Scope = "all" | "imports" | "mine";

const byCode = new Map(Countries.map((c) => [c.code, c]));
const countryLabel = (codes: string[]) => {
  if (codes.includes("ALL")) return "All countries";
  const names = codes.map((c) => byCode.get(c)?.name ?? c);
  return names.length > 4 ? `${names.slice(0, 4).join(", ")} and ${names.length - 4} more` : names.join(", ");
};

const day = (iso: string, withYear = true) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(withYear ? { year: "numeric" } : {}), timeZone: "UTC" });
const monthOf = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

// The stages an action moves through, with the latest one it has reached marked. Not every action
// passes every stage (many are never announced first), so earlier ones aren't shown as done.
const StageTrack = ({ current }: { current: number }) => (
  <ol className="flex flex-wrap items-center gap-1.5" aria-label="Where it stands">
    {STAGE_ORDER.map((stage, i) => (
      <li key={stage} aria-current={i === current ? "step" : undefined} className={i === current ? tt.chip("primary") : `${tt.chip()} opacity-60`}>
        {i === current ? "● " : ""}
        {STAGE_LABELS[stage]}
      </li>
    ))}
  </ol>
);

const Row = ({ update, isNew, match }: { update: TrackerUpdate; isNew: boolean; match?: ImportMatch }) => {
  const label = match ? matchLabel(match) : null;
  const [open, setOpen] = useState(false);
  return (
    <li className="border-t border-base-300 first:border-t-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full grid-cols-[6rem_minmax(0,1fr)_auto] items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-tt-soft"
      >
        <span className="pt-0.5 text-sm text-base-content/60">{day(update.last_activity_at, false)}</span>
        <span className="flex min-w-0 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-2">
            <span className={tt.chip()}>
              <span className={`mr-1.5 h-2 w-2 rounded-full ${NEWS_DOTS[newsToneOf(update.kind)]}`} aria-hidden />
              {AUTHORITIES[update.authority] ?? update.authority}
            </span>
            <span className="text-xs text-base-content/60">{STAGE_LABELS[update.stage]}</span>
            {isNew && <span className={tt.chip("error")}>New</span>}
            {label && <span className={tt.chip(label.tone)}>{label.text}</span>}
          </span>
          <span className="text-sm font-semibold leading-snug text-base-content">{update.title}</span>
          {!open && <span className="line-clamp-1 text-xs text-base-content/60">{update.summary}</span>}
        </span>
        <ChevronDownIcon className={`mt-1 h-5 w-5 text-base-content/40 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && (
        <div className="flex flex-col gap-4 px-6 pb-5 sm:pl-[8.5rem]">
          <p className="text-sm leading-relaxed text-base-content/80">{update.summary}</p>
          <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
            <dt className="text-xs text-base-content/60">Kind</dt>
            <dd>{KINDS[update.kind] ?? update.kind}</dd>
            <dt className="text-xs text-base-content/60">Effective</dt>
            <dd>{update.effective_on ? day(update.effective_on) : "Not set yet"}</dd>
            {update.countries.length > 0 && (
              <>
                <dt className="text-xs text-base-content/60">Countries</dt>
                <dd>{countryLabel(update.countries)}</dd>
              </>
            )}
            {update.products && (
              <>
                <dt className="text-xs text-base-content/60">Covers</dt>
                <dd>{update.products}</dd>
              </>
            )}
          </dl>
          <StageTrack current={STAGE_ORDER.indexOf(update.stage)} />
          <div className="flex flex-wrap gap-2">
            {update.kind !== "hts_revision" && (
              <Link href={`${sectionUrl("impact")}&update=${encodeURIComponent(update.slug)}`} className={ui.button({ variant: label ? "primary" : "secondary", size: "sm" })}>
                See the impact on my imports
              </Link>
            )}
            <a href={`/tariff-updates/${update.slug}`} target="_blank" rel="noopener" className={ui.button({ variant: "secondary", size: "sm" })}>
              Full update and sources
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      )}
    </li>
  );
};

const EmailCard = () => {
  const { signedIn, unlock } = useTrackerAccess();
  const [frequency, setFrequency] = useState<string | null>(null);
  useEffect(() => {
    if (!signedIn) return;
    fetch("/api/tracker/news")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => p && setFrequency(p.frequency))
      .catch((): null => null);
  }, [signedIn]);
  const now = frequency === "instant" ? "Each action as it happens" : frequency === "weekly" ? "A weekly digest, Mondays" : frequency === "off" ? "Off" : null;
  return (
    <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-3`} aria-labelledby="tt-news-email">
      <h2 id="tt-news-email" className={tt.title}>
        Get These by Email
      </h2>
      <p className="text-sm text-base-content/70">Every new action in plain English, with the official documents. Pick the laws and countries you care about.</p>
      {signedIn ? (
        <>
          {now && (
            <p className="text-sm">
              <span className="text-base-content/60">Now: </span>
              <span className="font-semibold text-base-content">{now}</span>
            </p>
          )}
          <Link href={sectionUrl("alerts")} className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`}>
            Change in Alerts
          </Link>
        </>
      ) : (
        <button type="button" className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`} onClick={() => unlock("alerts")}>
          Create a free account
        </button>
      )}
    </section>
  );
};

export const TariffNews = () => {
  const updates = useTariffUpdates("all");
  const { items } = useTracker();
  const [scope, setScope] = useState<Scope>("all");
  const [law, setLaw] = useState<Authority | "">("");
  const [query, setQuery] = useState("");
  // What counted as new when the tab opened, before it's marked seen
  const [seenAt] = useState(() => newsSeenAt());
  useEffect(() => {
    markNewsSeen();
  }, []);

  const myCountries = useMemo(() => new Set(items.map((i) => i.country)), [items]);
  const matches = useImportMatches(updates);
  const affectsImports = (u: TrackerUpdate) => {
    const m = matches.get(u.slug);
    return !!m && m.confirmed + m.likely > 0;
  };
  const isMine = (u: TrackerUpdate) => myCountries.size > 0 && (u.countries.includes("ALL") || u.countries.some((c) => myCountries.has(c)));
  const isNew = (u: TrackerUpdate) => !!seenAt && u.first_seen_at > seenAt;

  const laws = useMemo(() => Array.from(new Set((updates ?? []).map((u) => u.authority))), [updates]);
  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return (updates ?? []).filter((u) => {
      if (scope === "mine" && !isMine(u)) return false;
      if (scope === "imports" && !affectsImports(u)) return false;
      if (law && u.authority !== law) return false;
      const text = `${u.title} ${u.summary} ${u.products ?? ""} ${u.hts_codes.join(" ")}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updates, scope, law, query, myCountries, matches]);

  const months = useMemo(() => {
    const groups: { month: string; updates: TrackerUpdate[] }[] = [];
    for (const u of shown) {
      const month = monthOf(u.last_activity_at);
      if (groups[groups.length - 1]?.month !== month) groups.push({ month, updates: [] });
      groups[groups.length - 1].updates.push(u);
    }
    return groups;
  }, [shown]);

  const mineCount = (updates ?? []).filter(isMine).length;
  const importsCount = (updates ?? []).filter(affectsImports).length;

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <div className={`${tt.panel} flex flex-wrap items-center gap-3 p-4`}>
          <SegmentedControl
            label="Which actions"
            size="sm"
            options={[
              { id: "all", label: "All actions", count: updates?.length },
              { id: "imports", label: "Your imports", count: items.length ? importsCount : undefined, title: "Actions that affect, or may affect, the imports you added" },
              { id: "mine", label: "Your countries", count: myCountries.size ? mineCount : undefined, title: "Actions that apply to the countries you import from" },
            ]}
            value={scope}
            onChange={(v) => setScope(v as Scope)}
          />
          <Select<Authority | "">
            label="Filter by law"
            value={law}
            onChange={setLaw}
            options={[{ value: "", label: "Every category" }, ...laws.map((a) => ({ value: a, label: AUTHORITIES[a] ?? a }))]}
            size="sm"
            variant="pill"
            menuClassName="w-max max-w-xs"
          />
          <label className="relative min-w-[14rem] flex-1">
            <span className="sr-only">Search tariff news</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, HTS code or keyword"
              className="h-8 w-full rounded-full border border-base-300 bg-base-100 pl-9 pr-3 text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none"
            />
          </label>
        </div>

        {updates === null ? (
          <div className={`${ui.skeleton} h-96 w-full`} />
        ) : scope !== "all" && !myCountries.size ? (
          <div className={`${tt.panel} ${tt.panelPad} flex flex-col gap-3`}>
            <p className="text-sm text-base-content/70">Add your imports, and this shows only the actions that apply to the countries you buy from.</p>
            <Link href={sectionUrl("catalog")} className={`${ui.button({ variant: "primary", size: "sm" })} self-start`}>
              Add my imports
            </Link>
          </div>
        ) : months.length ? (
          months.map(({ month, updates: monthUpdates }) => (
            <section key={month} aria-label={month} className="flex flex-col gap-2">
              <h2 className={`${tt.eyebrow()} px-1`}>{month}</h2>
              <ul className={`${tt.panel} overflow-hidden`}>
                {monthUpdates.map((u) => (
                  <Row key={u.slug} update={u} isNew={isNew(u)} match={matches.get(u.slug)} />
                ))}
              </ul>
            </section>
          ))
        ) : (
          <p className={`${tt.panel} p-6 text-sm text-base-content/70`}>No actions match. Try another filter or search.</p>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <EmailCard />
        <section className={`${tt.panel} ${tt.panelPad} flex flex-col gap-2`}>
          <h2 className={tt.title}>Where These Come From</h2>
          <p className="text-sm text-base-content/70">
            The White House, the Federal Register, CBP, USTR and the USITC, checked every 15 minutes. Each action is followed from announcement into the
            HTS.
          </p>
          <a href="/tariff-updates" target="_blank" rel="noopener" className={`${ui.link} text-sm`}>
            The public tariff updates page
          </a>
        </section>
      </aside>
    </div>
  );
};
