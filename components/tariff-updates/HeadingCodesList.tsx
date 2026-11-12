"use client"

import Link from "next/link"
import { useState } from "react"
import { mono } from "@/components/ui/font"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { MAX_SHOWN, type HeadingCodes } from "@/libs/tariff-updates/headingCodes"
import { Countries } from "./UpdatesList"
import { formatDay } from "./labels"

// The HTS codes under each Chapter 99 heading an update names (libs/tariff-updates/headingCodes.ts,
// through namedByUpdate in match.ts: the codes matching uses), shown the same way on the public
// update page, in review (/tariff-sources) and in Duty Guard's Tariff Changes: the heading and its
// name, how many codes and from where, then the whole numbers and the codes covered only for a
// product described under the number. The page shows every code in rows by heading, linked; the
// compact form (review, Duty Guard) folds each group to its first few.

type Links = Record<string, string | null>

export const HtsCode = ({ code, href }: { code: string; href?: string | null }) => {
  const className = `${mono.className} rounded-full bg-tt-soft px-2.5 py-1 text-xs text-base-content`
  return href ? (
    <Link href={href} className={`${className} hover:text-primary`}>
      {code}
    </Link>
  ) : (
    <span className={className}>{code}</span>
  )
}

// A list of codes, every one shown
export const CodeList = ({ codes, links = {} }: { codes: string[]; links?: Links }) => (
  <div className="flex flex-wrap gap-1.5">
    {codes.map((code) => (
      <HtsCode key={code} code={code} href={links[code]} />
    ))}
  </div>
)

// A long list of codes, every one shown, in rows by heading (its first four digits), so it can be
// scanned: "7304 (12)" then its codes. A short one stays a single list.
const GROUP_FROM = 12
export const GroupedCodes = ({ codes, links = {} }: { codes: string[]; links?: Links }) => {
  if (codes.length < GROUP_FROM) return <CodeList codes={codes} links={links} />
  const groups = new Map<string, string[]>()
  for (const code of codes) {
    const digits = code.replace(/\D/g, "")
    const key = digits.length >= 4 ? digits.slice(0, 4) : digits || code
    groups.set(key, [...(groups.get(key) ?? []), code])
  }
  if (groups.size < 2) return <CodeList codes={codes} links={links} />
  return (
    <ul className="flex flex-col divide-y divide-base-300 rounded-lg border border-base-300">
      {Array.from(groups.entries()).map(([heading, group]) => (
        <li key={heading} className="grid gap-x-5 gap-y-2 px-4 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-baseline">
          <span className="flex items-baseline gap-1.5">
            <span className={`${mono.className} text-sm font-semibold text-base-content`}>{heading}</span>
            <span className="text-xs text-base-content/50">({group.length})</span>
          </span>
          <CodeList codes={group} links={links} />
        </li>
      ))}
    </ul>
  )
}

// The first few codes, the rest behind "and N more"
const FOLD = 24
const FoldedCodes = ({ codes }: { codes: string[] }) => {
  const [all, setAll] = useState(false)
  const shown = all ? codes : codes.slice(0, FOLD)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((code) => (
        <HtsCode key={code} code={code} />
      ))}
      {codes.length > FOLD && (
        <button type="button" className={`${ui.link} text-xs`} onClick={() => setAll((a) => !a)}>
          {all ? "Show fewer" : `and ${codes.length - FOLD} more`}
        </button>
      )}
    </div>
  )
}

export const HeadingCodesList = ({
  headings,
  links = {},
  compact = false,
  title = true,
}: {
  headings: HeadingCodes[]
  links?: Links
  // Review and Duty Guard: each group folded to its first few, no links
  compact?: boolean
  // The "HTS codes under these headings" label
  title?: boolean
}) => (
  <div className="flex flex-col gap-3">
    {title && <span className={tt.eyebrow()}>HTS codes under {headings.length === 1 ? "this heading" : "these headings"}</span>}
    <ul className={`flex flex-col ${compact ? "gap-3" : "gap-4"}`}>
      {headings.map((h) => {
        const described = new Set(h.describedCodes)
        const whole = h.codes.filter((c) => !described.has(c))
        const groups = [
          { label: h.allDescribed ? "Described products only" : "Whole numbers", codes: h.allDescribed ? h.codes : whole },
          ...(!h.allDescribed && h.describedCodes.length ? [{ label: "Described products only", codes: h.describedCodes }] : []),
          ...(h.excludedCodes.length ? [{ label: h.allProducts ? "Except" : "Carved out", codes: h.excludedCodes }] : []),
        ].filter((g) => g.codes.length)
        const total = h.codes.length
        return (
          <li key={h.heading} className={`flex flex-col rounded-lg border border-base-300 ${compact ? "gap-3 p-3" : "gap-4 p-4"}`}>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <HtsCode code={h.heading} href={links[h.heading]} />
                <span className="text-sm font-semibold text-base-content">{h.name}</span>
              </div>
              <p className={`${compact ? "text-xs" : "text-sm"} text-base-content/70`}>
                {h.allProducts ? "Every product" : `${total} HTS ${total === 1 ? "code" : "codes"}`}
                {", from "}
                {h.countries === "all" ? "every country" : <Countries codes={h.countries} max={8} className="" />}
                {h.allProducts && h.excludedCodes.length ? `, except ${h.excludedCodes.length} codes` : ""}, as of {formatDay(h.asOf)}.
                {h.describedCodes.length > 0 &&
                  (h.allDescribed
                    ? " Each covers only the product described under the number in the U.S. note, not every good classified there."
                    : ` ${h.describedCodes.length} of them cover only the product described under the number in the U.S. note, not every good classified there.`)}
              </p>
            </div>
            {groups.map((g) =>
              g.codes.length > MAX_SHOWN ? (
                <p key={g.label} className="text-sm text-base-content/70">
                  {g.label}: {g.codes.length} codes, too many to list here.
                </p>
              ) : (
                <div key={g.label} className="flex flex-col gap-2">
                  {groups.length > 1 && (
                    <span className={tt.eyebrow()}>
                      {g.label} ({g.codes.length})
                    </span>
                  )}
                  {compact ? <FoldedCodes codes={g.codes} /> : <GroupedCodes codes={g.codes} links={links} />}
                </div>
              )
            )}
          </li>
        )
      })}
    </ul>
    <p className="text-xs text-base-content/60">
      From the U.S. notes to Chapter 99 of the HTS, as entered in HTS Hero&apos;s duty calculator. Headings the calculator doesn&apos;t cover yet aren&apos;t expanded.
    </p>
  </div>
)
