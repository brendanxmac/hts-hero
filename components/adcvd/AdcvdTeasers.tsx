"use client"

import { ArrowDownIcon, ArrowRightIcon, CheckBadgeIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid"
import { useUser } from "@/contexts/UserContext"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { countryName, depositFor, Disclaimer } from "./AdcvdParts"
import { lookupOf, useAdcvdLookup, useAdcvdSummary } from "./useAdcvd"
import { useAdcvdAnswers, useOpenFlags } from "./useAdcvdAnswers"

// AD/CVD in short: a line under the Duty tab's totals (whether a case may apply, and the way down
// to the check further down the tab; signed out, only whether one may), and the Overview's summary card, which says
// plainly whether we found any (celebrated when not), always with what it's based on.

const pct = (n: number) => `${Number(n.toFixed(2))}%`

// Whether any live case or new petition may cover the import: from the full lookup on the trial or
// a plan, the summary signed out or on the free plan. null until known (or when it couldn't be
// checked)
// (cases the user ruled out don't count)
export const useAdcvdFlagged = (code: string, country: string) => {
  const { user, isLoading } = useUser()
  const state = useAdcvdLookup(code, country)
  const full = lookupOf(state)
  const summary = lookupOf(useAdcvdSummary(code, country, (!user && !isLoading) || state === "locked"))
  const open = useOpenFlags(code, country, full?.flags.filter((f) => f.level !== "history"))
  if (full) return (open?.length ?? 0) > 0 || full.petitions.length > 0
  if (summary) return summary.cases > 0 || summary.petitions > 0
  return null
}

export const AdcvdDutyTeaser = ({ code, country, onOpen }: { code: string; country: string; onOpen: () => void }) => {
  const { user } = useUser()
  const locked = useAdcvdLookup(code, country) === "locked"
  const flagged = useAdcvdFlagged(code, country)
  // Still checking
  if (flagged === null) return null
  if (!flagged)
    return (
      <div className={`${ui.cardSection} flex items-center gap-2 border-t border-base-300 py-3! text-sm text-base-content/70`}>
        <CheckCircleIcon className="h-4 w-4 shrink-0 text-success" aria-hidden />
        No antidumping or countervailing duty case found for this import.
      </div>
    )
  return (
    <div className={`${ui.cardSection} border-t border-base-300 py-3!`}>
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center gap-2.5 rounded-xl bg-warning/10 px-3.5 py-2 text-left text-sm text-base-content transition-colors hover:bg-warning/15"
      >
        <ExclamationTriangleIcon className="h-4 w-4 shrink-0 text-warning" aria-hidden />
        <span className="min-w-0 flex-1">
          <b>AD/CVD duties may apply to this import</b>
          <span className="text-base-content/70"> and aren&apos;t in this estimate.</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 font-medium text-primary group-hover:underline">
          {user && !locked ? "Check the cases" : user ? "See which cases" : "See if they apply"}
          <ArrowDownIcon className="h-3.5 w-3.5" aria-hidden />
        </span>
      </button>
    </div>
  )
}

// The Overview's AD/CVD card: found or not, in big type, and the way to the tab
export const AdcvdSummaryCard = ({ code, country, onOpen }: { code: string; country: string; onOpen: () => void }) => {
  const { user, isLoading } = useUser()
  const full = useAdcvdLookup(code, country)
  const locked = full === "locked"
  const summary = useAdcvdSummary(code, country, (!user && !isLoading) || locked)
  const state = user && !locked ? full : summary
  const { of: answerOf } = useAdcvdAnswers(code, country)
  const header = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className={tt.title}>AD/CVD Check</h3>
        <p className={tt.subtitle}>Antidumping and countervailing duty cases that may cover this import</p>
      </div>
      <button type="button" onClick={onOpen} className={`${ui.link} inline-flex shrink-0 items-center gap-1 text-sm`}>
        {user && !locked ? "See the full check" : user ? "See which cases" : "See it free for 14 days"}
        <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  )
  if (state === null || state === "loading" || state === "locked") {
    return (
      <section className={`${ui.cardSection} flex flex-col gap-4 py-5!`}>
        {header}
        <div className={`${ui.skeleton} h-20 w-full`} />
      </section>
    )
  }
  if (state === "error") {
    return (
      <section className={`${ui.cardSection} flex flex-col gap-4 py-5!`}>
        {header}
        <p className={`${ui.notice("warning")} ${ui.bodySm} m-0`}>We couldn&apos;t check AD/CVD cases for this import just now. Don&apos;t assume none apply; try again in a moment.</p>
      </section>
    )
  }
  const live = "flags" in state ? state.flags.filter((f) => f.level !== "history") : []
  // Without the cases the user ruled out on the AD/CVD tab
  const flags = live.filter((f) => answerOf(f).answer !== "no")
  const ruledOutAll = live.length > 0 && flags.length === 0
  const count = "flags" in state ? flags.flatMap((f) => f.cases).length : state.cases
  const petitions = typeof state.petitions === "number" ? state.petitions : state.petitions.length
  // Each case's estimated deposit (antidumping + countervailing): for the supplier the user picked,
  // else at the "all others" rate, the same number the AD/CVD tab shows. The one that would cost most
  // leads, from the cases the user said cover their product when there are any.
  const depositOf = (f: (typeof flags)[number]) => depositFor(f, answerOf(f).supplier ?? null).total
  const confirmed = flags.filter((f) => answerOf(f).answer === "yes")
  const deposits = (confirmed.length ? confirmed : flags).map(depositOf).filter((n): n is number => n !== null)
  const top = deposits.length ? Math.max(...deposits) : null
  const topSupplier = (confirmed.length ? confirmed : flags).some((f) => answerOf(f).supplier)
  return (
    <section className={`${ui.cardSection} flex flex-col gap-4 py-5!`}>
      {header}
      {ruledOutAll && petitions === 0 ? (
        <div className="flex items-center gap-4 rounded-xl bg-success/10 px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success text-success-content" aria-hidden>
            <CheckBadgeIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className={`${tt.display} block text-lg font-semibold text-base-content`}>You ruled out every AD/CVD case on this import</span>
            <span className="block text-sm text-base-content/75">
              By your answers, none of the {live.length === 1 ? "case" : `${live.length} cases`} we found covers your product, so no AD/CVD deposit should apply. Keep a record
              of why in case CBP asks.
            </span>
          </span>
        </div>
      ) : count === 0 && petitions === 0 ? (
        <div className="flex items-center gap-4 rounded-xl bg-success/10 px-5 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success text-success-content" aria-hidden>
            <CheckBadgeIcon className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className={`${tt.display} block text-lg font-semibold text-base-content`}>No AD/CVD cases found for this import</span>
            <span className="block text-sm text-base-content/75">
              No antidumping or countervailing duty order, investigation or new petition on goods from {countryName(state.country)} lists this HTS code. No extra AD/CVD
              duty should be on top of your rate.
            </span>
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl bg-warning/10 px-5 py-4">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning text-warning-content" aria-hidden>
              <ExclamationTriangleIcon className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`${tt.display} block text-lg font-semibold text-base-content`}>
                {confirmed.length
                  ? `${confirmed.length === 1 ? "An AD/CVD case covers" : `${confirmed.length} AD/CVD cases cover`} this import, by your answers`
                  : count
                    ? `${count === 1 ? "An AD/CVD case" : `${count} AD/CVD cases`} may cover this import`
                    : "A new AD/CVD petition names this product and country"}
              </span>
              <span className="block text-sm text-base-content/75">These duties are on top of your rate and aren&apos;t in the estimate. Check them with your customs broker.</span>
            </span>
            {top !== null && (
              <span className="shrink-0 text-right">
                <span className={`${tt.metricSm} block !text-error`}>about {pct(top)}</span>
                <span className="block text-xs text-base-content/60">on top, {topSupplier ? "for your supplier" : "at the all-others rate"}</span>
              </span>
            )}
          </div>
          {flags.length > 0 && (
            <ul className="m-0 flex list-none flex-col gap-1.5 border-t border-warning/20 p-0 pt-3">
              {/* Each case as the user left it on the AD/CVD tab, with its deposit */}
              {flags.map((f) => {
                const a = answerOf(f)
                const deposit = depositOf(f)
                const chip =
                  a.answer === "yes"
                    ? { tone: "error" as const, label: "Affects you" }
                    : a.answer === "unsure"
                      ? { tone: "warning" as const, label: "Not sure: ask your broker" }
                      : { tone: "warning" as const, label: f.level === "likely" ? "Probably affects you" : "Might affect you" }
                return (
                  <li key={f.cases.map((c) => c.case_number).join()} className="flex flex-wrap items-center gap-2 text-sm text-base-content/85">
                    <span className={tt.chip(chip.tone)}>{chip.label}</span>
                    <span className="min-w-0 font-medium">
                      {f.product} from {countryName(f.country)}
                    </span>
                    <span className="font-mono text-xs text-base-content/55">{f.cases.map((c) => c.case_number).join(", ")}</span>
                    {deposit !== null && (
                      <span className="ml-auto font-semibold tabular-nums text-error" title={a.supplier ? `For ${a.supplier}` : "At the all-others rate"}>
                        about {pct(deposit)}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
      <Disclaimer checkedAt={state.checked_at} />
    </section>
  )
}
