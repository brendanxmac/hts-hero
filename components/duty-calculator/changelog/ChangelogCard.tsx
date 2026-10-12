import Link from "next/link";
import { ChangelogEntry, formatChangelogDate } from "@/libs/supabase/tariff-changelog";
import * as mk from "@/components/ui/marketing/styles";
import { ChangelogTypeBadge } from "./ChangelogTypeBadge";
import { CHANGELOG_PATH } from "./constants";

// The latest updates, shown next to the hero text on /duty-calculator. dark: on the dark hero
export const ChangelogCard = ({ entries, dark = false }: { entries: ChangelogEntry[]; dark?: boolean }) => (
  <section
    aria-labelledby="changelog-card-title"
    className={`${dark ? `${mk.cardDark} backdrop-blur-sm` : mk.card} w-full p-6`}
  >
    <h2 id="changelog-card-title" className={`text-xs font-bold uppercase tracking-wider ${dark ? "text-slate-400" : "text-slate-500"}`}>
      Latest updates
    </h2>
    <ol className={`mt-4 divide-y ${dark ? "divide-white/10" : "divide-slate-100"}`}>
      {entries.map((entry) => (
        <li key={entry.id} className="py-3 first:pt-0">
          <div className={`flex items-center gap-2 text-xs tabular-nums ${dark ? "text-slate-400" : "text-slate-500"}`}>
            <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
            <ChangelogTypeBadge type={entry.type} dark={dark} />
          </div>
          <p className={`mt-1.5 text-sm font-semibold leading-snug ${dark ? "text-white" : "text-slate-900"}`}>{entry.title}</p>
        </li>
      ))}
    </ol>
    <Link
      href={CHANGELOG_PATH}
      className={`mt-2 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 hover:underline ${dark ? "text-teal-300" : "text-teal-700"}`}
    >
      View full changelog
      <span aria-hidden>→</span>
    </Link>
  </section>
);
