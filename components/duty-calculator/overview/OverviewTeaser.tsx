"use client";

import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/20/solid";
import * as ui from "@/components/ui/styles";
import { shortDate } from "../rate-history/format";
import { pct } from "./parts";
import { Overview } from "./useOverview";

// The Overview lives on an import's page in the Tracker. In the calculator, the Duty tab comes
// first and fast, and this one slim row under the totals teases what the Overview would show for
// this import, from its own numbers (savings always "could"): signed out, the way in is a free
// account; signed in, tracking the import, which opens its page on the Overview.

export const OverviewTeaser = ({ o, signedOut, onOpen }: { o: Overview | null; signedOut: boolean; onOpen: () => void }) => {
  const best = o ? Math.max(o.savings[0]?.pct ?? 0, o.cheaper?.[0] ? o.ratePct - o.cheaper[0].pct : 0) : 0;
  const ways = o ? o.savings.length + (o.cheaper?.length ?? 0) : 0;
  const facts = [
    best > 0.005 ? `this duty could be up to ${pct(best)} lower, with ${ways} ${ways === 1 ? "way" : "ways"} to check` : null,
    o?.history ? `${o.changes} rate ${o.changes === 1 ? "change" : "changes"} since ${shortDate(o.history.fromDate, true)}` : null,
    "why each tariff applies, and the news that touches it",
  ].filter(Boolean);
  return (
    <div className={`${ui.cardSection} flex flex-col items-start gap-3 bg-primary/5 sm:flex-row sm:items-center sm:justify-between`}>
      <p className="m-0 flex min-w-0 items-start gap-2.5 text-sm text-base-content/80">
        <SparklesIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <span>
          <b className="text-base-content">The full overview of this import:</b> {facts.join("; ")}.
        </span>
      </p>
      <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} shrink-0`} onClick={onOpen}>
        {signedOut ? "See it free" : "Track it to see it"}
        <ArrowRightIcon className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};
