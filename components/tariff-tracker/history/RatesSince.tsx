"use client";

import { useMemo, useState } from "react";
import { mono } from "@/components/ui/font";
import * as ui from "@/components/ui/styles";
import { todayIso } from "../../duty-calculator/lib/format";
import { IsoDate } from "../../../tariffs/engine-v2/types";
import { formatRate } from "../formatRate";
import { ProductHistory, segmentOn } from "../insights/catalogHistory";
import { TrackedProduct } from "../report";

// Every tracked product's rate on a past date beside its rate today, biggest moves first: any
// two points in time side by side
const PAGE = 50;

export const RatesSince = ({
  products,
  histories,
  from,
  onOpen,
}: {
  products: TrackedProduct[];
  histories: Map<string, ProductHistory>;
  from: IsoDate;
  onOpen: (key: string) => void;
}) => {
  const today = todayIso();
  const [since, setSince] = useState(from);
  const [shown, setShown] = useState(PAGE);
  const rows = useMemo(
    () =>
      products
        .flatMap((p) => {
          const h = histories.get(p.key);
          if (!h?.length) return [];
          const then = segmentOn(h, since).pct;
          const now = segmentOn(h, today).pct;
          const changes = h.filter((s) => s.from > since && s.changes.length > 0).length;
          return [{ p, then, now, delta: now - then, changes }];
        })
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    [products, histories, since, today]
  );

  return (
    <section className={ui.card} aria-labelledby="tt-rates-since">
      <div className={ui.cardHeader}>
        <div>
          <h3 id="tt-rates-since" className={ui.cardTitle}>
            Then and now
          </h3>
          <p className={`${ui.caption} mt-0.5`}>Each product&apos;s rate on a past date, and today</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="tt-since" className={`${ui.label} whitespace-nowrap`}>
            Compare from
          </label>
          <div className="w-40">
            <input
              id="tt-since"
              type="date"
              className={`${ui.inputSm} tabular-nums`}
              value={since}
              min={from}
              max={today}
              onChange={(e) => e.target.value && setSince(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className={`${ui.label} px-5 py-2.5 text-left sm:px-6`}>Product</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Then</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Today</th>
              <th scope="col" className={`${ui.label} px-4 py-2.5 text-right`}>Change</th>
              <th scope="col" className={`${ui.label} px-5 py-2.5 text-right sm:px-6`}>Times changed</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, shown).map(({ p, then, now, delta, changes }) => (
              <tr key={p.key} className="cursor-pointer border-t border-base-300 hover:bg-base-200/60" onClick={() => onOpen(p.key)}>
                <th scope="row" className="px-5 py-3 text-left font-normal sm:px-6">
                  <span className={`${mono.className} font-semibold text-base-content`}>{p.entry.element.htsno}</span>{" "}
                  <span className="text-base-content/70">
                    {p.entry.country.flag} {p.entry.country.name}
                  </span>
                </th>
                <td className="px-4 py-3 text-right text-base-content/70">{formatRate(then)}</td>
                <td className="px-4 py-3 text-right font-semibold text-base-content">{formatRate(now)}</td>
                <td
                  className={`px-4 py-3 text-right font-semibold ${
                    Math.abs(delta) < 0.005 ? "text-base-content/60" : delta > 0 ? "text-error" : "text-success"
                  }`}
                >
                  {Math.abs(delta) < 0.005 ? "No change" : `${delta > 0 ? "+" : "−"}${formatRate(Math.abs(delta))}`}
                </td>
                <td className="px-5 py-3 text-right sm:px-6">{changes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > shown && (
        <div className={`${ui.cardFooter} flex justify-center`}>
          <button type="button" className={ui.button({ size: "sm" })} onClick={() => setShown((n) => n + PAGE)}>
            Show more ({(rows.length - shown).toLocaleString("en-US")} left)
          </button>
        </div>
      )}
    </section>
  );
};
