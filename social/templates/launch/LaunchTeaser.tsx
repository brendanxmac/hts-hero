import { Sequence } from "remotion"
import { FPS } from "../../brand"
import { display } from "../../fonts"
import { Chip } from "../../kit"
import type { LaunchTeaserProps } from "../../types"
import { AccentProvider, AlertCard, AuditCard, BigLine, LaunchFrame, Rise, SavingsCard, Scene, Shield, useLaunch } from "./parts"
import { TEASER } from "./timing"

// A short Duty Guard teaser: a hook, the punch line on its own, then the product card on its own
// and big, then the reveal (the shield, the name, the date). With the visual off, its beat is cut
// and the video is that much shorter (teaserSeconds). The still is the reveal.

export const LaunchTeaser = (props: LaunchTeaserProps) => (
  <AccentProvider value={props.accent ?? "cobalt"}>
    <Teaser {...props} />
  </AccentProvider>
)

// How much bigger than its own size the card is drawn on its beat, and how wide it may get
const CARD_ZOOM = { wide: 1.45, tall: 1.4, other: 1.6 }

const Teaser = (props: LaunchTeaserProps) => {
  const { theme, visual, showVisual = true, hook, punch, name, tagline, date } = props
  const { p, u, wide, tall } = useLaunch(theme)
  const card = visual === "alerts" ? <AlertCard theme={theme} at={0.15} /> : visual === "audit" ? <AuditCard theme={theme} at={0.15} /> : <SavingsCard theme={theme} at={0.15} />
  const zoom = wide ? CARD_ZOOM.wide : tall ? CARD_ZOOM.tall : CARD_ZOOM.other
  const visualFrom = TEASER.hook + TEASER.punch
  const revealFrom = visualFrom + (showVisual ? TEASER.visual : 0)
  return (
    <LaunchFrame theme={theme} pill="Coming soon" foot={date}>
      <Sequence durationInFrames={TEASER.hook * FPS} layout="none">
        <Scene length={TEASER.hook}>
          <Rise>
            <BigLine text={hook} u={u} color={p.text} max={wide ? 76 : 96} />
          </Rise>
        </Scene>
      </Sequence>
      <Sequence from={TEASER.hook * FPS} durationInFrames={TEASER.punch * FPS} layout="none">
        <Scene length={TEASER.punch}>
          <Rise>
            <BigLine text={punch} u={u} color={p.cobalt} max={wide ? 76 : 96} />
          </Rise>
        </Scene>
      </Sequence>
      {showVisual && (
        <Sequence from={visualFrom * FPS} durationInFrames={TEASER.visual * FPS} layout="none">
          <Scene length={TEASER.visual}>
            {/* zoom lays the card out bigger (sharp text, unlike a scale); a % width isn't zoomed */}
            <div style={{ alignSelf: "center", width: wide ? "62%" : "100%", zoom }}>{card}</div>
          </Scene>
        </Sequence>
      )}
      <Sequence from={revealFrom * FPS} layout="none">
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 28 * u }}>
          <Shield size={(wide ? 150 : 210) * u} p={p} />
          <Rise at={0.5}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 96 : 120) * u, letterSpacing: -3 * u, lineHeight: 1 }}>{name}</div>
          </Rise>
          <Rise at={0.9}>
            <div style={{ fontFamily: display, fontWeight: 600, fontSize: (wide ? 34 : 42) * u, color: p.muted, maxWidth: 860 * u, lineHeight: 1.25 }}>{tagline}</div>
          </Rise>
          <Rise at={1.3}>
            <Chip tone="brand" p={p} size={(wide ? 24 : 30) * u} solid>
              {date}
            </Chip>
          </Rise>
        </div>
      </Sequence>
    </LaunchFrame>
  )
}
