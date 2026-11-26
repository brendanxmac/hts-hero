import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { display, sans } from "../../../social/fonts"
import { ALERT_TIERS, AUDIT_TIERS, formatPrice } from "../../../components/pricing-calculator/lib/pricing"
import { SALE, saleAnnual } from "../../../libs/black-friday"

// The Black Friday 2026 LinkedIn ad (libs/black-friday.ts), in three shapes from one design:
//   portrait  1080×1350, the feed's biggest image (best on mobile)
//   square    1080×1080
//   landscape 1200×627, LinkedIn's single-image ad size
// One video: the pieces arrive in turn (settled by frame 75), then hold. The stills are frame
// 120, so every shape reads whole without the motion.
// Render: `npm run email:render-black-friday`

export type AdFormat = "portrait" | "square" | "landscape"

const C = {
  ground: "#07080C",
  card: "#12151E",
  cardHi: "#181C28",
  line: "#262B3A",
  text: "#F1F3F8",
  muted: "#9298A6",
  amber: "#F2B24C",
  amberLight: "#FFE2A6",
  cobalt: "#8EA2FF",
  cobaltDeep: "#2F49D1",
  green: "#34C98B",
  red: "#FF7D6E",
}

const OFFERS = [
  { name: "Essentials", what: "Tariff alerts on your imports", deal: saleAnnual(ALERT_TIERS[0].price), accent: C.cobalt },
  { name: "Pro", what: "Alerts + audits + savings", deal: saleAnnual(AUDIT_TIERS[0].price), accent: C.amber },
]

const Mark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 576 576">
    <circle cx="288" cy="288" r="288" fill={C.cobaltDeep} />
    <line x1="211" y1="300" x2="277" y2="368" stroke="#fff" strokeWidth="58" strokeLinecap="round" />
    <line x1="453" y1="96" x2="279" y2="369" stroke="#fff" strokeWidth="58" strokeLinecap="round" />
  </svg>
)

export const LinkedInAd = ({ format }: { format: AdFormat }) => {
  const frame = useCurrentFrame()
  const { fps, width, height, durationInFrames } = useVideoConfig()
  const wide = format === "landscape"
  const tall = format === "portrait"
  // Drawn on a 1080-wide canvas (landscape on 1200×627 is sized by its height instead)
  const u = wide ? height / 627 : width / 1080

  // Each piece springs in at its own beat
  const enter = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120, mass: 0.8 } })
  const rise = (delay: number, px = 40) => {
    const s = enter(delay)
    return { opacity: s, transform: `translateY(${(1 - s) * px * u}px)` }
  }

  // A light that sweeps the headline once, then again near the end
  const sweepAt = (start: number) => interpolate(frame, [start, start + 24], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const sweep = frame < durationInFrames - 40 ? sweepAt(18) : sweepAt(durationInFrames - 36)
  // The alert's rate counts up from the old rate to the new one
  const rate = Math.round(interpolate(frame, [40, 62], [25, 45], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))
  const pulse = 0.55 + 0.45 * Math.abs(Math.sin((frame / fps) * Math.PI))

  const pill = (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * u, ...rise(0, 20) }}>
      <span
        style={{
          backgroundColor: C.amber,
          color: C.ground,
          fontWeight: 800,
          fontSize: (wide ? 17 : 24) * u,
          letterSpacing: "0.24em",
          padding: `${(wide ? 8 : 10) * u}px ${(wide ? 18 : 22) * u}px`,
          borderRadius: 999,
        }}
      >
        BLACK FRIDAY
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 * u, fontSize: (wide ? 17 : 24) * u, fontWeight: 600, color: C.muted }}>
        <span style={{ width: 10 * u, height: 10 * u, borderRadius: 999, backgroundColor: C.red, opacity: pulse }} />
        Ends {SALE.endsLabel}
      </span>
    </div>
  )

  const headline = (
    <div style={{ ...rise(6) }}>
      <div
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: (wide ? 128 : tall ? 210 : 176) * u,
          lineHeight: 0.92,
          letterSpacing: "-0.045em",
          whiteSpace: "nowrap",
          color: "transparent",
          backgroundImage: `linear-gradient(105deg, ${C.amber} ${sweep * 100 - 14}%, ${C.amberLight} ${sweep * 100}%, ${C.amber} ${sweep * 100 + 14}%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          paddingBottom: 6 * u,
        }}
      >
        {SALE.percentOff}% OFF
      </div>
      <div style={{ fontFamily: display, fontWeight: 600, fontSize: (wide ? 36 : tall ? 54 : 48) * u, lineHeight: 1.12, marginTop: (wide ? 8 : 14) * u, letterSpacing: "-0.02em" }}>
        A full year of Duty Guard
      </div>
      <div style={{ fontSize: (wide ? 20 : tall ? 29 : 26) * u, color: C.muted, marginTop: (wide ? 10 : 14) * u, lineHeight: 1.35, maxWidth: (wide ? 560 : 880) * u }}>
        Know the moment a tariff change hits your imports, and find duty you may be overpaying.
      </div>
    </div>
  )

  // What Duty Guard finds: a tariff change on one of your imports, and (portrait) a lower rate it may qualify for
  const notice = (n: { delay: number; tone: string; toneBg: string; icon: "bell" | "tag"; label: string; product: string; detail: string; from: string; to: string; change: string }) => (
    <div
      style={{
        ...rise(n.delay, 60),
        backgroundColor: C.card,
        border: `${1.5 * u}px solid ${C.line}`,
        borderRadius: (wide ? 18 : 22) * u,
        padding: `${(wide ? 16 : 22) * u}px ${(wide ? 20 : 28) * u}px`,
        boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.45)`,
        display: "flex",
        alignItems: "center",
        gap: (wide ? 14 : 22) * u,
      }}
    >
      <div
        style={{
          width: (wide ? 44 : 62) * u,
          height: (wide ? 44 : 62) * u,
          borderRadius: (wide ? 12 : 16) * u,
          backgroundColor: n.toneBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <svg width={(wide ? 22 : 30) * u} height={(wide ? 22 : 30) * u} viewBox="0 0 24 24" fill="none" stroke={n.tone} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {n.icon === "bell" ? (
            <>
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </>
          ) : (
            <>
              <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z" />
              <circle cx="7.5" cy="7.5" r="1.5" />
            </>
          )}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: (wide ? 13 : 19) * u, fontWeight: 700, letterSpacing: "0.12em", color: n.tone, whiteSpace: "nowrap" }}>{n.label}</div>
        <div style={{ fontSize: (wide ? 18 : 25) * u, fontWeight: 600, marginTop: 4 * u, whiteSpace: "nowrap" }}>
          {n.product} <span style={{ color: C.muted, fontWeight: 500 }}>· {wide ? n.detail.split(" · ").pop() : n.detail}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flex: "none" }}>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 24 : 34) * u, whiteSpace: "nowrap" }}>
          <span style={{ color: C.muted, fontWeight: 600 }}>{n.from}</span>
          <span style={{ color: C.muted, margin: `0 ${8 * u}px` }}>→</span>
          {n.to}
        </div>
        <div style={{ fontSize: (wide ? 14 : 20) * u, fontWeight: 700, color: n.tone }}>{n.change}</div>
      </div>
    </div>
  )
  const alert = notice({
    delay: 28,
    tone: C.red,
    toneBg: "rgba(255,125,110,0.14)",
    icon: "bell",
    label: "TARIFF CHANGE ON YOUR IMPORT",
    product: "Steel brackets",
    detail: "7326.90.8688 · China",
    from: "25%",
    to: `${rate}%`,
    change: `+${rate - 25}%`,
  })
  const saving = notice({
    delay: 36,
    tone: C.green,
    toneBg: "rgba(52,201,139,0.14)",
    icon: "tag",
    label: "YOU MAY QUALIFY FOR A LOWER RATE",
    product: "LED lamps",
    detail: "9405.42.8440 · Mexico",
    from: "3.9%",
    to: "0%",
    change: "USMCA",
  })

  const prices = (
    <div style={{ display: "flex", gap: (wide ? 14 : 22) * u }}>
      {OFFERS.map((o, i) => (
        <div
          key={o.name}
          style={{
            ...rise(44 + i * 6, 50),
            flex: 1,
            backgroundColor: C.cardHi,
            border: `${1.5 * u}px solid ${C.line}`,
            borderTop: `${4 * u}px solid ${o.accent}`,
            borderRadius: 20 * u,
            padding: `${(wide ? 14 : 22) * u}px ${(wide ? 18 : 26) * u}px`,
          }}
        >
          <div style={{ fontFamily: display, fontWeight: 600, fontSize: (wide ? 21 : 34) * u }}>{o.name}</div>
          <div style={{ fontSize: (wide ? 14 : 20) * u, color: C.muted, marginTop: 2 * u }}>{o.what}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 * u, marginTop: (wide ? 8 : 14) * u, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: (wide ? 14 : 20) * u, color: C.muted }}>from</span>
            <span style={{ fontSize: (wide ? 18 : 30) * u, color: C.muted, textDecoration: "line-through", textDecorationColor: C.red, textDecorationThickness: 2.5 * u }}>
              {formatPrice(o.deal.usual)}
            </span>
            <span style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 30 : 52) * u }}>{formatPrice(o.deal.sale)}</span>
            <span style={{ fontSize: (wide ? 14 : 20) * u, color: C.muted }}>/mo</span>
          </div>
        </div>
      ))}
    </div>
  )

  const brand = (
    <div style={{ display: "flex", alignItems: "center", gap: 14 * u, ...rise(58, 30) }}>
      <Mark size={(wide ? 44 : 54) * u} />
      <div>
        <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 22 : 28) * u }}>HTS Hero</div>
        <div style={{ fontSize: (wide ? 15 : 20) * u, color: C.muted }}>htshero.com/black-friday</div>
      </div>
    </div>
  )
  const button = (
    <div
      style={{
        ...rise(58, 30),
        backgroundColor: C.amber,
        color: C.ground,
        fontFamily: display,
        fontWeight: 700,
        fontSize: (wide ? 22 : 29) * u,
        padding: `${(wide ? 14 : 20) * u}px ${(wide ? 24 : 34) * u}px`,
        borderRadius: 999,
        whiteSpace: "nowrap",
        textAlign: "center",
        boxShadow: `0 0 ${40 * u * pulse}px rgba(242,178,76,0.35)`,
      }}
    >
      Claim 40% Off →
    </div>
  )
  const cta = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 * u }}>
      {brand}
      {button}
    </div>
  )

  const fine = (
    <div style={{ fontSize: (wide ? 13 : 18) * u, color: C.muted, textAlign: wide ? "center" : undefined, opacity: enter(64) * 0.85 }}>
      First year of any annual plan, then the regular annual price. No code needed.
    </div>
  )

  return (
    <AbsoluteFill style={{ backgroundColor: C.ground, overflow: "hidden", fontFamily: sans, color: C.text }}>
      {/* Glow and a faint grid behind everything */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${wide ? "55% 90%" : "90% 55%"} at ${wide ? "20% 30%" : "30% 18%"}, rgba(242,178,76,0.16), transparent 70%), radial-gradient(ellipse 70% 60% at ${wide ? "90% 90%" : "85% 85%"}, rgba(47,73,209,0.28), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
          backgroundSize: `${54 * u}px ${54 * u}px`,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent 85%)",
          WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0.9), transparent 85%)",
        }}
      />

      {wide ? (
        <AbsoluteFill style={{ flexDirection: "row", padding: `${44 * u}px ${52 * u}px`, gap: 44 * u }}>
          <div style={{ width: 540 * u, flex: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {pill}
            {headline}
            {brand}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 * u }}>
            {alert}
            {prices}
            {button}
            {fine}
          </div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ flexDirection: "column", justifyContent: "space-between", padding: `${(tall ? 76 : 60) * u}px ${70 * u}px ${(tall ? 64 : 52) * u}px` }}>
          {pill}
          {headline}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 * u }}>
            {alert}
            {tall && saving}
          </div>
          {prices}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 * u }}>
            {cta}
            {fine}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  )
}
