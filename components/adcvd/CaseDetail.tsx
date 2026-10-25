"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Countries } from "@/constants/countries"
import { dottedCode, ratesBasis, ratesText, shortDate } from "@/libs/adcvd/format"
import { ACCESS_URL, EVENTS, STATUSES, frDocUrl, type CaseRow, type EventRow } from "@/libs/adcvd/types"
import { Callout, DefList, Drawer, Pill, SectionLabel, Spinner, btn } from "../hts-revision-diff/ui"
import { adminCall } from "../tariff-sources/types"

// One case on /adcvd, in a drawer over the list: its codes, the automatic checks' notes, its scope
// and its notices, with what we know about it (dates, rates, where its codes came from) in a rail

const countryName = (code: string | null) => (code ? Countries.find((c) => c.code === code)?.name ?? code : "Unknown")

const Codes = ({ label, codes, tone, outdated }: { label: string; codes: string[]; tone: "neutral" | "info" | "warning"; outdated: string[] }) =>
  codes.length ? (
    <div className="flex flex-col gap-1.5">
      <div className="text-sm font-semibold">
        {label} <span className="font-normal text-base-content/60">{codes.length}</span>
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
    <Drawer
      open={!!caseNumber}
      onClose={onClose}
      top={<span className="text-sm text-base-content/60">AD/CVD case</span>}
      title={c ? `${c.product ?? "Product not named yet"} from ${countryName(c.country)}` : caseNumber ?? ""}
      description={
        c && (
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs">{c.case_number}</span>
            <Pill>{c.kind === "AD" ? "Antidumping" : "Countervailing"}</Pill>
            <Pill tone={c.status === "order" || c.status === "suspended" ? "warning" : c.status === "investigation" ? "info" : "neutral"}>{STATUSES[c.status]}</Pill>
          </span>
        )
      }
      footer={
        <>
          <a className={btn.ghost} href={ACCESS_URL} target="_blank" rel="noreferrer">
            ITA ACCESS ↗
          </a>
          {c?.scope_doc && (
            <a className={btn.ghost} href={frDocUrl(c.scope_doc)} target="_blank" rel="noreferrer">
              Scope notice ↗
            </a>
          )}
          <button className={`${btn.secondary} ml-auto`} onClick={rescope} disabled={busy || !c} title="Find its HTS codes in its notices again">
            {busy && <Spinner />}
            Read scope again
          </button>
        </>
      }
    >
      {!data ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : !c ? (
        <p className="px-6 py-6 text-sm text-base-content/60">This case isn&apos;t in the registry.</p>
      ) : (
        <div className="grid min-h-full lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="flex min-w-0 flex-col gap-8 px-6 py-6">
            {c.problems.length > 0 && (
              <Callout title="The automatic checks' notes">
                <ul className="list-disc space-y-1 pl-4">
                  {c.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </Callout>
            )}
            <section className="flex flex-col gap-4">
              <SectionLabel>HTS Codes</SectionLabel>
              {c.hts_main.length + c.hts_also.length + c.hts_excluded.length === 0 && (
                <p className="text-sm text-base-content/60">None found yet: it can&apos;t flag imports until it has codes.</p>
              )}
              <Codes label="Classified under" codes={c.hts_main} tone="info" outdated={c.hts_outdated} />
              <Codes label="May also enter under" codes={c.hts_also} tone="neutral" outdated={c.hts_outdated} />
              <Codes label="Named only for excluded products" codes={c.hts_excluded} tone="neutral" outdated={[]} />
            </section>
            {c.scope_text && (
              <details className="flex flex-col gap-2 text-sm">
                <summary className="cursor-pointer text-[0.9375rem] font-semibold">Scope Text</summary>
                <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-tt-soft p-4 font-sans text-xs leading-relaxed text-base-content/75">
                  {c.scope_text}
                </pre>
              </details>
            )}
            <section className="flex flex-col gap-2">
              <SectionLabel>Notices ({data.events.length})</SectionLabel>
              <ol className="flex flex-col">
                {data.events.map((e) => (
                  <li key={`${e.document_number}-${e.event}`} className="flex flex-col gap-0.5 border-t border-base-300 py-3 text-sm first:border-t-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="tabular-nums text-xs text-base-content/60">{shortDate(e.published_on)}</span>
                      <span className="font-semibold">{EVENTS[e.event] ?? e.event}</span>
                      {e.significant && <Pill tone="warning">News</Pill>}
                      <a className="ml-auto text-xs text-primary hover:underline" href={e.url} target="_blank" rel="noreferrer">
                        {e.document_number} ↗
                      </a>
                    </div>
                    <div className="text-base-content/70">{e.summary ?? e.title}</div>
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <aside className="flex flex-col gap-4 border-base-300 bg-tt-soft/50 px-6 py-6 lg:border-l">
            <SectionLabel>Details</SectionLabel>
            <DefList
              narrow
              items={[
                { label: "Started", value: c.initiated_on ? shortDate(c.initiated_on) : "–" },
                { label: "Order", value: c.order_on ? shortDate(c.order_on) : "–" },
                { label: "Continued", value: c.last_continued_on ? shortDate(c.last_continued_on) : "–" },
                { label: "Ended", value: c.ended_on ? shortDate(c.ended_on) : "–" },
                { label: "ITC", value: c.itc_numbers.join(", ") || "–" },
                { label: "Filed with", value: c.siblings.join(", ") || "–" },
                { label: "Reaches", value: c.third_countries.map(countryName).join(", ") || "–" },
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
          </aside>
        </div>
      )}
    </Drawer>
  )
}
