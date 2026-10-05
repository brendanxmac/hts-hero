import Link from "next/link"
import {
  ChangelogEntry,
  ChangelogType,
  ChangelogTypeLabels,
  formatChangelogDate,
} from "@/libs/supabase/tariff-changelog"
import styles from "../ui/theme.module.css"

export const CHANGELOG_PATH = "/duty-calculator/changelog"

const typeStyles: Record<ChangelogType, string> = {
  revision: "bg-[var(--dc-accent-soft)] text-[var(--dc-accent)] border-[var(--dc-accent-border)]",
  fix: "bg-[var(--dc-surface-2)] text-[var(--dc-text-2)] border-[var(--dc-border)]",
  improvement: "bg-[var(--dc-positive-soft)] text-[var(--dc-positive)] border-transparent",
}

export const ChangelogTypeBadge = ({ type }: { type: ChangelogType }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${typeStyles[type]}`}
  >
    {ChangelogTypeLabels[type]}
  </span>
)

// The latest updates, shown next to the hero text on /duty-calculator
export const ChangelogCard = ({ entries }: { entries: ChangelogEntry[] }) => (
  <section
    aria-labelledby="changelog-card-title"
    className={`${styles.card} w-full p-5`}
  >
    <h2 id="changelog-card-title" className={styles.h3}>
      Latest updates
    </h2>
    <ol className="mt-4 divide-y divide-[var(--dc-border)]">
      {entries.map((entry) => (
        <li key={entry.id} className="py-3 first:pt-0">
          <div className="flex items-center gap-2 text-[12px] text-[var(--dc-text-3)]">
            <time dateTime={entry.entry_date}>{formatChangelogDate(entry.entry_date)}</time>
            <ChangelogTypeBadge type={entry.type} />
          </div>
          <p className="mt-1.5 text-[14px] font-medium leading-snug text-[var(--dc-text)]">{entry.title}</p>
        </li>
      ))}
    </ol>
    <Link
      href={CHANGELOG_PATH}
      className="mt-1 inline-flex items-center gap-1 text-[14px] font-semibold text-[var(--dc-accent)] underline-offset-4 hover:underline"
    >
      View full changelog
      <span aria-hidden>→</span>
    </Link>
  </section>
)
