import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react"
import { continueRender, delayRender, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import { Palette, PALETTES, Theme, Tone, toneColor } from "./brand"
import { display, sans } from "./fonts"

// What every post template is built from: the branded frame, sizes that follow the format,
// the motion and the number formats. The last frame of every video is the still post.

// One design unit: 1 on a 1080-wide portrait post, smaller on the short landscape one (which
// shows less), a little larger on the tall Reels/Shorts one (which has room to spare)
export const useLayout = (theme: Theme) => {
  const { width, height } = useVideoConfig()
  const tall = height > width * 1.5
  const u = Math.min(width / 1080, height / 860) * (tall ? 1.1 : 1)
  return {
    p: PALETTES[theme],
    u,
    width,
    height,
    wide: width > height * 1.2,
    tall,
  }
}

// Shrinks its content to fit when it would run past the frame (a long headline, many rows), so
// no data overflows into the footer in any format. Only ever scales down; it starts again from
// full size whenever the text changes (an edited headline, a number counting up). It measures
// again whenever the frame or the content resizes (layout, fonts loading), and holds a render
// until the first fit is done, so stills never capture an unfitted frame.
const FitBox = ({ children }: { children: ReactNode }) => {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [, setTick] = useState(0)
  const lastText = useRef<string | null>(null)
  const [handle] = useState(() => delayRender("Fitting the post to its frame"))
  const released = useRef(false)
  const release = () => {
    if (released.current) return
    released.current = true
    continueRender(handle)
  }

  useEffect(() => {
    const observer = new ResizeObserver(() => setTick((t) => t + 1))
    if (outer.current) observer.observe(outer.current)
    if (inner.current?.firstElementChild) observer.observe(inner.current.firstElementChild)
    // Never hold a render for long, even if the frame can't be measured
    const timeout = setTimeout(release, 3000)
    return () => {
      observer.disconnect()
      clearTimeout(timeout)
      release()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useLayoutEffect(() => {
    const box = outer.current
    const content = inner.current
    if (!box || !content) return
    const text = content.textContent ?? ""
    if (text !== lastText.current) {
      lastText.current = text
      if (scale !== 1) return setScale(1)
    }
    // In the content's own (unscaled) pixels: the room it has, and what it needs
    const room = box.offsetHeight / scale
    const needed = content.scrollHeight
    if (room <= 0) return
    if (needed > room * 1.002) setScale(Math.max(0.55, scale * (room / needed)))
    else release()
  })
  return (
    <div ref={outer} style={{ flex: 1, minHeight: 0, position: "relative" }}>
      <div
        ref={inner}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${100 / scale}%`,
          height: `${100 / scale}%`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  )
}

// 0 → 1 between two moments, in seconds; 1 throughout a still. Settles fast by default; "even"
// moves at a steady pace, for a line that tells a story as it draws
export const useProgress = (startSec: number, lengthSec: number, pace: "settle" | "even" = "settle") => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return interpolate(frame, [startSec * fps, (startSec + lengthSec) * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: pace === "even" ? Easing.inOut(Easing.quad) : Easing.bezier(0.22, 1, 0.36, 1),
  })
}

// Fades and lifts its children in at `at` seconds
export const Enter = ({ at = 0, children, style }: { at?: number; children: ReactNode; style?: React.CSSProperties }) => {
  const t = useProgress(at, 0.6)
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 24}px)`, ...style }}>{children}</div>
}

// "#2F49D1" + 0.15 → "rgba(47, 73, 209, 0.15)"
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

// 70 → "70%", 70.125 → "70.1%"
export const pct = (n: number) => `${Math.round(n * 10) / 10}%`

// A signed change in a rate: "+25%", "−7.5%" (never "pts")
export const signedPct = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n * 10) / 10)}%`

// Signed percent change: "+340%", "−62%"
export const change = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n))}%`

// 1_250_000_000 → "$1.3B"
export const usd = (n: number) =>
  n >= 1e9 ? `$${(n / 1e9).toFixed(1).replace(/\.0$/, "")}B` : n >= 1e6 ? `$${Math.round(n / 1e6)}M` : `$${Math.max(1, Math.round(n / 1e3))}K`

// "2025-11-17" → "Nov 17, 2025"
export const longDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

// "2025-11-17" → "Nov '25"
export const shortDate = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`)
  return `${d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" })} '${String(d.getUTCFullYear()).slice(2)}`
}

// "8703.80.0000" in the mono digits used across HTS Hero
export const Code = ({ children, p, size }: { children: ReactNode; p: Palette; size: number }) => (
  <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: size, color: p.muted, letterSpacing: 0.5 }}>
    {children}
  </span>
)

export const Chip = ({ tone, p, size, children, solid }: { tone: Tone; p: Palette; size: number; children: ReactNode; solid?: boolean }) => {
  const color = toneColor(p, tone)
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.4,
        padding: `${size * 0.35}px ${size * 0.8}px`,
        borderRadius: 999,
        background: solid ? color : alpha(color, 0.14),
        color: solid ? p.surface : color,
        fontFamily: sans,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  )
}

// The HTS Hero mark: the check in a circle (public/logo.svg), in the post's cobalt
export const Mark = ({ size, p }: { size: number; p: Palette }) => (
  <svg width={size} height={size} viewBox="0 0 576 576">
    <circle cx="288" cy="288" r="288" fill={p.cobalt} />
    <line x1="211" y1="300" x2="277" y2="368" stroke={p.surface} strokeWidth="58" strokeLinecap="round" />
    <line x1="453" y1="96" x2="279" y2="369" stroke={p.surface} strokeWidth="58" strokeLinecap="round" />
  </svg>
)

// Every post's frame. The cobalt rule on top, the mark and wordmark, the post's kind as a pill,
// and the source and htshero.com at the foot never change, so every post reads as HTS Hero's.
export const Frame = ({
  theme,
  kind,
  kindTone = "brand",
  source,
  asOf,
  children,
}: {
  theme: Theme
  kind: string
  kindTone?: Tone
  source: string
  asOf: string
  children: ReactNode
}) => {
  const { p, u, tall, wide } = useLayout(theme)
  const pad = (wide ? 52 : 64) * u
  // Reels and Shorts lay their own buttons over the top and bottom of the video
  const safeTop = tall ? 150 : 0
  const safeBottom = tall ? 260 : 0
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: p.ground,
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
          <Mark size={48 * u} p={p} />
          <span style={{ fontFamily: display, fontWeight: 700, fontSize: 32 * u, letterSpacing: -0.5 }}>HTS Hero</span>
        </div>
        <Chip tone={kindTone} p={p} size={20 * u}>
          <span style={{ letterSpacing: 2 * u, textTransform: "uppercase" }}>{kind}</span>
        </Chip>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, padding: `${(wide ? 26 : 40) * u}px 0 ${(wide ? 14 : 24) * u}px` }}>
        <FitBox>{children}</FitBox>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24 * u,
          borderTop: `${Math.max(1, 2 * u)}px solid ${p.border}`,
          paddingTop: 24 * u,
          fontSize: 19 * u,
          color: p.muted,
        }}
      >
        <span>
          Source: {source} · As of {longDate(asOf)}
        </span>
        <span style={{ fontFamily: display, fontWeight: 600, fontSize: 24 * u, color: p.cobalt }}>htshero.com</span>
      </div>
    </div>
  )
}

// A headline in Sora that shrinks when it runs long
export const Headline = ({ text, u, max = 64, color }: { text: string; u: number; max?: number; color: string }) => {
  const size = (text.length > 70 ? max * 0.72 : text.length > 45 ? max * 0.85 : max) * u
  return (
    <div style={{ fontFamily: display, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5 * u, color }}>{text}</div>
  )
}

// The product and its code under a headline
export const ProductLine = ({ product, htsCode, p, u }: { product: string; htsCode: string; p: Palette; u: number }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 14 * u, marginTop: 14 * u, flexWrap: "wrap" }}>
    <span style={{ fontSize: 26 * u, color: p.muted, fontWeight: 500 }}>{product}</span>
    <Code p={p} size={22 * u}>
      HTS {htsCode}
    </Code>
  </div>
)
