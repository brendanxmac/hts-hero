"use client"

import { useState } from "react"
import { ArrowTopRightOnSquareIcon, CheckCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid"
import { Countries } from "@/constants/countries"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { dottedCode, shortDate } from "@/libs/adcvd/format"
import { scopeNames, type AdcvdFlag, type FlagCase } from "@/libs/adcvd/match"
import { ACCESS_URL, CBP_MESSAGES_URL, frDocUrl } from "@/libs/adcvd/types"

// The parts of an import's AD/CVD view (AdcvdTab, AdcvdTeasers): what may cover it, why we
// flagged it, the sources, its rates by company. Never says an import IS covered: the scope's
// written description decides, and the broker checks it. AD/CVD duties are never in the estimate.

export const countryName = (code: string | null) => (code ? Countries.find((c) => c.code === code)?.name ?? code : "its country")

export const lawOf = (cases: FlagCase[]) => {
  const kinds = new Set(cases.map((c) => c.kind))
  return kinds.has("AD") && kinds.has("CVD") ? "antidumping and countervailing duty" : kinds.has("CVD") ? "countervailing duty" : "antidumping duty"
}

export const plural = (cases: FlagCase[]) => (cases.length > 1 ? "s" : "")

// "Oleoresin Paprika" → "oleoresin paprika" in a sentence
export const inSentence = (product: string) =>
  product
    .split(" ")
    .map((w) => (/^[A-Z][a-z]/.test(w) && !/^[A-Z][a-z]*[A-Z]/.test(w) ? w.toLowerCase() : w))
    .join(" ")

export const headline = (f: AdcvdFlag) => {
  const what = `${inSentence(f.product)} from ${countryName(f.country)}`
  const law = lawOf(f.cases)
  const status = f.cases[0]?.status
  if (f.level === "history") {
    const ended = f.cases.find((c) => c.ended_on)?.ended_on
    return `A ${law} case on ${what} ended${ended ? ` on ${shortDate(ended)}` : ""}`
  }
  if (status === "investigation") return `An open ${law} investigation on ${what} may cover this import`
  if (status === "suspended") return `A suspension agreement on ${what} may cover this import`
  if (f.level === "possible") return `A ${law} order on ${what} may cover this import`
  return `This import may be covered by the ${law} order${plural(f.cases)} on ${what}`
}

// Why we flagged it, one line per check
export const reasonLines = (f: AdcvdFlag, importCode: string, importCountry: string) => {
  const lines: { text: string; quote?: string; source?: { label: string; url: string } }[] = []
  const numbers = f.cases.map((c) => c.case_number).join(" and ")
  if (f.via_circumvention) {
    lines.push({ text: `A circumvention ruling extends the case${plural(f.cases)} on ${countryName(f.country)} (${numbers}) to goods from ${countryName(importCountry)}.` })
  } else {
    lines.push({ text: `${countryName(f.country)} is the country of case${plural(f.cases)} ${numbers}.` })
  }
  const code = f.code ? dottedCode(f.code) : null
  const source = f.evidence ? { label: `Federal Register ${f.evidence.document_number}${f.evidence.published_on ? `, ${shortDate(f.evidence.published_on)}` : ""}`, url: frDocUrl(f.evidence.document_number) } : undefined
  if (f.reasons.includes("listed")) {
    lines.push({ text: `Your HTS code ${dottedCode(importCode)} is listed in the scope${code && code !== dottedCode(importCode) ? ` (as ${code})` : ""}.`, quote: f.evidence?.quote, source })
  } else if (f.reasons.includes("listed_renumbered")) {
    lines.push({ text: `The scope lists ${code}, which the HTS has since replaced with new codes, including yours (${dottedCode(importCode)}).`, quote: f.evidence?.quote, source })
  } else if (f.reasons.includes("also_listed")) {
    lines.push({ text: `Your HTS code is on the scope's "may also enter under" list (${code}), so it may or may not be covered.`, quote: f.evidence?.quote, source })
  } else if (f.reasons.includes("renumbered")) {
    lines.push({ text: `The scope lists ${code}, which has been renumbered in the HTS since, under the same line as your code.`, source })
  } else if (f.reasons.includes("same_subheading")) {
    lines.push({ text: `The scope lists ${code}, in the same subheading as your code, but not your code itself.`, source })
  }
  const c = f.cases[0]
  if (c) {
    if (c.status === "order" || c.status === "suspended") {
      const since = c.order_on ? ` since ${shortDate(c.order_on)}` : ""
      const continued = c.last_continued_on ? `, last continued ${shortDate(c.last_continued_on)}` : ""
      lines.push({ text: `${c.status === "suspended" ? "Suspension agreement" : "Order"} in effect${since}${continued}.` })
    } else if (c.status === "investigation") {
      lines.push({ text: `Investigation open${c.initiated_on ? ` since ${shortDate(c.initiated_on)}` : ""}. Deposits can start at Commerce's preliminary determination.` })
    } else if (c.ended_on) {
      lines.push({ text: `Ended ${shortDate(c.ended_on)}.` })
    }
  }
  return lines
}

export const Sources = ({ f }: { f: AdcvdFlag }) => {
  const doc = f.evidence?.document_number ?? f.events[0]?.document_number
  const links = [
    ...(doc ? [{ label: `Federal Register notice ${doc}`, url: frDocUrl(doc) }] : []),
    { label: "Commerce case search (ACCESS)", url: ACCESS_URL },
    { label: "CBP AD/CVD messages", url: CBP_MESSAGES_URL },
  ]
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <span className={ui.caption}>Check it yourself:</span>
      {links.map((l) => (
        <a key={l.url} href={l.url} target="_blank" rel="noopener" className={`${ui.link} inline-flex items-center gap-1 text-xs`}>
          {l.label}
          <ArrowTopRightOnSquareIcon className="h-3 w-3" aria-hidden />
        </a>
      ))}
    </div>
  )
}

// The scope's own sentence naming the code: plain text, with the code that names theirs marked
export const ScopeQuote = ({ quote, scopeCode }: { quote: string; scopeCode: string | null }) => {
  const parts = scopeCode ? quote.split(new RegExp(`(${scopeCode.replace(/\D/g, "").split("").join("\\.?")})`)) : [quote]
  return (
    <p className="m-0 rounded-xl bg-tt-soft px-3.5 py-2.5 text-sm leading-relaxed text-base-content/75">
      <span className="mr-1.5 text-xs font-semibold uppercase tracking-wider text-base-content/50">From the scope</span>
      {parts.map((p, i) =>
        i % 2 ? (
          <mark key={i} className="rounded-sm bg-primary/15 px-1 font-semibold text-primary">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </p>
  )
}

const CODES_SHOWN = 12

// The HTS codes a scope lists, as a clean list of chips with the import's own marked (and first)
export const ScopeCodes = ({ f, code, onTint = false }: { f: AdcvdFlag; code: string; onTint?: boolean }) => {
  const [all, setAll] = useState(false)
  const digits = code.replace(/\D/g, "")
  // The scope's lists; without them, the codes its sentence names
  const quoted = Array.from(new Set((f.evidence?.quote.match(/\b\d{4}\.\d{2}(?:\.\d{2,4})?(?:\.\d{2})?\b/g) ?? []).map((c) => c.replace(/\D/g, ""))))
  const main = f.scope_codes?.main.length ? f.scope_codes.main : f.scope_codes?.also.length ? [] : quoted
  const also = f.scope_codes?.also ?? []
  if (!main.length && !also.length) return null
  const group = (label: string, codes: string[]) => {
    if (!codes.length) return null
    const sorted = [...codes].sort((a, b) => Number(scopeNames(b, digits)) - Number(scopeNames(a, digits)) || a.localeCompare(b))
    const shown = all ? sorted : sorted.slice(0, CODES_SHOWN)
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-base-content/60">
          {label} <span className="font-normal text-base-content/45">{codes.length}</span>
        </span>
        <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {shown.map((c) => {
            const yours = scopeNames(c, digits)
            return (
              <li
                key={c}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm tabular-nums ${
                  yours ? "bg-primary font-semibold text-primary-content ring-2 ring-primary/30" : onTint ? "bg-base-100 text-base-content/75" : "bg-tt-soft text-base-content/75"
                }`}
              >
                {dottedCode(c)}
                {yours && <span className="rounded-full bg-primary-content/20 px-1.5 text-[11px] font-bold uppercase tracking-wide">Yours</span>}
              </li>
            )
          })}
        </ul>
        {codes.length > CODES_SHOWN && (
          <button type="button" className={`${ui.link} self-start text-xs`} onClick={() => setAll(!all)}>
            {all ? "Show fewer" : `Show all ${codes.length}`}
          </button>
        )}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-3">
      {group("HTS codes in the scope", main)}
      {group("May also enter under", also)}
    </div>
  )
}

export const Why = ({ f, code, country }: { f: AdcvdFlag; code: string; country: string }) => (
  <ul className="m-0 flex list-none flex-col gap-2 p-0">
    {reasonLines(f, code, country).map((line) => (
      <li key={line.text} className="flex gap-2">
        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
        <div className="flex min-w-0 flex-col gap-1">
          <span className={ui.bodySm}>{line.text}</span>
          {line.quote && <ScopeQuote quote={line.quote} scopeCode={f.code} />}
          {line.source && (
            <a href={line.source.url} target="_blank" rel="noopener" className={`${ui.link} text-xs`}>
              {line.source.label}
            </a>
          )}
        </div>
      </li>
    ))}
  </ul>
)

// Each producer's latest rate, searchable: "if your supplier is X, the rate is Y%"
const COMPANIES_SHOWN = 10

export const Companies = ({ f }: { f: AdcvdFlag }) => {
  const [query, setQuery] = useState("")
  const [all, setAll] = useState(false)
  const rows = f.cases.flatMap((c) => (c.companies ?? []).map((x) => ({ ...x, kind: c.kind })))
  if (!rows.length) return null
  const q = query.trim().toLowerCase()
  const rated = rows.filter((r) => !r.excluded && (!q || r.company.toLowerCase().includes(q))).sort((a, b) => a.company.localeCompare(b.company) || a.kind.localeCompare(b.kind))
  const excluded = rows.filter((r) => r.excluded)
  const shown = all || q ? rated : rated.slice(0, COMPANIES_SHOWN)
  const both = f.cases.length > 1
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h4 className={tt.sectionTitle}>Rates By Company</h4>
          <p className={`${ui.caption} m-0 mt-1`}>
            {rated.length} {rated.length === 1 ? "company has" : "companies have"} a rate of its own. Companies not named pay the &ldquo;all others&rdquo; rate.
          </p>
        </div>
        <label className="relative">
          <span className="sr-only">Search your supplier</span>
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
          <input
            id={`adcvd-companies-${f.cases[0]?.case_number}`}
            className={`${ui.inputSm} w-64 pl-9`}
            placeholder="Search your supplier"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      {shown.length ? (
        <div className="overflow-hidden rounded-xl border border-base-300">
          <table className="w-full text-sm">
            <thead className="bg-tt-soft">
              <tr>
                <th scope="col" className={`${tt.eyebrow()} px-4 py-2 text-left`}>Company</th>
                {both && <th scope="col" className={`${tt.eyebrow()} px-4 py-2 text-left`}>Law</th>}
                <th scope="col" className={`${tt.eyebrow()} px-4 py-2 text-right`}>Rate</th>
                <th scope="col" className={`${tt.eyebrow()} px-4 py-2 text-right`}>As Of</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300">
              {shown.map((r) => (
                <tr key={`${r.kind}-${r.company}`}>
                  <td className="max-w-0 truncate px-4 py-2 text-base-content/85" title={r.company}>
                    {r.company}
                  </td>
                  {both && <td className="w-28 px-4 py-2 text-xs text-base-content/60">{r.kind === "AD" ? "Antidumping" : "Countervailing"}</td>}
                  <td className="w-24 px-4 py-2 text-right font-semibold tabular-nums text-base-content">{r.rate === null ? "–" : `${Number(r.rate.toFixed(2))}%`}
                    {r.basis === "cash_deposit" && <span className="ml-1 text-xs font-normal text-base-content/50">deposit</span>}
                  </td>
                  <td className="w-32 px-4 py-2 text-right text-xs tabular-nums text-base-content/55">{shortDate(r.as_of)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className={`${ui.caption} m-0`}>No company by that name. Companies not named pay the &ldquo;all others&rdquo; rate.</p>
      )}
      {!q && rated.length > COMPANIES_SHOWN && (
        <button type="button" className={`${ui.link} self-start text-sm`} onClick={() => setAll(!all)}>
          {all ? "Show fewer" : `Show all ${rated.length} companies`}
        </button>
      )}
      {excluded.length > 0 && (
        <p className={`${ui.caption} m-0`}>
          Excluded from the order (their goods aren&apos;t covered): {excluded.map((x) => x.company).join("; ")}.
        </p>
      )}
    </div>
  )
}

// What every AD/CVD answer carries, found or not: where it comes from, and that it's no guarantee
export const Disclaimer = ({ checkedAt, className = "" }: { checkedAt?: string; className?: string }) => (
  <p className={`${ui.caption} m-0 ${className}`}>
    Based on our sources (Federal Register notices from the Commerce Department and the U.S. International Trade Commission
    {checkedAt ? `, checked ${shortDate(checkedAt)}` : ""}). We match on HTS code and country of origin, but whether an AD/CVD order covers your goods is decided by its
    written scope, so we can&apos;t give a 100% guarantee either way. Confirm with your customs broker before you file.
  </p>
)

export const monthName = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })

// The scope notice to read: the one our codes came from, or the case's latest notice
export const scopeDocOf = (f: AdcvdFlag) => f.evidence?.document_number ?? f.events[0]?.document_number ?? null

export interface DepositPart {
  kind: FlagCase["kind"]
  case_number: string
  rate: number | null
  // Where the rate comes from: the supplier's own, the "all others" rate, the supplier excluded
  // from the order (nothing due), or no rate set yet
  source: "company" | "all_others" | "excluded" | "none"
}

// The estimated deposit on an entry from one supplier (null: no supplier picked, so "all others"):
// each case's rate for that company, or its all-others rate, added up across the AD and CVD cases
export const depositFor = (f: AdcvdFlag, supplier: string | null) => {
  const parts: DepositPart[] = f.cases.map((c) => {
    const own = supplier ? (c.companies ?? []).find((x) => x.company === supplier) : undefined
    if (own?.excluded) return { kind: c.kind, case_number: c.case_number, rate: 0, source: "excluded" }
    if (own && own.rate !== null) return { kind: c.kind, case_number: c.case_number, rate: own.rate, source: "company" }
    const others = c.rates?.all_others ?? null
    return { kind: c.kind, case_number: c.case_number, rate: others, source: others === null ? "none" : "all_others" }
  })
  const rated = parts.filter((p) => p.rate !== null)
  return { parts, total: rated.length ? rated.reduce((sum, p) => sum + (p.rate ?? 0), 0) : null, missing: parts.some((p) => p.rate === null) }
}

