import { Palette } from "../brand"
import { display } from "../fonts"
import { alpha, Enter, Frame, Headline, pct, ProductLine, useLayout, useProgress } from "../kit"
import type { CountrySide, RateSpreadProps } from "../types"

// Every origin of one product, grouped by the rate it pays: one row per rate, highest first, a
// bar for the rate and the flags of every origin that pays it. The highest rate is red, the
// lowest green.

const RateRow = ({ rate, group, i, min, max, p, u }: { rate: number; group: CountrySide[]; i: number; min: number; max: number; p: Palette; u: number }) => {
  const t = useProgress(0.6 + i * 0.15, 0.9)
  const color = rate === max ? p.red : rate === min ? p.green : p.cobalt
  const flag = 56 * u
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 * u, opacity: Math.min(1, t * 2) }}>
      <span style={{ fontFamily: display, fontWeight: 700, fontSize: 38 * u, color, width: 150 * u, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        {pct(rate)}
      </span>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 14 * u, minWidth: 0 }}>
        <div style={{ height: 16 * u, width: `${Math.max((rate / Math.max(max, 1)) * 38 * t, 1)}%`, background: color, borderRadius: 999, flexShrink: 0 }} />
        <div style={{ display: "flex", gap: 6 * u, flexWrap: "wrap" }}>
          {group.map((r) => (
            <span
              key={r.country.code}
              title={r.country.name}
              style={{
                width: flag,
                height: flag,
                borderRadius: 999,
                background: alpha(color, 0.16),
                border: `${3 * u}px solid ${alpha(color, 0.7)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "safe center",
                fontSize: flag * 0.55,
              }}
            >
              {r.country.flag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export const RateSpread = (props: RateSpreadProps) => {
  const { theme, headline, product, htsCode, rows } = props
  const { p, u, wide, tall } = useLayout(theme)
  const min = Math.min(...rows.map((r) => r.ratePct))
  const max = Math.max(...rows.map((r) => r.ratePct))
  const groups = new Map<number, CountrySide[]>()
  rows.forEach((r) => {
    const key = Math.round(r.ratePct * 10) / 10
    groups.set(key, [...(groups.get(key) ?? []), r])
  })
  const ordered = Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .slice(0, wide ? 4 : 8)
  return (
    <Frame theme={theme} kind="Rate spread" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 30 * u, minHeight: 0, justifyContent: "safe center" }}>
        <Enter>
          <Headline text={headline} u={u} max={wide ? 46 : 62} color={p.text} />
          <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
        </Enter>
        <Enter at={0.3}>
          <div style={{ fontSize: 24 * u, color: p.muted }}>
            {rows.length} countries that sell it to the US, by the tariff each pays today
          </div>
        </Enter>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", gap: 16 * u, minHeight: 0, maxHeight: ordered.length * (tall ? 170 : 130) * u }}>
          {ordered.map(([rate, group], i) => (
            <RateRow key={rate} rate={rate} group={group} i={i} min={min} max={max} p={p} u={u} />
          ))}
        </div>
      </div>
    </Frame>
  )
}
