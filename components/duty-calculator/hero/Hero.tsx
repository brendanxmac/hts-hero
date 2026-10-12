import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ChangelogEntry, formatChangelogDate } from "@/libs/supabase/tariff-changelog";
import * as mk from "@/components/ui/marketing/styles";
import * as tt from "@/components/ui/styles/tracker";
import { CHANGELOG_PATH } from "../changelog/constants";

// The top of /duty-calculator, in the Tariff Tracker's look (DESIGN_SYSTEM.md §15): a short
// headline so the calculator sits high on the page, and beside it, quietly, the latest tariff
// data updates, so visitors see the rates are kept current. Server-rendered so crawlers see the copy. Follows
// light and dark with the site.

// Quiet on purpose: a short list in small text, no box, so the calculator below stays the focus
const Updates = ({ entries }: { entries: ChangelogEntry[] }) => (
  <section aria-labelledby="dc-updates" className="flex w-full flex-col gap-2 lg:max-w-sm lg:border-l lg:border-base-300 lg:pl-6">
    <div className="flex items-center justify-between gap-3">
      <h2 id="dc-updates" className="m-0 flex items-center gap-2 text-xs font-semibold text-base-content/60">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
        Latest tariff updates
      </h2>
      <Link href={CHANGELOG_PATH} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
        All updates
        <ArrowRightIcon className="h-3 w-3" aria-hidden />
      </Link>
    </div>
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {entries.map((e) => (
        <li key={e.id} className="flex min-w-0 items-baseline gap-2.5 text-sm">
          <span className="w-12 shrink-0 tabular-nums text-xs text-base-content/50">{formatChangelogDate(e.entry_date).replace(/,? \d{4}$/, "")}</span>
          <Link href={CHANGELOG_PATH} className="min-w-0 truncate text-base-content/80 hover:text-primary" title={e.title}>
            {e.title}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

export const Hero = ({ latestUpdates, revisionTitle }: { latestUpdates: ChangelogEntry[]; revisionTitle: string }) => (
  <header className={`${mk.container} flex flex-col gap-8 pb-8 pt-10 lg:flex-row lg:items-center lg:justify-between`}>
    <div className="flex max-w-3xl flex-col gap-4">
      <h1 className="m-0 flex flex-col gap-3">
        <span className={tt.eyebrow("primary")}>Free US Import Duty &amp; Tariff Calculator</span>
        <span className={`${tt.display} text-4xl font-semibold leading-tight tracking-tight text-base-content sm:text-5xl`}>
          Know what you owe on every import. <span className="text-primary">And why.</span>
        </span>
      </h1>
      <p className="m-0 text-base leading-relaxed text-base-content/70 sm:text-lg">
        Every tariff, exemption and fee in effect for your import, line by line with its legal source. Free, no sign-up, current with {revisionTitle}.
      </p>
    </div>
    {latestUpdates.length > 0 && <Updates entries={latestUpdates} />}
  </header>
);
