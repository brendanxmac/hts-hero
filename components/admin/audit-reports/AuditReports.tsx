"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckIcon, ArrowUturnLeftIcon } from "@heroicons/react/20/solid"
import { mono } from "@/components/ui/font"
import * as ui from "@/components/ui/styles"
import * as tt from "@/components/ui/styles/tracker"
import { AUDIT_REPORT_KINDS, type AuditReport } from "@/libs/admin/audit-reports"

// /audit-reports: what users sent from Duty Guard's entry audit, newest first. "This looks wrong"
// with their note and the audit's summary (everything else it showed under "All details"), AD/CVD
// cases we don't have, and cases added by hand to link. Resolve each once it's dealt with; reply
// to the user by email.

const TONE = { looks_wrong: "error", missing_case: "warning", case_link: "primary" } as const

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })

const Report = ({ r, onStatus }: { r: AuditReport; onStatus: (status: AuditReport["status"]) => void }) => {
  const summary = typeof r.details.summary === "string" ? r.details.summary : null
  return (
    <li className={`${tt.panel} flex flex-col gap-3 p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className={tt.chip(TONE[r.kind])}>{AUDIT_REPORT_KINDS[r.kind].short}</span>
            {r.case_number && <span className={`${mono.className} text-sm font-semibold`}>{r.case_number}</span>}
            {r.hts_code && (
              <span className={`${mono.className} text-sm text-base-content/70`}>
                {r.hts_code} · {r.country}
              </span>
            )}
          </span>
          <span className="text-xs text-base-content/60">
            {when(r.created_at)} ·{" "}
            {r.user_email ? (
              <a className="text-primary hover:underline" href={`mailto:${r.user_email}?subject=${encodeURIComponent("Your Duty Guard entry audit")}`}>
                {r.user_email}
              </a>
            ) : (
              "Unknown user"
            )}
          </span>
        </div>
        <button type="button" className={ui.button({ variant: r.status === "open" ? "primary" : "secondary", size: "sm" })} onClick={() => onStatus(r.status === "open" ? "resolved" : "open")}>
          {r.status === "open" ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <ArrowUturnLeftIcon className="h-3.5 w-3.5" aria-hidden />}
          {r.status === "open" ? "Resolve" : "Reopen"}
        </button>
      </div>
      {r.note && <p className="m-0 rounded-lg bg-tt-soft px-4 py-3 text-sm text-base-content">&ldquo;{r.note}&rdquo;</p>}
      {summary && <pre className={`${mono.className} m-0 whitespace-pre-wrap text-xs leading-relaxed text-base-content/80`}>{summary}</pre>}
      <details>
        <summary className="cursor-pointer text-xs font-semibold text-base-content/60">All details</summary>
        <pre className={`${mono.className} m-0 mt-2 max-h-96 overflow-auto rounded-lg bg-tt-soft p-3 text-[0.7rem]`}>{JSON.stringify(r.details, null, 2)}</pre>
      </details>
    </li>
  )
}

export default function AuditReports() {
  const [status, setStatus] = useState<AuditReport["status"]>("open")
  const [reports, setReports] = useState<AuditReport[] | "loading" | "error">("loading")
  const load = useCallback(async (s: AuditReport["status"]) => {
    setReports("loading")
    const r = await fetch(`/api/audit-reports?status=${s}`).catch((): null => null)
    setReports(r?.ok ? ((await r.json()) as { reports: AuditReport[] }).reports : "error")
  }, [])
  useEffect(() => {
    void load(status)
  }, [status, load])
  const change = async (id: string, next: AuditReport["status"]) => {
    const r = await fetch("/api/audit-reports", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: next }) }).catch((): null => null)
    if (r?.ok) setReports((list) => (Array.isArray(list) ? list.filter((x) => x.id !== id) : list))
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={tt.pageTitle}>Audit Reports</h1>
          <p className={tt.subtitle}>Sent from Duty Guard&apos;s entry audit: audits that look wrong, and AD/CVD cases to add or link.</p>
        </div>
        <div className="flex gap-1 rounded-full bg-tt-soft p-1">
          {(["open", "resolved"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${status === s ? "bg-base-100 text-base-content shadow-xs" : "text-base-content/60"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </header>
      {reports === "loading" ? (
        <div className={`${ui.skeleton} h-40 w-full`} />
      ) : reports === "error" ? (
        <p className="text-sm text-error">Couldn&apos;t load reports. Has supabase/migrations/audit_reports.sql been run?</p>
      ) : reports.length ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {reports.map((r) => (
            <Report key={r.id} r={r} onStatus={(s) => change(r.id, s)} />
          ))}
        </ul>
      ) : (
        <p className={`${tt.panel} p-6 text-sm text-base-content/70`}>{status === "open" ? "Nothing to review." : "None resolved yet."}</p>
      )}
    </div>
  )
}
