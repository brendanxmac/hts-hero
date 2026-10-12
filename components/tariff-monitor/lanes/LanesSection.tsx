import { SectionIntro } from "@/components/ui/marketing";
import * as mk from "@/components/ui/marketing/styles";
import { LaneMap } from "./LaneMap";
import { LANES } from "./lanes";

// Every lane into the US: where this year's changes came from, on a dark band
export const LanesSection = ({ countries }: { countries: number }) => (
  <section className={`${mk.band} bg-[#0b1220] text-white`} aria-labelledby="lanes-title">
    <div className={mk.container}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end">
        <SectionIntro eyebrow="Coverage" title={<>Every lane into the US, <span className={mk.accentDark}>watched.</span></>} id="lanes-title" dark />
        <p className={mk.leadDark}>
          Tariffs now differ by product and by country, and they move on their own schedules. The Tracker watches each HTS
          code and country of origin you import, across all {countries} countries.
        </p>
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
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.country}
              </span>
              <span className="text-xl font-bold tabular-nums" style={{ color: l.color }}>
                {l.change}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-300">{l.detail}</p>
            <p className="mt-1 text-xs text-slate-500">
              {l.program} · {l.date}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
