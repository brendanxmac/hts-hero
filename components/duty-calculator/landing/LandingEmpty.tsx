"use client";

import * as tt from "@/components/ui/styles/tracker";
import { TariffFinder } from "../lib/useTariffFinder";
import { RecentLookupsTable } from "./RecentLookupsTable";
import { useRecentLookups } from "./useRecentLookups";

// Before an import is entered: the visitor's recent searches, or (on a first visit) a few imports
// to try. The cards on what the calculator shows are switched off for now.
/* const SHOWS = [
  { title: "Every line", body: "Each tariff, exemption and fee on your import, with its legal source.", tone: "primary" as const },
  { title: "Compare countries", body: "Your import from three countries side by side, and sourcing intelligence across all of them.", tone: "success" as const },
  { title: "Duty over time", body: "When the rate changed, and by how much.", tone: "warning" as const },
]; */

export const LandingEmpty = ({ f }: { f: TariffFinder }) => {
  const { lookups, clear } = useRecentLookups();
  return (
    <div className="flex flex-col gap-4">
      {lookups.length > 0 ? (
        <RecentLookupsTable f={f} lookups={lookups} onCleared={clear} />
      ) : (
        <section aria-labelledby="dc-try" className="flex flex-col gap-3">
          <h2 id="dc-try" className={`${tt.title} px-1`}>
            Try an import
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {f.examples.slice(0, 4).map((e) => (
              <button
                key={`${e.code}-${e.country}`}
                type="button"
                onClick={() => f.selectExample(e)}
                className={`${tt.panel} flex flex-col gap-2 p-5 text-left transition-colors hover:border-primary/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40`}
              >
                <span className={tt.eyebrow("primary")}>Try it</span>
                <span className={`${tt.display} text-lg font-semibold text-base-content`}>{e.label}</span>
                <span className="text-sm text-base-content/70">
                  From {e.origin} · {e.code}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {/* <div className="grid gap-4 md:grid-cols-3">
        {SHOWS.map((s) => (
          <div key={s.title} className={`${tt.panel} flex flex-col gap-1.5 p-5`}>
            <span className={tt.eyebrow(s.tone)}>{s.title}</span>
            <span className="text-sm text-base-content/70">{s.body}</span>
          </div>
        ))}
      </div> */}
    </div>
  );
};
