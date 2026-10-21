import { interpolate, useCurrentFrame, useVideoConfig } from "remotion"
import { display } from "../fonts"
import { alpha, Enter, Frame, Headline, pct, ProductLine, useLayout, useProgress } from "../kit"
import type { QuizProps } from "../types"

// "Which pays the higher tariff?" The options show, a bar counts down three seconds, then every
// rate flips in and the answer lights up. The still post is the answer.

const QUESTION_SEC = 1
const COUNTDOWN_SEC = 3

export const Quiz = (props: QuizProps) => {
  const { theme, question, product, htsCode, options, reveal } = props
  const { p, u, wide, tall } = useLayout(theme)
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const countdown = interpolate(frame, [QUESTION_SEC * fps, (QUESTION_SEC + COUNTDOWN_SEC) * fps], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const revealT = useProgress(QUESTION_SEC + COUNTDOWN_SEC, 0.5)
  const answer = options.reduce((best, o) => (o.ratePct > best.ratePct ? o : best), options[0])
  const seconds = Math.ceil(countdown * COUNTDOWN_SEC)
  return (
    <Frame theme={theme} kind="Guess the tariff" kindTone="heads-up" source={props.source} asOf={props.asOf}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 30 * u, justifyContent: "safe center" }}>
        <Enter>
          <Headline text={question} u={u} max={wide ? 48 : 64} color={p.text} />
          <ProductLine product={product} htsCode={htsCode} p={p} u={u} />
        </Enter>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * u, opacity: 1 - revealT }}>
          <div style={{ flex: 1, height: 14 * u, borderRadius: 999, background: p.soft, overflow: "hidden" }}>
            <div style={{ width: `${countdown * 100}%`, height: "100%", background: p.amber, borderRadius: 999 }} />
          </div>
          <span style={{ fontFamily: display, fontWeight: 700, fontSize: 36 * u, color: p.amber, width: 40 * u }}>{seconds || ""}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: options.length > 2 || wide ? `repeat(${Math.min(options.length, wide ? 4 : 2)}, 1fr)` : "1fr 1fr", gap: 18 * u }}>
          {options.map((o, i) => {
            const isAnswer = o.country.code === answer.country.code
            const color = isAnswer ? p.red : p.green
            return (
              <Enter key={o.country.code} at={0.2 + i * 0.15}>
                <div
                  style={{
                    background: revealT > 0 ? alpha(color, 0.12 * revealT) : p.surface,
                    border: `${3 * u}px solid ${revealT > 0 && isAnswer ? p.red : p.border}`,
                    borderRadius: 28 * u,
                    padding: `${(tall ? 56 : 40) * u}px ${28 * u}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 12 * u,
                  }}
                >
                  <span style={{ fontSize: 110 * u, lineHeight: 1 }}>{o.country.flag}</span>
                  <span style={{ fontFamily: display, fontWeight: 600, fontSize: 34 * u }}>{o.country.name}</span>
                  <span
                    style={{
                      fontFamily: display,
                      fontWeight: 700,
                      fontSize: 88 * u,
                      lineHeight: 1,
                      color: revealT > 0 ? color : p.muted,
                      transform: `scaleY(${revealT > 0 ? revealT : 1})`,
                    }}
                  >
                    {revealT > 0 ? pct(o.ratePct) : "?"}
                  </span>
                </div>
              </Enter>
            )
          })}
        </div>
        <div style={{ opacity: revealT, fontFamily: display, fontWeight: 600, fontSize: 36 * u, lineHeight: 1.25 }}>{reveal}</div>
      </div>
    </Frame>
  )
}
