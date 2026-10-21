import { toneColor } from "../brand"
import { display } from "../fonts"
import { Code, Enter, Frame, Headline, useLayout, useProgress, usd } from "../kit"
import type { CountrySnapshotProps } from "../types"

// A country by the numbers: what the US buys from it (Census) and what its biggest products pay
// today (the engine).

export const CountrySnapshot = (props: CountrySnapshotProps) => {
  const { theme, headline, country, stats, products, year } = props
  const { p, u, wide, tall } = useLayout(theme)
  const bars = useProgress(1.4, 1.2)
  const max = Math.max(...products.map((x) => x.value), 1)
  return (
    <Frame theme={theme} kind="Country snapshot" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: (wide ? 22 : 34) * u, justifyContent: "safe center" }}>
        <Enter>
          <div style={{ display: "flex", alignItems: "center", gap: 24 * u }}>
            <span style={{ fontSize: (wide ? 70 : 96) * u, lineHeight: 1 }}>{country.flag}</span>
            <Headline text={headline} u={u} max={wide ? 44 : 58} color={p.text} />
          </div>
        </Enter>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${wide || stats.length === 3 ? stats.length : 2}, 1fr)`, gap: 16 * u }}>
          {stats.map((s, i) => (
            <Enter key={s.label} at={0.4 + i * 0.15}>
              <div style={{ background: p.surface, border: `${2 * u}px solid ${p.border}`, borderRadius: 24 * u, padding: `${(wide ? 16 : 24) * u}px ${26 * u}px` }}>
                <div style={{ fontSize: 19 * u, fontWeight: 700, letterSpacing: 1.5 * u, textTransform: "uppercase", color: p.muted }}>{s.label}</div>
                <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 40 : 56) * u, letterSpacing: -1.5 * u, color: s.tone ? toneColor(p, s.tone) : p.text }}>
                  {s.value}
                </div>
                {s.detail && <div style={{ fontSize: 19 * u, color: p.muted }}>{s.detail}</div>}
              </div>
            </Enter>
          ))}
        </div>
        {products.length > 0 && (
          <Enter at={1.1} style={{ display: "flex", flexDirection: "column", gap: (wide ? 8 : 14) * u }}>
            <div style={{ fontSize: 20 * u, fontWeight: 700, letterSpacing: 2 * u, textTransform: "uppercase", color: p.cobalt }}>
              Top US imports from {country.name}, {year} · tariff today
            </div>
            {products.slice(0, wide ? 3 : 5).map((x) => (
              <div key={x.htsCode} style={{ display: "flex", alignItems: "center", gap: 18 * u }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12 * u }}>
                    <span style={{ fontSize: 25 * u, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{x.label}</span>
                    <Code p={p} size={17 * u}>
                      {x.htsCode}
                    </Code>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 * u, marginTop: 6 * u }}>
                    <div style={{ height: 12 * u, width: `${(x.value / max) * 75 * bars}%`, background: p.cobalt, borderRadius: 999 }} />
                    <span style={{ fontSize: 19 * u, color: p.muted }}>{usd(x.value)}</span>
                  </div>
                </div>
                <span style={{ fontFamily: display, fontWeight: 700, fontSize: 32 * u, whiteSpace: "nowrap" }}>{x.rate}</span>
              </div>
            ))}
          </Enter>
        )}
      </div>
    </Frame>
  )
}
