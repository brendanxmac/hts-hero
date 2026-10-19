"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowPathIcon, CheckBadgeIcon, ScaleIcon } from "@heroicons/react/20/solid"
import { AccountGate } from "@/components/tariff-tracker/access/AccountGate"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { ratesBasis, ratesText, shortDate } from "@/libs/adcvd/format"
import type { AdcvdFlag, AdcvdLookup, FlagEvent } from "@/libs/adcvd/match"
import { STATUSES } from "@/libs/adcvd/types"
import { countryName, Disclaimer, headline, monthName, Sources, Why } from "./AdcvdParts"
import { CaseWalkthrough, Fold, SourceLinks } from "./AdcvdDecision"
import { CaseNav, caseLabel, CasesHeader } from "./CaseNav"
import { CardRow, CardSections } from "@/components/ui/Card"
import { useAdcvdAnswers } from "./useAdcvdAnswers"
import { useAdcvdLookup, useAdcvdSummary, lookupOf } from "./useAdcvd"
import { useUser } from "@/contexts/UserContext"
import { LockedPreview } from "@/components/ui/LockedPreview"
import { MixpanelEvent, trackEvent } from "@/libs/mixpanel"
import { useOptionalTrackerAccess } from "@/components/tariff-tracker/access/accessContext"

// The calculator's AD/CVD tab (and an import's page in the Tracker), decision first: whether any
// antidumping or countervailing duty case may cover this import (celebrated when none does), then
// for each case does it affect you, what you would pay, and what to do next (CaseDecision), with
// the case in full (why we flagged it, where it stands, every company's rate, its notices) folded
// under Case details. A free account: signed out, a stand-in behind the sign-up (never the cases
// themselves), led by whether any may apply.

const SECTION = `${ui.cardSection} flex flex-col gap-5 py-6!`

const pct = (n: number) => `${Number(n.toFixed(2))}%`

const Heading = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="min-w-0">
    <h3 className={tt.title}>{title}</h3>
    {hint && <p className={tt.subtitle}>{hint}</p>}
  </div>
)

// ── The answer, first ──

const Verdict = ({ data }: { data: AdcvdLookup }) => {
  const live = data.flags.filter((f) => f.level !== "history")
  if (!live.length && !data.petitions.length) {
    return (
      <section className={SECTION} aria-label="AD/CVD check">
        <div className="flex items-start gap-4 rounded-xl bg-success/10 px-5 py-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-success-content" aria-hidden>
            <CheckBadgeIcon className="h-7 w-7" />
          </span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className={tt.eyebrow("success")}>AD/CVD Check</span>
            <p className={`${tt.display} m-0 text-2xl font-semibold text-base-content`}>Good news: no AD/CVD cases found for this import</p>
            <p className="m-0 text-sm text-base-content/75">
              We checked every antidumping and countervailing duty order, suspension agreement, open investigation and new petition on goods from{" "}
              {countryName(data.country)}, and none lists this HTS code. No extra AD/CVD duty should be on top of the duty shown.
            </p>
          </div>
        </div>
      </section>
    )
  }
  // Cases found: each case leads with its own header (CaseDecision). Only a petition: say so here
  if (live.length) return null
  return (
    <section className={`${ui.cardSection} flex flex-col gap-1.5 py-6!`} aria-label="AD/CVD check">
      <span className={tt.eyebrow("warning")}>AD/CVD Check</span>
      <p className={`${tt.display} m-0 text-2xl font-semibold text-base-content`}>A new AD/CVD petition names this product and country</p>
      <p className="m-0 text-sm text-base-content/70">No order or investigation covers it yet. If Commerce opens one, deposits can follow within months.</p>
    </section>
  )
}

// ── One case ──

const Facts = ({ f }: { f: AdcvdFlag }) => {
  const c = f.cases[0]
  const rows = [
    { label: "Status", value: STATUSES[c.status] },
    ...(c.initiated_on ? [{ label: "Investigation started", value: shortDate(c.initiated_on) }] : []),
    ...(c.order_on ? [{ label: c.status === "suspended" ? "Agreement signed" : "Order issued", value: shortDate(c.order_on) }] : []),
    ...(c.last_continued_on ? [{ label: "Last continued", value: shortDate(c.last_continued_on) }] : []),
    ...(c.ended_on ? [{ label: "Ended", value: shortDate(c.ended_on) }] : []),
    ...(f.next.review_month ? [{ label: "Annual review window", value: `${monthName(f.next.review_month)} (est.)` }] : []),
    ...(f.next.sunset_due ? [{ label: "Five-year review due", value: `${monthName(f.next.sunset_due)} (est.)` }] : []),
  ]
  return (
    <div className="flex flex-col gap-2">
      <h4 className={tt.sectionTitle}>Where It Stands</h4>
      <dl className="m-0 flex flex-col divide-y divide-base-300 rounded-xl bg-tt-soft px-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
            <dt className="text-base-content/65">{r.label}</dt>
            <dd className="m-0 text-right font-semibold tabular-nums text-base-content">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const Rates = ({ f }: { f: AdcvdFlag }) => (
  <div className="flex flex-col gap-2">
    <h4 className={tt.sectionTitle}>Rates Commerce Set</h4>
    <div className={`grid gap-3 ${f.cases.length > 1 ? "md:grid-cols-2" : ""}`}>
      {f.cases.map((c) => (
        <div key={c.case_number} className={`${tt.tile} flex flex-col gap-1.5 px-5 py-4`}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-base-content">{c.kind === "AD" ? "Antidumping" : "Countervailing"}</span>
            <span className="font-mono text-xs text-base-content/55">{c.case_number}</span>
          </div>
          {c.rates ? (
            <>
              {c.rates.all_others !== null && (
                <div className="flex items-baseline gap-2">
                  <span className={`${tt.metric} !text-error`}>{pct(c.rates.all_others)}</span>
                  <span className="text-sm text-base-content/65">all others rate</span>
                </div>
              )}
              <span className="text-sm text-base-content/75">{ratesText(c.rates)}</span>
              <span className="text-xs text-base-content/55">
                Commerce&apos;s {ratesBasis(c.rates)}, {shortDate(c.rates.as_of)}
              </span>
            </>
          ) : (
            <span className="text-sm text-base-content/65">{c.status === "investigation" ? "No rates yet: Commerce sets them at its preliminary determination." : "No rates read yet."}</span>
          )}
        </div>
      ))}
    </div>
    <p className={`${ui.caption} m-0`}>
      The rate on an entry depends on who made and exported the goods, and the cash deposit CBP collects can differ from these (for example, adjusted for subsidy offsets).
      Later reviews can change them; the notice has the exact figures.
    </p>
  </div>
)

const Timeline = ({ events }: { events: FlagEvent[] }) =>
  events.length ? (
    <div className="flex flex-col gap-2">
      <h4 className={tt.sectionTitle}>Notices</h4>
      <ol className="m-0 flex list-none flex-col p-0">
        {events.map((e, i) => (
          <li key={e.document_number} className="grid grid-cols-[6.5rem_1rem_minmax(0,1fr)] gap-x-3">
            <span className="pt-0.5 text-xs tabular-nums text-base-content/55">{shortDate(e.date)}</span>
            <span className="relative flex justify-center" aria-hidden>
              <span className={`relative z-10 mt-1.5 h-2.5 w-2.5 rounded-full ${e.milestone ? "bg-warning" : "bg-base-300"}`} />
              {i < events.length - 1 && <span className="absolute bottom-0 top-3 w-px bg-base-300" />}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5 pb-4">
              <a href={e.url} target="_blank" rel="noopener" className="text-sm font-semibold text-base-content hover:text-primary hover:underline">
                {e.label}
              </a>
              <span className="text-sm text-base-content/70">{e.summary}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  ) : null

// Everything about one case, under the decision (or on its own for one that ended)
const CaseDetails = ({ f, code, country }: { f: AdcvdFlag; code: string; country: string }) => (
  <>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="flex flex-col gap-2">
        <h4 className={tt.sectionTitle}>Why We Flagged It</h4>
        <Why f={f} code={code} country={country} />
      </div>
      <Facts f={f} />
    </div>
    {f.level !== "history" && <Rates f={f} />}
    <Timeline events={f.events} />
    <Sources f={f} />
    <SourceLinks f={f} />
  </>
)

const Petitions = ({ petitions }: { petitions: FlagEvent[] }) =>
  petitions.length ? (
    <section className={SECTION}>
      <Heading title="New Petitions" hint="A petition names this product and country: an investigation may follow" />
      <ul className="m-0 flex list-none flex-col divide-y divide-base-300 p-0">
        {petitions.slice(0, 5).map((p) => (
          <li key={p.document_number} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 py-2.5">
            <span className="text-xs tabular-nums text-base-content/55">{shortDate(p.date)}</span>
            <span className="min-w-0">
              <a href={p.url} target="_blank" rel="noopener" className="text-sm font-semibold text-base-content hover:text-primary hover:underline">
                {p.label}
              </a>
              {p.summary && p.summary !== p.label && <span className="block text-sm text-base-content/70">{p.summary}</span>}
            </span>
          </li>
        ))}
      </ul>
      <p className={`${ui.caption} m-0`}>Commerce usually decides within about 20 days whether to open investigations.</p>
    </section>
  ) : null

// ── Signed out: a stand-in, never the cases ──

// While the check runs (it can take a few seconds): say what's happening, over the shape of the
// result to come, so the tab never looks empty
const Loading = () => (
  <section className={SECTION} aria-busy="true" aria-live="polite">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/10 text-warning" aria-hidden>
        <ArrowPathIcon className="h-5 w-5 animate-spin" />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-semibold text-base-content">Checking AD/CVD cases for this import…</span>
        <span className="text-sm text-base-content/60">
          Matching its HTS code and country against every antidumping and countervailing duty case from Commerce and the ITC.
        </span>
      </div>
    </div>
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="h-20 animate-pulse rounded-xl bg-tt-soft" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-tt-soft" />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-tt-soft" />
    </div>
  </section>
)

const StandIn = () => (
  <div className="flex flex-col gap-5 p-6">
    <div className="h-24 rounded-xl bg-warning/10" />
    <div className="grid grid-cols-4 gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-xl bg-tt-soft" />
      ))}
    </div>
    <div className="grid grid-cols-[7fr_5fr] gap-6">
      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-5 rounded-sm bg-base-300/70" />
        ))}
      </div>
      <div className="h-32 rounded-xl bg-tt-soft" />
    </div>
    <div className="h-40 rounded-xl border border-base-300" />
  </div>
)

const LOCKED_POINTS = [
  "Every AD/CVD case that may cover this import, and why we flagged it",
  "The rates Commerce set, and each company's own rate",
  "Every notice from the past year, and what comes next",
]

export const AdcvdTab = ({
  code,
  country,
  page,
  customsValue,
  dutyUsd,
}: {
  code: string
  country: string
  page: string
  // The shipment's value and its regular duty, to put the deposit in dollars
  customsValue?: number
  dutyUsd?: number
}) => {
  const { user, isLoading } = useUser()
  const state = useAdcvdLookup(code, country)
  // Signed out, or on the free plan: only whether any case may apply
  const summary = lookupOf(useAdcvdSummary(code, country, (!user && !isLoading) || state === "locked"))
  const tracker = useOptionalTrackerAccess()

  if (isLoading) return <Loading />
  const teaser = !summary
    ? "Antidumping and countervailing duties can be many times the regular rate, and aren't in the estimate."
    : summary.cases
      ? `We found ${summary.cases === 1 ? "an AD/CVD case" : `${summary.cases} AD/CVD cases`} that may cover this import. These duties aren't in the estimate.`
      : summary.petitions
        ? "A new AD/CVD petition names this product and country."
        : "We found no AD/CVD cases for this import. See exactly what we checked."
  // The free plan (after the 14-day trial): the full check takes a plan
  if (user && state === "locked") {
    return (
      <LockedPreview
        title={summary?.cases ? "See the AD/CVD Cases That May Cover This Import" : "See the Full AD/CVD Check"}
        teaser={teaser}
        points={LOCKED_POINTS}
        preview={<StandIn />}
        minHeight="min-h-104"
        framed={false}
        onShown={() => trackEvent(MixpanelEvent.LOCKED_FEATURE_VIEWED, { feature: "adcvd", reason: "plan", page })}
        cta={{
          label: "See plans",
          onClick: () => {
            trackEvent(MixpanelEvent.LOCKED_FEATURE_CTA_CLICKED, { feature: "adcvd", reason: "plan", page })
            if (tracker) tracker.openUpgrade("plan")
            else window.location.href = "/tariff-tracker?upgrade=plan"
          },
        }}
        note="AD/CVD checks are part of the Tariff Tracker's free trial and every plan."
      />
    )
  }
  if (!user) {
    return (
      <AccountGate
        feature="adcvd"
        page={page}
        title="See the AD/CVD Check For This Import"
        teaser={teaser}
        points={LOCKED_POINTS}
        preview={<StandIn />}
        minHeight="min-h-104"
        framed={false}
      >
        {null}
      </AccountGate>
    )
  }
  if (state === "loading" || state === null || state === "locked") return <Loading />
  if (state === "error") {
    return (
      <section className={SECTION}>
        <div className={`${ui.notice("warning")} flex items-start gap-3`}>
          <ScaleIcon className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden />
          <p className={`${ui.bodySm} m-0`}>We couldn&apos;t check AD/CVD cases for this import just now. Try again in a moment; until then, don&apos;t assume none apply.</p>
        </div>
        <Disclaimer />
      </section>
    )
  }
  return <AdcvdResults data={state} code={code} country={country} customsValue={customsValue} dutyUsd={dutyUsd} />
}

const WALK_ID = "adcvd-case"

// The check's results: no case (celebrated), one case walked through, or several: a quick
// question per case first (CaseTriage), then the open one walked through (CaseWalkthrough). Then
// new petitions, cases that ended this past year, and what it's all based on.
export const AdcvdResults = ({
  data,
  code,
  country,
  customsValue,
  dutyUsd,
}: {
  data: AdcvdLookup
  code: string
  country: string
  customsValue?: number
  dutyUsd?: number
}) => {
  const { of, set } = useAdcvdAnswers(code, country)
  const [picked, setPicked] = useState<number | null>(null)
  const live = data.flags.filter((f) => f.level !== "history")
  const ended = data.flags.filter((f) => f.level === "history")
  const keyOf = (f: AdcvdFlag) => f.cases.map((c) => c.case_number).join()
  const answers = live.map(of)
  const several = live.length > 1
  // Once another case is open (and drawn): back to the top of its steps when they start above the screen
  const scrollPending = useRef(false)
  useEffect(() => {
    if (!scrollPending.current) return
    scrollPending.current = false
    const header = document.getElementById(WALK_ID)
    if (header && header.getBoundingClientRect().top < 0) header.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [picked])
  // The case walked through: the one picked; else the first the user said is (or may be) theirs;
  // else the first not answered yet; else the first
  const firstWith = (test: (a: (typeof answers)[number]) => boolean) => answers.findIndex(test)
  const open = picked ?? [firstWith((a) => a.answer === "yes" || a.answer === "unsure"), firstWith((a) => !a.answer), 0].find((i) => i >= 0)!
  const current = live[open]
  const allRuledOut = several && answers.every((a) => a.answer === "no")
  // The next case not answered yet, after this one (round to the start)
  const nextIndex = several ? [...live.keys()].map((k) => (open + 1 + k) % live.length).find((i) => i !== open && !answers[i].answer) : undefined
  const openCase = (i: number) => {
    setPicked(i)
    scrollPending.current = true
  }
  const walkthrough = current && (
    <CaseWalkthrough
      key={keyOf(current)}
      id={WALK_ID}
      f={current}
      code={code}
      country={country}
      customsValue={customsValue}
      dutyUsd={dutyUsd}
      eyebrow={several ? `Case ${open + 1} of ${live.length}` : "AD/CVD Check"}
      value={answers[open]}
      onChange={(patch) => {
        // Stay on the case being answered: moving on is the user's call ("Next case")
        setPicked(open)
        set(current, patch)
      }}
      next={nextIndex !== undefined ? { label: caseLabel(live, nextIndex), onGo: () => openCase(nextIndex) } : undefined}
      details={<CaseDetails f={current} code={code} country={country} />}
    />
  )
  return (
    <>
      <Verdict data={data} />
      {several ? (
        <>
          <section className={SECTION} aria-label="AD/CVD check">
            <CasesHeader flags={live} answers={answers} />
          </section>
          {/* Two panels: every case on the left, the picked one's steps on the right */}
          <CardRow className="lg:grid-cols-[19rem_minmax(0,1fr)]">
            <div className="min-w-0 px-3 py-4">
              <div className="lg:sticky lg:top-4">
                <CaseNav flags={live} answers={answers} open={open} onOpen={openCase} />
              </div>
            </div>
            <CardSections className="min-w-0">
              {allRuledOut && (
                <section className={SECTION}>
                  <div className="flex items-start gap-4 rounded-xl bg-success/10 px-5 py-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-success-content" aria-hidden>
                      <CheckBadgeIcon className="h-7 w-7" />
                    </span>
                    <div className="flex min-w-0 flex-col gap-1.5">
                      <p className={`${tt.display} m-0 text-2xl font-semibold text-base-content`}>You&apos;ve ruled out every case</p>
                      <p className="m-0 text-sm text-base-content/75">
                        By your answers, none of these cases covers your product, so no AD/CVD deposit should apply. Keep a record of why (a spec sheet against each
                        scope&apos;s description) in case CBP asks, and check with your broker if you&apos;re unsure about any of them.
                      </p>
                    </div>
                  </div>
                </section>
              )}
              {walkthrough}
            </CardSections>
          </CardRow>
        </>
      ) : (
        // One case: its steps are one module
        <CardSections>{walkthrough}</CardSections>
      )}
      <Petitions petitions={data.petitions} />
      {ended.length > 0 && (
        <section className={`${ui.cardSection} py-6!`}>
          <Fold label="Recently ended" hint="Cases on this product and country that ended in the past year: no deposits on new entries">
            {ended.map((f) => (
              <div key={keyOf(f)} className="flex flex-col gap-5">
                <h3 className={tt.title}>{headline(f)}</h3>
                <CaseDetails f={f} code={code} country={country} />
              </div>
            ))}
          </Fold>
        </section>
      )}
      {/* What it's based on, and that it's no guarantee: last, under everything, as small print on
          the ground in the module layout */}
      <section data-plain className={`${ui.cardSection} py-4!`}>
        <Disclaimer checkedAt={data.checked_at} />
      </section>
    </>
  )
}
