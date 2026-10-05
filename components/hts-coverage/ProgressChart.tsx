"use client"

import { useMemo, useRef, useState } from "react"
import type { CoverageSnapshot } from "@/libs/hts-coverage/types"

// Coverage (modeled ÷ in effect) at each refresh. One series, so no legend: the panel title names
// it. Hover anywhere for the nearest snapshot.

const W = 640
const H = 160
const PAD = { top: 12, right: 12, bottom: 22, left: 36 }

const pct = (s: CoverageSnapshot) => (s.counts.inEffect ? (100 * s.counts.modeled) / s.counts.inEffect : 0)
const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" })

export default function ProgressChart({ snapshots }: { snapshots: CoverageSnapshot[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const { points, yMax } = useMemo(() => {
    const values = snapshots.map(pct)
    // Round the top up to the next 10% so the line has headroom
    const yMax = Math.min(100, Math.max(10, Math.ceil((Math.max(...values, 0) + 5) / 10) * 10))
    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top - PAD.bottom
    const points = snapshots.map((s, i) => ({
      x: PAD.left + (snapshots.length === 1 ? innerW / 2 : (i / (snapshots.length - 1)) * innerW),
      y: PAD.top + innerH - (pct(s) / yMax) * innerH,
      snapshot: s,
    }))
    return { points, yMax }
  }, [snapshots])

  if (!snapshots.length) {
    return <p className="px-4 py-6 text-sm text-base-content/50">Each refresh adds a point here.</p>
  }

  const ticks = [0, yMax / 2, yMax]
  const yOf = (v: number) => PAD.top + (H - PAD.top - PAD.bottom) * (1 - v / yMax)
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const active = hover !== null ? points[hover] : null

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * W
    let best = 0
    points.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(points[best].x - x)) best = i
    })
    setHover(best)
  }

  return (
    <div className="relative px-2 pb-2 pt-1">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-none select-none"
        role="img"
        aria-label={`Coverage at each refresh, latest ${pct(snapshots[snapshots.length - 1]).toFixed(1)}%`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={yOf(t)} y2={yOf(t)} className="stroke-base-content/10" strokeWidth={1} />
            <text x={PAD.left - 6} y={yOf(t) + 3} textAnchor="end" className="fill-base-content/45 text-[10px] tabular-nums">
              {t}%
            </text>
          </g>
        ))}
        <text x={PAD.left} y={H - 6} className="fill-base-content/45 text-[10px]">
          {shortDate(snapshots[0].created_at)}
        </text>
        {snapshots.length > 1 && (
          <text x={W - PAD.right} y={H - 6} textAnchor="end" className="fill-base-content/45 text-[10px]">
            {shortDate(snapshots[snapshots.length - 1].created_at)}
          </text>
        )}
        {active && <line x1={active.x} x2={active.x} y1={PAD.top} y2={H - PAD.bottom} className="stroke-base-content/25" strokeWidth={1} />}
        <path d={path} fill="none" className="stroke-base-content/70" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle
            key={p.snapshot.id}
            cx={p.x}
            cy={p.y}
            r={hover === i ? 5 : 4}
            className="fill-base-content/70 stroke-base-100"
            strokeWidth={2}
          />
        ))}
      </svg>
      {active && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 whitespace-nowrap rounded-md border border-base-content/10 bg-base-100 px-2.5 py-1.5 text-xs shadow-md"
          style={{ left: `${(active.x / W) * 100}%` }}
        >
          <div className="font-medium">{new Date(active.snapshot.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</div>
          <div className="tabular-nums text-base-content/70">
            {pct(active.snapshot).toFixed(1)}% · {active.snapshot.counts.modeled} of {active.snapshot.counts.inEffect} modeled
          </div>
          <div className="tabular-nums text-base-content/50">
            {active.snapshot.counts.missing} missing{active.snapshot.revision ? ` · ${active.snapshot.revision}` : ""}
          </div>
        </div>
      )}
    </div>
  )
}
