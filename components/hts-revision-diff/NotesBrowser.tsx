"use client"

import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import type { NoteNode, ParsedNotes, ParseWarning } from "@/libs/hts-revision-diff/types"

const MAX_RESULTS = 200

// Normalizes what someone types as a citation: "note 2 (v)(iii)" -> "2(v)(iii)"
const citationQuery = (query: string) =>
  query
    .trim()
    .replace(/^(u\.?\s?s\.?\s+)?notes?\s*/i, "")
    .replace(/\s+/g, "")

const looksLikeCitation = (query: string) => /^\d{1,3}(\([A-Za-z0-9]{1,6}\)|\[\d+\])*$/.test(citationQuery(query))

const Highlight = ({ text, term }: { text: string; term: string }) => {
  if (!term) return <>{text}</>
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"))
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="rounded bg-warning/40 px-0.5 text-inherit">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  )
}

const snippet = (text: string, term: string, radius = 90) => {
  const at = text.toLowerCase().indexOf(term.toLowerCase())
  if (at < 0) return text.slice(0, radius * 2)
  const start = Math.max(0, at - radius)
  return `${start > 0 ? "…" : ""}${text.slice(start, at + term.length + radius)}${at + term.length + radius < text.length ? "…" : ""}`
}

interface Props {
  notes: ParsedNotes
  warnings: ParseWarning[]
  // A node to show, set from outside (e.g. clicking a warning)
  focusKey: string | null
}

export default function NotesBrowser({ notes, warnings, focusKey }: Props) {
  const { nodes, subchapterTitles } = notes

  const byKey = useMemo(() => new Map(nodes.map((n) => [n.key, n])), [nodes])
  const topOf = useMemo(() => {
    const cache = new Map<string, string>()
    return (key: string) => {
      if (cache.has(key)) return cache.get(key)!
      let node = byKey.get(key)
      while (node?.parentKey) node = byKey.get(node.parentKey)
      const top = node?.key ?? key
      cache.set(key, top)
      return top
    }
  }, [byKey])
  const tops = useMemo(() => nodes.filter((n) => !n.parentKey), [nodes])
  const descendants = useMemo(() => {
    const map = new Map<string, NoteNode[]>()
    for (const node of nodes) {
      const top = topOf(node.key)
      const list = map.get(top)
      if (list) list.push(node)
      else map.set(top, [node])
    }
    return map
  }, [nodes, topOf])
  const warningsByKey = useMemo(() => {
    const map = new Map<string, ParseWarning[]>()
    for (const w of warnings) if (w.key) map.set(w.key, [...(map.get(w.key) ?? []), w])
    return map
  }, [warnings])
  const warningCountByTop = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of warnings) if (w.key && byKey.has(w.key)) map.set(topOf(w.key), (map.get(topOf(w.key)) ?? 0) + 1)
    return map
  }, [warnings, byKey, topOf])

  const [selectedTop, setSelectedTop] = useState<string | null>(null)
  const [highlightKey, setHighlightKey] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [outlineFilter, setOutlineFilter] = useState("")
  const nodeRefs = useRef(new Map<string, HTMLDivElement>())

  const go = (key: string, highlight = true) => {
    const node = byKey.get(key)
    if (!node) return
    setSelectedTop(topOf(key))
    setHighlightKey(highlight && node.parentKey ? key : null)
    try {
      history.replaceState(null, "", `#${encodeURIComponent(key)}`)
    } catch {
      // ignore
    }
  }

  // Initial selection: from the URL hash, else the first note
  useEffect(() => {
    if (selectedTop || !tops.length) return
    const fromHash = decodeURIComponent(window.location.hash.slice(1))
    if (fromHash && byKey.has(fromHash)) go(fromHash)
    else setSelectedTop(tops[0].key)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tops])

  useEffect(() => {
    if (focusKey) go(focusKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey])

  // Scroll the highlighted node into view once its note is shown
  useEffect(() => {
    if (!highlightKey) return
    const el = nodeRefs.current.get(highlightKey)
    el?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [highlightKey, selectedTop])

  const topIndex = tops.findIndex((t) => t.key === selectedTop)
  const step = (delta: number) => {
    const next = tops[topIndex + delta]
    if (next) {
      go(next.key, false)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  // [ and ] move between notes (when not typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return
      if (e.key === "]") step(1)
      if (e.key === "[") step(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // Search: a citation ("20(gg)", "note 2(v)") jumps by citation; anything
  // else searches text, codes and keys
  const results = useMemo(() => {
    const q = query.trim()
    if (q.length < 2) return null
    if (looksLikeCitation(q)) {
      const c = citationQuery(q).toLowerCase()
      const matches = nodes.filter((n) => n.citation.toLowerCase() === c || n.citation.toLowerCase().startsWith(`${c}(`) || n.citation.toLowerCase().startsWith(`${c}[`))
      return { term: "", matches }
    }
    const term = q.toLowerCase()
    const matches = nodes.filter(
      (n) => n.text.toLowerCase().includes(term) || n.key.toLowerCase().includes(term) || n.htsCodes.some((c) => c.startsWith(q))
    )
    return { term: q, matches }
  }, [query, nodes])

  const outline = useMemo(() => {
    const f = outlineFilter.trim().toLowerCase()
    return tops.filter((t) => !f || t.citation.toLowerCase().startsWith(f) || t.text.toLowerCase().includes(f) || t.label.toLowerCase().includes(f))
  }, [tops, outlineFilter])

  const selected = selectedTop ? byKey.get(selectedTop) : null
  const shown = selectedTop ? (descendants.get(selectedTop) ?? []) : []
  const groupTitle = (node: NoteNode) => {
    const title = node.subchapter ? subchapterTitles[node.subchapter] : null
    return `${node.subchapter ? `Subchapter ${node.subchapter}` : "Chapter 99"}, ${node.group}${title ? `: ${title}` : ""}`
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      {/* Outline */}
      <aside className="flex min-w-0 flex-col gap-2 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)]">
        <input
          className="input input-sm input-bordered"
          placeholder="Filter notes"
          value={outlineFilter}
          onChange={(e) => setOutlineFilter(e.target.value)}
        />
        <nav className="max-h-80 overflow-y-auto rounded-lg border border-base-300 lg:max-h-none lg:flex-1">
          {outline.map((top, i) => {
            const newGroup = i === 0 || outline[i - 1].groupKey !== top.groupKey
            const count = descendants.get(top.key)?.length ?? 1
            const warningCount = warningCountByTop.get(top.key) ?? 0
            const deleted = top.text === "[Deleted]" && count === 1
            return (
              <Fragment key={top.key}>
                {newGroup && (
                  <div className="sticky top-0 z-10 border-b border-base-300 bg-base-200 px-3 py-1 text-xs font-semibold">
                    {groupTitle(top)}
                  </div>
                )}
                <button
                  className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-sm hover:bg-base-200 ${
                    top.key === selectedTop ? "bg-primary/15 font-semibold" : ""
                  } ${deleted ? "text-base-content/40" : ""}`}
                  onClick={() => go(top.key, false)}
                >
                  <span className="w-12 shrink-0 font-mono">{top.citation || "intro"}</span>
                  <span className="min-w-0 flex-1 truncate text-xs text-base-content/60">
                    {deleted ? "deleted" : top.text || descendants.get(top.key)?.[1]?.text || ""}
                  </span>
                  {warningCount > 0 && <span className="badge badge-warning badge-xs">{warningCount}</span>}
                  <span className="text-xs text-base-content/40">{count}</span>
                </button>
              </Fragment>
            )
          })}
        </nav>
      </aside>

      {/* Search and note */}
      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-col gap-1">
          <input
            className="input input-bordered"
            placeholder='Search: a citation like "20(gg)" or "note 2(v)(iii)", any text, or an HTS code'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {results && (
            <div className="rounded-lg border border-base-300">
              <div className="flex items-center justify-between border-b border-base-300 px-3 py-1 text-xs text-base-content/60">
                <span>
                  {results.matches.length} match{results.matches.length === 1 ? "" : "es"}
                  {results.matches.length > MAX_RESULTS ? `, first ${MAX_RESULTS} shown` : ""}
                </span>
                <button className="link" onClick={() => setQuery("")}>
                  Clear
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {results.matches.slice(0, MAX_RESULTS).map((n) => (
                  <button
                    key={n.key}
                    className="block w-full border-b border-base-200 px-3 py-1.5 text-left text-sm hover:bg-base-200"
                    onClick={() => go(n.key)}
                  >
                    <span className="font-mono font-semibold">
                      {n.citation || "(intro)"}
                      {n.key.match(/#\d+$/)?.[0]}
                    </span>
                    {n.page && <span className="ml-2 text-xs text-base-content/40">p.{n.page}</span>}
                    <span className="ml-2 text-base-content/70">
                      <Highlight text={snippet(n.text, results.term)} term={results.term} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {selected && (
          <div className="rounded-lg border border-base-300">
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-base-300 bg-base-100 px-4 py-2">
              <button className="btn btn-xs" disabled={topIndex <= 0} onClick={() => step(-1)} title="Previous note ([)">
                ← Prev
              </button>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{selected.label}</div>
                <div className="text-xs text-base-content/60">
                  {groupTitle(selected)} · {shown.length} subdivision{shown.length === 1 ? "" : "s"}
                  {selected.page ? ` · starts on PDF page ${selected.page}` : ""}
                </div>
              </div>
              <button className="btn btn-xs" disabled={topIndex >= tops.length - 1} onClick={() => step(1)} title="Next note (])">
                Next →
              </button>
            </div>
            <div className="divide-y divide-base-200">
              {shown.map((n) => {
                const nodeWarnings = warningsByKey.get(n.key) ?? []
                return (
                  <div
                    key={n.key}
                    ref={(el) => {
                      if (el) nodeRefs.current.set(n.key, el)
                      else nodeRefs.current.delete(n.key)
                    }}
                    className={`p-2 text-sm ${n.key === highlightKey ? "bg-warning/15 ring-2 ring-inset ring-warning" : ""}`}
                    style={{ paddingLeft: `${0.75 + (n.depth - selected.depth) * 1.25}rem` }}
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <button className="font-mono font-semibold hover:underline" onClick={() => go(n.key)}>
                        {n.citation || "(intro)"}
                        {/* Second of two items the PDF numbers alike */}
                        {n.key.match(/#\d+$/)?.[0]}
                      </button>
                      {n.page && <span className="text-xs text-base-content/40">p.{n.page}</span>}
                      {n.htsCodes.length > 0 && (
                        <span className="text-xs text-base-content/50" title={n.htsCodes.join(", ")}>
                          {n.htsCodes.length} code{n.htsCodes.length === 1 ? "" : "s"}
                        </span>
                      )}
                      {nodeWarnings.map((w, i) => (
                        <span key={i} className="badge badge-warning badge-sm" title={w.message}>
                          {w.kind.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                    <p className="whitespace-pre-wrap break-words text-base-content/80">
                      {n.text ? (
                        <Highlight text={n.text} term={results?.term ?? ""} />
                      ) : (
                        <em className="text-base-content/40">no text of its own</em>
                      )}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}
        <p className="text-xs text-base-content/50">
          Tip: press <kbd className="kbd kbd-xs">[</kbd> and <kbd className="kbd kbd-xs">]</kbd> to move between notes. The URL
          keeps the selected subdivision, so you can link to it.
        </p>
      </section>
    </div>
  )
}
