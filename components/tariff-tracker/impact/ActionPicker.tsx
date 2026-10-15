"use client";

import { useMemo, useState } from "react";
import { Popover } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { AUTHORITIES } from "@/libs/tariff-updates/types";
import { NEWS_DOTS, newsToneOf } from "../news/tone";
import type { TrackerUpdate } from "../overview/useTariffUpdates";
import { day } from "./format";

// Picking the tariff action to check: a dropdown from the page header (DESIGN_SYSTEM §15, like
// Compare's country picker), with a search box, the actions that hit the user's imports first,
// then the ones still to take effect, then the rest, newest first. A pick, a click outside or
// Escape closes it.

const Row = ({ update, active, onPick, note }: { update: TrackerUpdate; active: boolean; onPick: () => void; note?: string }) => (
  <li>
    <button
      type="button"
      onClick={onPick}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-tt-soft focus-visible:bg-tt-soft focus-visible:outline-none ${active ? "bg-tt-soft" : ""}`}
    >
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${NEWS_DOTS[newsToneOf(update.kind)]}`} aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="line-clamp-1 text-sm font-semibold text-base-content">{update.title}</span>
        <span className="text-xs text-base-content/60">
          {AUTHORITIES[update.authority] ?? update.authority} · {day(update.last_activity_at)}
          {note && <span className="font-semibold text-base-content/80"> · {note}</span>}
        </span>
      </span>
      {active && <CheckIcon className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />}
    </button>
  </li>
);

export const ActionPicker = ({
  updates,
  selected,
  hits,
  inReview,
  today,
  onPick,
}: {
  updates: TrackerUpdate[];
  selected: TrackerUpdate | null;
  // The actions that affect, or may affect, the user's imports
  hits: Set<string>;
  // The admin's actions still in review
  inReview: Set<string>;
  today: string;
  onPick: (slug: string) => void;
}) => {
  const [query, setQuery] = useState("");
  const groups = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const found = updates.filter((u) => {
      const text = `${u.title} ${u.summary} ${u.products ?? ""} ${u.hts_codes.join(" ")} ${AUTHORITIES[u.authority] ?? ""}`.toLowerCase();
      return words.every((w) => text.includes(w));
    });
    const upcoming = (u: TrackerUpdate) => !!u.effective_on && u.effective_on > today;
    return [
      { label: "Hit your imports", updates: found.filter((u) => hits.has(u.slug)) },
      { label: "Taking effect soon", updates: found.filter((u) => !hits.has(u.slug) && upcoming(u)) },
      { label: "Every other action", updates: found.filter((u) => !hits.has(u.slug) && !upcoming(u)) },
    ].filter((g) => g.updates.length);
  }, [updates, query, hits, today]);

  return (
    <Popover className="relative">
      {({ close }) => (
        <>
          <Popover.Button className={ui.button({ variant: "primary" })} onClick={() => setQuery("")}>
            Choose a tariff action
            <ChevronDownIcon className="h-4 w-4" aria-hidden />
          </Popover.Button>
          <Popover.Panel className={`${ui.popover} absolute right-0 z-40 mt-2 flex w-[32rem] flex-col gap-1 tracker:rounded-2xl tracker:p-2`}>
            <label className={`${ui.inputSm} mb-1 flex items-center gap-2 tracker:rounded-xl tracker:border-transparent tracker:bg-tt-soft tracker:shadow-none`}>
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-base-content/50" aria-hidden />
              <span className="sr-only">Search tariff actions</span>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  const first = groups[0]?.updates[0];
                  if (e.key === "Enter" && first) {
                    // Not on to the button the dropdown closes back to, which would open it again
                    e.preventDefault();
                    onPick(first.slug);
                    close();
                    requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
                  }
                }}
                placeholder="Search by product, HTS code, law or country"
                className="w-full bg-transparent text-sm outline-none placeholder:text-base-content/40"
              />
            </label>
            <div className="max-h-[28rem] overflow-y-auto">
              {groups.map((g) => (
                <section key={g.label} aria-label={g.label} className="flex flex-col">
                  <h3 className="px-3 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-base-content/60">
                    {g.label} <span className="font-semibold tabular-nums text-base-content/40">{g.updates.length}</span>
                  </h3>
                  <ul className="flex flex-col">
                    {g.updates.map((u) => (
                      <Row
                        key={u.id}
                        update={u}
                        active={u.slug === selected?.slug}
                        note={inReview.has(u.id) ? "In review" : u.effective_on && u.effective_on > today ? `From ${day(u.effective_on, false)}` : undefined}
                        onPick={() => {
                          onPick(u.slug);
                          close();
                        }}
                      />
                    ))}
                  </ul>
                </section>
              ))}
              {!groups.length && <p className="px-3 py-6 text-sm text-base-content/60">No actions match.</p>}
            </div>
          </Popover.Panel>
        </>
      )}
    </Popover>
  );
};
