import Link from "next/link";
import { ChangelogEntry, formatChangelogDate } from "@/libs/supabase/tariff-changelog";
import * as ui from "@/components/ui/styles";
import { ChangelogTypeBadge } from "./ChangelogTypeBadge";
import { CHANGELOG_PATH } from "./constants";

// The latest updates, shown next to the hero text on /duty-calculator
export const ChangelogCard = ({ entries }: { entries: ChangelogEntry[] }) => (
  <section aria-labelledby="changelog-card-title" className={`${ui.card} w-full p-5`}>
    <h2 id="changelog-card-title" className={ui.cardTitle}>
      Latest updates
    </h2>
    <ol className="mt-4 divide-y divide-base-300">
      {entries.map((entry) => (
        <li key={entry.id} className="py-3 first:pt-0">
          <div className={`${ui.caption} flex items-center gap-2`}>
            <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
            <ChangelogTypeBadge type={entry.type} />
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug text-base-content">{entry.title}</p>
        </li>
      ))}
    </ol>
    <Link href={CHANGELOG_PATH} className={`${ui.link} mt-1 inline-flex items-center gap-1 text-sm`}>
      View full changelog
      <span aria-hidden>→</span>
    </Link>
  </section>
);
