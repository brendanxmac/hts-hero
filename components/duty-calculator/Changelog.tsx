import Link from "next/link"
import {
  ChangelogEntry,
  ChangelogType,
  ChangelogTypeLabels,
  formatChangelogDate,
} from "@/libs/supabase/tariff-changelog"

export const CHANGELOG_PATH = "/duty-calculator/changelog"

const typeStyles: Record<ChangelogType, string> = {
  revision: "border-primary/30 bg-primary/10 text-primary",
  fix: "border-base-300 bg-base-200 text-base-content/70",
  improvement: "border-transparent bg-success/10 text-success",
}

export const ChangelogTypeBadge = ({ type }: { type: ChangelogType }) => (
  <span
    className={`badge badge-sm font-medium ${typeStyles[type]}`}
  >
    {ChangelogTypeLabels[type]}
  </span>
)

// The latest updates, shown next to the hero text on /duty-calculator
export const ChangelogCard = ({ entries }: { entries: ChangelogEntry[] }) => (
  <section
    aria-labelledby="changelog-card-title"
    className="w-full rounded-lg border border-base-300 bg-base-100 p-5 shadow-sm"
  >
    <h2 id="changelog-card-title" className="text-base font-semibold text-base-content">
      Latest updates
    </h2>
    <ol className="mt-4 divide-y divide-base-300">
      {entries.map((entry) => (
        <li key={entry.id} className="py-3 first:pt-0">
          <div className="flex items-center gap-2 text-xs text-base-content/60">
            <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
            <ChangelogTypeBadge type={entry.type} />
          </div>
          <p className="mt-1.5 text-sm font-medium leading-snug text-base-content">{entry.title}</p>
        </li>
      ))}
    </ol>
    <Link
      href={CHANGELOG_PATH}
      className="link link-primary link-hover mt-1 inline-flex items-center gap-1 text-sm font-semibold"
    >
      View full changelog
      <span aria-hidden>→</span>
    </Link>
  </section>
)
