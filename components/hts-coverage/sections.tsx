"use client"

import { useEffect, useState } from "react"
import { CATEGORIES, CATEGORY_LABELS, PRIORITIES, STATUS_LABELS, STATUSES, type Category, type CoverageStatus, type Priority } from "@/libs/hts-coverage/constants"
import type { CitedNote, NoteSubtreeNode } from "@/libs/hts-coverage/server"
import type { CoverageItem, CoveragePatch } from "@/libs/hts-coverage/types"
import { describePeriod } from "@/tariffs/engine-v2/dates"
import type { Tariff } from "@/tariffs/engine-v2/types"
import { Callout, DefList, Field, Pill, SectionLabel, Segmented, Spinner, btn, inputCls, selectCls } from "../hts-revision-diff/ui"
import { coverageApi } from "./api"
import { formatDay, noteKeysOf, programFromNotes, resolvedProgram, type DashboardData } from "./derive"

// The pieces of a heading's detail: tracking fields, Claude's suggestion, the HTS text, the notes
// it cites, and what the engine has. Used by the dashboard's detail panel and the batch viewer.

export interface Detail {
  item: CoverageItem
  notesRevision: string | null
  notes: CitedNote[]
  records: Tariff[]
  references: { kind: string; id: string; label: string }[]
  examples: Tariff[]
  asOf: string
}

export const useHeadingDetail = (htsno: string) => {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    setDetail(null)
    setError(null)
    coverageApi<Detail>(`/items/${encodeURIComponent(htsno)}`)
      .then((d) => !cancelled && setDetail(d))
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [htsno])
  return { detail, error }
}

export const patchItems = async (htsnos: string[], patch: CoveragePatch) =>
  (await coverageApi<{ items: CoverageItem[] }>("/items", { method: "PATCH", body: JSON.stringify({ htsnos, patch }) })).items

// ---------- Note text ----------

const CODE = /^\d{4}\.\d{2}(?:\.\d{2,4})?(?:\.\d{2})?$/
const digits = (code: string) => code.replace(/\D/g, "")

type Block = { kind: "text"; text: string } | { kind: "codes"; codes: string[] } | { kind: "table"; rows: string[][] }

// Paragraphs, code lists and tables ("| a | b |" rows), as the calculator's referenced notes show them
const blocks = (text: string): Block[] => {
  const out: Block[] = []
  let rows: string[][] = []
  const flush = () => {
    if (!rows.length) return
    const cells = rows.flat().filter(Boolean)
    if (cells.length && cells.every((c) => CODE.test(c))) out.push({ kind: "codes", codes: cells })
    else out.push({ kind: "table", rows })
    rows = []
  }
  for (const raw of text.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    if (line.startsWith("|")) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue // markdown separator row
      rows.push(line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
      continue
    }
    flush()
    out.push({ kind: "text", text: line })
  }
  flush()
  return out
}

const NoteNodeText = ({ node, htsno }: { node: NoteSubtreeNode; htsno: string }) => (
  <div style={{ paddingLeft: `${node.depth * 14}px` }} className="flex flex-col gap-1.5">
    {blocks(node.text).map((b, i) =>
      b.kind === "text" ? (
        <p key={i} className="text-sm leading-relaxed text-base-content/85">
          {i === 0 && node.citation && <span className="mr-1.5 font-mono text-xs text-base-content/45">{node.citation}</span>}
          {b.text}
        </p>
      ) : b.kind === "codes" ? (
        <ul key={i} className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-1">
          {b.codes.map((code, j) => {
            const hit = digits(htsno).startsWith(digits(code)) || digits(code).startsWith(digits(htsno))
            return (
              <li
                key={`${code}-${j}`}
                className={`rounded px-1.5 py-0.5 font-mono text-[11px] ring-1 ring-inset ${
                  hit ? "bg-success/10 font-semibold text-success ring-success/30" : "bg-base-content/[0.03] text-base-content/70 ring-base-content/10"
                }`}
              >
                {code}
              </li>
            )
          })}
        </ul>
      ) : (
        <div key={i} className="overflow-x-auto rounded-md border border-base-content/10">
          <table className="w-full text-xs">
            <tbody>
              {b.rows.map((row, r) => (
                <tr key={r} className={r ? "border-t border-base-content/10" : "bg-base-content/[0.04] font-medium"}>
                  {row.map((cell, c) => (
                    <td key={c} className="px-2 py-1 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )}
  </div>
)

const CitedNoteView = ({ note, htsno }: { note: CitedNote; htsno: string }) => {
  const [open, setOpen] = useState(true)
  const partial = note.foundKey && note.foundKey !== note.key
  return (
    <div className="rounded-lg border border-base-content/10">
      <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium" onClick={() => setOpen((o) => !o)}>
        <span className={`text-base-content/40 transition-transform ${open ? "rotate-90" : ""}`}>›</span>
        {note.label}
        {partial && <Pill tone="warning">showing {note.foundKey!.split("/").pop()}</Pill>}
        {!note.foundKey && <Pill tone="error">not found</Pill>}
        <span className="ml-auto text-xs font-normal text-base-content/40">{note.nodes.length > 1 ? `${note.nodes.length} subdivisions` : ""}</span>
      </button>
      {open && note.nodes.length > 0 && (
        <div className="flex max-h-[28rem] flex-col gap-2.5 overflow-y-auto border-t border-base-content/10 px-3 py-2.5">
          {note.nodes.map((n, i) => (
            <NoteNodeText key={i} node={n} htsno={htsno} />
          ))}
        </div>
      )}
    </div>
  )
}

// ---------- Engine records ----------

const RecordView = ({ record, asOf }: { record: Tariff; asOf: string }) => {
  const active = (!record.effective.from || record.effective.from <= asOf) && (!record.effective.to || asOf < record.effective.to)
  return (
    <details className="group rounded-lg border border-base-content/10">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-2 px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
        <span className="text-base-content/40 transition-transform group-open:rotate-90">›</span>
        <span className="font-mono text-xs">{record.code}</span>
        <span className="font-medium">{record.name}</span>
        <Pill>{record.program}</Pill>
        <span className="text-xs text-base-content/50">{describePeriod(record.effective)}</span>
        {active && <Pill tone="success">in effect</Pill>}
        {record.source?.revision && <span className="ml-auto text-xs text-base-content/40">{record.source.revision}</span>}
      </summary>
      <pre className="max-h-80 overflow-auto border-t border-base-content/10 bg-base-content/[0.02] px-3 py-2 font-mono text-[11px] leading-relaxed">
        {JSON.stringify(record, null, 2)}
      </pre>
    </details>
  )
}


// ---------- Sections ----------

const programNameIn = (data: DashboardData) => (id: string | null) => (id ? data.programs.find((p) => p.id === id)?.name ?? id : "—")

export const TrackingFields = ({
  item,
  data,
  onPatched,
  compact,
}: {
  item: CoverageItem
  data: DashboardData
  onPatched: (items: CoverageItem[]) => void
  compact?: boolean
}) => {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState(item.notes ?? "")
  const [statusNote, setStatusNote] = useState(item.status_note ?? "")
  useEffect(() => {
    setNotes(item.notes ?? "")
    setStatusNote(item.status_note ?? "")
  }, [item.htsno]) // eslint-disable-line react-hooks/exhaustive-deps

  const patch = async (p: CoveragePatch) => {
    setSaving(true)
    setError(null)
    try {
      onPatched(await patchItems([item.htsno], p))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }
  const programName = programNameIn(data)
  const fromNotes = programFromNotes(item, data.notePrograms)
  const suggestedCategory = item.claude_suggestion?.category ?? item.category_suggested

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel right={saving && <Spinner />}>Tracking</SectionLabel>
      {error && <Callout tone="error">{error}</Callout>}
      <div className={`grid gap-3 ${compact ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}>
        <Field label="Status">
          <select className={selectCls} value={item.status} onChange={(e) => patch({ status: e.target.value as CoverageStatus })}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "open" ? "In effect" : STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <Segmented
            options={[{ value: "", label: "—" }, ...PRIORITIES.map((p) => ({ value: p, label: p }))]}
            value={item.priority ?? ""}
            onChange={(v) => patch({ priority: (v || null) as Priority | null })}
          />
        </Field>
        <Field label="Category">
          <select className={selectCls} value={item.category ?? ""} onChange={(e) => patch({ category: (e.target.value || null) as Category | null })}>
            <option value="">{suggestedCategory ? `Suggested (${CATEGORY_LABELS[suggestedCategory]})` : "—"}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Program"
          hint={
            compact || item.program
              ? undefined
              : item.engine_programs.length
                ? "From the engine records"
                : fromNotes
                  ? `From its notes: ${programName(fromNotes)}`
                  : item.claude_suggestion?.program
                    ? "Suggested by Claude"
                    : "Not mapped from its notes"
          }
        >
          <select className={selectCls} value={item.program ?? ""} onChange={(e) => patch({ program: e.target.value || null })}>
            <option value="">{`Automatic (${programName(resolvedProgram({ ...item, program: null }, data.notePrograms))})`}</option>
            {data.programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        {!compact && (
          <>
            <Field label="Status note" className="sm:col-span-2">
              <input
                className={inputCls}
                value={statusNote}
                placeholder="e.g. Terminated (See 90 Fed. Reg. 44638)"
                onChange={(e) => setStatusNote(e.target.value)}
                onBlur={() => statusNote !== (item.status_note ?? "") && patch({ status_note: statusNote })}
              />
            </Field>
            <Field label="Notes" className="sm:col-span-2">
              <textarea
                className="textarea textarea-bordered textarea-sm min-h-20 border-base-content/15 bg-base-100 text-sm"
                value={notes}
                placeholder="Anything to remember about this heading"
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => notes !== (item.notes ?? "") && patch({ notes })}
              />
            </Field>
          </>
        )}
      </div>
    </section>
  )
}

const COMPLEXITY_TONE = { low: "success", medium: "warning", high: "error" } as const

export const SuggestionCard = ({
  item,
  data,
  onPatched,
}: {
  item: CoverageItem
  data: DashboardData
  onPatched: (items: CoverageItem[]) => void
}) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const s = item.claude_suggestion
  const suggest = async () => {
    setBusy(true)
    setError(null)
    try {
      const { items } = await coverageApi<{ items: CoverageItem[] }>("/suggest", { method: "POST", body: JSON.stringify({ htsnos: [item.htsno] }) })
      onPatched(items)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const programName = programNameIn(data)
  return (
    <section className="flex flex-col gap-2.5">
      <SectionLabel
        right={
          <button className={btn.xsSecondary} onClick={suggest} disabled={busy || !!data.pendingMigration}>
            {busy && <Spinner />}
            {s ? "Ask again" : "Suggest with Claude"}
          </button>
        }
      >
        Claude&apos;s read
      </SectionLabel>
      {error && <Callout tone="error">{error}</Callout>}
      {s ? (
        <div className="flex flex-col gap-2 rounded-lg border border-base-content/10 bg-base-content/[0.02] px-3.5 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <Pill>{CATEGORY_LABELS[s.category]}</Pill>
            {s.program ? <Pill>{programName(s.program)}</Pill> : s.new_program && <Pill tone="warning">New program: {s.new_program}</Pill>}
            <Pill tone={COMPLEXITY_TONE[s.complexity]}>{s.complexity} complexity</Pill>
            <span className="ml-auto text-[11px] text-base-content/40">
              {s.model}
              {s.usage ? ` · ~$${s.usage.cost_usd.toFixed(3)}` : ""}
            </span>
          </div>
          <p className="leading-relaxed">{s.summary}</p>
          <p className="leading-relaxed text-base-content/70">{s.modeling}</p>
        </div>
      ) : (
        <p className="text-sm text-base-content/50">No suggestion yet. Claude reads the heading and its notes and suggests a category, program and what modeling it takes.</p>
      )}
    </section>
  )
}

export const HtsSection = ({ item }: { item: CoverageItem }) => (
  <section className="flex flex-col gap-3">
    <SectionLabel right={item.last_seen_revision && <span className="text-xs text-base-content/40">{item.last_seen_revision}</span>}>HTS</SectionLabel>
    <p className="text-sm leading-relaxed">{item.description || <span className="text-base-content/40">(no description)</span>}</p>
    <DefList
      items={[
        { label: "General", value: item.general || "—" },
        { label: "Special", value: item.special || "—" },
        { label: "Column 2", value: item.other || "—" },
        ...(item.starts_on ? [{ label: "Starts", value: formatDay(item.starts_on) }] : []),
        ...(item.footnotes.length ? [{ label: "Footnotes", value: item.footnotes.join(" · ") }] : []),
      ]}
    />
  </section>
)

export const NotesSection = ({
  item,
  detail,
  error,
  data,
  onNoteProgram,
}: {
  item: CoverageItem
  detail: Detail | null
  error: string | null
  data: DashboardData
  onNoteProgram?: (noteKey: string, program: string | null) => Promise<void>
}) => {
  const programName = programNameIn(data)
  return (
    <section className="flex flex-col gap-3">
      <SectionLabel right={detail?.notesRevision && <span className="text-xs text-base-content/40">from {detail.notesRevision}</span>}>Cited notes</SectionLabel>
      {!item.note_citations.length ? (
        <p className="text-sm text-base-content/50">The description doesn&apos;t cite a U.S. note.</p>
      ) : !detail ? (
        !error && <Spinner />
      ) : (
        <>
          {item.subchapter !== "9903" && (
            <Callout>Only subchapter III notes are parsed by the revision checker, so notes for {item.subchapter} headings may not be found.</Callout>
          )}
          {!detail.notesRevision && <Callout tone="warning">No revision in the revision checker has parsed notes yet.</Callout>}
          {detail.notes.map((n) => (
            <CitedNoteView key={n.key} note={n} htsno={item.htsno} />
          ))}
          {onNoteProgram &&
            noteKeysOf(item).map((key) => (
              <div key={key} className="flex flex-wrap items-center gap-2 text-xs text-base-content/60">
                <span>
                  Program for every heading citing note <span className="font-mono">{key}</span>:
                </span>
                <select
                  className={`${selectCls} select-xs`}
                  value={data.notePrograms.overrides[key] ?? ""}
                  onChange={(e) => onNoteProgram(key, e.target.value || null)}
                >
                  <option value="">{data.notePrograms.suggested[key] ? `Suggested (${programName(data.notePrograms.suggested[key])})` : "Not mapped"}</option>
                  {data.programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
        </>
      )}
    </section>
  )
}

export const EngineSection = ({ detail, error }: { detail: Detail | null; error: string | null }) => (
  <>
    <section className="flex flex-col gap-3">
      <SectionLabel>In the engine</SectionLabel>
      {!detail ? (
        !error && <Spinner />
      ) : (
        <>
          {detail.records.length ? (
            detail.records.map((r, i) => <RecordView key={i} record={r} asOf={detail.asOf} />)
          ) : (
            <p className="text-sm text-base-content/50">No tariff record for this heading.</p>
          )}
          {detail.references.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="text-xs font-medium text-base-content/50">Named elsewhere</div>
              <ul className="flex flex-col gap-1 text-sm">
                {detail.references.map((r) => (
                  <li key={`${r.kind}:${r.id}`} className="flex items-baseline gap-2">
                    <Pill>{r.kind}</Pill>
                    <span className="font-mono text-xs">{r.id}</span>
                    <span className="truncate text-base-content/70">{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
    {detail && !detail.records.length && detail.examples.length > 0 && (
      <section className="flex flex-col gap-3">
        <SectionLabel>Modeled examples nearby</SectionLabel>
        <p className="text-xs text-base-content/50">The closest modeled headings: same heading group, else the same U.S. note.</p>
        {detail.examples.map((r, i) => (
          <RecordView key={i} record={r} asOf={detail.asOf} />
        ))}
      </section>
    )}
  </>
)
