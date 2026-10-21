import Link from "next/link"
import * as tt from "@/components/ui/styles/tracker"
import type { PublicUpdate } from "@/libs/tariff-updates/public"
import { formatDay, STAGE_LABELS } from "./labels"

// On an HTS code page: the latest tariff updates that name the code or a heading above it, each
// linked to its own page
export function CodeUpdates({ updates, htsno }: { updates: PublicUpdate[]; htsno: string }) {
  if (!updates.length) return null
  return (
    <section aria-labelledby="code-updates" className={`${tt.panel} flex flex-col gap-4 p-6`}>
      <div className="flex flex-col gap-1">
        <h2 id="code-updates" className={tt.eyebrow("primary")}>
          Tariff updates
        </h2>
        <p className="text-xs text-base-content/60">Recent US tariff actions that name {htsno} or its heading.</p>
      </div>
      <ul className="flex flex-col gap-3">
        {updates.map((u) => (
          <li key={u.slug} className="flex flex-col gap-0.5">
            <span className="text-xs text-base-content/60">
              {formatDay(u.last_activity_at)} · {STAGE_LABELS[u.stage]}
            </span>
            <Link href={`/tariff-updates/${u.slug}`} className="text-sm font-medium leading-snug text-base-content underline-offset-4 hover:text-primary hover:underline">
              {u.title}
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/tariff-updates" className="text-xs font-semibold text-primary underline-offset-4 hover:underline">
        All tariff updates
      </Link>
    </section>
  )
}
