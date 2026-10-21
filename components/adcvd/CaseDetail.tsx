"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Countries } from "@/constants/countries"
import { dottedCode, ratesBasis, ratesText, shortDate } from "@/libs/adcvd/format"
import { ACCESS_URL, EVENTS, STATUSES, frDocUrl, type CaseRow, type EventRow } from "@/libs/adcvd/types"
import { DefList, Modal, Pill, Spinner, btn } from "../hts-revision-diff/ui"
import { adminCall } from "../tariff-sources/types"

// One case on /adcvd: what we know, where each piece came from, and its notices

const countryName = (code: string | null) => (code ? Countries.find((c) => c.code === code)?.name ?? code : "Unknown")

const Codes = ({ label, codes, tone, outdated }: { label: string; codes: string[]; tone: "neutral" | "info" | "warning"; outdated: string[] }) =>
  codes.length ? (
    <div className="flex flex-col gap-1.5">
      <div className="text-xs font-medium text-base-content/50">
        {label} <span className="font-normal">{codes.length}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {codes.map((c) => (
          <Pill key={c} tone={outdated.includes(c) ? "warning" : tone} mono title={outdated.includes(c) ? "Not in the current HTS" : undefined}>
            {dottedCode(c)}
          </Pill>
        ))}
      </div>
    </div>
  ) : null

export default function CaseDetail({ caseNumber, onClose, onChanged }: { caseNumber: string | null; onClose: () => void; onChanged: () => void }) {
  const [data, setData] = useState<{ case: CaseRow | null; events: EventRow[] } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setData(null)
    if (!caseNumber) return
    adminCall<{ case: CaseRow | null; events: EventRow[] }>(`/api/adcvd/cases/${caseNumber}`, "GET")
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Couldn't load the case"))
  }, [caseNumber])

  const rescope = async () => {
    if (!caseNumber) return
    setBusy(true)
    try {
      const { method } = await adminCall<{ method: string }>(`/api/adcvd/cases/${caseNumber}`, "POST", { action: "rescope" })
      toast.success(method === "none" ? "No codes found in its notices" : `Codes found (${method})`)
      const fresh = await adminCall<{ case: CaseRow | null; events: EventRow[] }>(`/api/adcvd/cases/${caseNumber}`, "GET")
      setData(fresh)
      onChanged()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't read the scope")
    } finally {
      setBusy(false)
    }
  }

  const c = data?.case
  return (
    <Modal
      open={!!caseNumber}
      onClose={onClose}
      wide
      title={c ? `${c.product ?? "Product not named yet"} from ${countryName(c.country)}` : caseNumber ?? ""}
      description={c ? `${c.case_number} · ${c.kind === "AD" ? "Antidumping" : "Countervailing"} · ${STATUSES[c.status]}` : undefined}
      footer={
        <>
          <a className={btn.ghost} href={ACCESS_URL} target="_blank" rel="noreferrer">
            ITA ACCESS
          </a>
          {c?.scope_doc && (
            <a className={btn.ghost} href={frDocUrl(c.scope_doc)} target="_blank" rel="noreferrer">
              Scope Notice
            </a>
          )}
          <button className={btn.secondary} onClick={rescope} disabled={busy || !c}>
            {busy && <Spinner />}
            Read Scope Again
          </button>
        </>
      }
    >
      {!data ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : !c ? (
        <p className="text-sm text-base-content/60">This case isn&apos;t in the registry.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <DefList
            items={[
              { label: "Investigation started", value: c.initiated_on ? shortDate(c.initiated_on) : "–" },
              { label: "Order", value: c.order_on ? shortDate(c.order_on) : "–" },
              { label: "Last continued", value: c.last_continued_on ? shortDate(c.last_continued_on) : "–" },
              { label: "Ended", value: c.ended_on ? shortDate(c.ended_on) : "–" },
              { label: "ITC investigations", value: c.itc_numbers.join(", ") || "–" },
              { label: "Filed together with", value: c.siblings.join(", ") || "–" },
              { label: "Reaches (circumvention)", value: c.third_countries.map(countryName).join(", ") || "–" },
              {
                label: "Rates",
                value: c.rates ? `${ratesText(c.rates)} (${ratesBasis(c.rates)}, ${shortDate(c.rates.as_of)})` : "None read yet",
              },
              {
                label: "Codes from",
                value: c.scope_doc ? `${c.scope_doc}${c.scope_published_on ? `, ${shortDate(c.scope_published_on)}` : ""} · ${c.scope_method}` : c.scope_method ?? "–",
              },
            ]}
          />
          <Codes label="Classified Under" codes={c.hts_main} tone="info" outdated={c.hts_outdated} />
          <Codes label="May Also Enter Under" codes={c.hts_also} tone="neutral" outdated={c.hts_outdated} />
          <Codes label="Named Only For Excluded Products" codes={c.hts_excluded} tone="neutral" outdated={[]} />
          {c.problems.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-base-content/70">
              {c.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          {c.scope_text && (
            <details className="text-sm">
              <summary className="cursor-pointer text-xs font-medium text-base-content/50">Scope Text</summary>
              <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-base-content/10 bg-base-content/[0.02] p-3 font-sans text-xs leading-relaxed text-base-content/75">
                {c.scope_text}
              </pre>
            </details>
          )}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-medium text-base-content/50">Notices {data.events.length}</div>
            <ol className="flex flex-col divide-y divide-base-content/10 rounded-md border border-base-content/10">
              {data.events.map((e) => (
                <li key={`${e.document_number}-${e.event}`} className="flex flex-col gap-0.5 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tabular-nums text-xs text-base-content/50">{shortDate(e.published_on)}</span>
                    <span className="font-medium">{EVENTS[e.event] ?? e.event}</span>
                    {e.significant && <Pill tone="warning">News</Pill>}
                    <a className="ml-auto text-xs text-base-content/50 underline" href={e.url} target="_blank" rel="noreferrer">
                      {e.document_number}
                    </a>
                  </div>
                  <div className="text-base-content/70">{e.summary ?? e.title}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </Modal>
  )
}
