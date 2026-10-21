import { Palette, toneColor } from "../brand"
import { display } from "../fonts"
import { alpha, Chip, Enter, Frame, Headline, longDate, useLayout, useProgress, usd } from "../kit"
import type { NewsProps } from "../types"

// A tariff action from the /tariff-updates feed. The rate change is the hook when there is one;
// the stage track along the bottom (announced → … → in the HTS) is the signature: where the
// action is between a headline and the duty an importer actually pays.

const STAGES = ["Announced", "Signed", "Filed", "Published", "CBP guidance", "In the HTS"]

const StageTrack = ({ stage, p, u, color }: { stage: number; p: Palette; u: number; color: string }) => {
  const t = useProgress(1.2, 1.4, "even")
  const reached = stage * t
  return (
    <div style={{ position: "relative", padding: `${10 * u}px 0 0` }}>
      <div style={{ position: "absolute", top: 10 * u + 13 * u, left: `${100 / 12}%`, right: `${100 / 12}%`, height: 6 * u, background: p.border, borderRadius: 999 }}>
        <div style={{ height: "100%", width: `${(reached / (STAGES.length - 1)) * 100}%`, background: color, borderRadius: 999 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${STAGES.length}, 1fr)` }}>
        {STAGES.map((label, i) => {
          const done = i <= reached + 0.001
          const current = i === stage && t === 1
          return (
            <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 * u, position: "relative" }}>
              <div
                style={{
                  width: (current ? 44 : 32) * u,
                  height: (current ? 44 : 32) * u,
                  marginTop: (current ? -6 : 0) * u,
                  marginBottom: (current ? -6 : 0) * u,
                  borderRadius: 999,
                  background: done ? color : p.surface,
                  border: `${(current ? 8 : 4) * u}px solid ${current ? alpha(color, 0.45) : done ? color : p.border}`,
                }}
              />
              <span style={{ fontSize: 18 * u, fontWeight: current ? 700 : 500, color: done ? p.text : p.muted, textAlign: "center", lineHeight: 1.15 }}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Fact = ({ label, children, p, u }: { label: string; children: React.ReactNode; p: Palette; u: number }) => (
  <div style={{ display: "flex", gap: 20 * u, alignItems: "baseline" }}>
    <span style={{ width: 130 * u, flexShrink: 0, fontSize: 20 * u, fontWeight: 700, letterSpacing: 1.5 * u, textTransform: "uppercase", color: p.muted }}>{label}</span>
    <span style={{ fontSize: 30 * u, fontWeight: 500, lineHeight: 1.3 }}>{children}</span>
  </div>
)

export const News = (props: NewsProps) => {
  const { theme, headline, authority, kindLabel, tone, rateBefore, rateAfter, rateNote, countries, products, effectiveOn, stage, imports } = props
  const { p, u, wide, tall } = useLayout(theme)
  const color = toneColor(p, tone)
  const rate = useProgress(0.5, 0.8)
  const hasRate = !!rateAfter
  const stakeHero = !hasRate && !!imports && imports.value > 0
  const shownCountries = countries.slice(0, 6)
  return (
    <Frame theme={theme} kind="Tariff news" kindTone={tone} source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: (wide ? 18 : 30) * u, justifyContent: tall ? "center" : undefined, minHeight: 0 }}>
        <Enter>
          <div style={{ display: "flex", gap: 12 * u, marginBottom: 18 * u, flexWrap: "wrap" }}>
            <Chip tone={tone} p={p} size={22 * u} solid>
              {authority}
            </Chip>
            <Chip tone="neutral" p={p} size={22 * u}>
              {kindLabel}
            </Chip>
          </div>
          <Headline text={headline} u={u} max={wide ? 46 : 62} color={p.text} />
        </Enter>

        {hasRate && (
          <div style={{ display: "flex", alignItems: "center", gap: 24 * u, opacity: rate, transform: `scale(${0.9 + rate * 0.1})`, transformOrigin: "left center" }}>
            {rateBefore && (
              <>
                <span style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 84 : 120) * u, color: p.muted, letterSpacing: -4 * u, textDecoration: "line-through", textDecorationThickness: 6 * u }}>
                  {rateBefore}
                </span>
                <span style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 64 : 90) * u, color: p.muted }}>→</span>
              </>
            )}
            <span style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 104 : 150) * u, color, letterSpacing: -5 * u, lineHeight: 1 }}>{rateAfter}</span>
          </div>
        )}
        {hasRate && rateNote && (
          <Enter at={0.8}>
            <div style={{ fontSize: 28 * u, color: p.muted, marginTop: -12 * u }}>{rateNote}</div>
          </Enter>
        )}
        {/* No single rate: the money at stake is the hook, else the date it starts */}
        {!hasRate && (stakeHero || effectiveOn) && (
          <div style={{ opacity: rate, transform: `scale(${0.9 + rate * 0.1})`, transformOrigin: "left center" }}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 96 : 140) * u, color: stakeHero ? p.cobalt : color, letterSpacing: -5 * u, lineHeight: 1 }}>
              {stakeHero ? usd(imports!.value) : longDate(effectiveOn!).replace(/, \d{4}$/, "")}
            </div>
            <div style={{ fontSize: 28 * u, color: p.muted, marginTop: 10 * u }}>
              {stakeHero ? `of US imports in ${imports!.year} under the HTS codes named` : `takes effect, ${effectiveOn!.slice(0, 4)}`}
            </div>
          </div>
        )}

        <Enter at={0.7} style={{ display: "flex", flexDirection: "column", gap: (wide ? 8 : 14) * u }}>
          <Fact label="Who" p={p} u={u}>
            {shownCountries.length ? (
              <>
                {shownCountries.map((c) => `${c.flag} ${c.name}`).join("  ")}
                {countries.length > shownCountries.length ? ` +${countries.length - shownCountries.length} more` : ""}
              </>
            ) : (
              "🌐 Imports from all countries"
            )}
          </Fact>
          {products && (
            <Fact label="What" p={p} u={u}>
              {products}
            </Fact>
          )}
          {effectiveOn && (
            <Fact label="When" p={p} u={u}>
              {longDate(effectiveOn)}
            </Fact>
          )}
          {imports && imports.value > 0 && !stakeHero && (
            <Fact label="At stake" p={p} u={u}>
              <b style={{ color: p.cobalt }}>{usd(imports.value)}</b> of US imports in {imports.year} under the codes named
            </Fact>
          )}
        </Enter>

        <div style={{ marginTop: "auto" }}>
          <StageTrack stage={stage} p={p} u={u} color={color} />
        </div>
      </div>
    </Frame>
  )
}
