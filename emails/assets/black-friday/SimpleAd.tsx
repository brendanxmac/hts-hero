import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { display, sans } from "../../../social/fonts"
import { SALE } from "../../../libs/black-friday"

// The simplest Black Friday 2026 post (libs/black-friday.ts): the promo pill, "40% Off" and
// "Tariff Audits, Savings, and Alerts", nothing else but a small mark and the link at the foot.
// Portrait (1080×1350) and square (1080×1080); the stills are frame 90, after the motion settles.
// Render: `npm run email:render-black-friday`

export type SimpleFormat = "portrait" | "square"

const C = {
  ground: "#07080C",
  text: "#F1F3F8",
  muted: "#9298A6",
  amber: "#F2B24C",
  amberLight: "#FFE2A6",
  cobaltDeep: "#2F49D1",
}

const Mark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 576 576">
    <circle cx="288" cy="288" r="288" fill={C.cobaltDeep} />
    <line x1="211" y1="300" x2="277" y2="368" stroke="#fff" strokeWidth="58" strokeLinecap="round" />
    <line x1="453" y1="96" x2="279" y2="369" stroke="#fff" strokeWidth="58" strokeLinecap="round" />
  </svg>
)

export const SimpleAd = ({ format }: { format: SimpleFormat }) => {
  const frame = useCurrentFrame()
  const { fps, width, durationInFrames } = useVideoConfig()
  const tall = format === "portrait"
  const u = width / 1080

  const enter = (delay: number) => spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 110, mass: 0.8 } })
  const rise = (delay: number, px = 40) => {
    const s = enter(delay)
    return { opacity: s, transform: `translateY(${(1 - s) * px * u}px)` }
  }
  // A light across "40% Off": once on the way in, once near the end
  const sweepAt = (start: number) => interpolate(frame, [start, start + 26], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const sweep = frame < durationInFrames - 40 ? sweepAt(16) : sweepAt(durationInFrames - 36)
  const glow = 0.8 + 0.2 * Math.sin((frame / fps) * Math.PI * 0.8)

  return (
    <AbsoluteFill style={{ backgroundColor: C.ground, overflow: "hidden", fontFamily: sans, color: C.text }}>
      {/* A warm glow behind the offer, a cool one in the corner */}
      <AbsoluteFill
        style={{
          opacity: glow,
          background: `radial-gradient(ellipse 75% 45% at 50% ${tall ? 46 : 48}%, rgba(242,178,76,0.20), transparent 70%), radial-gradient(ellipse 60% 45% at 90% 100%, rgba(47,73,209,0.30), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: `${60 * u}px ${60 * u}px`,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.9), transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,0,0,0.9), transparent 80%)",
        }}
      />

      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: `0 ${70 * u}px` }}>
        <span
          style={{
            ...rise(0, 20),
            backgroundColor: C.amber,
            color: C.ground,
            fontWeight: 800,
            fontSize: 34 * u,
            letterSpacing: "0.26em",
            padding: `${14 * u}px ${34 * u}px ${14 * u}px ${42 * u}px`,
            borderRadius: 999,
          }}
        >
          BLACK FRIDAY
        </span>
        <div
          style={{
            ...rise(6),
            marginTop: (tall ? 56 : 34) * u,
            fontFamily: display,
            fontWeight: 700,
            fontSize: (tall ? 250 : 236) * u,
            lineHeight: 0.9,
            letterSpacing: "-0.05em",
            whiteSpace: "nowrap",
            color: "transparent",
            backgroundImage: `linear-gradient(105deg, ${C.amber} ${sweep * 100 - 14}%, ${C.amberLight} ${sweep * 100}%, ${C.amber} ${sweep * 100 + 14}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            paddingBottom: 10 * u,
          }}
        >
          {SALE.percentOff}% Off
        </div>
        <div
          style={{
            ...rise(16),
            marginTop: (tall ? 44 : 24) * u,
            fontFamily: display,
            fontWeight: 600,
            fontSize: (tall ? 84 : 70) * u,
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
          }}
        >
          Tariff Audits, Savings,
          <br />
          and Alerts
        </div>
      </AbsoluteFill>

      {/* The foot: the mark and where to go */}
      <div
        style={{
          ...rise(28, 20),
          position: "absolute",
          left: 0,
          right: 0,
          bottom: (tall ? 70 : 54) * u,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14 * u,
          fontSize: 28 * u,
          fontWeight: 600,
          color: C.muted,
        }}
      >
        <Mark size={40 * u} />
        <span style={{ fontFamily: display, color: C.text }}>HTS Hero</span>
        <span>· Ends {SALE.endsLabel}</span>
      </div>
    </AbsoluteFill>
  )
}
