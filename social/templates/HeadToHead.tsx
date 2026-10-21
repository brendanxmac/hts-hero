import { Palette } from "../brand"
import { display } from "../fonts"
import { alpha, change, Chip, Enter, Frame, Headline, pct, ProductLine, useLayout, useProgress, usd } from "../kit"
import type { CountrySide, HeadToHeadProps } from "../types"

// The same product from two origins: what each pays today and how much the US bought from
// each. The side that pays more is red, the side that pays less green.

const Side = ({ side, other, p, u, at, year }: { side: CountrySide; other: CountrySide; p: Palette; u: number; at: number; year?: number }) => {
  const t = useProgress(at, 1.2)
  const color = side.ratePct > other.ratePct ? p.red : side.ratePct < other.ratePct ? p.green : p.cobalt
  return (
    <div
      style={{
        flex: 1,
        background: p.surface,
        border: `${2 * u}px solid ${p.border}`,
        borderRadius: 32 * u,
        padding: 40 * u,
        display: "flex",
        flexDirection: "column",
        gap: 18 * u,
        opacity: Math.min(1, t * 2),
        transform: `translateY(${(1 - t) * 30}px)`,
      }}
    >
      <div style={{ fontSize: 96 * u, lineHeight: 1 }}>{side.country.flag}</div>
      <div style={{ fontFamily: display, fontWeight: 600, fontSize: 40 * u, letterSpacing: -0.5 * u }}>{side.country.name}</div>
      <div>
        {/* Long rates ("37.5%") a little smaller, so they clear the "vs" badge */}
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: Math.min(132, 480 / pct(side.ratePct).length) * u, lineHeight: 1, letterSpacing: -4 * u, color }}>
          {pct(side.ratePct * t)}
        </div>
        <div style={{ fontSize: 22 * u, fontWeight: 700, letterSpacing: 2 * u, textTransform: "uppercase", color: p.muted, marginTop: 8 * u }}>Tariff today</div>
      </div>
      <div style={{ height: 16 * u, borderRadius: 999, background: p.soft, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(side.ratePct / Math.max(side.ratePct, other.ratePct, 1)) * 100 * t}%`, background: color, borderRadius: 999 }} />
      </div>
      {side.importValue !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 * u, flexWrap: "wrap", fontSize: 24 * u, color: p.muted }}>
          <span>
            US imports {year}: <b style={{ color: p.text }}>{usd(side.importValue)}</b>
          </span>
          {side.importChangePct !== undefined && Number.isFinite(side.importChangePct) && (
            <Chip tone={side.importChangePct >= 0 ? "brand" : "neutral"} p={p} size={20 * u}>
              {change(side.importChangePct)}
            </Chip>
          )}
        </div>
      )}
    </div>
  )
}

export const HeadToHead = (props: HeadToHeadProps) => {
  const { theme, headline, product, htsCode, left, right, year } = props
  const { p, u, wide, tall } = useLayout(theme)
  const gap = Math.abs(left.ratePct - right.ratePct)
  const more = left.ratePct > right.ratePct ? left : right
  return (
    <Frame theme={theme} kind="Head to head" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 36 * u, justifyContent: tall ? "center" : "flex-start" }}>
        <Enter>
          <Headline text={headline} u={u} max={wide ? 52 : 64} color={p.text} />
          <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
        </Enter>
        <div style={{ display: "flex", gap: 28 * u, position: "relative", flex: wide ? 1 : undefined }}>
          <Side side={left} other={right} p={p} u={u} at={0.5} year={year} />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 84 * u,
              height: 84 * u,
              borderRadius: 999,
              background: p.cobalt,
              color: p.surface,
              display: "flex",
              alignItems: "center",
              justifyContent: "safe center",
              fontFamily: display,
              fontWeight: 700,
              fontSize: 30 * u,
              border: `${6 * u}px solid ${p.ground}`,
              zIndex: 1,
            }}
          >
            vs
          </div>
          <Side side={right} other={left} p={p} u={u} at={0.8} year={year} />
        </div>
        {gap > 0 && (
          <Enter at={2}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 600,
                fontSize: 40 * u,
                letterSpacing: -0.5 * u,
                padding: `${22 * u}px ${30 * u}px`,
                borderRadius: 24 * u,
                background: alpha(p.red, 0.12),
                color: p.text,
              }}
            >
              {more.country.flag} {more.country.name} pays <span style={{ color: p.red }}>{Math.round(gap * 10) / 10}% more</span>
            </div>
          </Enter>
        )}
      </div>
    </Frame>
  )
}
