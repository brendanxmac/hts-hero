"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { AUTHORITIES } from "@/libs/tariff-updates/types"
import type { DigestCandidate, DigestPicks } from "@/libs/email/news-producer"
import { Pill, Segmented, Spinner, btn, inputCls } from "../hts-revision-diff/ui"

// A weekly digest's updates, picked by hand: every recent update, ticked when the digest carries
// it. In by itself: a step this week or its effective date this week. Ticking one adds it for every
// reader whose laws and countries it matches; unticking takes it out for everyone. Each change
// makes the batch's messages again, so the previews below follow.

type Filter = "all" | "in" | "out"

const day = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })

const call = async <T,>(path: string, body?: unknown): Promise<T> => {
  const response = await fetch(path, {
    cache: "no-store",
    method: body ? "POST" : "GET",
    ...(body ? { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } } : {}),
  })
  const json = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(json.error ?? `Request failed (${response.status})`)
  return json as T
}

export default function DigestPicker({ batchId, editable, onChange }: { batchId: string; editable: boolean; onChange: () => Promise<unknown> }) {
  const [candidates, setCandidates] = useState<DigestCandidate[] | null>(null)
  const [picks, setPicks] = useState<DigestPicks>({ include: [], exclude: [] })
  const [busy, setBusy] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("all")
  const [search, setSearch] = useState("")

  // Keyed by the batch in the dashboard, so a new batch starts from nothing
  useEffect(() => {
    call<{ candidates: DigestCandidate[]; picks: DigestPicks; rebuilt: boolean }>(`/api/email-outbox/${batchId}/digest`)
      .then((r) => {
        setCandidates(r.candidates)
        setPicks(r.picks)
        // Made again under the current rules: the messages changed
        if (r.rebuilt) onChange()
      })
      .catch((e) => toast.error(e.message))
    // Once per batch: onChange is new every render
  }, [batchId])

  const save = useCallback(
    async (id: string, next: DigestPicks) => {
      setBusy(id)
      try {
        const r = await call<{ candidates: DigestCandidate[]; picks: DigestPicks }>(`/api/email-outbox/${batchId}/digest`, next)
        setCandidates(r.candidates)
        setPicks(r.picks)
        await onChange()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't change the digest")
      } finally {
        setBusy(null)
      }
    },
    [batchId, onChange]
  )

  const without = (list: string[], id: string) => list.filter((x) => x !== id)
  const toggle = (c: DigestCandidate) =>
    save(
      c.id,
      c.picked
        ? { include: without(picks.include, c.id), exclude: c.reasons.length ? [...without(picks.exclude, c.id), c.id] : without(picks.exclude, c.id) }
        : { include: c.reasons.length ? without(picks.include, c.id) : [...without(picks.include, c.id), c.id], exclude: without(picks.exclude, c.id) }
    )
  // In for some readers only (the ones following every step): send it to everyone it matches
  const toEveryone = (c: DigestCandidate) => save(c.id, { include: [...without(picks.include, c.id), c.id], exclude: without(picks.exclude, c.id) })

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (candidates ?? []).filter(
      (c) => (filter === "all" || (filter === "in") === c.picked) && (!q || c.title.toLowerCase().includes(q) || (AUTHORITIES[c.authority as keyof typeof AUTHORITIES] ?? "").toLowerCase().includes(q))
    )
  }, [candidates, filter, search])
  const inCount = (candidates ?? []).filter((c) => c.picked).length

  return (
    <div className="flex flex-col gap-3 border-t border-base-300 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Updates in this digest</h3>
          <p className="text-xs text-base-content/60">
            {candidates === null
              ? "Loading…"
              : `${inCount} of ${candidates.length} recent updates. In by itself: a step this week or taking effect this week.${editable ? " Tick or untick to change it for every reader." : ""}`}
          </p>
        </div>
        <input className={`${inputCls} input-sm w-56`} placeholder="Search updates…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All" },
            { value: "in", label: "In" },
            { value: "out", label: "Left out" },
          ]}
        />
      </div>
      {candidates === null ? (
        <div className="flex justify-center p-6">
          <Spinner />
        </div>
      ) : (
        <ul className="max-h-[26rem] overflow-y-auto rounded-xl border border-base-300">
          {shown.map((c) => {
            const added = picks.include.includes(c.id)
            const takenOut = picks.exclude.includes(c.id)
            return (
              <li key={c.id} className={`flex items-start gap-3 border-b border-base-300 px-4 py-3 last:border-b-0 ${c.picked ? "" : "bg-base-200/40"}`}>
                <span className="mt-0.5 flex w-5 shrink-0 justify-center">
                  {busy === c.id ? (
                    <Spinner />
                  ) : (
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary"
                      checked={c.picked}
                      disabled={!editable || !!busy}
                      onChange={() => toggle(c)}
                      aria-label={c.picked ? `Take out: ${c.title}` : `Add: ${c.title}`}
                    />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <a href={`/tariff-updates/${c.slug}`} target="_blank" rel="noreferrer" className={`text-sm font-medium hover:underline ${c.picked ? "" : "text-base-content/60"}`}>
                    {c.title} <span className="text-base-content/35">↗</span>
                  </a>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-base-content/60">
                    <span>{AUTHORITIES[c.authority as keyof typeof AUTHORITIES] ?? c.authority}</span>
                    {c.countries.length > 0 && <span>· {c.countries.includes("ALL") ? "All countries" : c.countries.join(", ")}</span>}
                    <span>· updated {day(c.lastActivityAt)}</span>
                    {c.reasons.map((r) => (
                      <Pill key={r} tone={r.startsWith("Takes effect") ? "warning" : "info"}>
                        {r}
                      </Pill>
                    ))}
                    {!c.reasons.length && <Pill>Nothing new this week</Pill>}
                    {added && <Pill tone="success">Added by you</Pill>}
                    {takenOut && <Pill tone="neutral">Taken out by you</Pill>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-xs text-base-content/60">
                  <span>{!c.matching ? "No reader follows this" : c.picked ? `${c.recipients} of ${c.matching} readers` : `${c.matching} matching readers`}</span>
                  {editable && c.picked && c.recipients < c.matching && (
                    <button
                      type="button"
                      className={btn.xsGhost}
                      disabled={!!busy}
                      title="Only readers who follow every step get it now; this sends it to every reader whose laws and countries it matches"
                      onClick={() => toEveryone(c)}
                    >
                      Send to all {c.matching}
                    </button>
                  )}
                </div>
              </li>
            )
          })}
          {!shown.length && <li className="px-4 py-6 text-center text-sm text-base-content/60">No updates here.</li>}
        </ul>
      )}
    </div>
  )
}
