"use client"

import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import type { AttemptRow, DocumentRow, ParsedNotes, RevisionRow } from "@/libs/hts-revision-diff/types"
import { hasParseResults } from "@/libs/hts-revision-diff/types"
import HeadingsPanel from "./HeadingsPanel"
import MarkdownEditor from "./MarkdownEditor"
import NotesBrowser from "./NotesBrowser"
import { api, formatTime, StatusBadge } from "./shared"
import {
  btn,
  Callout,
  Dot,
  EmptyState,
  Help,
  PageHeader,
  PageSpinner,
  Panel,
  Pill,
  selectCls,
  Spinner,
  Stat,
  StatGrid,
  Tabs,
} from "./ui"

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
  const [tab, setTab] = useState<"notes" | "warnings" | "change-record" | "headings" | "markdown">("notes")
  const [warningKind, setWarningKind] = useState("all")
  const [focusKey, setFocusKey] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [parsing, setParsing] = useState(false)
  // A page to open in the markdown tab; a new object each time so the same
  // page can be opened again
  const [markdownPage, setMarkdownPage] = useState<{ page: number } | null>(null)
  // The editor stays mounted once opened, so switching tabs keeps unsaved edits
  const [markdownOpened, setMarkdownOpened] = useState(false)
  useEffect(() => {
    if (tab === "markdown") setMarkdownOpened(true)
  }, [tab])

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

  const reparse = async () => {
    setParsing(true)
    try {
      const { attempt } = await api<{ attempt: AttemptRow }>(`/attempts/${attemptId}/parse`, { method: "POST" })
      const before = data?.attempt.parse_stats
      const after = attempt.parse_stats
      if (attempt.status === "failed") toast.error(attempt.error ?? "Parsing failed")
      else if (hasParseResults(after)) {
        const was = hasParseResults(before) ? ` (was ${before.topLevelNotes})` : ""
        toast.success(`Parsed: ${after.topLevelNotes} top-level notes${was}, ${after.warnings} warnings`, { duration: 6000 })
      }
      await load()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setParsing(false)
    }
  }

  if (!data) return <PageSpinner />

  const { attempt, revision } = data
  const stats = hasParseResults(attempt.parse_stats) ? attempt.parse_stats : null
  const items = attempt.change_record_items ?? []
  const chapter99Doc = data.documents.find((d) => d.kind === "ch99_pdf")
  const inCh99 = items.filter((i) => i.in_chapter_99).length
  const subchapterTitle = (groupKey: string) => data.notes?.subchapterTitles[groupKey.match(/^sub-([IVXLC]+)/)?.[1] ?? ""]

  const th = "px-4 py-2 text-left text-xs font-medium text-base-content/50"
  const td = "px-4 py-2.5 align-top"

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        crumbs={[{ label: "Overview", href: "/revision-checker" }, { label: revision.name }, { label: `Attempt ${attempt.attempt_number}` }]}
        title={
          <>
            <span className="font-mono">{revision.name}</span>
            <span className="font-normal text-base-content/45">Attempt {attempt.attempt_number}</span>
            <StatusBadge status={attempt.status} />
          </>
        }
        meta={attempt.parsed_at ? `Parsed ${formatTime(attempt.parsed_at)} with ${attempt.parser_version}` : "Not parsed yet"}
        actions={
          <div className="flex flex-wrap gap-1.5">
            <button className={btn.xsSecondary} disabled={parsing || !chapter99Doc?.markdown_path} onClick={reparse}>
              {parsing && <Spinner />}
              Re-parse
            </button>
            {data.links.map((l) => (
              <a key={l.label} className={btn.xsSecondary} href={l.url} target="_blank" rel="noreferrer">
                {l.label} <span className="text-base-content/40">↗</span>
              </a>
            ))}
          </div>
        }
      />

      {attempt.error && (
        <Callout tone="error" title="Attempt failed">
          <span className="whitespace-pre-wrap">{attempt.error}</span>
        </Callout>
      )}

      {stats && (
        <div className="flex flex-col gap-2">
          <StatGrid>
            <Stat label="Top-level notes" value={stats.topLevelNotes} />
            <Stat label="Subdivisions" value={stats.nodes.toLocaleString()} />
            <Stat label="Subchapters" value={stats.subchapters.length} />
            <Stat label="JSON headings" value={stats.htsRows ? stats.htsRowsWithCode.toLocaleString() : "—"} hint={stats.htsRows ? undefined : "No Chapter 99 JSON"} />
            <Stat
              label="Parse warnings"
              value={<span className={stats.warnings ? "text-warning" : ""}>{stats.warnings}</span>}
            />
          </StatGrid>
          <details className="group">
            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-base-content/50 hover:text-base-content/80 [&::-webkit-details-marker]:hidden">
              <span className="transition-transform group-open:rotate-90">›</span>
              By note group ({stats.groups.length})
            </summary>
            <div className="mt-2 overflow-x-auto rounded-lg border border-base-content/10 bg-base-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-base-content/10">
                    <th className={th}>Note group</th>
                    <th className={`${th} text-right`}>Top-level notes</th>
                    <th className={`${th} text-right`}>Subdivisions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/[0.07]">
                  {stats.groups.map((g) => (
                    <tr key={g.groupKey}>
                      <td className={td}>
                        {g.label}
                        {subchapterTitle(g.groupKey) && <span className="ml-2 text-xs text-base-content/45">{subchapterTitle(g.groupKey)}</span>}
                      </td>
                      <td className={`${td} text-right tabular-nums`}>{g.topLevelNotes}</td>
                      <td className={`${td} text-right tabular-nums`}>{g.nodes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      )}

      <Tabs
        value={tab}
        onChange={(v) => setTab(v as typeof tab)}
        tabs={[
          { value: "notes", label: "Notes", count: nodes.length },
          { value: "warnings", label: "Warnings", count: warnings.length, tone: "warning" },
          { value: "headings", label: "Headings" },
          { value: "change-record", label: "Change record", count: items.length },
          { value: "markdown", label: "Markdown" },
        ]}
      />

      {tab === "notes" &&
        (data.notes ? (
          <NotesBrowser notes={data.notes} warnings={warnings} focusKey={focusKey} />
        ) : (
          <div className="rounded-lg border border-dashed border-base-content/15">
            <EmptyState title="Not parsed yet">Notes appear here once the documents are converted and parsed.</EmptyState>
          </div>
        ))}

      {tab === "headings" && <HeadingsPanel attemptId={attemptId} />}

      {markdownOpened && chapter99Doc?.markdown_path && (
        <div className={tab === "markdown" ? "" : "hidden"}>
          <MarkdownEditor
            attemptId={attemptId}
            pageCount={chapter99Doc.page_count}
            visible={tab === "markdown"}
            openPage={markdownPage}
            onReparse={reparse}
          />
        </div>
      )}
      {tab === "markdown" && !chapter99Doc?.markdown_path && (
        <div className="rounded-lg border border-dashed border-base-content/15">
          <EmptyState title="Not converted yet">The Chapter 99 markdown appears here once datalab has converted the PDF.</EmptyState>
        </div>
      )}

      {tab === "warnings" && (
        <Panel
          title="Parse warnings"
          count={warnings.length}
          actions={
            warningKinds.length > 1 && (
              <select className={`${selectCls} select-xs h-8 min-h-8`} value={warningKind} onChange={(e) => setWarningKind(e.target.value)}>
                <option value="all">All kinds</option>
                {warningKinds.map((k) => (
                  <option key={k} value={k}>
                    {k.replace(/_/g, " ")} ({warnings.filter((w) => w.kind === k).length})
                  </option>
                ))}
              </select>
            )
          }
        >
          <div className="border-b border-base-content/10 px-4 py-2.5">
            <Help label="What warnings mean">
              Warnings point at places the parser had to guess: numbering gaps, citations kept as text, empty subdivisions. Check
              them against the PDF page before trusting a diff in that area.
            </Help>
          </div>
          {warnings.length === 0 ? (
            <EmptyState title="No parse warnings" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-base-content/10">
                    <th className={th}>Kind</th>
                    <th className={th}>Message</th>
                    <th className={th}>Where</th>
                    <th className={`${th} text-right`}>Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-content/[0.07]">
                  {warnings
                    .filter((w) => warningKind === "all" || w.kind === warningKind)
                    .map((w, i) => (
                      <tr key={i} className="hover:bg-base-content/[0.02]">
                        <td className={`${td} whitespace-nowrap`}>
                          <Pill tone="warning">{w.kind.replace(/_/g, " ")}</Pill>
                        </td>
                        <td className={`${td} text-base-content/80`}>{w.message}</td>
                        <td className={`${td} font-mono text-xs`}>
                          {w.key && (
                            <button
                              className="text-left underline decoration-base-content/30 underline-offset-2 hover:decoration-base-content"
                              onClick={() => {
                                setFocusKey(null)
                                setTimeout(() => setFocusKey(w.key!), 0)
                                setTab("notes")
                              }}
                            >
                              {w.key}
                            </button>
                          )}
                        </td>
                        <td className={`${td} text-right text-xs tabular-nums text-base-content/55`}>
                          {w.page && (
                            <button
                              className="underline decoration-base-content/30 underline-offset-2 hover:decoration-base-content"
                              title="Open this page's markdown"
                              onClick={() => {
                                setMarkdownPage({ page: w.page! })
                                setTab("markdown")
                              }}
                            >
                              {w.page}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      )}

      {tab === "change-record" && (
        <Panel
          title="Change record items"
          count={items.length}
          actions={
            <>
              {attempt.change_record_model && (
                <span className="text-xs text-base-content/45">
                  {attempt.change_record_model} <Dot /> {formatTime(attempt.change_record_extracted_at)}
                </span>
              )}
              <button className={btn.xsSecondary} disabled={extracting || !data.changeRecordMarkdown} onClick={reextract}>
                {extracting && <Spinner />}
                {items.length ? "Read again with Claude" : "Read with Claude"}
              </button>
            </>
          }
        >
          {items.length === 0 ? (
            <EmptyState title="Not read yet">Read automatically the first time this revision is compared.</EmptyState>
          ) : (
            <>
              <div className="border-b border-base-content/10 px-4 py-2 text-xs text-base-content/50">
                {inCh99} of {items.length} items are in Chapter 99. The rest are dimmed.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base-content/10">
                      <th className={th}>Item</th>
                      <th className={th}>Action</th>
                      <th className={th}>Description</th>
                      <th className={th}>Cites</th>
                      <th className={th}>Effective</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-content/[0.07]">
                    {items.map((item) => (
                      <tr key={item.id} className={item.in_chapter_99 ? "" : "text-base-content/40"}>
                        <td className={`${td} whitespace-nowrap font-mono text-xs`}>
                          {item.id}
                          {!item.in_chapter_99 && <div className="mt-0.5 font-sans text-[10px]">not ch. 99</div>}
                        </td>
                        <td className={td}>
                          <Pill tone={item.action === "added" ? "success" : item.action === "deleted" ? "error" : "neutral"}>{item.action}</Pill>
                        </td>
                        <td className={`${td} min-w-[16rem]`}>{item.description}</td>
                        <td className={`${td} max-w-xs break-words font-mono text-xs`}>
                          {[
                            item.subchapter && `sub ${item.subchapter}`,
                            ...item.note_citations.map((c) => `note ${c}`),
                            ...item.hts_codes,
                            ...item.hts_code_ranges.map((r) => `${r.from}–${r.to}`),
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </td>
                        <td className={`${td} whitespace-nowrap text-xs`}>{item.effective_date ?? ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {data.changeRecordMarkdown && (
            <details className="group border-t border-base-content/10">
              <summary className="flex cursor-pointer list-none items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-base-content/50 hover:text-base-content/80 [&::-webkit-details-marker]:hidden">
                <span className="transition-transform group-open:rotate-90">›</span>
                Change record markdown (from datalab)
              </summary>
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap border-t border-base-content/10 bg-base-content/[0.02] px-4 py-3 text-xs leading-relaxed">
                {data.changeRecordMarkdown}
              </pre>
            </details>
          )}
        </Panel>
      )}
    </div>
  )
}
