import { Palette, toneColor } from "../brand"
import { display } from "../fonts"
import { Enter, Frame, Headline, useLayout, useProgress } from "../kit"
import type { TopListProps } from "../types"

// Any ranked list, numbered: the highest base rates in the HTS, the fastest-growing suppliers,
// a country's biggest products. Each row's bar shows its share of the top value.

type Row = TopListProps["rows"][number]

const ListRow = ({ row, i, p, u }: { row: Row; i: number; p: Palette; u: number }) => {
  const t = useProgress(0.6 + i * 0.12, 1)
  const color = toneColor(p, row.tone ?? "brand")
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 * u, flex: "1 0 auto", opacity: Math.min(1, t * 2.5) }}>
      <span style={{ fontFamily: display, fontWeight: 700, fontSize: 30 * u, color: p.muted, width: 44 * u, textAlign: "right" }}>{i + 1}</span>
      {row.flag && <span style={{ fontSize: 40 * u }}>{row.flag}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 * u }}>
          <span style={{ fontSize: 27 * u, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.label}</span>
          {row.sublabel && <span style={{ fontSize: 19 * u, color: p.muted, whiteSpace: "nowrap" }}>{row.sublabel}</span>}
        </div>
        <div style={{ height: 12 * u, marginTop: 8 * u, width: `${Math.max(row.share * 100 * t, 1)}%`, background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontFamily: display, fontWeight: 700, fontSize: 36 * u, color, whiteSpace: "nowrap" }}>{row.value}</span>
    </div>
  )
}

export const TopList = (props: TopListProps) => {
  const { theme, kind, headline, subhead, rows, footnote } = props
  const { p, u, wide, tall } = useLayout(theme)
  return (
    <Frame theme={theme} kind={kind} source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 * u, minHeight: 0, justifyContent: "safe center" }}>
        <Enter>
          <Headline text={headline} u={u} max={wide ? 48 : 62} color={p.text} />
          {subhead && <div style={{ fontSize: 26 * u, color: p.muted, marginTop: 12 * u }}>{subhead}</div>}
        </Enter>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 * u, maxHeight: rows.length * (tall ? 130 : 105) * u }}>
          {rows.slice(0, wide ? 5 : 8).map((row, i) => (
            <ListRow key={`${row.label}-${i}`} row={row} i={i} p={p} u={u} />
          ))}
        </div>
        {footnote && <div style={{ fontSize: 19 * u, color: p.muted }}>{footnote}</div>}
      </div>
    </Frame>
  )
}
