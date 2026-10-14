import { Palette } from "../brand"
import { display } from "../fonts"
import { alpha, Chip, Enter, Frame, Headline, pct, ProductLine, useLayout, useProgress, usd } from "../kit"
import type { CountrySide, SourcingSaverProps } from "../types"

// "Sourcing X from China? You could save up to 27.5%." The origins offered are ones the US
// really bought the product from, so every saving is one an importer could look into. Savings
// are potential: duty only, never landed cost.

const OriginRow = ({ side, p, u, at, saving, year }: { side: CountrySide; p: Palette; u: number; at: number; saving?: number; year?: number }) => {
  const t = useProgress(at, 0.8)
  const current = saving === undefined
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20 * u,
        padding: `${18 * u}px ${26 * u}px`,
        borderRadius: 24 * u,
        background: current ? alpha(p.red, 0.1) : p.surface,
        border: `${2 * u}px solid ${current ? alpha(p.red, 0.35) : p.border}`,
        opacity: t,
        transform: `translateX(${(1 - t) * 40}px)`,
      }}
    >
      <span style={{ fontSize: 46 * u }}>{side.country.flag}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: display, fontWeight: 600, fontSize: 32 * u }}>{side.country.name}</div>
        <div style={{ fontSize: 20 * u, color: p.muted }}>
          {current ? "Where you source now" : side.importValue ? `US bought ${usd(side.importValue)} here in ${year}` : "Supplies the US"}
        </div>
      </div>
      {!current && saving! > 0 && (
        <Chip tone="down" p={p} size={22 * u}>
          −{Math.round(saving! * 10) / 10}%
        </Chip>
      )}
      <span style={{ fontFamily: display, fontWeight: 700, fontSize: 48 * u, color: current ? p.red : p.green, minWidth: 150 * u, textAlign: "right" }}>
        {pct(side.ratePct)}
      </span>
    </div>
  )
}

export const SourcingSaver = (props: SourcingSaverProps) => {
  const { theme, headline, product, htsCode, from, options, year } = props
  const { p, u, wide, tall } = useLayout(theme)
  const best = options[0]
  const count = useProgress(0.6, 1.4)
  return (
    <Frame theme={theme} kind="Sourcing insight" kindTone="down" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: wide ? "row" : "column", gap: (wide ? 40 : 30) * u, justifyContent: "safe center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 * u, width: wide ? "44%" : undefined, justifyContent: wide ? "center" : undefined }}>
          <Enter>
            <Headline text={headline} u={u} max={wide ? 46 : 64} color={p.text} />
            <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
          </Enter>
          {best && (
            <Enter at={0.4}>
              <div style={{ fontSize: 28 * u, color: p.muted, fontWeight: 600 }}>You could save up to</div>
              <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 110 : 150) * u, lineHeight: 1, letterSpacing: -5 * u, color: p.green }}>
                {Math.round(best.savingPts * count * 10) / 10}%
              </div>
              <div style={{ fontSize: 28 * u, color: p.muted, fontWeight: 600, marginTop: 6 * u }}>
                in duty by sourcing from {best.country.name}
              </div>
            </Enter>
          )}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 * u, justifyContent: "safe center" }}>
          <OriginRow side={from} p={p} u={u} at={1.2} />
          {options.slice(0, wide ? 2 : 3).map((o, i) => (
            <OriginRow key={o.country.code} side={o} p={p} u={u} at={1.5 + i * 0.2} saving={o.savingPts} year={year} />
          ))}
          <div style={{ fontSize: 19 * u, color: p.muted, marginTop: 6 * u }}>Duty only. Landed cost, quality and rules of origin vary by supplier.</div>
        </div>
      </div>
    </Frame>
  )
}
