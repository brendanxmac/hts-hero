"use client";

import { Popover } from "@headlessui/react";
import { CalendarDaysIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { formatDate, formatPct, todayIso } from "../lib/format";
import { TariffFinder } from "../lib/useTariffFinder";

// The import's entry date, picked the useful way: today, any date this import's rates changed (each
// with what changed and what it did to the duty), or any other date. The same date as Entry details
// and the import's header, so changing it here changes it everywhere.

// A change in duty as a change in the rate (true at any value): "+12.5%"
const signedRate = (usd: number, value: number) => `${usd > 0 ? "+" : "−"}${formatPct(Math.round((Math.abs(usd) / (value || 1)) * 10000) / 100)}`;

export const EntryDatePicker = ({ f, align = "right" }: { f: TariffFinder; align?: "left" | "right" }) => {
  const today = todayIso();
  // The dates its rates changed, newest first
  const changes = f.history.filter((s, i) => i > 0 && s.changes.length > 0).reverse();
  const pick = (date: string, close: () => void) => {
    f.setEntryDate(date, "compare_date_picker");
    close();
  };
  const isToday = f.entryDate === today;

  return (
    <Popover className="relative">
      <Popover.Button className={`${ui.button({ size: "sm" })} gap-1.5`} aria-label={`Rates on ${formatDate(f.entryDate)}. Change the date`}>
        <CalendarDaysIcon className="h-4 w-4 text-base-content/60" aria-hidden />
        <span className="tabular-nums">{isToday ? "Today" : formatDate(f.entryDate)}</span>
        <ChevronDownIcon className="-mr-1 h-4 w-4 text-base-content/60" aria-hidden />
      </Popover.Button>
      <Popover.Panel className={`${ui.popover} absolute ${align === "right" ? "right-0" : "left-0"} z-30 mt-2 flex w-96 flex-col gap-1 tracker:rounded-2xl tracker:p-2`}>
        {({ close }) => (
          <>
            <button
              type="button"
              onClick={() => pick(today, close)}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm hover:bg-tt-soft ${isToday ? "bg-tt-soft font-semibold text-primary" : "text-base-content"}`}
            >
              Today
              <span className="text-xs font-normal text-base-content/60">{formatDate(today)}</span>
            </button>

            {changes.length > 0 && (
              <>
                <span className={`${ui.label} px-3 pb-1 pt-2`}>When its rates changed</span>
                <ul className="m-0 flex max-h-72 list-none flex-col overflow-y-auto p-0">
                  {changes.map((s) => {
                    const delta = s.changes.reduce((sum, c) => sum + c.delta, 0);
                    const on = f.entryDate === s.from;
                    return (
                      <li key={s.from}>
                        <button
                          type="button"
                          onClick={() => pick(s.from, close)}
                          className={`flex w-full flex-col gap-0.5 rounded-xl px-3 py-2 text-left hover:bg-tt-soft ${on ? "bg-tt-soft" : ""}`}
                        >
                          <span className="flex items-baseline justify-between gap-3">
                            <span className={`text-sm tabular-nums ${on ? "font-semibold text-primary" : "font-medium text-base-content"}`}>{formatDate(s.from)}</span>
                            {Math.abs(delta) >= 0.005 && (
                              <span className={`text-xs font-semibold tabular-nums ${delta > 0 ? "text-error" : "text-success"}`}>{signedRate(delta, f.customsValue)}</span>
                            )}
                          </span>
                          <span className="truncate text-xs text-base-content/60">
                            {s.changes[0].name} {s.changes[0].kind}
                            {s.changes.length > 1 ? ` · and ${s.changes.length - 1} more` : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <label className="flex items-center justify-between gap-3 border-t border-base-300 px-3 pb-1 pt-3">
              <span className="text-sm text-base-content/70">Another date</span>
              <input
                type="date"
                className={`${ui.inputSm} w-40`}
                value={f.entryDate}
                onChange={(e) => e.target.value && f.setEntryDate(e.target.value, "compare_date_picker")}
              />
            </label>
          </>
        )}
      </Popover.Panel>
    </Popover>
  );
};
