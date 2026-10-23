import { display } from "../fonts"
import { alpha, Chip, Enter, Frame, Headline, ProductLine, useLayout } from "../kit"
import type { OddRateProps } from "../types"

// A rate the HTS charges in an odd way, quoted word for word, then HTS Hero working it out part
// by part on the standard shipment: each part's figure, or the question the calculator asks.

export const OddRate = (props: OddRateProps) => {
  const { theme, headline, product, htsCode, rate, column, columnNote, shipment, steps, total, footnote } = props
  const { p, u, wide } = useLayout(theme)
  const quoteSize = (rate.length > 90 ? 34 : rate.length > 50 ? 42 : 54) * u * (wide ? 0.8 : 1)
  return (
    <Frame theme={theme} kind="Odd rate" kindTone="heads-up" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: (wide ? 20 : 32) * u, justifyContent: "safe center", minHeight: 0 }}>
        <Enter>
          <Headline text={headline} u={u} max={wide ? 46 : 58} color={p.text} />
          <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
        </Enter>

        <Enter at={0.5}>
          <div style={{ borderLeft: `${8 * u}px solid ${p.amber}`, background: alpha(p.amber, 0.08), borderRadius: 12 * u, padding: `${22 * u}px ${28 * u}px` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 * u, marginBottom: 12 * u, flexWrap: "wrap" }}>
              <Chip tone="heads-up" p={p} size={18 * u}>
                {column}
              </Chip>
              {columnNote && <span style={{ fontSize: 18 * u, color: p.muted }}>{columnNote}</span>}
            </div>
            <div style={{ fontFamily: display, fontWeight: 600, fontSize: quoteSize, lineHeight: 1.2, letterSpacing: -0.5 * u }}>“{rate}”</div>
          </div>
        </Enter>

        <Enter at={1.2} style={{ display: "flex", flexDirection: "column", gap: 10 * u }}>
          <div style={{ fontSize: 20 * u, fontWeight: 700, letterSpacing: 2 * u, textTransform: "uppercase", color: p.cobalt }}>{shipment}</div>
          {steps.map((s, i) => (
            <div key={`${s.rate}-${i}`} style={{ display: "flex", alignItems: "baseline", gap: 16 * u, fontSize: 25 * u, borderTop: i ? `${Math.max(1, u)}px solid ${p.border}` : undefined, paddingTop: i ? 10 * u : 0 }}>
              <span style={{ fontWeight: 600, flexShrink: 0, maxWidth: "45%" }}>{s.rate}</span>
              {s.asks ? (
                <span style={{ flex: 1, color: p.cobalt, fontWeight: 500 }}>Asks: {s.asks}</span>
              ) : (
                <>
                  <span style={{ flex: 1, color: p.muted }}>{s.detail}</span>
                  <span style={{ fontFamily: display, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{s.amount}</span>
                </>
              )}
            </div>
          ))}
          {total && (
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", borderTop: `${2 * u}px solid ${p.text}`, paddingTop: 12 * u, marginTop: 4 * u }}>
              <span style={{ fontSize: 25 * u, fontWeight: 700 }}>Base duty</span>
              <span style={{ fontFamily: display, fontWeight: 700, fontSize: 44 * u, color: p.cobalt }}>{total}</span>
            </div>
          )}
        </Enter>

        {footnote && (
          <Enter at={1.8}>
            <div style={{ fontSize: 20 * u, color: p.muted }}>{footnote}</div>
          </Enter>
        )}
      </div>
    </Frame>
  )
}
