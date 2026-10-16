"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Countries } from "@/constants/countries";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { readRecentLookups, RecentLookup } from "@/libs/recent-lookups";
import { itemKey } from "../catalog";
import { formatRate } from "../formatRate";
import { useTracker } from "../TrackerContext";

// A head start for a new catalog: the products looked up in the calculator on this device, as
// cards to pick from (all picked to start), added in one click
const SHOWN = 10;

const ago = (iso: string) => {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  return days < 1 ? "Looked up today" : days === 1 ? "Yesterday" : days < 7 ? `${days} days ago` : days < 14 ? "Last week" : `${Math.floor(days / 7)} weeks ago`;
};

export const RecentLookups = () => {
  const { addProducts, items } = useTracker();
  const [lookups, setLookups] = useState<RecentLookup[]>([]);
  const [off, setOff] = useState<Set<string>>(new Set());
  useEffect(() => setLookups(readRecentLookups()), []);

  const inCatalog = useMemo(() => new Set(items.map(itemKey)), [items]);
  const shown = lookups.filter((l) => !inCatalog.has(itemKey(l))).slice(0, SHOWN);
  if (!shown.length) return null;
  const picked = shown.filter((l) => !off.has(itemKey(l)));

  const toggle = (key: string) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const add = () => {
    addProducts(picked.map((l) => ({ code: l.code, country: l.country })), "recent_lookups");
    trackEvent(MixpanelEvent.TARIFF_TRACKER_LOOKUPS_ADDED, { added: picked.length, offered: shown.length });
  };

  return (
    <section aria-labelledby="tt-recent-lookups" className={`${tt.panel} ${tt.panelPad} flex flex-col gap-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="tt-recent-lookups" className={tt.title}>
            Start from Your Recent Lookups
          </h2>
          <p className={tt.subtitle}>You looked these up in the calculator. Pick the ones you import.</p>
        </div>
        <span className={tt.chip("success")}>
          {picked.length} of {shown.length} picked
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {shown.map((l) => {
          const key = itemKey(l);
          const on = !off.has(key);
          const country = Countries.find((c) => c.code === l.country);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(key)}
              className={`flex flex-col gap-2 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                on ? "border-success bg-success/10" : "border-base-300 bg-base-100 hover:border-base-content/30"
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`${mono.className} text-sm font-bold text-base-content`}>{l.htsno}</span>
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border-2 ${on ? "border-success bg-success text-success-content" : "border-base-300"}`} aria-hidden>
                  {on && <CheckIcon className="h-3.5 w-3.5" />}
                </span>
              </span>
              <span className="flex items-center justify-between text-sm text-base-content">
                <span className="truncate">
                  {country?.flag} {country?.name ?? l.country}
                </span>
                <b className={tt.display}>{formatRate(l.pct)}</b>
              </span>
              <span className="text-xs text-base-content/60">{ago(l.at)}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className={ui.button({ variant: "primary" })} onClick={add} disabled={!picked.length}>
          {picked.length ? `Add ${picked.length} ${picked.length === 1 ? "product" : "products"} to your imports` : "Pick products to add"}
        </button>
        <span className="text-sm text-base-content/60">You can add more, or remove any, later.</span>
      </div>
    </section>
  );
};
