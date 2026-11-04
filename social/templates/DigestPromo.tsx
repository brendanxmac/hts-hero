import { Section, Text } from "@react-email/components"
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import { C as EMAIL } from "../../emails/kit/brand"
import { Divider, Eyebrow, Title, UpdateBlock } from "../../emails/kit/parts"
import { display, sans } from "../fonts"
import { alpha, Chip, Mark, useLayout, useProgress } from "../kit"
import { Rise } from "./launch/parts"
import type { DigestPromoProps } from "../types"

// The Weekly Tariff Digest's promo (/tariff-digest): the promise in big type, then the digest
// arriving as a light email on the dark ground, its updates landing one after another, then where
// to subscribe. The email is the real thing: drawn with the digest email's own React Email parts
// (emails/kit/parts.tsx: Eyebrow, Title, UpdateBlock), at the email's own 600px width and zoomed
// up, so the post shows exactly what lands in the inbox. Its updates are real ones from
// /tariff-updates. A new-email toast pops over it and leaves. The still (the last frame) is
// everything in place.

// When each beat starts, in seconds (the template runs 9)
const T = { eyebrow: 0.1, line1: 0.3, line2: 0.75, card: 1.3, toast: 1.9, toastOut: 3.6, updates: 2.3, step: 0.45, cta: 4.6 }

// Long summaries are cut to one line's worth at poster scale
const clip = (s: string, n = 120) => (s.length > n ? `${s.slice(0, n).replace(/\s+\S*$/, "")}…` : s)

const Toast = ({ subject, u, at, outAt }: { subject: string; u: number; at: number; outAt: number }) => {
  const t = useProgress(at, 0.5)
  const out = useProgress(outAt, 0.5)
  return (
    <div
      style={{
        position: "absolute",
        top: -34 * u,
        right: 28 * u,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        gap: 16 * u,
        padding: `${16 * u}px ${22 * u}px`,
        borderRadius: 22 * u,
        background: "#FFFFFF",
        color: EMAIL.text,
        fontFamily: sans,
        boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.45)`,
        opacity: t * (1 - out),
        transform: `translateY(${(1 - t) * -30 * u + out * -16 * u}px) scale(${0.92 + t * 0.08})`,
      }}
    >
      <div style={{ width: 46 * u, height: 46 * u, borderRadius: 999, background: EMAIL.cobalt, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 22 * u }}>H</div>
      <div>
        <div style={{ fontSize: 18 * u, fontWeight: 700 }}>New email · HTS Hero</div>
        <div style={{ fontSize: 17 * u, color: EMAIL.muted }}>{subject}</div>
      </div>
    </div>
  )
}

export const DigestPromo = (props: DigestPromoProps) => {
  const { theme, eyebrow, line1, line2, cta, url, emailSubject, emailHeading, updates } = props
  const { p, u, wide, tall } = useLayout(theme)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const pad = (wide ? 56 : 72) * u
  const safeTop = tall ? 150 : 0
  const safeBottom = tall ? 260 : 0

  // The card rises in from below and leans back, then settles
  const card = useProgress(T.card, 1.1)
  const lean = interpolate(frame, [T.card * fps, (T.card + 2.4) * fps], [14, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const ctaIn = useProgress(T.cta, 0.7)
  // The email's 600px drawn as wide as the post allows
  const zoom = (wide ? 1.16 : tall ? 1.55 : 1.48) * u
  const shown = updates.slice(0, wide ? 3 : 4)

  const headline = (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 * u }}>
      <Rise at={T.eyebrow}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u, fontSize: 22 * u, fontWeight: 700, letterSpacing: 5 * u, textTransform: "uppercase", color: p.cobalt }}>
          <span style={{ width: 12 * u, height: 12 * u, borderRadius: 999, background: p.cobalt }} />
          {eyebrow}
        </div>
      </Rise>
      <div style={{ fontFamily: display, fontWeight: 600, fontSize: (wide ? 64 : 76) * u, lineHeight: 1.04, letterSpacing: -3 * u }}>
        <Rise at={T.line1}>{line1}</Rise>
        <Rise at={T.line2}>
          <span style={{ color: p.muted }}>{line2}</span>
        </Rise>
      </div>
    </div>
  )

  const email = (
    <div style={{ position: "relative", perspective: 2400 * u }}>
      <Toast subject={emailSubject} u={u} at={T.toast} outAt={T.toastOut} />
      <div
        style={{
          transformOrigin: "50% 0%",
          transform: `translateY(${(1 - card) * 420 * u}px) rotateX(${lean}deg)`,
          opacity: card,
          borderRadius: 34 * u,
          overflow: "hidden",
          background: EMAIL.surface,
          color: EMAIL.text,
          fontFamily: sans,
          boxShadow: `0 ${50 * u}px ${140 * u}px rgba(0,0,0,0.6)`,
        }}
      >
        {/* The inbox line it arrives as */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 * u, padding: `${22 * u}px ${32 * u}px`, background: EMAIL.soft, borderBottom: `${Math.max(1, 1.5 * u)}px solid ${EMAIL.border}` }}>
          <Mark size={44 * u} p={{ ...p, cobalt: EMAIL.cobalt }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 21 * u }}>
              <span style={{ fontWeight: 700 }}>HTS Hero</span>
              <span style={{ color: EMAIL.faint }}>Mon</span>
            </div>
            <div style={{ fontSize: 20 * u, color: EMAIL.muted }}>{emailSubject}</div>
          </div>
        </div>
        {/* The digest's own React Email parts, at the email's width, zoomed */}
        <div style={{ zoom, width: 600, padding: "26px 32px 8px", boxSizing: "border-box" }}>
          <Eyebrow>Weekly tariff digest</Eyebrow>
          <Title size={24}>{emailHeading}</Title>
          {shown.map((up, i) => (
            <UpdateLanding key={up.slug} at={T.updates + i * T.step}>
              {i > 0 && <Divider />}
              <UpdateBlock update={{ ...up, summary: clip(up.summary) }} campaign="social" compact />
            </UpdateLanding>
          ))}
          <Section>
            <Text style={{ margin: 0 }}>&nbsp;</Text>
          </Section>
        </div>
      </div>
    </div>
  )

  // The email runs on past its space: clipped there, and masked to fade out over whatever is
  // behind it, so it reads as continuing rather than cut
  const fade = "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)"
  const clipped = (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        padding: `${40 * u}px ${8 * u}px 0`,
        margin: `0 ${-8 * u}px`,
        maskImage: fade,
        WebkitMaskImage: fade,
      }}
    >
      {email}
    </div>
  )

  const subscribe = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: wide ? "flex-start" : "center", gap: 24 * u, opacity: ctaIn, transform: `translateY(${(1 - ctaIn) * 30 * u}px)` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14 * u,
          padding: `${22 * u}px ${40 * u}px`,
          borderRadius: 999,
          background: p.cobalt,
          color: p.ground,
          fontFamily: display,
          fontWeight: 700,
          fontSize: (wide ? 28 : 34) * u,
          letterSpacing: -0.5 * u,
        }}
      >
        {cta} →
      </div>
      <span style={{ fontFamily: display, fontWeight: 600, fontSize: (wide ? 26 : 32) * u, color: p.text }}>{url}</span>
    </div>
  )

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: p.ground,
        color: p.text,
        fontFamily: sans,
        display: "flex",
        flexDirection: "column",
        padding: `${pad + safeTop}px ${pad}px ${pad * 0.8 + safeBottom}px`,
      }}
    >
      {/* A low cobalt light behind the email */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(${wide ? "60% 90% at 78% 60%" : "80% 55% at 50% 72%"}, ${alpha(p.cobalt, 0.2)}, ${alpha(p.cobalt, 0.05)} 45%, ${alpha(p.cobalt, 0)} 70%)`,
        }}
      />
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u }}>
          <Mark size={48 * u} p={p} />
          <span style={{ fontFamily: display, fontWeight: 700, fontSize: 32 * u, letterSpacing: -0.5 }}>HTS Hero</span>
        </div>
        <Chip tone="brand" p={p} size={20 * u}>
          <span style={{ letterSpacing: 2 * u, textTransform: "uppercase" }}>Free · Every Monday</span>
        </Chip>
      </div>

      {wide ? (
        <div style={{ position: "relative", flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 * u, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 44 * u }}>
            {headline}
            {subscribe}
          </div>
          <div style={{ position: "relative", height: "100%" }}>{clipped}</div>
        </div>
      ) : (
        <>
          <div style={{ position: "relative", marginTop: (tall ? 80 : 52) * u }}>{headline}</div>
          <div style={{ position: "relative", flex: 1, minHeight: 0, marginTop: (tall ? 60 : 30) * u }}>
            {clipped}
          </div>
          <div style={{ position: "relative", paddingTop: 30 * u }}>{subscribe}</div>
        </>
      )}
    </div>
  )
}

// An update landing in the email: fades and rises into place in turn
const UpdateLanding = ({ at, children }: { at: number; children: React.ReactNode }) => {
  const t = useProgress(at, 0.6)
  return <div style={{ opacity: t, transform: `translateY(${(1 - t) * 18}px)` }}>{children}</div>
}
