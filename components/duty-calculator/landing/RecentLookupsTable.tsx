"use client";

import { useMemo } from "react";
import { ArrowRightIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as tt from "@/components/ui/styles/tracker";
import { Countries } from "@/constants/countries";
import { useHts } from "@/contexts/HtsContext";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { clearRecentLookups, RecentLookup } from "@/libs/recent-lookups";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { trackProduct } from "@/components/tariff-tracker/report";
import { TRACKER_PATH } from "@/components/tariff-tracker/sections";
import { formatPct, todayIso } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";

// Recent searches: the imports looked up on this device, each at today's rate (on a $10,000
// shipment). A click anywhere on a row opens it again; one link tracks them all.
const ago = (iso: string) => {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  return days < 1 ? "today" : days === 1 ? "yesterday" : days < 7 ? `${days} days ago` : days < 14 ? "last week" : `${Math.floor(days / 7)} weeks ago`;
};

export const RecentLookupsTable = ({ f, lookups, onCleared }: { f: TariffFinder; lookups: RecentLookup[]; onCleared: () => void }) => {
  const { htsElements } = useHts();
  const today = todayIso();
  const rows = useMemo(
    () =>
      lookups.flatMap((l) => {
        const element = htsElements.find((el) => htsCodeDigitsOnly(el.htsno) === l.code);
        const country = Countries.find((c) => c.code === l.country);
        if (!element || !country) return [];
        const product = trackProduct({ line: 1, text: `${element.htsno},${country.code}`, element, country }, htsElements, today);
        return [{ lookup: l, element, country, pct: product.totalPct }];
      }),
    [lookups, htsElements, today]
  );
  if (!rows.length) return null;

  const open = (row: (typeof rows)[number]) => {
    f.changeCountries([row.country]);
    f.selectElement(row.element, "recent_lookup");
  };
  const trackAll = () => {
    addToCatalog(rows.map((r) => ({ code: r.lookup.code, country: r.lookup.country })));
    trackEvent(MixpanelEvent.TARIFF_TRACKER_LOOKUPS_ADDED, { added: rows.length, offered: rows.length, from: "calculator" });
    window.location.href = `${TRACKER_PATH}?tab=catalog`;
  };

  return (
    <section aria-labelledby="dc-recent" className={`${tt.panel} overflow-hidden`}>
      <div className="flex items-center justify-between gap-3 px-6 pb-2 pt-5">
        <h2 id="dc-recent" className={`${tt.display} m-0 text-base font-semibold text-base-content`}>
          Recent searches
        </h2>
        <div className="flex items-center gap-4 text-sm">
          <button
            type="button"
            className="font-medium text-base-content/60 hover:text-base-content"
            onClick={() => {
              clearRecentLookups();
              onCleared();
            }}
          >
            Clear
          </button>
          <button type="button" className="inline-flex items-center gap-1 font-semibold text-primary hover:underline" onClick={trackAll}>
            Track all {rows.length} free
            <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>
      <ul className="m-0 list-none p-0 pb-2">
        {rows.map((r) => (
          <li key={`${r.lookup.code}-${r.lookup.country}`}>
            <button
              type="button"
              onClick={() => open(r)}
              className="group grid w-full grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto_1rem] items-center gap-4 px-6 py-3 text-left text-sm tabular-nums transition-colors hover:bg-tt-soft focus-visible:bg-tt-soft focus-visible:outline-none"
            >
              <span className={`${mono.className} font-semibold text-base-content`}>{r.element.htsno}</span>
              <span className="flex min-w-0 items-baseline gap-2 truncate text-base-content/80">
                <span aria-hidden>{r.country.flag}</span>
                {r.country.name}
                <span className="text-xs text-base-content/50">{ago(r.lookup.at)}</span>
              </span>
              <span className="font-semibold text-base-content">{formatPct(Math.round(r.pct * 100) / 100)}</span>
              <ChevronRightIcon className="h-4 w-4 text-base-content/30 transition-colors group-hover:text-base-content/70" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};
