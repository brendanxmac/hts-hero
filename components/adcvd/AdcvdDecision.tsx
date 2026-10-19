"use client"

import { ReactNode, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CheckBadgeIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { wholeDollars } from "@/components/tariff-tracker/insights/teasers"
import { dottedCode, shortDate } from "@/libs/adcvd/format"
import type { AdcvdFlag } from "@/libs/adcvd/match"
import { ACCESS_URL, CBP_MESSAGES_URL, frDocUrl, STATUSES } from "@/libs/adcvd/types"
import type { AdcvdAnswer } from "@/components/tariff-tracker/adjustments"
import { countryName, depositFor, inSentence, lawOf, ScopeCodes, scopeDocOf } from "./AdcvdParts"

// One AD/CVD case on an import, as a walk through the questions that decide whether it affects the
// user, in order, one column (sections of the results box, DESIGN_SYSTEM §15):
//   the case: its product and country, how sure the match is, where it stands, the range of rates
//   1. is it your product? (the scope's written description decides; where the HTS code stands)
//   2. who made and exported it? (every company with its own rate; not listed: "all others")
//   3. your result: what it means, and the deposit for that company, in % and on this shipment
//   4. what to do, for that answer
//   then everything else about the case, folded
// Later steps open as the earlier ones are answered; the user's own numbers only show once they
// have said it's their product (or aren't sure), never as the opening line.

export type Answer = "yes" | "no" | "unsure" | null

const pct = (n: number) => `${Number(n.toFixed(2))}%`

type Tone = "warning" | "error" | "success"

const TONE: Record<Tone, { icon: string; text: string; tint: string }> = {
  warning: { icon: "bg-warning text-warning-content", text: "text-warning", tint: "bg-warning/10" },
  error: { icon: "bg-error text-error-content", text: "text-error", tint: "bg-error/10" },
  success: { icon: "bg-success text-success-content", text: "text-success", tint: "bg-success/10" },
}

// What the answer means for the importer. Never certain: the scope's written description decides,
// and the broker confirms it.
const verdictOf = (f: AdcvdFlag, answer: Answer): { tone: Tone; title: string; body: string } => {
  const investigation = f.cases.every((c) => c.status === "investigation")
  if (answer === "no")
    return {
      tone: "success",
      title: "Probably not affected",
      body: "If your goods don't fit the scope's written description, the case doesn't apply to them. Keep a note of why (a spec sheet, or a scope ruling) in case CBP asks.",
    }
  if (answer === "yes")
    return {
      tone: "error",
      title: investigation ? "Very likely affects you once deposits start" : "Very likely affects you",
      body: investigation
        ? "Commerce is still investigating. Deposits usually start at its preliminary determination, so plan for them now."
        : "If your goods fit the scope, a cash deposit is due at entry, on top of the regular duty. Your broker confirms it and files the case number.",
    }
  return {
    tone: "warning",
    title: "Not sure? Let your broker decide",
    body: "Until it's settled, plan as if it applies. Your broker can confirm it, or ask Commerce for a scope ruling.",
  }
}

export const MATCH_CHIP: Record<AdcvdFlag["level"], { label: string; tone: Parameters<typeof tt.chip>[0] }> = {
  likely: { label: "Likely match", tone: "warning" },
  possible: { label: "Possible match", tone: "neutral" },
  history: { label: "Ended", tone: "neutral" },
}

// The lowest and highest deposit anyone pays on the case (each company's own, and "all others")
export const depositRange = (f: AdcvdFlag) => {
  const names = Array.from(new Set(f.cases.flatMap((c) => (c.companies ?? []).filter((x) => !x.excluded).map((x) => x.company))))
  const totals = [null, ...names].map((n) => depositFor(f, n).total).filter((t): t is number => t !== null)
  return totals.length ? { low: Math.min(...totals), high: Math.max(...totals) } : null
}

export const rangeText = (r: { low: number; high: number } | null) =>
  !r ? "No rates set yet" : r.low === r.high ? pct(r.high) : `${pct(r.low)} to ${pct(r.high)}`

// ── The case ──

const CaseHeader = ({ f, eyebrow, id }: { f: AdcvdFlag; eyebrow: string; id?: string }) => {
  const c = f.cases[0]
  const since = c.status === "investigation" ? (c.initiated_on ? `opened ${shortDate(c.initiated_on)}` : null) : c.order_on ? `since ${shortDate(c.order_on)}` : null
  return (
    <div id={id} className={`${ui.cardSection} flex scroll-mt-24 flex-col gap-2 py-6!`}>
      <span className={tt.eyebrow("warning")}>{eyebrow}</span>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <h3 className={`${tt.display} m-0 text-2xl font-semibold leading-tight text-base-content`}>
          {f.product} from {countryName(f.country)}
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={tt.chip(MATCH_CHIP[f.level].tone)}>{MATCH_CHIP[f.level].label}</span>
          {f.cases.map((c) => (
            <span key={c.case_number} className={tt.chip()}>
              {c.kind === "AD" ? "Antidumping" : "Countervailing"} <span className="ml-1 font-mono font-medium">{c.case_number}</span>
            </span>
          ))}
        </div>
      </div>
      <p className="m-0 text-sm text-base-content/70">
        {STATUSES[c.status]}
        {since ? ` ${since}` : ""} · Deposits on this {lawOf(f.cases)} case: <b className="font-semibold tabular-nums text-base-content">{rangeText(depositRange(f))}</b>,
        depending on who made the goods. They&apos;re paid on top of the regular duty and aren&apos;t in its estimate.
      </p>
    </div>
  )
}

// ── The steps ──

// A numbered step: its number (a check once answered), its title, then its content. Locked until
// the steps before it are answered, with a line saying so.
const Step = ({ n, title, hint, done, locked, children }: { n: number; title: string; hint?: ReactNode; done?: boolean; locked?: string; children?: ReactNode }) => (
  <section className={`${ui.cardSection} py-6!`}>
    <div className="flex gap-4">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          locked ? "bg-tt-soft text-base-content/40" : done ? "bg-primary text-primary-content" : "bg-primary/15 text-primary"
        }`}
        aria-hidden
      >
        {done ? <CheckIcon className="h-4 w-4" /> : n}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-4 pt-0.5">
        <div className="flex flex-col gap-1">
          <h4 className={`${tt.title} m-0 ${locked ? "text-base-content/45!" : ""}`}>{title}</h4>
          {locked ? <p className="m-0 text-sm text-base-content/50">{locked}</p> : hint && <div className="m-0 max-w-3xl text-sm text-base-content/70">{hint}</div>}
        </div>
        {!locked && children}
      </div>
    </div>
  </section>
)

const ANSWERS = [
  ["yes", "Yes, it is"],
  ["no", "No"],
  ["unsure", "Not sure"],
] as const

// Yes / No / Not sure, as a row of buttons (clicking the picked one clears it)
const AnswerButtons = ({ value, onChange, label, size = "md" }: { value: Answer; onChange: (a: Answer) => void; label: string; size?: "sm" | "md" }) => (
  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
    {ANSWERS.map(([id, text]) => (
      <button
        key={id}
        type="button"
        role="radio"
        aria-checked={value === id}
        onClick={() => onChange(value === id ? null : id)}
        className={`${ui.button({ variant: value === id ? "primary" : "secondary", size: "sm" })} ${size === "md" ? "min-w-24" : "min-w-16"}`}
      >
        {value === id && <CheckIcon className="h-4 w-4" aria-hidden />}
        {size === "sm" && id === "yes" ? "Yes" : text}
      </button>
    ))}
  </div>
)

// Where the import's HTS code stands against the case's list of codes: a short headline and a line
const codeStanding = (f: AdcvdFlag, code: string) => {
  const yours = dottedCode(code.replace(/\D/g, ""))
  const listed = f.code ? dottedCode(f.code) : null
  const n = f.scope_codes?.main.length ?? 0
  const list = n ? `the case's list of ${n} HTS code${n === 1 ? "" : "s"}` : "the case's list of HTS codes"
  if (f.reasons.includes("listed"))
    return { title: `${yours} is on ${list}`, body: "Commerce lists the HTS codes the covered goods are usually entered under, and yours is one of them. That makes a match likely, but the description still decides." }
  if (f.reasons.includes("listed_renumbered"))
    return { title: `${yours} is on ${list}`, body: `The list names ${listed}, which the HTS has since renumbered; yours is one of the codes that replaced it.` }
  if (f.reasons.includes("also_listed"))
    return { title: `${yours} is on the case's "may also enter under" list`, body: "Goods the case covers sometimes enter under it, so it may or may not apply." }
  if (f.reasons.includes("renumbered")) return { title: `${yours} is next to ${list}`, body: `The list names ${listed}, renumbered since, on the same line as yours.` }
  return { title: `${yours} isn't on ${list}, but it's close`, body: `It shares a subheading with ${listed}, which the list names.` }
}

const YourProduct = ({ f, code, answer, onAnswer }: { f: AdcvdFlag; code: string; answer: Answer; onAnswer: (a: Answer) => void }) => {
  const [showCodes, setShowCodes] = useState(false)
  const standing = codeStanding(f, code)
  const doc = scopeDocOf(f)
  const question = f.via_circumvention
    ? `Is your product ${inSentence(f.product)}, made with parts or materials from ${countryName(f.country)}?`
    : `Is your product ${inSentence(f.product)}?`
  return (
    <Step
      n={1}
      title={question}
      done={answer !== null}
      hint={
        <>
          The case covers the goods its scope describes in writing. Read it and compare it with your goods: the description decides, not the HTS code.{" "}
          {doc && (
            <a href={frDocUrl(doc)} target="_blank" rel="noopener" className={`${ui.link} inline-flex items-center gap-1 whitespace-nowrap`}>
              Read the scope
              <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </>
      }
    >
      <AnswerButtons value={answer} onChange={onAnswer} label={question} />
      <div className="flex max-w-3xl flex-col gap-1 rounded-xl bg-tt-soft px-4 py-3">
        <span className="text-sm font-semibold text-base-content">{standing.title}</span>
        <span className="text-sm text-base-content/70">{standing.body}</span>
        <button type="button" className={`${ui.link} self-start text-sm`} onClick={() => setShowCodes(!showCodes)} aria-expanded={showCodes}>
          {showCodes ? "Hide the list" : "See the list"}
        </button>
        {showCodes && (
          <div className="mt-1">
            <ScopeCodes f={f} code={code} />
          </div>
        )}
      </div>
    </Step>
  )
}

const copy = async (text: string, what: string) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(`${what} copied`)
  } catch {
    toast.error("Couldn't copy. Select the text and copy it instead.")
  }
}

const SUPPLIER_ASK =
  "Could you confirm the name of the company that manufactured these goods, and the company that exported them to the U.S.? We need both for U.S. antidumping and countervailing duty purposes."

// Every company with a rate of its own, in full (no scrolling box), searchable, "not listed" (the
// all-others rate) first. Two columns on wide screens, so a long list stays short.
const WhoMadeIt = ({ n, f, value, onChange }: { n: number; f: AdcvdFlag; value: string | null; onChange: (v: string | null) => void }) => {
  const [query, setQuery] = useState("")
  const rows = useMemo(() => {
    const names = Array.from(new Set(f.cases.flatMap((c) => (c.companies ?? []).map((x) => x.company))))
    return names
      .map((name) => {
        const d = depositFor(f, name)
        return { name, total: d.total, excluded: d.parts.every((p) => p.source === "excluded") }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [f])
  const others = depositFor(f, null)
  const q = query.trim().toLowerCase()
  const shown = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows

  // One company (a plain function, not a component: called, so rows aren't remounted on every render)
  const row = ({ id, name, sub, total, excluded }: { id: string | null; name: string; sub?: string; total: number | null; excluded?: boolean }) => {
    const picked = value === id
    return (
      <li key={id ?? "others"}>
        <button
          type="button"
          role="radio"
          aria-checked={picked}
          onClick={() => onChange(id)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${picked ? "bg-primary/10 ring-1 ring-inset ring-primary/30" : "hover:bg-tt-soft"}`}
        >
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${picked ? "border-primary" : "border-base-300"}`} aria-hidden>
            {picked && <span className="h-2 w-2 rounded-full bg-primary" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-semibold ${picked ? "text-primary" : "text-base-content"}`}>{name}</span>
            {sub && <span className="block text-xs text-base-content/55">{sub}</span>}
          </span>
          <span className={`shrink-0 text-sm font-semibold tabular-nums ${excluded ? "text-success" : total === null ? "text-base-content/50" : "text-base-content/80"}`}>
            {excluded ? "Excluded" : total === null ? "–" : pct(total)}
          </span>
        </button>
      </li>
    )
  }

  return (
    <Step
      n={n}
      title="Who made and exported it?"
      done={value !== null}
      hint={
        <>
          The deposit depends on the company that made and exported your goods. {rows.length} {rows.length === 1 ? "has" : "have"} a rate of {rows.length === 1 ? "its" : "their"}{" "}
          own; everyone else pays the &ldquo;all others&rdquo; rate. Don&apos;t know who made them?{" "}
          <button type="button" className={ui.link} onClick={() => copy(SUPPLIER_ASK, "Message to your supplier")}>
            Copy a message asking your supplier
          </button>
        </>
      }
    >
      <label className="relative block w-full max-w-md">
        <span className="sr-only">Search companies</span>
        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-content/40" aria-hidden />
        <input className={`${ui.input} pl-9`} placeholder="Search for your supplier" value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <ul className="m-0 grid list-none grid-cols-1 gap-x-4 gap-y-0.5 p-0 lg:grid-cols-2" role="radiogroup" aria-label="Who made and exported it?">
        {row({ id: null, name: "Not listed, or not sure", sub: "Pays the “all others” rate", total: others.total })}
        {shown.map((r) => row({ id: r.name, name: r.name, sub: r.excluded ? "Excluded from the order: not covered" : undefined, total: r.total, excluded: r.excluded }))}
      </ul>
      {q && !shown.length && <p className="m-0 text-sm text-base-content/60">No company by that name. If yours isn&apos;t listed, it pays the &ldquo;all others&rdquo; rate.</p>}
    </Step>
  )
}

// The estimate's parts, AD and CVD, as one bar
const DepositBar = ({ parts, total }: { parts: { kind: string; rate: number | null }[]; total: number }) =>
  parts.length > 1 && total > 0 ? (
    <div className="flex max-w-md flex-col gap-1.5">
      <div className="flex h-2 overflow-hidden rounded-full bg-base-100" aria-hidden>
        {parts.map((p, i) => (
          // Each part's share of the total: runtime width
          <span key={p.kind} className={i ? "bg-error/45" : "bg-error"} style={{ width: `${((p.rate ?? 0) / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-base-content/65">
        {parts.map((p, i) => (
          <span key={p.kind} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-xs ${i ? "bg-error/45" : "bg-error"}`} aria-hidden />
            {p.kind === "AD" ? "Antidumping" : "Countervailing"} <b className="tabular-nums text-base-content">{p.rate === null ? "not set" : pct(p.rate)}</b>
          </span>
        ))}
      </div>
    </div>
  ) : null

const YourResult = ({
  n,
  f,
  answer,
  supplier,
  customsValue,
  dutyUsd,
}: {
  n: number
  f: AdcvdFlag
  answer: Answer
  supplier: string | null
  customsValue?: number
  dutyUsd?: number
}) => {
  if (!answer) return <Step n={n} title="Your Result" locked="Answer the question above to see what this case means for you." />
  const d = depositFor(f, supplier)
  const excluded = d.parts.length > 0 && d.parts.every((p) => p.source === "excluded")
  const v = excluded ? { tone: "success" as Tone, title: `${supplier} is excluded from the order`, body: "Goods made and exported by this company aren't covered. Keep proof of who made them." } : verdictOf(f, answer)
  const tone = TONE[v.tone]
  const Icon = v.tone === "success" ? CheckBadgeIcon : answer === "unsure" ? QuestionMarkCircleIcon : ExclamationTriangleIcon
  const showDeposit = answer !== "no" && !excluded
  const usd = d.total !== null && customsValue ? (customsValue * d.total) / 100 : null
  const who = supplier ? `for ${supplier}` : "at the “all others” rate"
  return (
    <Step n={n} title="Your Result" done>
      <div className={`flex max-w-3xl flex-col gap-4 rounded-xl px-5 py-4 ${tone.tint}`} aria-live="polite">
        <div className="flex items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.icon}`} aria-hidden>
            <Icon className="h-5 w-5" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className={`${tt.display} m-0 text-lg font-semibold leading-tight ${tone.text}`}>{v.title}</p>
            <p className="m-0 text-sm text-base-content/75">{v.body}</p>
          </div>
        </div>
        {showDeposit && (
          <div className="flex flex-col gap-3 border-t border-base-content/10 pt-4">
            {d.total === null ? (
              <p className="m-0 text-sm text-base-content/70">No deposit rate is set yet: Commerce sets rates at its preliminary determination.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-base-content/60">Estimated deposit, {who}</span>
                    <span className={`${tt.metric} text-error!`}>{pct(d.total)}</span>
                  </div>
                  {usd !== null && customsValue && (
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-base-content/60">On a {wholeDollars(customsValue)} shipment</span>
                      <span className={`${tt.metric} text-error!`}>{wholeDollars(usd)}</span>
                    </div>
                  )}
                  {usd !== null && dutyUsd !== undefined && (
                    <span className="text-sm text-base-content/70">
                      About <b className="tabular-nums text-base-content">{Math.max(1, Math.round(usd / Math.max(dutyUsd, 1)))}×</b> the regular duty ({wholeDollars(dutyUsd)})
                    </span>
                  )}
                </div>
                <DepositBar parts={d.parts} total={d.total} />
                <p className={`${ui.caption} m-0`}>
                  A cash deposit CBP collects at entry, as a share of the goods&apos; value. The final duty is set later, in Commerce&apos;s reviews.
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </Step>
  )
}

// This check on the public calculator, opened on the AD/CVD tab: what the broker (and anyone they
// pass it to) lands on. Always the live site: the note is for someone else.
const pageLink = (code: string, country: string) => `https://htshero.com/duty-calculator?code=${encodeURIComponent(code)}&country=${country}&view=adcvd`

const brokerNote = (f: AdcvdFlag, code: string, country: string, answer: Answer, supplier: string | null) => {
  const d = depositFor(f, supplier)
  const deposit = d.total === null ? "no rates set yet" : `estimated deposit about ${pct(d.total)}`
  return [
    answer === "yes" ? "Hi, I believe this import is covered by an AD/CVD order. Could you confirm it and file the case?" : "Hi, could you check whether this import is covered by an AD/CVD order?",
    "",
    `HTS ${dottedCode(code)} from ${countryName(country)}`,
    `Case ${f.cases.map((c) => c.case_number).join(" / ")}: ${f.product} from ${countryName(f.country)}`,
    `Supplier: ${supplier ? `${supplier} (${deposit})` : `not confirmed yet (${deposit} at the all others rate)`}`,
    "",
    `Details: ${pageLink(code, country)}`,
  ].join("\n")
}

const WhatToDo = ({ n, f, code, country, answer, supplier }: { n: number; f: AdcvdFlag; code: string; country: string; answer: Answer; supplier: string | null }) => {
  if (!answer) return <Step n={n} title="What To Do" locked="Your next steps appear once you've answered." />
  const doc = scopeDocOf(f)
  if (answer === "no")
    return (
      <Step n={n} title="What To Do" hint="Nothing to pay on this case. Keep a record of why your goods don't fit the scope (a spec sheet or photos against its description), in case CBP asks.">
        {doc && (
          <a href={frDocUrl(doc)} target="_blank" rel="noopener" className={`${ui.button({ variant: "secondary", size: "sm" })} self-start`}>
            Open the scope to keep with your records
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
      </Step>
    )
  const note = brokerNote(f, code, country, answer, supplier)
  return (
    <Step
      n={n}
      title="What To Do"
      hint={
        answer === "yes"
          ? "Send your broker this note: they confirm the case applies, file its case number on your entries and pay the deposit at entry."
          : "Send your broker this note: they can confirm whether the case applies, or ask Commerce for a scope ruling."
      }
    >
      <p className="m-0 max-w-3xl whitespace-pre-line wrap-break-word rounded-xl bg-tt-soft px-4 py-3 text-sm leading-relaxed text-base-content/80">{note}</p>
      <button type="button" className={`${ui.button({ variant: "primary", size: "sm" })} self-start`} onClick={() => copy(note, "Broker note")}>
        <ClipboardDocumentIcon className="h-4 w-4" aria-hidden />
        Copy the note for your broker
      </button>
    </Step>
  )
}

// ── Case details ──

// Where every number here comes from, one click away: the scope notice, each case's notices in the
// Federal Register, Commerce's case search and CBP's instructions
export const SourceLinks = ({ f }: { f: AdcvdFlag }) => {
  const doc = scopeDocOf(f)
  const links = [
    ...(doc ? [{ label: "Scope notice", url: frDocUrl(doc) }] : []),
    ...f.cases.map((c) => ({
      label: `${c.case_number} notices`,
      url: `https://www.federalregister.gov/documents/search?conditions%5Bdocket_id%5D=${encodeURIComponent(c.case_number)}`,
    })),
    { label: "Commerce case search", url: ACCESS_URL },
    { label: "CBP instructions", url: CBP_MESSAGES_URL },
  ]
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold text-base-content">Check it at the source</span>
      {links.map((l) => (
        <a
          key={l.url}
          href={l.url}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full border border-base-300 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          {l.label}
          <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" aria-hidden />
        </a>
      ))}
    </div>
  )
}

export const Fold = ({ label, hint, children, defaultOpen = false }: { label: string; hint?: string; children: ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl px-1 py-1 text-left transition-colors hover:text-primary"
      >
        <span className="min-w-0">
          <span className="block font-semibold text-base-content">{label}</span>
          {hint && <span className="block truncate text-sm text-base-content/60">{hint}</span>}
        </span>
        <ChevronDownIcon className={`h-5 w-5 shrink-0 text-base-content/50 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {open && <div className="flex flex-col gap-6 pt-5">{children}</div>}
    </div>
  )
}

// ── One case ──

export const CaseWalkthrough = ({
  f,
  code,
  country,
  customsValue,
  dutyUsd,
  details,
  eyebrow = "AD/CVD Check",
  value,
  onChange,
  id,
  next,
}: {
  f: AdcvdFlag
  code: string
  country: string
  customsValue?: number
  dutyUsd?: number
  // Case details, folded at the end
  details: ReactNode
  // Above the case's name: which of several cases this is ("Case 2 of 7")
  eyebrow?: string
  // What the user said about this case (saved with the product)
  value: AdcvdAnswer
  onChange: (patch: AdcvdAnswer) => void
  // On the case's header, to scroll to it
  id?: string
  // The next case still to answer, once this one is answered (several cases)
  next?: { label: string; onGo: () => void }
}) => {
  const answer: Answer = value.answer ?? null
  const supplier = value.supplier ?? null
  const hasCompanies = f.cases.some((c) => (c.companies ?? []).length > 0)
  // Who made it only matters when the case may apply
  const asksSupplier = hasCompanies && answer !== "no"
  const step = asksSupplier ? 3 : 2
  return (
    <>
      <CaseHeader f={f} eyebrow={eyebrow} id={id} />
      <YourProduct f={f} code={code} answer={answer} onAnswer={(a) => onChange({ answer: a ?? undefined })} />
      {asksSupplier &&
        (answer ? (
          <WhoMadeIt n={2} f={f} value={supplier} onChange={(s) => onChange({ supplier: s ?? undefined })} />
        ) : (
          <Step n={2} title="Who made and exported it?" locked="Answer the question above first." />
        ))}
      <YourResult n={step} f={f} answer={answer} supplier={supplier} customsValue={customsValue} dutyUsd={dutyUsd} />
      <WhatToDo n={step + 1} f={f} code={code} country={country} answer={answer} supplier={supplier} />
      {next && answer && (
        <div className={`${ui.cardSection} flex flex-wrap items-center justify-between gap-3 py-4!`}>
          <span className="text-sm text-base-content/70">Next case to answer</span>
          <button type="button" className={ui.button({ variant: "secondary", size: "sm" })} onClick={next.onGo}>
            {next.label}
            <ArrowRightIcon className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
      <div className={`${ui.cardSection} py-5!`}>
        <Fold label="Case Details" hint="Where it stands, why we flagged it, the rates Commerce set, every notice and the sources">
          {details}
        </Fold>
      </div>
    </>
  )
}
