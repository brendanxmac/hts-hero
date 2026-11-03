"use client";

import { useMemo, useState } from "react";
import { ChevronRightIcon, PlusIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { Countries } from "@/constants/countries";
import { useHts } from "@/contexts/HtsContext";
import { useUser } from "@/contexts/UserContext";
import { htsCodeDigitsOnly } from "@/libs/hts-code";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { clearRecentLookups, RecentLookup } from "@/libs/recent-lookups";
import { addToCatalog } from "@/components/tariff-tracker/catalogStore";
import { addToAccountCatalog } from "@/components/tariff-tracker/catalogSync";
import { trackProduct } from "@/components/tariff-tracker/report";
import { entryHref } from "@/libs/signup-onboarding";
import { sectionUrl } from "@/components/tariff-tracker/sections";
import { formatPct, todayIso } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";
import { ConversionDialog } from "../calculator/ConversionDialog";
import { alertPitch } from "./TrackImportButton";

// Recent searches: the imports looked up on this device, each at today's rate (on a $10,000
// shipment). A click anywhere on a row opens it again; one button tracks them all: signed in, right
// away; signed out, the pitch first, whose button saves them on this device, and sign-up brings them
// into the new account, which starts the trial.
const ago = (iso: string) => {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86400000);
  return days < 1 ? "today" : days === 1 ? "yesterday" : days < 7 ? `${days} days ago` : days < 14 ? "last week" : `${Math.floor(days / 7)} weeks ago`;
};

export const RecentLookupsTable = ({ f, lookups, onCleared }: { f: TariffFinder; lookups: RecentLookup[]; onCleared: () => void }) => {
  const { htsElements } = useHts();
  const { user } = useUser();
  const [pitching, setPitching] = useState(false);
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
  const trackAll = async () => {
    const products = rows.map((r) => ({ code: r.lookup.code, country: r.lookup.country }));
    const { added, duplicates } = addToCatalog(products);
    // "Products Added" is the one count of imports added, wherever they come from
    trackEvent(MixpanelEvent.DUTY_GUARD_PRODUCTS_ADDED, { added, duplicates, source: "recent_lookups" });
    trackEvent(MixpanelEvent.DUTY_GUARD_LOOKUPS_ADDED, { added, offered: rows.length, from: "calculator" });
    trackEvent(MixpanelEvent.SIGNUP_CTA_CLICKED, { page: "calculator", entry: "calculator_recent", section: "recent_searches", label: "Track All Your Recent Searches", signed_in: !!user });
    if (!user) {
      window.location.href = entryHref("calculator_recent");
      return;
    }
    // Into the account too, so they're there before Duty Guard's first sync
    await addToAccountCatalog(user.id, products).catch((e) => console.error("Saving the searches to the account:", e));
    window.location.href = sectionUrl("catalog");
  };

  const ask = () => {
    if (user) return trackAll();
    setPitching(true);
    trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "recent-searches", reason: "account", page: "calculator" });
  };
  const many = rows.length > 1;

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
          <button type="button" className={ui.button({ variant: "primary", size: "sm" })} onClick={ask}>
            <PlusIcon className="h-4 w-4" aria-hidden />
            Get alerts when any of these change
          </button>
        </div>
      </div>
      <ul className="m-0 list-none p-0 pb-2">
        {rows.map((r) => (
          <li key={`${r.lookup.code}-${r.lookup.country}`}>
            <button
              type="button"
              onClick={() => open(r)}
              className="group grid w-full grid-cols-[minmax(0,9rem)_minmax(0,1fr)_auto_1rem] items-center gap-4 px-6 py-3 text-left text-sm tabular-nums transition-colors hover:bg-tt-soft focus-visible:bg-tt-soft focus-visible:outline-hidden"
            >
              <span className={`${mono.className} font-semibold text-base-content`}>{r.element.htsno}</span>
              <span className="flex min-w-0 items-baseline gap-2 truncate text-base-content">
                <span aria-hidden>{r.country.flag}</span>
                {r.country.name}
                <span className="text-xs text-base-content/60">{ago(r.lookup.at)}</span>
              </span>
              <span className="font-semibold text-base-content">{formatPct(Math.round(r.pct * 100) / 100)}</span>
              <ChevronRightIcon className="h-4 w-4 text-base-content/30 transition-colors group-hover:text-base-content/70" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <ConversionDialog
        open={pitching}
        view="account"
        account={alertPitch(
          many ? `Get alerted when any of these ${rows.length} imports change` : "Get alerted when this import changes",
          many ? "each of them" : "this import",
        )}
        onClose={() => setPitching(false)}
        onCreateAccount={trackAll}
        page="calculator"
      />
    </section>
  );
};
