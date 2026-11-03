import { Sequence } from "remotion"
import { FPS } from "../../brand"
import { display } from "../../fonts"
import { Chip } from "../../kit"
import type { LaunchFeature, LaunchVideoProps } from "../../types"
import { AccentProvider, AlertCard, AuditCard, BigLine, LaunchFrame, Rise, SavingsCard, Scene, Shield, useLaunch } from "./parts"

// The Duty Guard launch video: an opener, the three things it does (each a line and a product
// card, in the post's order), then the end card with the call to action. The still is the end card.

const OPENER = 4.5
const FEATURE = 5
const END = 5
export const LAUNCH_VIDEO_SECONDS = OPENER + FEATURE * 3 + END

const Feature = ({ props, feature }: { props: LaunchVideoProps; feature: LaunchFeature }) => {
  const { theme, showVisual = true } = props
  const { p, u, wide } = useLaunch(theme)
  const words = { audit: [props.auditTitle, props.auditLine], savings: [props.savingsTitle, props.savingsLine], alerts: [props.alertsTitle, props.alertsLine] }[feature]
  const tone = { audit: p.amber, savings: p.green, alerts: p.red }[feature]
  const card = !showVisual ? null : feature === "alerts" ? <AlertCard theme={theme} at={0.6} /> : feature === "audit" ? <AuditCard theme={theme} at={0.6} /> : <SavingsCard theme={theme} at={0.6} />
  return (
    <Scene length={FEATURE}>
      <div style={{ display: "flex", flexDirection: wide ? "row" : "column", alignItems: wide ? "center" : "stretch", gap: (wide ? 48 : 40) * u }}>
        <div style={{ flex: wide ? 1 : undefined, display: "flex", flexDirection: "column", gap: 18 * u }}>
          <Rise>
            <div style={{ fontSize: 24 * u, fontWeight: 700, letterSpacing: 3 * u, textTransform: "uppercase", color: tone }}>{words[0]}</div>
          </Rise>
          <Rise at={0.2}>
            <BigLine text={words[1]} u={u} color={p.text} max={card ? (wide ? 54 : 66) : wide ? 72 : 88} weight={600} />
          </Rise>
        </div>
        {card && <div style={{ flex: wide ? 1.1 : undefined }}>{card}</div>}
      </div>
    </Scene>
  )
}

export const LaunchVideo = (props: LaunchVideoProps) => (
  <AccentProvider value={props.accent ?? "cobalt"}>
    <Video {...props} />
  </AccentProvider>
)

const Video = (props: LaunchVideoProps) => {
  const { theme, opener, openerSub, order, cta, ctaSub } = props
  const { p, u, wide } = useLaunch(theme)
  return (
    <LaunchFrame theme={theme} pill="Now live" foot="Duty Guard by HTS Hero">
      <Sequence durationInFrames={OPENER * FPS} layout="none">
        <Scene length={OPENER}>
          <Rise>
            <BigLine text={opener} u={u} color={p.text} max={wide ? 76 : 92} />
          </Rise>
          <Rise at={0.8} style={{ marginTop: 28 * u }}>
            <div style={{ fontFamily: display, fontWeight: 600, fontSize: (wide ? 34 : 42) * u, lineHeight: 1.25, color: p.cobalt }}>{openerSub}</div>
          </Rise>
        </Scene>
      </Sequence>
      {order.slice(0, 3).map((feature, i) => (
        <Sequence key={feature} from={(OPENER + i * FEATURE) * FPS} durationInFrames={FEATURE * FPS} layout="none">
          <Feature props={props} feature={feature} />
        </Sequence>
      ))}
      <Sequence from={(OPENER + FEATURE * 3) * FPS} layout="none">
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 26 * u }}>
          <Shield size={(wide ? 130 : 190) * u} p={p} />
          <Rise at={0.4}>
            <div style={{ fontFamily: display, fontWeight: 700, fontSize: (wide ? 90 : 116) * u, letterSpacing: -3 * u, lineHeight: 1 }}>Duty Guard</div>
          </Rise>
          <Rise at={0.8}>
            <Chip tone="brand" p={p} size={(wide ? 28 : 34) * u} solid>
              {cta}
            </Chip>
          </Rise>
          <Rise at={1.2}>
            <div style={{ fontSize: (wide ? 26 : 32) * u, color: p.muted }}>{ctaSub}</div>
          </Rise>
        </div>
      </Sequence>
    </LaunchFrame>
  )
}
