"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import type { PublicUpdate } from "@/libs/tariff-updates/public"
import type { Authority } from "@/libs/tariff-updates/types"
import { authorityColor, authorityLabel, countryOf, formatDay, kindLabel, STAGE_LABELS } from "./labels"

// Every published update, latest activity first and grouped by month, with a search and filters
// by law and country. The list is server-rendered in full (each update links to its own page);
// filtering only hides rows.

const monthOf = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })

export const AuthorityChip = ({ authority }: { authority: Authority }) => (
  <span className={tt.chip()}>
    <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: authorityColor(authority) }} aria-hidden />
    {authorityLabel(authority)}
  </span>
)

export const Countries = ({ codes, max = 6 }: { codes: string[]; max?: number }) =>
  codes.length ? (
    <span className="text-xs text-base-content/70">
      {codes
        .slice(0, max)
        .map((c) => {
          const country = countryOf(c)
          return `${country.flag} ${country.name}`.trim()
        })
        .join(", ")}
      {codes.length > max ? ` and ${codes.length - max} more` : ""}
    </span>
  ) : null

const UpdateRow = ({ update }: { update: PublicUpdate }) => (
  <li className="grid gap-x-6 gap-y-2 px-6 py-5 sm:grid-cols-[7.5rem_minmax(0,1fr)]">
    <div className="text-sm text-base-content/60">
      <time dateTime={update.last_activity_at.slice(0, 10)}>{formatDay(update.last_activity_at)}</time>
    </div>
    <div className="flex min-w-0 flex-col gap-2">
      <h3 className="text-base font-semibold leading-snug text-base-content">
        <Link href={`/tariff-updates/${update.slug}`} className="hover:text-primary hover:underline underline-offset-4">
          {update.title}
        </Link>
      </h3>
      <p className="line-clamp-3 text-sm leading-relaxed text-base-content/70">{update.summary}</p>
      <div className="flex flex-wrap items-center gap-2">
        <AuthorityChip authority={update.authority} />
        <span className={tt.chip("primary")}>{STAGE_LABELS[update.stage]}</span>
        <span className="text-xs text-base-content/60">{kindLabel(update.kind)}</span>
        {update.effective_on && <span className="text-xs text-base-content/60">· Effective {formatDay(update.effective_on)}</span>}
        {update.countries.length > 0 && <span className="text-xs text-base-content/40">·</span>}
        <Countries codes={update.countries} max={4} />
      </div>
    </div>
  </li>
)

export function UpdatesList({ updates }: { updates: PublicUpdate[] }) {
  const [query, setQuery] = useState("")
  const [authority, setAuthority] = useState<Authority | "">("")
  const [country, setCountry] = useState("")

  const authorities = useMemo(() => Array.from(new Set(updates.map((u) => u.authority))), [updates])
  const countries = useMemo(
    () =>
      Array.from(new Set(updates.flatMap((u) => u.countries)))
        .filter((c) => c !== "ALL")
        .map(countryOf)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [updates]
  )

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    return updates.filter((u) => {
      if (authority && u.authority !== authority) return false
      // An all-countries action applies to every country
      if (country && !u.countries.includes(country) && !u.countries.includes("ALL")) return false
      const text = `${u.title} ${u.summary} ${u.products ?? ""} ${u.hts_codes.join(" ")}`.toLowerCase()
      return words.every((w) => text.includes(w))
    })
  }, [updates, query, authority, country])

  const months = useMemo(() => {
    const groups: { month: string; updates: PublicUpdate[] }[] = []
    for (const u of shown) {
      const month = monthOf(u.last_activity_at)
      if (groups[groups.length - 1]?.month !== month) groups.push({ month, updates: [] })
      groups[groups.length - 1].updates.push(u)
    }
    return groups
  }, [shown])

  const filterButton = (active: boolean) =>
    `${ui.button({ variant: active ? "primary" : "secondary", size: "sm" })} ${active ? "" : "font-medium"}`

  return (
    <div className="flex flex-col gap-6">
      <div className={`${tt.panel} flex flex-col gap-4 p-5`}>
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative min-w-[16rem] flex-1">
            <span className="sr-only">Search tariff updates</span>
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, HTS code or keyword"
              className="h-10 w-full rounded-full border border-base-300 bg-base-100 pl-10 pr-4 text-sm text-base-content placeholder:text-base-content/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-base-content/70">
            Country
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-10 rounded-full border border-base-300 bg-base-100 px-4 text-sm text-base-content focus:border-primary focus:outline-none"
            >
              <option value="">Any country</option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={filterButton(!authority)} onClick={() => setAuthority("")}>
            All
          </button>
          {authorities.map((a) => (
            <button key={a} type="button" className={filterButton(authority === a)} onClick={() => setAuthority(authority === a ? "" : a)}>
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: authorityColor(a) }} aria-hidden />
              {authorityLabel(a)}
            </button>
          ))}
          <span className="ml-auto text-xs text-base-content/60">
            {shown.length === updates.length ? `${updates.length} updates` : `Showing ${shown.length} of ${updates.length}`}
          </span>
        </div>
      </div>

      {months.length ? (
        months.map(({ month, updates: monthUpdates }) => (
          <section key={month} aria-labelledby={`month-${month}`}>
            <h2 id={`month-${month}`} className={`${tt.eyebrow()} mb-3 px-1`}>
              {month}
            </h2>
            <ul className={`${tt.panel} divide-y divide-base-300 overflow-hidden`}>
              {monthUpdates.map((u) => (
                <UpdateRow key={u.slug} update={u} />
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className={`${tt.panel} p-6 text-sm text-base-content/70`}>No updates match. Try another search or filter.</p>
      )}
    </div>
  )
}
