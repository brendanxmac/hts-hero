import { Palette } from "../brand"
import { display } from "../fonts"
import { Enter, Frame, Headline, pct, ProductLine, useLayout, useProgress } from "../kit"
import type { CountrySide, RankingProps } from "../types"

// The same product from several origins, highest tariff first: the highest rate red, the
// lowest green, the rest cobalt.

const Row = ({ row, i, min, max, p, u }: { row: CountrySide; i: number; min: number; max: number; p: Palette; u: number }) => {
  const t = useProgress(0.6 + i * 0.12, 1.1)
  // Ties share a color: every origin at the top rate is red, every one at the lowest green
  const color = min === max ? p.cobalt : row.ratePct === max ? p.red : row.ratePct === min ? p.green : p.cobalt
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 * u, flex: "1 0 auto", opacity: Math.min(1, t * 3) }}>
      <div style={{ width: 300 * u, display: "flex", alignItems: "center", gap: 14 * u, fontSize: 28 * u, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>
        <span style={{ fontSize: 40 * u }}>{row.country.flag}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{row.country.name}</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16 * u }}>
        <div
          style={{
            height: "62%",
            maxHeight: 56 * u,
            minHeight: 18 * u,
            width: `${Math.max((row.ratePct / Math.max(max, 1)) * 82 * t, 0.8)}%`,
            background: color,
            borderRadius: 999,
          }}
        />
        <span style={{ fontFamily: display, fontWeight: 700, fontSize: 34 * u, fontVariantNumeric: "tabular-nums" }}>{pct(row.ratePct * t)}</span>
      </div>
    </div>
  )
}

export const Ranking = (props: RankingProps) => {
  const { theme, headline, product, htsCode, rows } = props
  const { p, u, wide, tall } = useLayout(theme)
  const max = Math.max(...rows.map((r) => r.ratePct))
  const min = Math.min(...rows.map((r) => r.ratePct))
  return (
    <Frame theme={theme} kind="By country" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 36 * u, minHeight: 0, justifyContent: "safe center" }}>
        <Enter>
          <Headline text={headline} u={u} max={wide ? 50 : 64} color={p.text} />
          <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
        </Enter>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 * u, maxHeight: rows.length * (tall ? 150 : 110) * u }}>
          {rows.slice(0, wide ? 6 : 8).map((row, i) => (
            <Row key={row.country.code} row={row} i={i} min={min} max={max} p={p} u={u} />
          ))}
        </div>
      </div>
    </Frame>
  )
}
