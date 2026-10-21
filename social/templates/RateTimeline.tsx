import { scaleLinear, scaleUtc } from "d3-scale"
import { toneColor } from "../brand"
import { display, sans } from "../fonts"
import { alpha, Chip, Enter, Frame, Headline, pct, ProductLine, shortDate, signedPct, useLayout, useProgress } from "../kit"
import type { RateTimelineProps } from "../types"
import { useSize } from "../useSize"

// One product from one country: its tariff over the verified data, drawn as steps (rates jump,
// they never slide). The line draws itself left to right while the big number ticks through
// each rate it passes; the changes that moved it pop up as pills.

const time = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime()

export const RateTimeline = (props: RateTimelineProps) => {
  const { theme, headline, product, htsCode, country, points, end, events } = props
  const { p, u, wide, tall } = useLayout(theme)
  const draw = useProgress(0.6, 4.4, "even")
  const chart = useSize<HTMLDivElement>()

  const t0 = time(points[0].from)
  const t1 = time(end)
  const revealAt = t0 + (t1 - t0) * draw
  const current = [...points].reverse().find((pt) => time(pt.from) <= revealAt) ?? points[0]
  const first = points[0].pct
  const last = points[points.length - 1].pct
  const peak = Math.max(...points.map((pt) => pt.pct))
  const delta = current.pct - first

  const number = (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 24 * u, flexWrap: "wrap" }}>
      <div>
        <div style={{ fontSize: 22 * u, fontWeight: 700, letterSpacing: 2 * u, textTransform: "uppercase", color: p.muted }}>
          {country.flag} {country.name} · {draw < 1 ? shortDate(current.from) : "today"}
        </div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 112 : tall ? 200 : 168) * u, lineHeight: 1, letterSpacing: -6 * u, color: p.text }}>
          {pct(current.pct)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", flexWrap: "wrap", alignItems: "flex-start", gap: 10 * u, paddingBottom: 18 * u }}>
        {delta !== 0 && (
          <Chip tone={delta > 0 ? "up" : "down"} p={p} size={24 * u}>
            {signedPct(delta)} since {shortDate(points[0].from)}
          </Chip>
        )}
        {peak > last && draw === 1 && (
          <Chip tone="heads-up" p={p} size={24 * u}>
            Peaked at {pct(peak)}
          </Chip>
        )}
      </div>
    </div>
  )

  // The plot, in the box the layout leaves for it
  const { width: W, height: H } = chart
  const left = 64 * u
  const right = 24 * u
  const x = scaleUtc().domain([t0, t1]).range([left, W - right])
  // Event pills sit in lanes above the plot; each takes the first lane it doesn't overlap
  const pillW = (label: string) => label.length * 12.5 * u + 36 * u
  const laneEnds: number[] = []
  const placed = events.map((event) => {
    const width = pillW(event.label)
    const ex = x(time(event.date))
    const px = Math.min(Math.max(ex - width / 2, left), W - right - width)
    let lane = laneEnds.findIndex((end) => end + 10 * u <= px)
    if (lane === -1) lane = laneEnds.length
    laneEnds[lane] = px + width
    return { event, ex, px, width, lane }
  })
  const top = (Math.max(laneEnds.length, 1) * 52 + 40) * u
  const bottom = 48 * u
  const y = scaleLinear()
    .domain([0, Math.max(peak * 1.1, 10)])
    .nice(4)
    .range([H - bottom, top])
  const steps = points.map((pt, i) => ({ x0: x(time(pt.from)), x1: x(i < points.length - 1 ? time(points[i + 1].from) : t1), y: y(pt.pct) }))
  const line = steps.map((s, i) => `${i ? "L" : "M"}${s.x0},${s.y}H${s.x1}`).join("")
  const area = `${line}V${y(0)}H${steps[0].x0}Z`
  const clipW = left + (W - right - left) * draw
  const endStep = steps.find((s) => s.x0 <= clipW && clipW <= s.x1) ?? steps[steps.length - 1]
  const gradientId = `fade-${theme}`

  return (
    <Frame theme={theme} kind="Rate history" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: wide ? "row" : "column", gap: 40 * u, minHeight: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: (wide ? 20 : 28) * u, width: wide ? "44%" : undefined, justifyContent: wide ? "center" : undefined }}>
          <Enter>
            <Headline text={headline} u={u} max={wide ? 40 : 66} color={p.text} />
            <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
          </Enter>
          <Enter at={0.3}>{number}</Enter>
        </div>
        <div ref={chart.ref} style={{ flex: 1, position: "relative", minHeight: 0 }}>
          {W > 0 && (
            <svg width={W} height={H} fontFamily={sans} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={p.cobalt} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={p.cobalt} stopOpacity={0} />
                </linearGradient>
                <clipPath id={`clip-${theme}`}>
                  <rect x={0} y={0} width={clipW} height={H} />
                </clipPath>
              </defs>
              {y.ticks(4).map((tick) => (
                <text key={tick} x={left - 14 * u} y={y(tick)} textAnchor="end" dominantBaseline="middle" fontSize={20 * u} fill={p.muted}>
                  {tick}%
                </text>
              ))}
              <line x1={left} x2={W - right} y1={y(0)} y2={y(0)} stroke={p.border} strokeWidth={2 * u} />
              <g clipPath={`url(#clip-${theme})`}>
                <path d={area} fill={`url(#${gradientId})`} />
                <path d={line} fill="none" stroke={p.cobalt} strokeWidth={7 * u} strokeLinejoin="round" strokeLinecap="round" />
              </g>
              <circle cx={Math.min(clipW, W - right)} cy={endStep.y} r={14 * u} fill={p.cobalt} stroke={p.ground} strokeWidth={5 * u} />
              {placed.map(({ event, ex, px, width, lane }, i) => {
                if (ex > clipW) return null
                const py = lane * 52 * u
                const color = toneColor(p, event.tone)
                const stepY = steps.find((s) => s.x0 <= ex + 0.5 && ex - 0.5 <= s.x1)?.y ?? y(0)
                return (
                  <g key={`${event.date}-${i}`}>
                    <line x1={ex} x2={ex} y1={py + 40 * u} y2={stepY} stroke={alpha(color, 0.5)} strokeWidth={2 * u} strokeDasharray={`${6 * u} ${6 * u}`} />
                    <rect x={px} y={py} width={width} height={40 * u} rx={20 * u} fill={alpha(color, 0.16)} />
                    <text x={px + width / 2} y={py + 21 * u} textAnchor="middle" dominantBaseline="middle" fontSize={20 * u} fontWeight={700} fill={color}>
                      {event.label}
                    </text>
                  </g>
                )
              })}
              <text x={left} y={H - 8 * u} fontSize={20 * u} fill={p.muted}>
                {shortDate(points[0].from)}
              </text>
              <text x={W - right} y={H - 8 * u} textAnchor="end" fontSize={20 * u} fill={p.muted}>
                {shortDate(end)}
              </text>
            </svg>
          )}
        </div>
      </div>
    </Frame>
  )
}
