"use client"

import { useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Countries } from "@/constants/countries"
import { LIVE_STATUSES, STATUSES, type MonthRow } from "@/libs/adcvd/types"
import { Callout, Help, PageHeader, Panel, Segmented, Spinner, Stat, StatGrid, StatusDot, Tabs, btn, inputCls, type Tone } from "../hts-revision-diff/ui"
import { adminCall } from "../tariff-sources/types"
import CaseDetail from "./CaseDetail"
import type { CaseListRow, UsageRow } from "./types"

// /adcvd: the AD/CVD case registry built from Commerce and ITC notices (libs/adcvd). Months of
// notices are processed here one at a time, newest first, with what each cost; the cases, the
// automatic checks' notes and all AI spend can be looked through.

type Tab = "months" | "cases" | "problems" | "costs"

// The backfill reaches back to here (PRE_DEPLOY.md: the full tariff sources backfill)
const FIRST_MONTH = "2025-01"
// The estimate in the AD/CVD report, for the whole backfill
const ESTIMATE = "$30–60"

const STEP_LABELS: Record<string, string> = {
  collect: "Collecting notices",
  read: "Reading notices",
  summarize: "Writing summaries",
  link: "Linking ITC notices",
  scope: "Finding scope codes",
  check: "Checking cases",
  updates: "Writing updates",
}

const STATUS_TONE: Record<MonthRow["status"], Tone> = { pending: "neutral", running: "info", done: "success", paused: "warning", error: "error" }
const STATUS_LABEL: Record<MonthRow["status"], string> = { pending: "Not started", running: "In progress", done: "Done", paused: "Paused at budget", error: "Error" }

const usd = (n: number) => `$${n.toFixed(n >= 10 ? 0 : 2)}`
const countryName = (code: string | null) => (code ? Countries.find((c) => c.code === code)?.name ?? code : "Unknown")
const monthLabel = (m: string) => new Date(`${m}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })

// Every month from this one back to FIRST_MONTH, newest first
const monthsBack = () => {
  const out: string[] = []
  const d = new Date()
  d.setUTCDate(15)
  for (let m = d.toISOString().slice(0, 7); m >= FIRST_MONTH; ) {
    out.push(m)
    d.setUTCMonth(d.getUTCMonth() - 1)
    m = d.toISOString().slice(0, 7)
  }
  return out
}

interface RunResult {
  status: MonthRow["status"]
  step: string | null
  remaining: boolean
  log: string[]
  errors: string[]
  cost_usd: number
}

export default function AdcvdDashboard({
  cases,
  months,
  usage,
  budget,
  lastCron,
  loadError,
}: {
  cases: CaseListRow[]
  months: MonthRow[]
  usage: UsageRow[]
  budget: number
  // The cron's last run (null before it has run, e.g. in development)
  lastCron: { at: string; run: Record<string, unknown> | null } | null
  loadError: string | null
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("months")
  const [open, setOpen] = useState<string | null>(null)

  const live = cases.filter((c) => LIVE_STATUSES.includes(c.status))
  const liveWithCodes = live.filter((c) => c.hts_main.length || c.hts_also.length)
  const withProblems = cases.filter((c) => c.problems.length)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const spentThisMonth = usage.filter((u) => u.month === thisMonth).reduce((n, u) => n + Number(u.cost_usd), 0)
  const adcvdSpent = usage.filter((u) => u.pipeline === "adcvd").reduce((n, u) => n + Number(u.cost_usd), 0)

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="AD/CVD Cases"
        meta={<span>Antidumping and countervailing duty cases, read from Commerce and ITC notices in the Federal Register.</span>}
      >
        <Help>
          <p>
            Each month of notices is read into cases: the case number gives the country, each notice becomes an event on its cases, and the HTS codes come from
            the scope of the newest notice that lists them. Most of this is done without AI. Claude writes a one-sentence summary of each notice (Haiku), checks
            how a scope&apos;s codes are sorted (Sonnet), and reads a case&apos;s history when nothing else found its codes (Opus).
          </p>
          <p>
            Process months newest first. Each month&apos;s AI steps pause once it has cost the budget below; reading and linking keep going. New notices are
            read every 15 minutes by the cron. Imports are flagged from these cases on the calculator and the Tracker.
          </p>
        </Help>
      </PageHeader>

      <CronHealth lastCron={lastCron} />

      {loadError && <Callout tone="error" title="Couldn't load everything">{loadError}. Has supabase/migrations/adcvd.sql been applied?</Callout>}

      <StatGrid>
        <Stat label="Live Cases" value={live.length} hint="Orders, suspension agreements and open investigations" />
        <Stat
          label="Live Cases With Codes"
          value={live.length ? `${Math.round((liveWithCodes.length / live.length) * 100)}%` : "–"}
          hint={`${liveWithCodes.length} of ${live.length} can flag imports`}
        />
        <Stat label="AI Spend This Month" value={usd(spentThisMonth)} hint="AD/CVD and tariff updates, this calendar month" />
        <Stat label="AD/CVD Spend So Far" value={usd(adcvdSpent)} hint={`The backfill was estimated at ${ESTIMATE}`} />
      </StatGrid>

      <Tabs<Tab>
        tabs={[
          { value: "months", label: "Months", count: months.filter((m) => m.status === "done").length },
          { value: "cases", label: "Cases", count: cases.length },
          { value: "problems", label: "Notes", count: withProblems.length },
          { value: "costs", label: "AI Costs" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "months" && <MonthsTab months={months} budget={budget} onDone={() => router.refresh()} />}
      {tab === "cases" && <CasesTab cases={cases} onOpen={setOpen} />}
      {tab === "problems" && <ProblemsTab cases={withProblems} onOpen={setOpen} />}
      {tab === "costs" && <CostsTab usage={usage} />}

      <CaseDetail caseNumber={open} onClose={() => setOpen(null)} onChanged={() => router.refresh()} />
    </div>
  )
}

// ---------- Cron health ----------

const STALE_HOURS = 6

function CronHealth({ lastCron }: { lastCron: { at: string; run: Record<string, unknown> | null } | null }) {
  if (!lastCron) return <Callout title="The cron hasn't run here yet">New notices are read every 15 minutes once deployed (/api/cron/adcvd).</Callout>
  const hours = (Date.now() - new Date(lastCron.at).getTime()) / 3_600_000
  const months = (lastCron.run?.months as { month: string; status: string; log: string[] }[] | undefined) ?? []
  const summary = months.map((m) => `${monthLabel(m.month)}: ${m.log.join(", ") || m.status}`).join(" · ")
  return hours > STALE_HOURS ? (
    <Callout tone="error" title={`The cron hasn't run for ${Math.round(hours)} hours`}>Last run {new Date(lastCron.at).toLocaleString()}. An email went to the admin; check Vercel&apos;s cron logs.</Callout>
  ) : (
    <Callout tone="success" title={`Cron ran ${Math.max(1, Math.round(hours * 60))} minutes ago`}>{summary || "Nothing new."}</Callout>
  )
}

// ---------- Months ----------

function MonthsTab({ months, budget, onDone }: { months: MonthRow[]; budget: number; onDone: () => void }) {
  const byMonth = new Map(months.map((m) => [m.month, m]))
  const all = monthsBack()
  const next = all.find((m) => byMonth.get(m)?.status !== "done")
  const [running, setRunning] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ step: string | null; log: string[]; cost: number } | null>(null)
  const [budgetInput, setBudgetInput] = useState(String(budget))
  const stop = useRef(false)

  const run = async (month: string, reset = false) => {
    setRunning(month)
    stop.current = false
    setProgress({ step: reset ? "read" : null, log: [], cost: byMonth.get(month)?.cost_usd ?? 0 })
    try {
      for (let first = true; ; first = false) {
        const r = await adminCall<RunResult>("/api/adcvd/process", "POST", { month, reset: reset && first })
        setProgress((p) => ({ step: r.step, log: [...(p?.log ?? []), ...r.log].slice(-8), cost: r.cost_usd }))
        if (r.status === "error") {
          toast.error(`${monthLabel(month)} stopped: see the month's error`)
          break
        }
        if (r.status === "paused") {
          toast(`${monthLabel(month)} paused: its AI budget is spent`, { icon: "⏸" })
          break
        }
        if (!r.remaining || stop.current) {
          if (r.status === "done") toast.success(`${monthLabel(month)} done (${usd(r.cost_usd)} of AI)`)
          break
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Processing failed")
    } finally {
      setRunning(null)
      onDone()
    }
  }

  const saveBudget = async () => {
    try {
      await adminCall("/api/adcvd/settings", "PATCH", { monthly_budget_usd: Number(budgetInput) })
      toast.success("Budget saved")
      onDone()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save the budget")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        {next && (
          <button className={btn.primary} disabled={!!running} onClick={() => run(next)}>
            {running === next ? <Spinner /> : null}
            Process {monthLabel(next)}
          </button>
        )}
        {running && (
          <button className={btn.secondary} onClick={() => (stop.current = true)}>
            Stop after this run
          </button>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm text-base-content/60">
          AI budget per month of notices
          <span className="flex items-center gap-1">
            $
            <input id="adcvd-budget" className={`${inputCls} w-20 tabular-nums`} value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} inputMode="decimal" />
          </span>
          <button className={btn.xsSecondary} onClick={saveBudget} disabled={budgetInput === String(budget)}>
            Save
          </button>
        </label>
      </div>

      {running && progress && (
        <Callout tone="info" busy title={`${monthLabel(running)}: ${STEP_LABELS[progress.step ?? ""] ?? "Starting"} · ${usd(progress.cost)} of AI so far`}>
          {progress.log.length ? progress.log.join(" · ") : "This takes a few minutes per month: notices are read one at a time from the Federal Register."}
        </Callout>
      )}

      <Panel bodyClassName="overflow-x-auto">
        <table className="table table-sm">
          <thead>
            <tr className="text-xs text-base-content/50">
              <th>Month</th>
              <th>Status</th>
              <th className="text-right">Notices</th>
              <th className="text-right">About Cases</th>
              <th className="text-right">New Cases</th>
              <th className="text-right">Cases With Codes</th>
              <th className="text-right">AI Cost</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {all.map((month) => {
              const m = byMonth.get(month)
              const status = m?.status ?? "pending"
              return (
                <tr key={month} className="align-top">
                  <td className="font-medium">{monthLabel(month)}</td>
                  <td>
                    <StatusDot tone={STATUS_TONE[status]} label={status === "running" && m?.step ? `${STATUS_LABEL[status]}: ${STEP_LABELS[m.step] ?? m.step}` : STATUS_LABEL[status]} busy={running === month} />
                    {m?.error && <div className="mt-1 max-w-md whitespace-pre-line text-xs text-error/80">{m.error.split("\n").slice(0, 3).join("\n")}</div>}
                  </td>
                  <td className="text-right tabular-nums">{m ? m.notices : "–"}</td>
                  <td className="text-right tabular-nums">{m ? m.linked : "–"}</td>
                  <td className="text-right tabular-nums">{m ? m.new_cases : "–"}</td>
                  <td className="text-right tabular-nums">{m ? m.scopes_found : "–"}</td>
                  <td className="text-right tabular-nums">{m ? usd(Number(m.cost_usd)) : "–"}</td>
                  <td className="text-right">
                    <div className="flex justify-end gap-1">
                      {status !== "done" && (
                        <button className={btn.xsSecondary} disabled={!!running} onClick={() => run(month)}>
                          {status === "pending" ? "Process" : "Continue"}
                        </button>
                      )}
                      {m && (
                        <button className={btn.xsGhost} disabled={!!running} onClick={() => run(month, true)} title="Read every notice of this month again">
                          Read Again
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}

// ---------- Cases ----------

type CaseFilter = "live" | "all" | "ended" | "no_codes"

const statusTone = (s: CaseListRow["status"]): Tone => (s === "order" || s === "suspended" ? "warning" : s === "investigation" ? "info" : "neutral")

const CaseTable = ({ rows, onOpen, notes }: { rows: CaseListRow[]; onOpen: (c: string) => void; notes?: boolean }) => (
  <Panel bodyClassName="overflow-x-auto">
    <table className="table table-sm">
      <thead>
        <tr className="text-xs text-base-content/50">
          <th>Case</th>
          <th>Product</th>
          <th>Country</th>
          <th>Status</th>
          <th className="text-right">Codes</th>
          <th>Codes From</th>
          <th>Last Notice</th>
          {notes && <th>Notes</th>}
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 500).map((c) => (
          <tr key={c.case_number} className="cursor-pointer align-top hover:bg-base-content/[0.03]" onClick={() => onOpen(c.case_number)}>
            <td className="whitespace-nowrap font-mono text-xs">{c.case_number}</td>
            <td className="max-w-xs">{c.product ?? <span className="text-base-content/40">Not named yet</span>}</td>
            <td className="whitespace-nowrap">{countryName(c.country)}</td>
            <td className="whitespace-nowrap">
              <StatusDot tone={statusTone(c.status)} label={STATUSES[c.status]} />
            </td>
            <td className="text-right tabular-nums">{c.hts_main.length + c.hts_also.length || <span className="text-base-content/40">0</span>}</td>
            <td className="whitespace-nowrap text-xs text-base-content/60">{c.scope_method ?? "–"}</td>
            <td className="whitespace-nowrap tabular-nums text-xs text-base-content/60">{c.last_activity_on ?? "–"}</td>
            {notes && <td className="max-w-md text-xs text-base-content/70">{c.problems.join(" ")}</td>}
          </tr>
        ))}
      </tbody>
    </table>
    {rows.length > 500 && <div className="border-t border-base-content/10 px-4 py-2 text-xs text-base-content/50">Showing 500 of {rows.length}. Search to narrow it down.</div>}
  </Panel>
)

function CasesTab({ cases, onOpen }: { cases: CaseListRow[]; onOpen: (c: string) => void }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<CaseFilter>("live")
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const digits = q.replace(/\D/g, "")
    return cases.filter((c) => {
      if (filter === "live" && !LIVE_STATUSES.includes(c.status)) return false
      if (filter === "ended" && !(c.status === "revoked" || c.status === "terminated")) return false
      if (filter === "no_codes" && (c.hts_main.length || c.hts_also.length)) return false
      if (!q) return true
      return (
        c.case_number.toLowerCase().includes(q) ||
        (c.product ?? "").toLowerCase().includes(q) ||
        countryName(c.country).toLowerCase().includes(q) ||
        (digits.length >= 4 && [...c.hts_main, ...c.hts_also].some((code) => code.startsWith(digits) || digits.startsWith(code)))
      )
    })
  }, [cases, query, filter])
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          id="adcvd-search"
          className={`${inputCls} w-80`}
          placeholder="Search case, product, country or HTS code"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Segmented<CaseFilter>
          options={[
            { value: "live", label: "Live" },
            { value: "all", label: "All" },
            { value: "ended", label: "Ended" },
            { value: "no_codes", label: "No Codes" },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <span className="text-sm text-base-content/50">{rows.length} cases</span>
      </div>
      <CaseTable rows={rows} onOpen={onOpen} />
    </div>
  )
}

function ProblemsTab({ cases, onOpen }: { cases: CaseListRow[]; onOpen: (c: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Callout tone="info" title="Nothing here needs you">
        These are the automatic checks&apos; notes on each case, and each says what happens next. Cases without codes are tried again next month; renumbered
        codes match only as &ldquo;possible&rdquo;.
      </Callout>
      <CaseTable rows={cases} onOpen={onOpen} notes />
    </div>
  )
}

// ---------- Costs ----------

function CostsTab({ usage }: { usage: UsageRow[] }) {
  const adcvd = usage.filter((u) => u.pipeline === "adcvd")
  const steps = Array.from(new Set(adcvd.map((u) => u.step))).sort()
  const byMonth = new Map<string, Record<string, number>>()
  for (const u of adcvd) {
    const key = u.for_month ?? u.month
    const row = byMonth.get(key) ?? {}
    row[u.step] = (row[u.step] ?? 0) + Number(u.cost_usd)
    byMonth.set(key, row)
  }
  const updates = usage.filter((u) => u.pipeline === "tariff_updates")
  const updateSteps = Array.from(new Set(updates.map((u) => u.step))).sort()
  const updatesByMonth = new Map<string, Record<string, number>>()
  for (const u of updates) {
    const row = updatesByMonth.get(u.month) ?? {}
    row[u.step] = (row[u.step] ?? 0) + Number(u.cost_usd)
    updatesByMonth.set(u.month, row)
  }
  const byModel = new Map<string, number>()
  for (const u of usage) byModel.set(u.model, (byModel.get(u.model) ?? 0) + Number(u.cost_usd))

  const table = (rows: Map<string, Record<string, number>>, cols: string[], first: string) => (
    <table className="table table-sm">
      <thead>
        <tr className="text-xs text-base-content/50">
          <th>{first}</th>
          {cols.map((s) => (
            <th key={s} className="text-right">
              {s.replace(/_/g, " ")}
            </th>
          ))}
          <th className="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        {Array.from(rows)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([month, row]) => (
            <tr key={month}>
              <td className="font-medium">{monthLabel(month)}</td>
              {cols.map((s) => (
                <td key={s} className="text-right tabular-nums">
                  {row[s] ? usd(row[s]) : "–"}
                </td>
              ))}
              <td className="text-right font-medium tabular-nums">{usd(Object.values(row).reduce((a, b) => a + b, 0))}</td>
            </tr>
          ))}
      </tbody>
    </table>
  )

  return (
    <div className="flex flex-col gap-4">
      <Panel title="AD/CVD, By Month Of Notices" bodyClassName="overflow-x-auto">
        {byMonth.size ? table(byMonth, steps, "Notices of") : <p className="px-4 py-3 text-sm text-base-content/50">No AD/CVD AI calls yet.</p>}
      </Panel>
      <Panel title="Tariff Updates, By Calendar Month" bodyClassName="overflow-x-auto">
        {updatesByMonth.size ? table(updatesByMonth, updateSteps, "Month") : <p className="px-4 py-3 text-sm text-base-content/50">Logged from now on.</p>}
      </Panel>
      <Panel title="By Model" bodyClassName="overflow-x-auto">
        <table className="table table-sm">
          <tbody>
            {Array.from(byModel)
              .sort((a, b) => b[1] - a[1])
              .map(([model, cost]) => (
                <tr key={model}>
                  <td className="font-mono text-xs">{model}</td>
                  <td className="text-right tabular-nums">{usd(cost)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </Panel>
    </div>
  )
}
