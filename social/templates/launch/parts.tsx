import { createContext, ReactNode, useContext } from "react"
import { accentColor, Palette, Theme } from "../../brand"
import { display, sans } from "../../fonts"
import { alpha, Chip, Mark, useLayout, useProgress } from "../../kit"
import type { LaunchColor } from "../../types"

// What the Duty Guard launch videos are made of: their own frame (no data source in the footer,
// since they're about the product), the shield, and the three things Duty Guard does drawn as
// small product cards. Every rate is an example and says so; savings are only ever "may" and
// "could", rates are in %, never dollars.

// Each launch post picks its own accent: it takes cobalt's place in the frame, the shield, the
// pills and the big lines. The product cards keep their meaning colors (red alert, green savings),
// and the HTS Hero mark stays cobalt.
const Accent = createContext<LaunchColor>("cobalt")
export const AccentProvider = Accent.Provider

// useLayout with the post's accent in cobalt's place; `brand` is the untouched palette
export const useLaunch = (theme: Theme) => {
  const layout = useLayout(theme)
  const color = useContext(Accent)
  return { ...layout, brand: layout.p, p: { ...layout.p, cobalt: accentColor(theme, color) } }
}

// The launch frame: the cobalt rule, the mark and wordmark, a pill, and htshero.com at the foot.
// Reels and Shorts lay their own buttons over the top and bottom, so the tall format keeps clear.
export const LaunchFrame = ({ theme, pill, foot, children }: { theme: Theme; pill: string; foot: string; children: ReactNode }) => {
  const { p, brand, u, tall, wide } = useLaunch(theme)
  const pad = (wide ? 52 : 64) * u
  const safeTop = tall ? 150 : 0
  const safeBottom = tall ? 260 : 0
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        // A soft cobalt glow from the top, sized in design units so it reads the same in every format
        background: `radial-gradient(${1100 * u}px ${700 * u}px at 50% 0%, ${alpha(p.cobalt, theme === "dark" ? 0.2 : 0.1)}, ${p.ground} 100%)`,
        color: p.text,
        fontFamily: sans,
        display: "flex",
        flexDirection: "column",
        padding: `${pad + safeTop}px ${pad}px ${pad * 0.8 + safeBottom}px`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12 * u, background: p.cobalt }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u }}>
          <Mark size={48 * u} p={brand} />
          <span style={{ fontFamily: display, fontWeight: 700, fontSize: 32 * u, letterSpacing: -0.5 }}>HTS Hero</span>
        </div>
        <Chip tone="brand" p={p} size={20 * u}>
          <span style={{ letterSpacing: 2 * u, textTransform: "uppercase" }}>{pill}</span>
        </Chip>
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>{children}</div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24 * u,
          borderTop: `${Math.max(1, 2 * u)}px solid ${p.border}`,
          paddingTop: 24 * u,
          fontSize: 21 * u,
          color: p.muted,
        }}
      >
        <span>{foot}</span>
        <span style={{ fontFamily: display, fontWeight: 600, fontSize: 24 * u, color: p.cobalt }}>htshero.com</span>
      </div>
    </div>
  )
}

// A scene fills the frame's middle and fades out over its last half second, so scenes in a row
// cross over instead of cutting. `length` is the scene's own length in seconds.
export const Scene = ({ length, children, center = true }: { length: number; children: ReactNode; center?: boolean }) => {
  const fadeOut = useProgress(length - 0.5, 0.5)
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: center ? "center" : "flex-start",
        opacity: 1 - fadeOut,
        transform: `scale(${1 - fadeOut * 0.03})`,
      }}
    >
      {children}
    </div>
  )
}

// Rises into place at `at` seconds
export const Rise = ({ at = 0, children, style }: { at?: number; children: ReactNode; style?: React.CSSProperties }) => {
  const t = useProgress(at, 0.7)
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 40}px)`, ...style }}>{children}</div>
}

// The Duty Guard shield with the HTS Hero check, drawing itself in from `at`
export const Shield = ({ size, p, at = 0 }: { size: number; p: Palette; at?: number }) => {
  const t = useProgress(at, 1.1)
  const check = useProgress(at + 0.6, 0.6)
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 200 230" style={{ overflow: "visible", transform: `scale(${0.85 + t * 0.15})`, opacity: Math.min(1, t * 1.6) }}>
      <path d="M100 8 L184 40 V112 C184 166 148 204 100 222 C52 204 16 166 16 112 V40 Z" fill={alpha(p.cobalt, 0.16)} stroke={p.cobalt} strokeWidth="10" strokeLinejoin="round" />
      <path d="M62 116 L90 144 L142 82" fill="none" stroke={p.cobalt} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - check} />
    </svg>
  )
}

// A big Sora line that shrinks as it gets long
export const BigLine = ({ text, u, color, max = 92, weight = 700 }: { text: string; u: number; color: string; max?: number; weight?: number }) => {
  const size = (text.length > 60 ? max * 0.66 : text.length > 36 ? max * 0.8 : max) * u
  return <div style={{ fontFamily: display, fontWeight: weight, fontSize: size, lineHeight: 1.06, letterSpacing: -2 * u, color }}>{text}</div>
}

const Card = ({ p, u, children, accent }: { p: Palette; u: number; children: ReactNode; accent?: string }) => (
  <div
    style={{
      background: p.surface,
      border: `${Math.max(1, 2 * u)}px solid ${p.border}`,
      borderLeft: accent ? `${8 * u}px solid ${accent}` : undefined,
      borderRadius: 26 * u,
      padding: `${26 * u}px ${30 * u}px`,
      boxShadow: `0 ${18 * u}px ${50 * u}px ${alpha("#000000", 0.18)}`,
    }}
  >
    {children}
  </div>
)

const Label = ({ p, u, children, color }: { p: Palette; u: number; children: ReactNode; color?: string }) => (
  <div style={{ fontSize: 18 * u, fontWeight: 700, letterSpacing: 2 * u, textTransform: "uppercase", color: color ?? p.muted }}>{children}</div>
)

// A tariff alert as Duty Guard sends it, with an example rate change counting up
export const AlertCard = ({ theme, at = 0 }: { theme: Theme; at?: number }) => {
  const { p, u } = useLaunch(theme)
  const t = useProgress(at + 0.6, 1.2)
  const after = 12.9 + (52.9 - 12.9) * t
  return (
    <Rise at={at}>
      <Card p={p} u={u} accent={p.red}>
        <Label p={p} u={u} color={p.red}>
          Tariff alert · Example
        </Label>
        <div style={{ fontFamily: display, fontWeight: 600, fontSize: 32 * u, lineHeight: 1.2, margin: `${12 * u}px 0 ${16 * u}px` }}>Section 232: steel derivatives added</div>
        <div style={{ fontSize: 24 * u, color: p.muted }}>Your import: 7326.90.86 from Germany</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 * u, marginTop: 14 * u, fontVariantNumeric: "tabular-nums" }}>
          <span style={{ fontSize: 40 * u, fontWeight: 700, color: p.muted }}>12.9%</span>
          <span style={{ fontSize: 34 * u, color: p.muted }}>→</span>
          <span style={{ fontFamily: display, fontSize: 56 * u, fontWeight: 700, color: p.red }}>{after.toFixed(1)}%</span>
        </div>
      </Card>
    </Rise>
  )
}

// Past entries checked one by one; the last is flagged as a possible overpayment
export const AuditCard = ({ theme, at = 0 }: { theme: Theme; at?: number }) => {
  const { p, u } = useLaunch(theme)
  const rows = [
    { entry: "Entry 1 · Mar 4", ok: true },
    { entry: "Entry 2 · Apr 18", ok: true },
    { entry: "Entry 3 · May 9", ok: false },
  ]
  return (
    <Rise at={at}>
      <Card p={p} u={u}>
        <Label p={p} u={u}>Entry audit · Example</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 * u, marginTop: 18 * u }}>
          {rows.map((r, i) => (
            <Rise key={r.entry} at={at + 0.5 + i * 0.45}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16 * u,
                  padding: `${16 * u}px ${20 * u}px`,
                  borderRadius: 16 * u,
                  background: r.ok ? p.soft : alpha(p.amber, 0.14),
                  fontSize: 26 * u,
                }}
              >
                <span style={{ fontWeight: 600 }}>{r.entry}</span>
                <span style={{ fontWeight: 700, color: r.ok ? p.green : p.amber, whiteSpace: "nowrap" }}>{r.ok ? "✓ Duty matches" : "⚠ Possible overpayment"}</span>
              </div>
            </Rise>
          ))}
        </div>
      </Card>
    </Rise>
  )
}

// What an import may qualify for: always potential
export const SavingsCard = ({ theme, at = 0 }: { theme: Theme; at?: number }) => {
  const { p, u } = useLaunch(theme)
  const rows = ["A trade program", "An exemption", "A lower-duty origin"]
  return (
    <Rise at={at}>
      <Card p={p} u={u} accent={p.green}>
        <Label p={p} u={u} color={p.green}>
          Savings detection · Example
        </Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 * u, marginTop: 18 * u }}>
          {rows.map((r, i) => (
            <Rise key={r} at={at + 0.5 + i * 0.45}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 * u, fontSize: 27 * u }}>
                <span style={{ fontWeight: 600 }}>{r}</span>
                <Chip tone="down" p={p} size={20 * u}>
                  May qualify
                </Chip>
              </div>
            </Rise>
          ))}
        </div>
      </Card>
    </Rise>
  )
}
