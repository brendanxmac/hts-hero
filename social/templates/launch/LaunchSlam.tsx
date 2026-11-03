import { ReactNode } from "react"
import { Sequence, useCurrentFrame, useVideoConfig } from "remotion"
import { FPS } from "../../brand"
import { display, sans } from "../../fonts"
import { alpha, Mark, useProgress } from "../../kit"
import type { LaunchSlamProps } from "../../types"
import { AccentProvider, AlertCard, AuditCard, SavingsCard, Shield, useLaunch } from "./parts"
import { SLAM } from "./timing"

// A Duty Guard teaser in big type on a full-color ground: three setups, each slammed shut by one
// word (the grounds swap between beats, hard cuts, no fades), a blurred glimpse of the product,
// then the name. The still is the name.

const BEAT = SLAM.beat
const GLIMPSE = SLAM.glimpse

// The full-bleed frame: the mark, wordmark and pill in the ink color, htshero.com at the foot
const SlamFrame = ({ theme, fill, ink, children }: { theme: LaunchSlamProps["theme"]; fill: string; ink: string; children: ReactNode }) => {
  const { p, u, tall, wide } = useLaunch(theme)
  const pad = (wide ? 52 : 64) * u
  const safeTop = tall ? 150 : 0
  const safeBottom = tall ? 260 : 0
  return (
    <div style={{ position: "absolute", inset: 0, background: fill, color: ink, fontFamily: sans, display: "flex", flexDirection: "column", padding: `${pad + safeTop}px ${pad}px ${pad * 0.8 + safeBottom}px` }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u }}>
          <Mark size={48 * u} p={{ ...p, cobalt: ink, surface: fill }} />
          <span style={{ fontFamily: display, fontWeight: 700, fontSize: 32 * u, letterSpacing: -0.5 }}>HTS Hero</span>
        </div>
        <span style={{ border: `${3 * u}px solid ${ink}`, borderRadius: 999, padding: `${6 * u}px ${18 * u}px`, fontSize: 20 * u, fontWeight: 700, letterSpacing: 2 * u, textTransform: "uppercase" }}>
          Coming soon
        </span>
      </div>
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", fontFamily: display, fontWeight: 600, fontSize: 24 * u }}>htshero.com</div>
    </div>
  )
}

// The setup's words land one by one, then the closing word slams in big with a jolt
const Beat = ({ theme, line, word }: { theme: LaunchSlamProps["theme"]; line: string; word: string }) => {
  const { u, wide } = useLaunch(theme)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const words = line.split(" ")
  const slam = useProgress(0.95, 0.22, "even")
  const since = frame / fps - 1.17
  const jolt = since > 0 && since < 0.35 ? Math.sin(since * 60) * 10 * u * (1 - since / 0.35) : 0
  const lineSize = (line.length > 40 ? 60 : 72) * u * (wide ? 0.85 : 1)
  const wordSize = (word.length > 9 ? 150 : 190) * u * (wide ? 0.8 : 1)
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 * u, transform: `translateX(${jolt}px)` }}>
      <div style={{ fontFamily: display, fontWeight: 600, fontSize: lineSize, lineHeight: 1.08, letterSpacing: -1.5 * u }}>
        {words.map((w, i) => (
          <WordIn key={i} at={i * 0.09}>
            {w}{" "}
          </WordIn>
        ))}
      </div>
      <div
        style={{
          fontFamily: display,
          fontWeight: 700,
          fontSize: wordSize,
          lineHeight: 0.95,
          letterSpacing: -6 * u,
          opacity: slam === 0 ? 0 : 1,
          transform: `scale(${2.6 - slam * 1.6})`,
          transformOrigin: "left center",
        }}
      >
        {word}
      </div>
    </div>
  )
}

const WordIn = ({ at, children }: { at: number; children: ReactNode }) => {
  const t = useProgress(at, 0.35)
  return <span style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 30}px)`, whiteSpace: "pre" }}>{children}</span>
}

// The product, blurred, behind a line: you can tell it's real, not what it says
const Glimpse = ({ theme, text, fill, ink }: { theme: LaunchSlamProps["theme"]; text: string; fill: string; ink: string }) => {
  const { u, wide } = useLaunch(theme)
  const t = useProgress(0, GLIMPSE, "even")
  const focus = useProgress(0.2, 0.8)
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: wide ? "row" : "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 26 * u,
          filter: `blur(${(22 - focus * 13) * u}px)`,
          transform: `scale(${1.02 + t * 0.06})`,
          opacity: 0.95,
        }}
      >
        <div style={{ width: wide ? "34%" : "88%" }}>
          <AlertCard theme={theme} />
        </div>
        <div style={{ width: wide ? "34%" : "88%" }}>
          <AuditCard theme={theme} />
        </div>
        {!wide && (
          <div style={{ width: "88%" }}>
            <SavingsCard theme={theme} />
          </div>
        )}
      </div>
      <div
        style={{
          position: "relative",
          background: fill,
          color: ink,
          borderRadius: 24 * u,
          padding: `${22 * u}px ${36 * u}px`,
          fontFamily: display,
          fontWeight: 700,
          fontSize: (wide ? 48 : 60) * u,
          letterSpacing: -1.5 * u,
          textAlign: "center",
          maxWidth: "88%",
          lineHeight: 1.1,
          boxShadow: `0 ${20 * u}px ${60 * u}px ${alpha("#000000", 0.35)}`,
          opacity: focus,
          transform: `scale(${0.9 + focus * 0.1})`,
        }}
      >
        {text}
      </div>
    </div>
  )
}

export const LaunchSlam = (props: LaunchSlamProps) => (
  <AccentProvider value={props.accent ?? "cobalt"}>
    <Slam {...props} />
  </AccentProvider>
)

const Slam = ({ theme, showVisual = true, line1, word1, line2, word2, line3, word3, glimpse, name, date }: LaunchSlamProps) => {
  const { p } = useLaunch(theme)
  // The accent ground, with ink that reads on it; the swapped beats use the reverse
  const fill = p.cobalt
  const ink = theme === "dark" ? p.ground : "#FFFFFF"
  const dark = theme === "dark" ? p.ground : "#0E1220"
  const beats = [
    { line: line1, word: word1, fill, ink },
    { line: line2, word: word2, fill: dark, ink: fill },
    { line: line3, word: word3, fill, ink },
  ]
  const revealFrom = BEAT * 3 + (showVisual ? GLIMPSE : 0)
  return (
    <>
      {beats.map((b, i) => (
        <Sequence key={i} from={i * BEAT * FPS} durationInFrames={BEAT * FPS} layout="none">
          <SlamFrame theme={theme} fill={b.fill} ink={b.ink}>
            <Beat theme={theme} line={b.line} word={b.word} />
          </SlamFrame>
        </Sequence>
      ))}
      {showVisual && (
        <Sequence from={BEAT * 3 * FPS} durationInFrames={GLIMPSE * FPS} layout="none">
          <SlamFrame theme={theme} fill={dark} ink={fill}>
            <Glimpse theme={theme} text={glimpse} fill={fill} ink={ink} />
          </SlamFrame>
        </Sequence>
      )}
      <Sequence from={revealFrom * FPS} layout="none">
        <SlamFrame theme={theme} fill={fill} ink={ink}>
          <Reveal theme={theme} name={name} date={date} ink={ink} fill={fill} />
        </SlamFrame>
      </Sequence>
    </>
  )
}

const Reveal = ({ theme, name, date, ink, fill }: { theme: LaunchSlamProps["theme"]; name: string; date: string; ink: string; fill: string }) => {
  const { p, u, wide } = useLaunch(theme)
  const nameIn = useProgress(0.35, 0.5)
  const dateIn = useProgress(0.9, 0.5)
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 26 * u }}>
      <Shield size={(wide ? 140 : 200) * u} p={{ ...p, cobalt: ink }} />
      <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 104 : 132) * u, letterSpacing: -4 * u, lineHeight: 1, opacity: nameIn, transform: `scale(${1.25 - nameIn * 0.25})` }}>{name}</div>
      <div
        style={{
          background: ink,
          color: fill,
          borderRadius: 999,
          padding: `${12 * u}px ${30 * u}px`,
          fontWeight: 700,
          fontSize: (wide ? 28 : 34) * u,
          opacity: dateIn,
          transform: `translateY(${(1 - dateIn) * 20}px)`,
        }}
      >
        {date}
      </div>
    </div>
  )
}
