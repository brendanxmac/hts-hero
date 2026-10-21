import { Palette } from "../brand"
import { display } from "../fonts"
import { alpha, change, Chip, Enter, Frame, Headline, pct, ProductLine, useLayout, useProgress, usd } from "../kit"
import type { TradeShiftProps } from "../types"

// Where the US bought a product, last year against the year before, with the tariff each
// origin pays today. Census figures are shown as published; the post shows a pattern, it
// doesn't claim the tariff caused it.

type Row = TradeShiftProps["rows"][number]

const ShiftRow = ({ row, i, max, p, u, prior, year }: { row: Row; i: number; max: number; p: Palette; u: number; prior: number; year: number }) => {
  const t = useProgress(0.6 + i * 0.15, 1.2)
  const growth = row.priorValue > 0 ? ((row.importValue - row.priorValue) / row.priorValue) * 100 : Infinity
  const bar = (value: number, color: string, label: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 * u }}>
      <div style={{ height: 26 * u, width: `${Math.max((value / max) * 70 * t, 0.6)}%`, background: color, borderRadius: 999 }} />
      <span style={{ fontSize: 24 * u, color: p.muted, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
        {label} {usd(value)}
      </span>
    </div>
  )
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 * u, flex: "1 0 auto", opacity: Math.min(1, t * 3) }}>
      <div style={{ width: 250 * u, display: "flex", alignItems: "center", gap: 12 * u, fontSize: 30 * u, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>
        <span style={{ fontSize: 38 * u }}>{row.country.flag}</span>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{row.country.name}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 * u }}>
        {bar(row.priorValue, p.slate, String(prior))}
        {bar(row.importValue, p.cobalt, String(year))}
      </div>
      <div style={{ width: 230 * u, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 * u }}>
        <Chip tone={growth >= 0 ? "brand" : "heads-up"} p={p} size={26 * u}>
          {Number.isFinite(growth) ? change(growth) : "New"}
        </Chip>
        <span style={{ fontSize: 24 * u, color: p.muted, whiteSpace: "nowrap" }}>
          tariff <b style={{ color: p.text }}>{pct(row.ratePct)}</b>
        </span>
      </div>
    </div>
  )
}

export const TradeShift = (props: TradeShiftProps) => {
  const { theme, headline, product, htsCode, rows, year, prior } = props
  const { p, u, wide, tall } = useLayout(theme)
  const max = Math.max(...rows.flatMap((r) => [r.importValue, r.priorValue]), 1)
  return (
    <Frame theme={theme} kind="Trade shift" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 * u, minHeight: 0, justifyContent: "safe center" }}>
        <Enter>
          <Headline text={headline} u={u} max={wide ? 50 : 62} color={p.text} />
          <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
        </Enter>
        <Enter at={0.3}>
          <div style={{ display: "flex", gap: 28 * u, fontSize: 22 * u, color: p.muted, alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 10 * u }}>
              <span style={{ width: 18 * u, height: 18 * u, borderRadius: 999, background: p.slate }} /> US imports {prior}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 10 * u }}>
              <span style={{ width: 18 * u, height: 18 * u, borderRadius: 999, background: p.cobalt }} /> US imports {year}
            </span>
          </div>
        </Enter>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 * u, maxHeight: rows.length * (tall ? 210 : 150) * u }}>
          {rows.slice(0, wide ? 4 : 6).map((row, i) => (
            <ShiftRow key={row.country.code} row={row} i={i} max={max} p={p} u={u} prior={prior} year={year} />
          ))}
        </div>
        <div style={{ fontFamily: display, fontSize: 18 * u, color: alpha(p.muted, 0.9) }}>Census general imports, customs value. Tariffs are today&apos;s rates.</div>
      </div>
    </Frame>
  )
}
