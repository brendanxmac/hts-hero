import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { LANES, LaneMap } from "@/components/tariff-monitor";
import * as mk from "@/components/ui/marketing/styles";
import type { MonitorFacts } from "@/components/tariff-monitor/lib/facts";

// The homepage's former "Monitor 24/7" block: the lane map with each lane's latest change. Not on
// the homepage now (savings discovery took its place); kept for reuse.

export const LanesBand = ({ facts }: { facts: MonitorFacts }) => (
  <>
    {/* Monitor 24/7 */}
    <section
      className={`${mk.band} bg-[#0b1220] text-base-content`}
      aria-labelledby="tool-monitor-title"
    >
      <div className={mk.container}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
          <div>
            <p className={mk.eyebrowDark}>Monitor 24/7</p>
            <h2 id="tool-monitor-title" className={`${mk.h2Dark} mt-4`}>
              Every lane into the US,{" "}
              <span className={mk.accentDark}>watched around the clock.</span>
            </h2>
          </div>
          <div>
            <p className={mk.leadDark}>
              {facts.chapter99Headings} tariff headings across {facts.countries}{" "}
              countries, checked against every HTS revision and announcement.
              The HTS changed {facts.revisionsThisYear} times in {facts.year};
              you&apos;ll know about each one.
            </p>
            <Link href="/tariff-monitor" className={`${mk.buttonOnDark} mt-6`}>
              Watch your lanes{" "}
              <ArrowRightIcon className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
        <div className="mt-12">
          <LaneMap />
        </div>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LANES.map((l) => (
            <li key={l.id} className={`${mk.cardDark} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold">
                  {/* Lane color is data */}
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  {l.country}
                </span>
                <span
                  className="text-xl font-bold tabular-nums"
                  style={{ color: l.color }}
                >
                  {l.change}
                </span>
              </div>
              <p className="mt-2 text-sm text-base-content/40">{l.detail}</p>
              <p className="mt-1 text-xs text-base-content/60">
                {l.program} · {l.date}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </>
);
