import { Palette, toneColor } from "../brand"
import { display } from "../fonts"
import { Enter, Frame, pct, useLayout, useProgress } from "../kit"
import type { BigNumberProps } from "../types"

// One number, as big as the post allows, with the sentence that makes it land and, when it's a
// tariff, the stack of duties that adds up to it.

// Base duty is slate (DESIGN_SYSTEM.md §15); each additional duty takes the next color
const partColors = (p: Palette) => [p.slate, p.cobalt, p.red, p.amber, p.sky, p.green]

// "70.1%" counts up from 0; anything else ("$4.2B") just appears
const countUp = (value: string, t: number) => {
  const m = value.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/)
  if (!m) return value
  const target = parseFloat(m[2].replace(/,/g, ""))
  const decimals = m[2].split(".")[1]?.length ?? 0
  const now = (target * t).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return `${m[1]}${now}${m[3]}`
}

export const BigNumber = (props: BigNumberProps) => {
  const { theme, eyebrow, value, label, tone, parts, footnote } = props
  const { p, u, wide } = useLayout(theme)
  const count = useProgress(0.4, 1.6)
  const fill = useProgress(1.6, 1.4)
  const total = parts.reduce((s, x) => s + x.pct, 0)
  const colors = partColors(p)
  // As big as fits: "37.5%" at 300, "+43.5%" a little smaller
  const size = (wide ? Math.min(250, 1300 / Math.max(value.length, 1)) : Math.min(300, 1500 / Math.max(value.length, 1))) * u

  return (
    <Frame theme={theme} kind="Tariff fact" kindTone={tone} source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "safe center", gap: 36 * u }}>
        <Enter>
          <div style={{ fontSize: 26 * u, fontWeight: 700, letterSpacing: 3 * u, textTransform: "uppercase", color: toneColor(p, tone) }}>{eyebrow}</div>
        </Enter>
        {/* Landscape puts the sentence beside the number */}
        <div style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "center" : undefined, gap: (wide ? 48 : 36) * u }}>
          <div style={{ fontFamily: display, fontWeight: 700, fontSize: size, lineHeight: 0.9, letterSpacing: -size * 0.04, color: p.text, whiteSpace: "nowrap" }}>
            {countUp(value, count)}
          </div>
          <Enter at={0.9} style={{ flex: wide ? 1 : undefined }}>
            <div style={{ fontFamily: display, fontWeight: 600, fontSize: (label.length > 80 ? 44 : 54) * u * (wide ? 0.8 : 1), lineHeight: 1.15, letterSpacing: -1 * u }}>
              {label}
            </div>
          </Enter>
        </div>
        {parts.length > 1 && total > 0 && (
          <Enter at={1.4}>
            <div style={{ display: "flex", height: 36 * u, borderRadius: 999, overflow: "hidden", background: p.soft, gap: 4 * u }}>
              {parts.map((part, i) => (
                <div key={part.label} style={{ width: `${(part.pct / total) * 100 * fill}%`, background: colors[i % colors.length], borderRadius: 999 }} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: `${14 * u}px ${32 * u}px`, marginTop: 22 * u }}>
              {parts.map((part, i) => (
                <div key={part.label} style={{ display: "flex", alignItems: "center", gap: 12 * u, fontSize: 24 * u }}>
                  <span style={{ width: 18 * u, height: 18 * u, borderRadius: 999, background: colors[i % colors.length] }} />
                  <span style={{ color: p.muted }}>{part.label}</span>
                  <span style={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{pct(part.pct)}</span>
                </div>
              ))}
            </div>
          </Enter>
        )}
        {footnote && (
          <Enter at={1.8}>
            <div style={{ fontSize: 22 * u, color: p.muted }}>{footnote}</div>
          </Enter>
        )}
      </div>
    </Frame>
  )
}
