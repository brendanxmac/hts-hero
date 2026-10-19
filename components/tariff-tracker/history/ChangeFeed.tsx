"use client";

import { useState } from "react";
import { ArrowDownRightIcon, ArrowUpRightIcon } from "@heroicons/react/20/solid";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { formatDate } from "../../duty-calculator/lib/format";
import { formatRate } from "../formatRate";
import { ChangeDay } from "../insights/catalogHistory";
import { shortProgram } from "../report";

// What changed on each day a tariff moved a rate in the catalog, newest first: the tariffs
// behind it, and every product it hit, before and after
const DAYS = 6;
const PER_DAY = 8;

export const ChangeFeed = ({ days, onOpen }: { days: ChangeDay[]; onOpen: (key: string) => void }) => {
  const [shown, setShown] = useState(DAYS);
  const [open, setOpen] = useState<Set<string>>(new Set());
  return (
    <section className={ui.card} aria-labelledby="tt-change-feed">
      <div className={ui.cardHeader}>
        <div>
          <h3 id="tt-change-feed" className={ui.cardTitle}>
            Every Change on Your Imports
          </h3>
          <p className={`${ui.caption} mt-0.5`}>The day a tariff took effect, and the products it moved</p>
        </div>
      </div>
      {days.length === 0 ? (
        <p className={`${ui.bodySm} px-5 py-6`}>No rate on your tracked products has changed in this period.</p>
      ) : (
        <ol>
          {days.slice(0, shown).map((day) => {
            const expanded = open.has(day.date);
            const list = expanded ? day.changes : day.changes.slice(0, PER_DAY);
            return (
              <li key={day.date} className="border-t border-base-300 first:border-t-0 px-5 py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="text-sm font-semibold text-base-content">{formatDate(day.date)}</span>
                  {day.up > 0 && <span className={ui.badge("error")}>{day.up} up</span>}
                  {day.down > 0 && <span className={ui.badge("success")}>{day.down} down</span>}
                  {day.causes.slice(0, 3).map((c) => (
                    <span key={c.name} className={`${ui.badge()} max-w-72 truncate`} title={c.name}>
                      {shortProgram(c.name)}
                    </span>
                  ))}
                </div>
                <ul className="mt-3 flex flex-col">
                  {list.map((c) => (
                    <li key={c.product.key}>
                      <button
                        type="button"
                        className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-base-200 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40"
                        onClick={() => onOpen(c.product.key)}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <span className={`${mono.className} font-semibold text-base-content`}>{c.product.entry.element.htsno}</span>
                          <span className="truncate text-base-content/70">
                            {c.product.entry.country.flag} {c.product.entry.country.name}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 tabular-nums">
                          <span className="text-base-content/60">{formatRate(c.before.pct)}</span>
                          <span className="text-base-content/60" aria-hidden>→</span>
                          <span className="font-semibold text-base-content">{formatRate(c.after.pct)}</span>
                          <span className={`inline-flex items-center gap-0.5 font-semibold ${c.deltaPct > 0 ? "text-error" : "text-success"}`}>
                            {c.deltaPct > 0 ? <ArrowUpRightIcon className="h-4 w-4" aria-hidden /> : <ArrowDownRightIcon className="h-4 w-4" aria-hidden />}
                            {formatRate(Math.abs(c.deltaPct))}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {day.changes.length > PER_DAY && (
                  <button
                    type="button"
                    className={`${ui.link} mt-2 text-sm`}
                    onClick={() => setOpen((prev) => new Set(prev).add(day.date))}
                    hidden={expanded}
                  >
                    {day.changes.length - PER_DAY} more products
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
      {days.length > shown && (
        <div className={`${ui.cardFooter} flex justify-center`}>
          <button type="button" className={ui.button({ size: "sm" })} onClick={() => setShown((n) => n + DAYS)}>
            Earlier changes
          </button>
        </div>
      )}
    </section>
  );
};
