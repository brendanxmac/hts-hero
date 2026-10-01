"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import type { AttemptRow, DocumentRow, ParsedNotes, RevisionRow } from "@/libs/hts-revision-diff/types"
import HeadingsPanel from "./HeadingsPanel"
import NotesBrowser from "./NotesBrowser"
import { api, formatTime, StatusBadge } from "./shared"

interface InspectData {
  attempt: AttemptRow
  revision: RevisionRow
  documents: DocumentRow[]
  notes: ParsedNotes | null
  changeRecordMarkdown: string | null
  links: { label: string; url: string }[]
}

export default function AttemptInspector({ attemptId }: { attemptId: string }) {
  const [data, setData] = useState<InspectData | null>(null)
  const [tab, setTab] = useState<"notes" | "warnings" | "change-record" | "headings">("notes")
  const [warningKind, setWarningKind] = useState("all")
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)

  const load = useCallback(async () => {
    try {
      setData(await api<InspectData>(`/attempts/${attemptId}/notes`))
    } catch (error) {
      toast.error((error as Error).message)
    }
  }, [attemptId])

  useEffect(() => {
    load()
  }, [load])

  const nodes = data?.notes?.nodes ?? []
  const warnings = data?.attempt.parse_warnings ?? []
  const warningKinds = Array.from(new Set(warnings.map((w) => w.kind)))

  const reextract = async () => {
    setExtracting(true)
    try {
      await api(`/attempts/${attemptId}/change-record`, { method: "POST" })
      toast.success("Change record read again. Re-run comparisons to use it.")
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setExtracting(false)
    }
  }

  if (!data) {
    return (
      <div className="flex justify-center p-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    )
  }

  const { attempt, revision } = data
  const stats = attempt.parse_stats
  const items = attempt.change_record_items ?? []

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
      <div>
        <Link href="/revision-checker" className="link text-sm">
          ← Revision checker
        </Link>
        <h1 className="mt-2 flex items-center gap-3 font-mono text-2xl font-bold">
          {revision.name} · attempt {attempt.attempt_number} <StatusBadge status={attempt.status} />
        </h1>
        <p className="text-sm text-base-content/60">
          {attempt.parsed_at ? `Parsed ${formatTime(attempt.parsed_at)} with ${attempt.parser_version}` : "Not parsed yet"}
        </p>
        {attempt.error && <p className="mt-2 whitespace-pre-wrap text-sm text-error">{attempt.error}</p>}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {data.links.map((l) => (
          <a key={l.label} className="btn btn-xs" href={l.url} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </div>

      {stats && (
        <div className="overflow-x-auto rounded-lg border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Note group</th>
                <th>Top-level notes</th>
                <th>Subdivisions</th>
              </tr>
            </thead>
            <tbody>
              {stats.groups.map((g) => (
                <tr key={g.groupKey}>
                  <td>
                    {g.label}
                    {data.notes?.subchapterTitles[g.groupKey.match(/^sub-([IVXLC]+)/)?.[1] ?? ""] && (
                      <span className="ml-2 text-xs text-base-content/50">
                        {data.notes?.subchapterTitles[g.groupKey.match(/^sub-([IVXLC]+)/)?.[1] ?? ""]}
                      </span>
                    )}
                  </td>
                  <td>{g.topLevelNotes}</td>
                  <td>{g.nodes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div role="tablist" className="tabs-boxed tabs w-fit">
        <button role="tab" className={`tab ${tab === "notes" ? "tab-active" : ""}`} onClick={() => setTab("notes")}>
          Notes ({nodes.length})
        </button>
        <button role="tab" className={`tab ${tab === "warnings" ? "tab-active" : ""}`} onClick={() => setTab("warnings")}>
          Warnings ({warnings.length})
        </button>
        <button role="tab" className={`tab ${tab === "headings" ? "tab-active" : ""}`} onClick={() => setTab("headings")}>
          Headings
        </button>
        <button role="tab" className={`tab ${tab === "change-record" ? "tab-active" : ""}`} onClick={() => setTab("change-record")}>
          Change record ({items.length})
        </button>
      </div>

      {tab === "notes" &&
        (data.notes ? (
          <NotesBrowser notes={data.notes} warnings={warnings} focusKey={focusKey} />
        ) : (
          <p className="text-base-content/60">Not parsed yet.</p>
        ))}

      {tab === "headings" && <HeadingsPanel attemptId={attemptId} />}

      {tab === "warnings" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-base-content/70">
            Warnings point at places the parser had to guess: numbering gaps, citations kept as text, empty subdivisions.
            Check them against the PDF page before trusting a diff in that area.
          </p>
          <select className="select select-sm select-bordered w-fit" value={warningKind} onChange={(e) => setWarningKind(e.target.value)}>
            <option value="all">All kinds</option>
            {warningKinds.map((k) => (
              <option key={k} value={k}>
                {k} ({warnings.filter((w) => w.kind === k).length})
              </option>
            ))}
          </select>
          <div className="overflow-x-auto rounded-lg border border-base-300">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Message</th>
                  <th>Where</th>
                  <th>Page</th>
                </tr>
              </thead>
              <tbody>
                {warnings
                  .filter((w) => warningKind === "all" || w.kind === warningKind)
                  .map((w, i) => (
                    <tr key={i}>
                      <td className="text-xs">{w.kind}</td>
                      <td>{w.message}</td>
                      <td className="font-mono text-xs">
                        {w.key ? (
                          <button
                            className="link text-left"
                            onClick={() => {
                              setFocusKey(null)
                              setTimeout(() => setFocusKey(w.key!), 0)
                              setTab("notes")
                            }}
                          >
                            {w.key}
                          </button>
                        ) : (
                          ""
                        )}
                      </td>
                      <td>{w.page ?? ""}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "change-record" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button className="btn btn-sm" disabled={extracting || !data.changeRecordMarkdown} onClick={reextract}>
              {extracting && <span className="loading loading-spinner loading-xs" />}
              {items.length ? "Read again with Claude" : "Read with Claude"}
            </button>
            {attempt.change_record_model && (
              <span className="text-xs text-base-content/60">
                {attempt.change_record_model} · {formatTime(attempt.change_record_extracted_at)}
              </span>
            )}
            {!items.length && (
              <span className="text-sm text-base-content/60">Read automatically the first time this revision is compared.</span>
            )}
          </div>
          {items.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-base-300">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Ch. 99</th>
                    <th>Action</th>
                    <th>Cites</th>
                    <th>Description</th>
                    <th>Effective</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={item.in_chapter_99 ? "" : "opacity-50"}>
                      <td className="font-mono text-xs">{item.id}</td>
                      <td>{item.in_chapter_99 ? "yes" : "no"}</td>
                      <td>{item.action}</td>
                      <td className="max-w-xs break-words font-mono text-xs">
                        {[
                          item.subchapter && `sub ${item.subchapter}`,
                          ...item.note_citations.map((c) => `note ${c}`),
                          ...item.hts_codes,
                          ...item.hts_code_ranges.map((r) => `${r.from}–${r.to}`),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </td>
                      <td>{item.description}</td>
                      <td className="text-xs">{item.effective_date ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {data.changeRecordMarkdown && (
            <details className="rounded-md bg-base-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold">Change record markdown (from datalab)</summary>
              <pre className="mt-2 max-h-[32rem] overflow-auto whitespace-pre-wrap text-xs">{data.changeRecordMarkdown}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
