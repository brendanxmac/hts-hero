"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRightIcon, BellAlertIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { useUser } from "@/contexts/UserContext";
import { formatDate, formatPct } from "@/components/duty-calculator/lib/format";
import type { TariffFinder } from "@/components/duty-calculator/lib/useTariffFinder";
import * as ui from "@/components/ui/styles";
import * as tt from "@/components/ui/styles/tracker";
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel";
import { todayIsoDate } from "@/tariffs/engine-v2/dates";
import { arrivalSource, clearArrivalParam } from "../onboarding/arrival";
import { openImportTakeover } from "../onboarding/takeoverStore";
import type { TrackedProduct } from "../report";

// The top of an import's page on its first visit from the one-click ways in (arrival.ts): what
// they just asked for, done ("You're watching 7318.15.80 from China"), where its alerts go, three
// facts about it (its duty today, its last change, what's coming), and one next step: add the
// rest of their imports. Shown once per import on this browser; on that arrival it also asks for
// the "You're watching" email (/api/tracker/watching), sent once per import.

const SEEN_KEY = (key: string) => `hts-hero-arrival-seen-${key}`;

// The duty as a percent of the shipment's value
const pctOf = (amount: number, value: number) => (value > 0 ? Math.round((amount / value) * 10000) / 100 : 0);

export const ArrivalPanel = ({ row, f, onExplore }: { row: TrackedProduct; f: TariffFinder; onExplore: () => void }) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const source = useRef(arrivalSource());

  // Once per import: the first arrival shows it (and asks for the email), later ones don't
  useEffect(() => {
    if (!source.current) return;
    clearArrivalParam();
    let seen = false;
    try {
      seen = !!localStorage.getItem(SEEN_KEY(row.key));
      localStorage.setItem(SEEN_KEY(row.key), "1");
    } catch {
      // Storage blocked: shown this time
    }
    if (seen) return;
    setOpen(true);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ARRIVAL_PANEL, { action: "shown", source: source.current });
    void fetch("/api/tracker/watching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productKey: row.key, source: source.current }),
    }).catch((): null => null);
  }, [row.key]);

  if (!open || !f.result) return null;

  const value = f.customsValue;
  const today = todayIsoDate();
  // The duty on each stretch of dates, with the stretches that moved the total
  const moves = f.history.slice(1).flatMap((s, i) => {
    const before = pctOf(f.history[i].result.totalDuty, value);
    const after = pctOf(s.result.totalDuty, value);
    return before === after ? [] : [{ date: s.from, before, after }];
  });
  const past = moves.filter((m) => m.date <= today);
  const last = past[past.length - 1];
  const next = moves.find((m) => m.date > today);
  const since = f.history[0]?.from;

  const close = (action: string) => {
    setOpen(false);
    trackEvent(MixpanelEvent.TARIFF_TRACKER_ARRIVAL_PANEL, { action, source: source.current });
  };

  const facts = [
    { label: "Duty today", value: formatPct(pctOf(f.result.totalDuty, value)), note: `On ${row.entry.country.name} imports, before fees` },
    last
      ? {
        label: "Last changed",
        value: formatDate(last.date),
        note: `${formatPct(last.before)} → ${formatPct(last.after)}`,
        tone: last.after > last.before ? "text-error" : "text-success",
      }
      : { label: "Last changed", value: "No changes", note: since ? `Since ${formatDate(since)}` : "In our tariff data" },
    next
      ? { label: "Coming up", value: formatDate(next.date), note: `${formatPct(next.before)} → ${formatPct(next.after)}`, tone: "text-warning" }
      : { label: "Coming up", value: "Nothing announced", note: "We'll tell you the moment there is" },
  ];

  return (
    <section aria-labelledby="arrival-title" className={`${tt.panel} relative overflow-hidden`}>
      <div className="flex flex-col gap-5 bg-linear-to-b from-primary/10 to-transparent p-6 sm:p-7">
        <button
          type="button"
          onClick={() => close("dismissed")}
          className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-tt-soft hover:text-base-content"
        >
          <XMarkIcon className="h-5 w-5" aria-hidden />
          <span className="sr-only">Close</span>
        </button>
        <div className="flex flex-col gap-1.5 pr-10">
          <span className={`${tt.eyebrow("primary")} flex items-center gap-1.5`}>
            <BellAlertIcon className="h-3.5 w-3.5" aria-hidden />
            Alerts on
          </span>
          <h2 id="arrival-title" className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content`}>
            You&apos;re watching {row.entry.element.htsno} from {row.entry.country.name}
          </h2>
          <p className="m-0 text-base text-base-content/80">
            We&apos;ll email {user?.email ? <strong className="font-semibold text-base-content">{user.email}</strong> : "you"} the day a tariff change
            hits it, with the rate before and after.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} className="rounded-xl bg-base-100 px-4 py-3.5 ring-1 ring-base-300">
              <p className={`${tt.eyebrow()} m-0`}>{fact.label}</p>
              <p className={`${tt.display} m-0 mt-1 text-xl font-semibold ${"tone" in fact && fact.tone ? fact.tone : "text-base-content"}`}>{fact.value}</p>
              <p className={`${ui.caption} m-0 mt-0.5`}>{fact.note}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={ui.button({ variant: "primary" })}
            onClick={() => {
              close("add_imports");
              openImportTakeover("arrival", "choose");
            }}
          >
            Add Your Other Imports
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            className={ui.button({ variant: "ghost" })}
            onClick={() => {
              close("explore");
              onExplore();
            }}
          >
            Explore the Tracker
          </button>
        </div>
      </div>
    </section>
  );
};
