"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { SOURCE_IDS, SOURCES, type SourceId } from "@/libs/tariff-sources/types"
import { formatTime } from "../hts-revision-diff/shared"
import { Callout, PageHeader, Spinner, Stat, StatGrid, StatusDot, Tabs, btn } from "../hts-revision-diff/ui"
import ItemsTable from "./ItemsTable"
import { adminCall, type SourceItemRow, type SourceRunRow, type UpdateRow } from "./types"
import UpdatesTable from "./UpdatesTable"

// The tariff updates pipeline's admin view: how each source's collection is going, the updates
// built from what was collected (to review), and every raw source item.

type Tab = "updates" | "items"

// The latest run per source, and the latest that worked
const healthOf = (source: SourceId, runs: SourceRunRow[]) => {
  const own = runs.filter((r) => r.source === source)
  return { last: own[0], lastOk: own.find((r) => r.finished_at && !r.error) }
}

export default function TariffSourcesDashboard({
  items,
  updates,
  runs,
  loadError,
}: {
  items: SourceItemRow[]
  updates: UpdateRow[]
  runs: SourceRunRow[]
  loadError: string | null
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("updates")
  const [busy, setBusy] = useState<"collect" | "process" | null>(null)

  const collect = async () => {
    setBusy("collect")
    try {
      const { results } = await adminCall<{ results: { source: SourceId; added: number; error?: string }[] }>("/api/tariff-sources/collect", "POST")
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tariff sources"
        meta={
          <>
            {items.length.toLocaleString()} items from {SOURCE_IDS.length} sources, {termCount.toLocaleString()} with tariff words,{" "}
            {updates.length.toLocaleString()} updates. {unsorted ? `${unsorted.toLocaleString()} not sorted, ` : ""}
            {waiting ? `${waiting.toLocaleString()} tariff actions waiting to be grouped, ` : ""}
            {failed ? `${failed} failed. ` : ""}Collected and processed every 15 minutes.
          </>
        }
        actions={
          <>
            <button type="button" className={btn.secondary} onClick={collect} disabled={!!busy}>
              {busy === "collect" && <Spinner />}
              Collect now
            </button>
            <button type="button" className={btn.primary} onClick={processNow} disabled={!!busy} title="Sort, read and group for up to 100 seconds">
              {busy === "process" && <Spinner />}
              Process now
            </button>
          </>
        }
      />

      {loadError && (
        <Callout tone="error" title="Couldn't load the tariff tables">
          {loadError}. Have <code>supabase/migrations/tariff_sources.sql</code> and <code>tariff_updates.sql</code> been applied?
        </Callout>
      )}

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

      <Tabs
        tabs={[
          { value: "updates", label: "Updates", count: updates.filter((u) => u.needs_review).length, tone: "warning" },
          { value: "items", label: "Source items", count: items.length },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "updates" ? <UpdatesTable updates={updates} items={items} /> : <ItemsTable items={items} />}
    </div>
  )
}
