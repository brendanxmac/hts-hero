"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { formatTime } from "../hts-revision-diff/shared"
import { Pill, Spinner, btn } from "../hts-revision-diff/ui"
import { adminCall } from "./types"

// An update's impact check: the products it affects across the users' catalogs (from its scope,
// above, and the duty engine), to cross-check against the official sources. Approving it sends
// every affected account one alert about its own imports, straight away; approving again later
// sends only what's new or changed (now confirmed, a different amount, no longer affected).

interface Impact {
  levels: Record<string, number>
  accounts: number
  alertable: number
  deltaUsd: number
  computedAt: string | null
  products: { key: string; level: string; accounts: number; beforePct: number | null; afterPct: number | null; deltaUsd: number | null }[]
  pending: number
  approvedAt: string | null
  alerted: number | null
}

const SHOWN = 40

const change = (p: Impact["products"][number]) => {
  if (p.level !== "confirmed") return "may apply"
  const delta = Number(p.deltaUsd ?? 0)
  if (Math.abs(delta) < 0.5) return `new Chapter 99 number, same duty (${p.afterPct}%)`
  return `${p.beforePct}% → ${p.afterPct}% (${delta > 0 ? "+" : "−"}$${Math.abs(Math.round(delta)).toLocaleString()})`
}

export default function ImpactCheck({ updateId, version }: { updateId: string; version: string }) {
  const [impact, setImpact] = useState<Impact | null>(null)
  const [busy, setBusy] = useState(false)
  const [all, setAll] = useState(false)

  const load = useCallback(() => {
    setImpact(null)
    adminCall<Impact>(`/api/tariff-updates/${updateId}`, "GET").then(setImpact).catch(() => setImpact(null))
  }, [updateId])
  // Again whenever the update changes (a scope saved or read)
  useEffect(load, [load, version])

  const approve = async () => {
    if (!impact) return
    if (!window.confirm(`Approve this impact check and alert ${impact.pending} account${impact.pending === 1 ? "" : "s"} now?`)) return
    setBusy(true)
    try {
      const r = await adminCall<{ alerted: { accounts: number; messages: number }; sent: { sent: number; failed: number } | null }>(`/api/tariff-updates/${updateId}`, "POST", { action: "approve-impact" })
      toast.success(`Alerted ${r.alerted.accounts} account${r.alerted.accounts === 1 ? "" : "s"} (${r.sent?.sent ?? 0} messages sent${r.sent?.failed ? `, ${r.sent.failed} failed` : ""})`)
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't approve")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-lg border border-base-content/10 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Impact check</h4>
        {impact?.approvedAt ? (
          <Pill tone="success">
            Approved {formatTime(impact.approvedAt)} · {impact.alerted ?? 0} alerted
          </Pill>
        ) : (
          <Pill tone="warning">Not approved yet</Pill>
        )}
        {impact && (
          <button type="button" className={`${btn.xsPrimary} ml-auto`} disabled={busy || !impact.pending} onClick={approve}>
            {busy && <Spinner />}
            {impact.pending ? `Approve and alert ${impact.pending} account${impact.pending === 1 ? "" : "s"}` : "Nothing new to alert"}
          </button>
        )}
      </div>
      {!impact ? (
        <span className="text-base-content/50">Loading…</span>
      ) : !impact.products.length ? (
        <span className="text-base-content/60">
          No user imports affected{impact.levels.possible ? ` (${impact.levels.possible} possible: country only, never alerted)` : ""}.
        </span>
      ) : (
        <>
          <p className="text-base-content/70">
            {impact.levels.confirmed} confirmed and {impact.levels.likely} likely imports across {impact.alertable} account{impact.alertable === 1 ? "" : "s"}
            {impact.levels.possible ? `; ${impact.levels.possible} possible (country only, never alerted)` : ""}. Check these against the official sources
            before approving.
          </p>
          <ul className="flex max-h-72 flex-col overflow-y-auto rounded-md border border-base-content/10">
            {(all ? impact.products : impact.products.slice(0, SHOWN)).map((p) => (
              <li key={p.key} className="flex items-center gap-2 border-b border-base-content/5 px-3 py-1.5 text-xs last:border-b-0">
                <span className="font-mono">{p.key.replace("-", " · ")}</span>
                <Pill tone={p.level === "confirmed" ? "error" : "warning"}>{p.level}</Pill>
                <span className="text-base-content/70">{change(p)}</span>
                <span className="ml-auto text-base-content/50">
                  {p.accounts} account{p.accounts === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
          {impact.products.length > SHOWN && !all && (
            <button type="button" className={`${btn.xsGhost} self-start`} onClick={() => setAll(true)}>
              Show all {impact.products.length}
            </button>
          )}
        </>
      )}
    </section>
  )
}
