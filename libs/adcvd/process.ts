import type { SupabaseClient } from "@supabase/supabase-js"
import { collectSources } from "../tariff-sources/collect"
import { checkCases } from "./checks"
import { AGENCY_NAMES, AGENCY_SLUGS, monthRange, readMonth } from "./notices"
import { scopeCases } from "./scope"
import { linkItcEvents, summarizeMonth } from "./summaries"
import { updateMonth } from "./updates"
import { readCbpMessages } from "./cbp"
import { refreshItaPages } from "./ita"
import { budgetTracker, spentFor } from "./usage"
import type { MonthRow } from "./types"

// One month of Commerce and ITC notices, start to finish, in steps that each pick up where the
// last run stopped (a run has a deadline; /adcvd calls again until the month is done):
//   collect    the month's Federal Register notices from ITA and the ITC (no other agencies)
//   read       every notice into cases and events (regex: notices.ts)
//   summarize  a plain sentence and the rates for each notice (Haiku)
//   link       ITC notices to their Commerce cases
//   scope      HTS codes for the month's cases (scope.ts)
//   check      automatic checks (checks.ts)
//   updates    significant events onto /tariff-updates (updates.ts)
// The month's AI steps pause once its budget (adcvd_settings) is spent; the rest keeps going.

type Db = SupabaseClient

export const STEPS = ["collect", "read", "summarize", "link", "scope", "check", "updates"] as const
export type Step = (typeof STEPS)[number]

export const STEP_LABELS: Record<Step, string> = {
  collect: "Collecting notices",
  read: "Reading notices",
  summarize: "Writing summaries",
  link: "Linking ITC notices",
  scope: "Finding scope codes",
  check: "Checking cases",
  updates: "Writing updates",
}

export interface MonthResult {
  month: string
  status: MonthRow["status"]
  step: Step | null
  remaining: boolean
  log: string[]
  errors: string[]
  cost_usd: number
}

const isMonth = (m: string) => /^\d{4}-\d{2}$/.test(m)

const loadMonth = async (db: Db, month: string) => {
  const { data } = await db.from("adcvd_months").select("*").eq("month", month).maybeSingle()
  return (data as MonthRow | null) ?? null
}

const saveMonth = (db: Db, month: string, fields: Partial<MonthRow>) => db.from("adcvd_months").upsert({ month, ...fields }, { onConflict: "month" })

// The cases a month's notices touched
const monthCases = async (db: Db, month: string) => {
  const { start, end } = monthRange(month)
  const { data } = await db
    .from("adcvd_events")
    .select("case_number")
    .not("case_number", "is", null)
    .gte("published_on", start.toISOString().slice(0, 10))
    .lte("published_on", end.toISOString().slice(0, 10))
  return Array.from(new Set((data ?? []).map((r) => r.case_number as string)))
}

// The month's counts, from what's stored (so they hold however many runs it took)
const monthCounts = async (db: Db, month: string) => {
  const { start, end } = monthRange(month)
  const [notices, linked, cases, cost] = await Promise.all([
    db
      .from("tariff_source_items")
      .select("id", { count: "exact", head: true })
      .eq("source", "federal_register")
      .overlaps("agencies", Object.values(AGENCY_NAMES))
      .gte("published_at", start.toISOString())
      .lte("published_at", end.toISOString()),
    db
      .from("adcvd_events")
      .select("document_number")
      .gte("published_on", start.toISOString().slice(0, 10))
      .lte("published_on", end.toISOString().slice(0, 10)),
    monthCases(db, month),
    spentFor(db, month),
  ])
  const touched = cases
  let scopes = 0
  for (let i = 0; i < touched.length; i += 300) {
    const { count } = await db
      .from("adcvd_cases")
      .select("case_number", { count: "exact", head: true })
      .in("case_number", touched.slice(i, i + 300))
      .or("hts_main.neq.{},hts_also.neq.{}")
    scopes += count ?? 0
  }
  return {
    notices: notices.count ?? 0,
    linked: new Set((linked.data ?? []).map((r) => r.document_number)).size,
    cases: touched.length,
    scopes_found: scopes,
    cost_usd: Math.round(cost * 10_000) / 10_000,
  }
}

// Runs a month's steps from where it stopped until done or the deadline. `collect: false` for the
// cron, whose own collector already gathers new notices.
export const runMonth = async (
  db: Db,
  month: string,
  { deadline, collect = true, restart = false, quiet = false }: { deadline: number; collect?: boolean; restart?: boolean; quiet?: boolean }
): Promise<MonthResult> => {
  if (!isMonth(month)) throw new Error(`Not a month: ${month}`)
  const log: string[] = []
  const errors: string[] = []
  const existing = await loadMonth(db, month)
  const startAt: Step = restart || !existing?.step || existing.status === "done" ? (collect ? "collect" : "read") : (existing.step as Step)
  await saveMonth(db, month, { status: "running", step: startAt, started_at: existing?.started_at ?? new Date().toISOString(), error: null })
  const budget = await budgetTracker(db, month)
  const { start, end } = monthRange(month)
  let newCases = 0
  // Quiet runs (the cron) stop after reading when there was nothing new to read
  let changed = !quiet

  const finish = async (status: MonthRow["status"], step: Step | null, remaining: boolean, error?: string): Promise<MonthResult> => {
    const counts = await monthCounts(db, month)
    await saveMonth(db, month, {
      status,
      step,
      notices: counts.notices,
      linked: counts.linked,
      new_cases: (existing?.new_cases ?? 0) + newCases,
      scopes_found: counts.scopes_found,
      cost_usd: counts.cost_usd,
      finished_at: status === "done" ? new Date().toISOString() : null,
      error: error ?? (errors.length ? errors.slice(0, 20).join("\n") : null),
    })
    return { month, status, step, remaining, log, errors, cost_usd: counts.cost_usd }
  }

  try {
    for (const step of STEPS.slice(STEPS.indexOf(startAt))) {
      await saveMonth(db, month, { step })
      if (Date.now() > deadline) return finish("running", step, true)
      if (step === "collect") {
        const results = await collectSources(db, { since: start, until: end, agencies: AGENCY_SLUGS, backfill: true, trigger: "backfill", sources: ["federal_register"] })
        for (const r of results) {
          if (r.error) throw new Error(`Collecting: ${r.error}`)
          log.push(`Collected ${r.found} notices (${r.added} new)`)
        }
      }
      if (step === "read") {
        const r = await readMonth(db, month, { deadline })
        newCases += r.newCases
        errors.push(...r.errors)
        log.push(`Read ${r.read} notices: ${r.linked} about cases, ${r.skipped} not`)
        if (r.remaining) return finish("running", step, true)
        if (r.read) changed = true
        // Nothing new: done, unless an earlier run stopped partway (paused at the budget, cut off by
        // its deadline, or an error), which this run picks up again
        if (!changed && existing && ["paused", "running", "error"].includes(existing.status) && existing.step) changed = true
        if (!changed) return finish(existing?.status === "done" || !existing ? "done" : existing.status, null, false)
      }
      if (step === "summarize") {
        const r = await summarizeMonth(db, month, { deadline, budget })
        errors.push(...r.errors)
        log.push(`Summarized ${r.summarized} notices`)
        if (r.remaining) return budget.reached && Date.now() <= deadline ? finish("paused", step, false) : finish("running", step, true)
      }
      if (step === "link") {
        const r = await linkItcEvents(db, { deadline, budget })
        log.push(`Linked ${r.linked} ITC notices`)
      }
      if (step === "scope") {
        const r = await scopeCases(db, { caseNumbers: await monthCases(db, month), deadline, budget })
        errors.push(...r.errors)
        log.push(`Scope: ${Object.entries(r.found).map(([k, v]) => `${v} ${k}`).join(", ") || "nothing to do"}`)
        if (r.remaining) return budget.reached && Date.now() <= deadline ? finish("paused", step, false) : finish("running", step, true)
        if (budget.reached) return finish("paused", step, false)
      }
      if (step === "check") {
        const r = await checkCases(db, await monthCases(db, month))
        log.push(`Checked ${r.checked} cases, ${r.withProblems} with notes`)
      }
      if (step === "updates") {
        const r = await updateMonth(db, month)
        log.push(`Wrote ${r.updates} updates`)
      }
    }
    return finish("done", null, false)
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    return finish("error", (await loadMonth(db, month))?.step as Step | null, false, message)
  }
}

// Marks a month's notices unread, so the next run reads them all again
export const resetMonth = async (db: Db, month: string) => {
  const { start, end } = monthRange(month)
  await db
    .from("tariff_source_items")
    .update({ adcvd_at: null })
    .eq("source", "federal_register")
    .gte("published_at", start.toISOString())
    .lte("published_at", end.toISOString())
  await saveMonth(db, month, { status: "pending", step: null, error: null, finished_at: null, new_cases: 0 })
}

// The cron's share: new notices this month, a few minutes at most. In the first days of a month it
// also catches up the month before, once: collects the whole month again (anything the collector's
// 3-day window missed while crons were down) and reads every notice again (any that errored).
// Re-reading keeps the summaries and checked codes already written, so it costs no AI.
export const CATCH_UP_DAYS = 3
// Cases without codes the cron tries again per run (any month's)
const RETRY_PER_RUN = 3
// ITA case pages read per run: every live case within a day, then each about monthly
const ITA_PER_RUN = 60

export const runNew = async (db: Db, { deadline }: { deadline: number }) => {
  const started = new Date()
  const thisMonth = started.toISOString().slice(0, 7)
  const results: MonthResult[] = []
  const extras: Record<string, unknown> = {}
  if (started.getUTCDate() <= CATCH_UP_DAYS) {
    const last = new Date(started)
    last.setUTCDate(0)
    const lastMonth = last.toISOString().slice(0, 7)
    const row = await loadMonth(db, lastMonth)
    const caughtUp = !!row?.finished_at && row.finished_at >= `${thisMonth}-01`
    if (!caughtUp) {
      // Started once; later runs continue where it stopped
      if (row?.status !== "running") await resetMonth(db, lastMonth)
      results.push(await runMonth(db, lastMonth, { deadline: deadline - 90_000, collect: true }))
    }
  }
  results.push(await runMonth(db, thisMonth, { deadline: deadline - 60_000, collect: false, restart: true, quiet: true }))
  // CBP's latest AD/CVD messages (one request)
  extras.cbp = await readCbpMessages(db).catch((e) => ({ error: e instanceof Error ? e.message : String(e) }))
  // A few cases still without codes, not tried in RETRY_DAYS, whatever month they're from
  if (Date.now() < deadline - 20_000) {
    const scope = await scopeCases(db, { deadline: deadline - 10_000, budget: await budgetTracker(db, thisMonth), limit: RETRY_PER_RUN }).catch((e) => ({ error: String(e) }))
    extras.scopeRetry = "found" in scope ? scope.found : scope
  }
  // ITA's case pages: a few per run, never read or read over a month ago (one request a second)
  if (Date.now() < deadline - 45_000) {
    const ita = await refreshItaPages(db, { deadline: deadline - 15_000, budget: await budgetTracker(db, thisMonth), limit: ITA_PER_RUN }).catch((e) => ({ error: String(e) }))
    extras.ita = "read" in ita ? { read: ita.read, sorted: ita.sorted, errors: ita.errors.slice(0, 5) } : ita
  }
  // Recorded for /adcvd's health line and the "cron stopped" email
  await db
    .from("adcvd_settings")
    .update({
      last_cron_at: started.toISOString(),
      last_cron: { months: results.map((r) => ({ month: r.month, status: r.status, log: r.log, errors: r.errors.slice(0, 5) })), ...extras },
    })
    .eq("id", true)
  return { results, ...extras }
}
