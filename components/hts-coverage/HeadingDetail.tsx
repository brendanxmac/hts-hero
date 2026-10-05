"use client"

import Link from "next/link"
import { useEffect } from "react"
import { STATUS_LABELS } from "@/libs/hts-coverage/constants"
import type { CoverageItem } from "@/libs/hts-coverage/types"
import { Callout, Kbd, Pill, btn } from "../hts-revision-diff/ui"
import { displayStatus, STATUS_TONES, type DashboardData } from "./derive"
import { EngineSection, HtsSection, NotesSection, SuggestionCard, TrackingFields, useHeadingDetail } from "./sections"

// The dashboard's side panel for one heading
export default function HeadingDetail({
  htsno,
  data,
  position,
  onClose,
  onMove,
  onPatched,
  onNoteProgram,
}: {
  htsno: string
  data: DashboardData
  position: { index: number; total: number }
  onClose: () => void
  onMove: (delta: number) => void
  onPatched: (items: CoverageItem[]) => void
  onNoteProgram: (noteKey: string, program: string | null) => Promise<void>
}) {
  const { detail, error } = useHeadingDetail(htsno)
  const item = data.items.find((i) => i.htsno === htsno) ?? detail?.item

  // j/k or arrows move, Esc closes, unless typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return
      if (e.key === "Escape") onClose()
      if (e.key === "j" || e.key === "ArrowDown") (e.preventDefault(), onMove(1))
      if (e.key === "k" || e.key === "ArrowUp") (e.preventDefault(), onMove(-1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, onMove])

  if (!item) return null
  const membership = data.memberships[htsno]
  const status = displayStatus(item, membership)

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-3xl flex-col border-l border-base-content/10 bg-base-100 shadow-2xl">
      <header className="flex flex-wrap items-center gap-2 border-b border-base-content/10 px-5 py-3">
        <h2 className="font-mono text-base font-semibold">{item.htsno}</h2>
        <Pill tone={STATUS_TONES[status]}>{STATUS_LABELS[status]}</Pill>
        {membership && (
          <Link href={`/coverage-checker/batches/${membership.batch_id}`} className="text-xs text-base-content/60 underline-offset-2 hover:underline">
            in {membership.title}
          </Link>
        )}
        {item.engine_referenced && !item.engine_modeled && <Pill tone="info">referenced in engine</Pill>}
        {!item.in_hts && <Pill tone="error">no longer in the HTS</Pill>}
        <div className="ml-auto flex items-center gap-1.5 text-xs text-base-content/50">
          <span className="tabular-nums">
            {position.index + 1} / {position.total}
          </span>
          <button className={btn.xsGhost} onClick={() => onMove(-1)} title="Previous (k)">
            <Kbd>k</Kbd>
          </button>
          <button className={btn.xsGhost} onClick={() => onMove(1)} title="Next (j)">
            <Kbd>j</Kbd>
          </button>
          <button className="btn btn-circle btn-ghost btn-sm" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-4">
        {error && <Callout tone="error">{error}</Callout>}
        <TrackingFields item={item} data={data} onPatched={onPatched} />
        <SuggestionCard item={item} data={data} onPatched={onPatched} />
        <HtsSection item={item} />
        <NotesSection item={item} detail={detail} error={error} data={data} onNoteProgram={onNoteProgram} />
        <EngineSection detail={detail} error={error} />
      </div>
    </aside>
  )
}
