import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion"
import { display, sans } from "../../../social/fonts"
import { ALERT_TIERS, AUDIT_TIERS, formatPrice } from "../../../components/pricing-calculator/lib/pricing"
import { SALE, saleAnnual } from "../../../libs/black-friday"

// The Black Friday 2026 visual (libs/black-friday.ts): "40% off Tariff Audits, Savings & Alerts" with
// both offers' from-prices struck through. Two layouts from one design:
//   banner: the email's animated hero (a GIF, emails/marketing/black-friday)
//   square: a 1080×1080 post for LinkedIn / X
// The first frame carries the whole message (Outlook shows only that one), and the motion is
// ambient and seamless: a shine across "40% OFF", tags that sway, falling confetti, a pulsing
// clock. Flat colors only, so the GIF stays small.
// Render: `npm run email:render-black-friday`

const COLORS = {
  ground: "#0B0D14",
  card: "#161A25",
  line: "#2A3040",
  text: "#F1F3F8",
  muted: "#9298A6",
  amber: "#F2B24C",
  amberDeep: "#C98A1E",
  cobalt: "#8EA2FF",
  green: "#34C98B",
  red: "#FF7D6E",
}

const OFFERS = [
  { name: "Essentials", what: "Tariff alerts", deal: saleAnnual(ALERT_TIERS[0].price) },
  { name: "Pro", what: "Audits, savings & alerts", deal: saleAnnual(AUDIT_TIERS[0].price) },
]

// Confetti that falls on a loop: each piece's start, speed and shape are fixed, so the loop is seamless
const CONFETTI = Array.from({ length: 26 }, (_, i) => {
  const r = (n: number) => ((Math.sin(i * 127.1 + n * 311.7) * 43758.5453) % 1 + 1) % 1
  return {
    x: r(1),
    offset: r(2),
    size: 4 + r(3) * 6,
    color: [COLORS.amber, COLORS.cobalt, COLORS.text, COLORS.green][i % 4],
    spin: r(4) * 360,
    round: i % 3 === 0,
  }
})

export type HeroLayout = "banner" | "square"

export const BlackFridayHero = ({ layout }: { layout: HeroLayout }) => {
  const frame = useCurrentFrame()
  const { width, height, durationInFrames } = useVideoConfig()
  // 0 → 1 over the loop, and a wave that starts and ends at rest
  const t = frame / durationInFrames
  const wave = Math.sin(t * Math.PI * 2)
  const square = layout === "square"
  // Everything is drawn on a 600-wide banner or a 1080 square
  const u = square ? width / 1080 : width / 600

  // The shine's place across the headline, off one edge to off the other (at rest on frame 0)
  const sweep = -0.3 + t * 1.6

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ground, overflow: "hidden", fontFamily: sans, color: COLORS.text }}>
      {/* Falling confetti */}
      {CONFETTI.filter((_, i) => square || i % 2 === 0).map((c, i) => {
        const y = ((c.offset + t) % 1) * (height + 40 * u) - 20 * u
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: c.x * width,
              top: y,
              width: c.size * u,
              height: (c.round ? c.size : c.size * 0.45) * u,
              borderRadius: c.round ? 999 : 1,
              backgroundColor: c.color,
              opacity: 0.55,
              transform: `rotate(${c.spin + t * 360}deg)`,
            }}
          />
        )
      })}

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: square ? "column" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: (square ? 56 : 22) * u,
          padding: `${(square ? 80 : 24) * u}px ${(square ? 70 : 30) * u}px`,
        }}
      >
        {/* The offer */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: square ? "center" : "flex-start", textAlign: square ? "center" : "left", flex: square ? "none" : 1.3 }}>
          <span
            style={{
              alignSelf: square ? "center" : "flex-start",
              backgroundColor: COLORS.amber,
              color: COLORS.ground,
              fontWeight: 800,
              fontSize: (square ? 30 : 13) * u,
              letterSpacing: "0.22em",
              padding: `${(square ? 12 : 6) * u}px ${(square ? 26 : 12) * u}px`,
              borderRadius: 999,
            }}
          >
            BLACK FRIDAY
          </span>
          <div style={{ position: "relative", marginTop: (square ? 34 : 12) * u, overflow: "hidden" }}>
            <div
              style={{
                fontFamily: display,
                fontWeight: 700,
                fontSize: (square ? 190 : 64) * u,
                whiteSpace: "nowrap",
                lineHeight: 0.95,
                letterSpacing: "-0.04em",
                // A light that sweeps across the letters, clipped to them
                color: "transparent",
                backgroundImage: `linear-gradient(110deg, ${COLORS.amber} ${sweep * 100 - 12}%, #FFE7B3 ${sweep * 100}%, ${COLORS.amber} ${sweep * 100 + 12}%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                // The square post breathes; the email's GIF keeps still letters (every changed pixel costs bytes)
                transform: square ? `scale(${1 + 0.025 * wave})` : undefined,
                transformOrigin: square ? "center" : "left center",
              }}
            >
              {SALE.percentOff}% OFF
            </div>
          </div>
          <div style={{ fontFamily: display, fontWeight: 600, fontSize: (square ? 60 : 18) * u, lineHeight: 1.15, whiteSpace: "nowrap", marginTop: (square ? 18 : 8) * u }}>
            Tariff Audits, Savings & Alerts
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8 * u,
              marginTop: (square ? 26 : 12) * u,
              fontSize: (square ? 30 : 13) * u,
              fontWeight: 600,
              color: COLORS.muted,
            }}
          >
            {/* The clock dot pulses */}
            <span style={{ width: (square ? 14 : 7) * u, height: (square ? 14 : 7) * u, borderRadius: 999, backgroundColor: COLORS.red, opacity: 0.6 + 0.4 * Math.abs(wave) }} />
            A full year, every annual plan · Ends {SALE.endsLabel}
          </div>
        </div>

        {/* The two offers, as swinging price tags */}
        <div style={{ display: "flex", flexDirection: square ? "row" : "column", gap: (square ? 32 : 12) * u, flex: square ? "none" : 1 }}>
          {OFFERS.map((o, i) => (
            <div
              key={o.name}
              style={{
                backgroundColor: COLORS.card,
                border: `${Math.max(1, 1.5 * u)}px solid ${COLORS.line}`,
                borderRadius: (square ? 28 : 14) * u,
                padding: `${(square ? 26 : 11) * u}px ${(square ? 28 : 14) * u}px`,
                minWidth: 0,
                transform: square ? `rotate(${(i === 0 ? 1 : -1) * 1.6 * wave}deg)` : undefined,
                transformOrigin: "top center",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 * u }}>
                <span style={{ fontFamily: display, fontWeight: 600, fontSize: (square ? 40 : 17) * u }}>{o.name}</span>
                <span style={{ fontSize: (square ? 24 : 11) * u, color: COLORS.muted, fontWeight: 600 }}>{o.what}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: (square ? 14 : 7) * u, marginTop: (square ? 12 : 4) * u }}>
                <span style={{ fontSize: (square ? 26 : 11) * u, color: COLORS.muted }}>from</span>
                <span style={{ fontSize: (square ? 40 : 17) * u, color: COLORS.muted, textDecoration: "line-through", textDecorationColor: COLORS.red, textDecorationThickness: 2 * u }}>
                  {formatPrice(o.deal.usual)}
                </span>
                <span style={{ fontFamily: display, fontWeight: 700, fontSize: (square ? 64 : 28) * u, color: COLORS.text }}>{formatPrice(o.deal.sale)}</span>
                <span style={{ fontSize: (square ? 26 : 11) * u, color: COLORS.muted }}>/mo</span>
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      {square && (
        <div style={{ position: "absolute", bottom: 56 * u, left: 0, right: 0, textAlign: "center", fontFamily: display, fontWeight: 600, fontSize: 30 * u, color: COLORS.muted }}>
          htshero.com/black-friday
        </div>
      )}
    </AbsoluteFill>
  )
}
