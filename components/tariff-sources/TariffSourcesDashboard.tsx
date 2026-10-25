"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { SOURCE_IDS, SOURCES, type SourceId } from "@/libs/tariff-sources/types"
import { formatTime } from "../hts-revision-diff/shared"
import { STAGES } from "@/libs/tariff-updates/types"
import { Callout, EmptyState, PageHeader, Panel, Pill, Spinner, Stat, StatGrid, StatusDot, Tabs, btn, inputCls } from "../hts-revision-diff/ui"
import ItemsTable from "./ItemsTable"
import { adminCall, type SourceItemRow, type SourceRunRow, type UpdateRow } from "./types"
import UpdateDetail from "./UpdateDetail"
import UpdatesTable from "./UpdatesTable"

// The tariff updates pipeline's admin view, in four views (the header's tabs, kept in the address
// as ?view=): Review, what waits on the admin (updates Claude flagged, impact checks to approve);
// All Updates, every update as a table; Sources, how each source's collection is going, with
// collect, process and backfill; Source Items, everything collected. Any update opens in a drawer
// (UpdateDetail, ?update=<id>).

type Tab = "review" | "updates" | "sources" | "items"
const TABS: Tab[] = ["review", "updates", "sources", "items"]

export interface ImpactWaiting {
  id: string
  title: string
  last_activity_at: string
  accounts: string[]
}

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

// Keeps the open view and update in the address, so a link (the morning email, Needs You) opens them
const setParam = (key: string, value: string | null) => {
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(key, value)
  else url.searchParams.delete(key)
  window.history.replaceState(null, "", url)
}

type CollectResult = { results: { source: SourceId; added: number; error?: string }[] }

// The Federal Register collectors fetch a day at a time and honour an end date, so their backfill
// goes a month per request; the others page back from today whatever the end date, so each goes
// back to `since` in one request.
const BY_MONTH: SourceId[] = ["federal_register", "federal_register_pi"]

// A backfill's periods, a month at a time from `since` to today (YYYY-MM-DD pairs), newest first
const monthsSince = (since: string) => {
  const periods: { since: string; until: string }[] = []
  const today = new Date().toISOString().slice(0, 10)
  let start = since
  while (start <= today) {
    const [y, m] = start.split("-").map(Number)
    const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10)
    const end = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
    periods.push({ since: start, until: end < today ? end : today })
    start = next
  }
  return periods.reverse()
}

const monthLabel = (date: string) => new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" })

// The latest run per source, and the latest that worked
const healthOf = (source: SourceId, runs: SourceRunRow[]) => {
  const own = runs.filter((r) => r.source === source)
  return { last: own[0], lastOk: own.find((r) => r.finished_at && !r.error) }
}

export default function TariffSourcesDashboard({
  items,
  updates,
  runs,
  impactWaiting,
  alertsFrom,
  loadError,
}: {
  items: SourceItemRow[]
  updates: UpdateRow[]
  runs: SourceRunRow[]
  impactWaiting: ImpactWaiting[]
  // NEWS_ALERTS_FROM: from then on, an update in review holds back its news email and alerts
  alertsFrom: string
  loadError: string | null
}) {
  const holdsAlerts = (u: UpdateRow) => u.last_activity_at >= alertsFrom.slice(0, 10)
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("review")
  const [openId, setOpenId] = useState<string | null>(null)
  const [failedOnly, setFailedOnly] = useState(false)
  const [busy, setBusy] = useState<"collect" | "process" | "backfill" | null>(null)
  const [backfillFrom, setBackfillFrom] = useState("2025-01-01")
  const [backfillStatus, setBackfillStatus] = useState<string | null>(null)

  // ?view=, ?update= and ?failed=1 from a link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get("view")
    if (view && TABS.includes(view as Tab)) setTab(view as Tab)
    const id = params.get("update")
    if (id && updates.some((u) => u.id === id)) setOpenId(id)
    if (params.get("failed")) setFailedOnly(true)
    // Only on arrival
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const openTab = (next: Tab) => {
    setTab(next)
    setParam("view", next === "review" ? null : next)
  }
  const openUpdate = (id: string | null) => {
    setOpenId(id)
    setParam("update", id)
  }

  // To review: those holding back news and alerts first, then the rest, newest first in each
  const toReview = useMemo(
    () => updates.filter((u) => u.needs_review).sort((a, b) => Number(holdsAlerts(b)) - Number(holdsAlerts(a)) || b.last_activity_at.localeCompare(a.last_activity_at)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updates, alertsFrom]
  )
  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const i of items) if (i.update_id) counts.set(i.update_id, (counts.get(i.update_id) ?? 0) + 1)
    return counts
  }, [items])
  // The drawer steps through what's waiting: updates to review, then impact checks
  const queue = useMemo(() => [...toReview.map((u) => u.id), ...impactWaiting.map((u) => u.id)], [toReview, impactWaiting])

  // Collects every source back to the chosen date, one request per source (per month for the
  // Federal Register), then leaves the 15-minute
  // cron (or Process now) to process what's added. Safe to repeat: stored items are skipped.
  const backfill = async () => {
    if (!backfillFrom) return
    const months = monthsSince(backfillFrom)
    if (!months.length) return toast.error("Pick a date before today")
    const steps = SOURCE_IDS.flatMap((source) => (BY_MONTH.includes(source) ? months.map((m) => ({ source, ...m })) : [{ source, since: backfillFrom }]))
    setBusy("backfill")
    let added = 0
    const failures: string[] = []
    try {
      for (const [i, step] of steps.entries()) {
        const what = `${SOURCES[step.source].label}${"until" in step ? `, ${monthLabel(step.since)}` : ""}`
        setBackfillStatus(`${what} (${i + 1} of ${steps.length}), ${added.toLocaleString()} added`)
        const { results } = await adminCall<CollectResult>("/api/tariff-sources/collect", "POST", step)
        added += results.reduce((n, r) => n + r.added, 0)
        if (results.some((r) => r.error)) failures.push(what)
      }
      if (failures.length) toast.error(`Failed: ${failures.join(", ")}. Run the backfill again to retry.`)
      toast.success(`Backfill done: ${added.toLocaleString()} new item${added === 1 ? "" : "s"}. They're processed every hour.`)
      router.refresh()
    } catch (e) {
      toast.error(`${e instanceof Error ? e.message : "Backfill failed"}. Run it again to continue: stored items are skipped.`)
    } finally {
      setBusy(null)
      setBackfillStatus(null)
    }
  }

  const collect = async () => {
    setBusy("collect")
    try {
      const { results } = await adminCall<CollectResult>("/api/tariff-sources/collect", "POST")
      const added = results.reduce((n, r) => n + r.added, 0)
      const failed = results.filter((r) => r.error)
      if (failed.length) toast.error(`${failed.map((r) => SOURCES[r.source].label).join(", ")} failed`)
      toast.success(added ? `${added} new item${added === 1 ? "" : "s"}` : "Nothing new")
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Collection failed")
    } finally {
      setBusy(null)
    }
  }

  const processNow = async () => {
    setBusy("process")
    try {
      const r = await adminCall<{ sorted: number; read: number; grouped: number; created: number; errors: number; remaining: boolean }>(
        "/api/tariff-updates/process",
        "POST"
      )
      toast.success(
        `Sorted ${r.sorted}, read ${r.read}, grouped ${r.grouped} (${r.created} new)${r.errors ? `, ${r.errors} errors` : ""}${r.remaining ? ". More to do: run it again." : ""}`
      )
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Processing failed")
    } finally {
      setBusy(null)
    }
  }

  const termCount = items.filter((i) => i.matched_terms.length > 0).length
  const unsorted = items.filter((i) => !i.category).length
  const waiting = items.filter((i) => (i.category === "tariff_action" || i.category === "hts_revision") && !i.update_id && !i.process_error).length
  const failed = items.filter((i) => i.process_error).length
  const failing = SOURCE_IDS.filter((source) => healthOf(source, runs).last?.error)
  const waitingOnYou = toReview.filter(holdsAlerts).length + impactWaiting.length

  return (
    <>
      <PageHeader
        title="Tariff Updates"
        meta={
          <>
            {updates.length.toLocaleString()} updates from {SOURCE_IDS.length} sources, collected and processed every hour.
            {failing.length > 0 && (
              <button type="button" onClick={() => openTab("sources")} className="text-error hover:underline">
                {failing.length} source{failing.length === 1 ? "" : "s"} failing
              </button>
            )}
          </>
        }
        actions={
          <button type="button" className={btn.secondary} onClick={processNow} disabled={!!busy} title="Sort, read and group what's been collected, for up to 100 seconds">
            {busy === "process" && <Spinner />}
            Process now
          </button>
        }
      >
        <Tabs<Tab>
          tabs={[
            { value: "review", label: "Review", count: waitingOnYou + toReview.filter((u) => !holdsAlerts(u)).length, tone: waitingOnYou ? "warning" : undefined },
            { value: "updates", label: "All Updates", count: updates.length },
            { value: "sources", label: "Sources", count: failing.length || undefined, tone: "warning" },
            { value: "items", label: "Source Items", count: items.length },
          ]}
          value={tab}
          onChange={openTab}
        />
      </PageHeader>

      {loadError && (
        <Callout tone="error" title="Couldn't load the tariff tables">
          {loadError}. Have <code>supabase/migrations/tariff_sources.sql</code> and <code>tariff_updates.sql</code> been applied?
        </Callout>
      )}

      {tab === "review" && (
        <>
          {toReview.length === 0 && impactWaiting.length === 0 ? (
            <Panel>
              <EmptyState title="Nothing to review">Claude was sure about every update, and every impact check is approved. New ones show up here.</EmptyState>
            </Panel>
          ) : (
            <>
              {impactWaiting.length > 0 && (
                <Panel title="Impact Checks to Approve" count={impactWaiting.length}>
                  <p className="px-6 pt-4 text-sm text-base-content/60">
                    Accounts whose imports these affect get no alert until you check what each covers against the official sources and approve.
                  </p>
                  <ul className="py-2">
                    {impactWaiting.map((u, i) => (
                      <QueueRow
                        key={u.id}
                        title={u.title}
                        meta={`${u.accounts.length} account${u.accounts.length === 1 ? "" : "s"} affected · ${day(u.last_activity_at)}`}
                        action="Check and approve"
                        primary={i === 0 && !toReview.some(holdsAlerts)}
                        onOpen={() => openUpdate(u.id)}
                      />
                    ))}
                  </ul>
                </Panel>
              )}
              {toReview.length > 0 && (
                <Panel title="Flagged for Review" count={toReview.length}>
                  <p className="px-6 pt-4 text-sm text-base-content/60">
                    Claude wasn&apos;t sure about these. Recent ones send no news email or alerts until you clear them; older ones only affect the site&apos;s history.
                  </p>
                  <ul className="py-2">
                    {toReview.map((u, i) => (
                      <QueueRow
                        key={u.id}
                        title={u.title}
                        chip={holdsAlerts(u) ? <Pill tone="warning">Holding news and alerts</Pill> : <Pill>History only</Pill>}
                        meta={`${day(u.last_activity_at)} · ${STAGES[u.stage]} · ${sourceCounts.get(u.id) ?? 0} source${sourceCounts.get(u.id) === 1 ? "" : "s"}${u.status === "hidden" ? " · hidden" : ""}`}
                        note={u.review_notes?.split("\n")[0]}
                        action="Review"
                        primary={i === 0 && holdsAlerts(u)}
                        onOpen={() => openUpdate(u.id)}
                      />
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </>
      )}

      {tab === "updates" && <UpdatesTable updates={updates} items={items} onOpen={openUpdate} />}

      {tab === "sources" && (
        <>
          <StatGrid>
            {SOURCE_IDS.map((source) => {
              const { last, lastOk } = healthOf(source, runs)
              const count = items.filter((i) => i.source === source).length
              return (
                <Stat key={source} label={SOURCES[source].label} value={count.toLocaleString()} hint={lastOk ? `Last checked ${formatTime(lastOk.finished_at)}` : "Not collected yet"}>
                  {last?.error ? (
                    <span title={last.error}>
                      <StatusDot tone="error" label="Last run failed" />
                    </span>
                  ) : last && !last.finished_at ? (
                    <StatusDot tone="info" label="Running" busy />
                  ) : last ? (
                    <StatusDot tone="success" label={`OK, ${last.added ?? 0} new`} />
                  ) : null}
                </Stat>
              )
            })}
          </StatGrid>
          {failing.map((source) => (
            <Callout key={source} tone="error" title={`${SOURCES[source].label}: the last run failed`}>
              {healthOf(source, runs).last?.error}
            </Callout>
          ))}
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel
              title="Pipeline"
              actions={
                <button type="button" className={btn.xsSecondary} onClick={collect} disabled={!!busy}>
                  {busy === "collect" && <Spinner />}
                  Collect now
                </button>
              }
            >
              <ul className="flex flex-col gap-2 px-6 py-5 text-sm">
                <li>
                  <span className="font-semibold tabular-nums">{items.length.toLocaleString()}</span> items collected,{" "}
                  <span className="font-semibold tabular-nums">{termCount.toLocaleString()}</span> with tariff words
                </li>
                <li className={unsorted ? "text-warning" : "text-base-content/60"}>{unsorted ? `${unsorted.toLocaleString()} not sorted yet` : "Everything sorted"}</li>
                <li className={waiting ? "text-warning" : "text-base-content/60"}>
                  {waiting ? `${waiting.toLocaleString()} tariff actions waiting to be grouped` : "Every tariff action grouped into an update"}
                </li>
                <li>
                  {failed ? (
                    <button
                      type="button"
                      className="text-error hover:underline"
                      onClick={() => {
                        setFailedOnly(true)
                        openTab("items")
                      }}
                    >
                      {failed} failed processing: see them
                    </button>
                  ) : (
                    <span className="text-base-content/60">None failed processing</span>
                  )}
                </li>
              </ul>
            </Panel>
            <Panel title="Backfill">
              <div className="flex flex-col gap-3 px-6 py-5">
                <p className="text-sm text-base-content/60">
                  Collect every source back to a date. Older updates are history only: no alerts or news emails. Safe to run again: stored items are skipped.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    aria-label="Backfill from"
                    className={inputCls}
                    value={backfillFrom}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setBackfillFrom(e.target.value)}
                    disabled={!!busy}
                  />
                  <button type="button" className={btn.secondary} onClick={backfill} disabled={!!busy || !backfillFrom}>
                    {busy === "backfill" && <Spinner />}
                    Backfill
                  </button>
                </div>
                {backfillStatus && <p className="text-sm text-base-content/60">{backfillStatus}</p>}
              </div>
            </Panel>
          </div>
        </>
      )}

      {tab === "items" && <ItemsTable key={failedOnly ? "failed" : "terms"} items={items} initialScope={failedOnly ? "failed" : "terms"} />}

      <UpdateDetail update={updates.find((u) => u.id === openId) ?? null} items={items} updates={updates} queue={queue} onOpen={openUpdate} onClose={() => openUpdate(null)} />
    </>
  )
}

// One thing waiting in the Review view: what it is, why, and the button that opens it
const QueueRow = ({
  title,
  chip,
  meta,
  note,
  action,
  primary,
  onOpen,
}: {
  title: string
  chip?: React.ReactNode
  meta: string
  note?: string | null
  action: string
  primary: boolean
  onOpen: () => void
}) => (
  <li className="flex items-start gap-4 border-t border-base-300 px-6 py-4 first:border-t-0">
    <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 flex-col gap-1 text-left">
      <span className="flex flex-wrap items-center gap-2">
        <span className="text-[0.9375rem] font-semibold hover:underline">{title}</span>
        {chip}
      </span>
      <span className="text-xs text-base-content/60">{meta}</span>
      {note && <span className="line-clamp-2 text-sm text-base-content/70">{note}</span>}
    </button>
    <button type="button" className={`${primary ? btn.primary : btn.secondary} shrink-0`} onClick={onOpen}>
      {action}
    </button>
  </li>
)
