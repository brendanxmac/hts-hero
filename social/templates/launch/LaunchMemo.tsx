import { ReactNode } from "react"
import { useCurrentFrame, useVideoConfig } from "remotion"
import { display, typewriter } from "../../fonts"
import { alpha, Mark, useProgress } from "../../kit"
import type { LaunchMemoProps } from "../../types"
import { AccentProvider, useLaunch } from "./parts"
import { MEMO, memoText, memoTimeline } from "./timing"

// A Duty Guard teaser drawn as a declassified memo on paper. The memo's lines type out one
// sentence at a time, big, then the name and date close it. Timing is in timing.ts
// (memoTimeline); the still is the last frame.

// The paper and its ink stay the same in both themes: it's a sheet of paper
const PAPER = "#F4F1E9"
const INK = "#16181F"
const FADED = "#77746D"

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

// Seconds since the video started
const useNow = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  return frame / fps
}

// One sentence, typed from `start`. The whole sentence is laid out from the first frame and each
// character fades in on its turn, so nothing reflows or jumps lines as it types. It fades up and
// away over its last `MEMO.turn` seconds, as the next one starts.
const Sentence = ({ text, start, length, size, caret }: { text: string; start: number; length: number; size: number; caret: string }) => {
  const now = useNow()
  const typed = (now - start) * MEMO.cps
  const out = clamp01((now - (start + length)) / MEMO.turn)
  const done = typed >= text.length
  // Solid while typing, then a soft blink
  const blink = done ? 0.5 + 0.5 * Math.cos((now - start - text.length / MEMO.cps) * Math.PI * 2.4) : 1
  const at = Math.min(text.length, Math.ceil(typed))
  return (
    <div style={{ fontFamily: typewriter, fontWeight: 700, fontSize: size, lineHeight: 1.32, color: INK, opacity: 1 - out, transform: `translateY(${-out * size * 0.5}px)` }}>
      {[...text].map((ch, i) => (
        <span key={i} style={{ opacity: clamp01((now - start - i / MEMO.cps) / MEMO.fade), position: "relative" }}>
          {ch}
          {i === at - 1 && out === 0 && (
            <span style={{ position: "absolute", left: "100%", top: "0.12em", width: "0.5em", height: "1em", marginLeft: "0.08em", background: caret, opacity: blink }} />
          )}
        </span>
      ))}
    </div>
  )
}

// A memo header row: "TO:", "RE:"
const Field = ({ name, u, size, children }: { name: string; u: number; size: number; children: ReactNode }) => (
  <div style={{ display: "flex", gap: 16 * u, fontFamily: typewriter, fontSize: size, color: INK, lineHeight: 1.4 }}>
    <span style={{ width: 4.2 * size * 0.6, color: FADED, fontWeight: 700 }}>{name}:</span>
    <span style={{ flex: 1 }}>{children}</span>
  </div>
)

export const LaunchMemo = (props: LaunchMemoProps) => (
  <AccentProvider value={props.accent ?? "red"}>
    <Memo {...props} />
  </AccentProvider>
)

const Memo = ({ theme, to, subject, line1, line2, line3, date }: LaunchMemoProps) => {
  const { p, brand, u, wide, tall } = useLaunch(theme)
  const now = useNow()
  const { sentences, endAt } = memoTimeline([line1, line2, line3])
  // The sentence on the page: the latest one that has started
  const page = sentences.reduce((n, s, i) => (now >= s.start ? i : n), -1)

  const enter = useProgress(0, 0.8)
  const toEnd = useProgress(endAt, 0.5)
  const nameIn = useProgress(endAt + 0.2, 0.7)
  const dateIn = useProgress(endAt + 0.8, 0.6)

  const pad = (wide ? 40 : 56) * u
  const safeTop = tall ? 150 : 0
  const safeBottom = tall ? 260 : 0
  const body = (wide ? 46 : 66) * u
  const label = (wide ? 21 : 27) * u
  const subjectText = memoText(subject)
  // The ending: "HTS Hero: Built for Trade Pros" → "HTS Hero" over a big "Built for Trade Pros";
  // without a colon, "Project Duty Guard" → "Project" over a big "Duty Guard"
  const colon = subjectText.indexOf(": ")
  const [lead, ...rest] = colon > 0 ? [subjectText.slice(0, colon), subjectText.slice(colon + 2)] : subjectText.split(" ")
  const name = rest.length ? rest.join(" ") : lead

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: p.ground,
        display: "flex",
        flexDirection: "column",
        padding: `${pad + safeTop}px ${pad}px ${pad * 0.7 + safeBottom}px`,
        gap: 20 * u,
      }}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: PAPER,
          borderRadius: 8 * u,
          padding: `${(wide ? 30 : 44) * u}px ${(wide ? 44 : 52) * u}px`,
          boxShadow: `0 ${30 * u}px ${80 * u}px ${alpha("#000000", 0.45)}`,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 80 * u}px) rotate(${-0.6 + (1 - enter) * 1.6}deg)`,
        }}
      >
        {/* Letterhead */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16 * u, borderBottom: `${3 * u}px solid ${INK}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 * u }}>
            <Mark size={40 * u} p={{ ...brand, surface: PAPER }} />
            <span style={{ fontFamily: display, fontWeight: 700, fontSize: 28 * u, color: INK, letterSpacing: -0.5 }}>HTS Hero</span>
          </div>
          <span style={{ fontFamily: typewriter, fontWeight: 700, fontSize: label * 0.85, letterSpacing: 4 * u, color: p.cobalt, border: `${2.5 * u}px solid ${p.cobalt}`, borderRadius: 6 * u, padding: `${4 * u}px ${12 * u}px` }}>
            DECLASSIFIED
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 * u, padding: `${16 * u}px 0`, borderBottom: `${1.5 * u}px dashed ${alpha(INK, 0.35)}` }}>
          <Field name="TO" u={u} size={label}>{to}</Field>
          <Field name="RE" u={u} size={label}>{subjectText}</Field>
        </div>

        {/* The body: one sentence at a time, then the name and date in its place */}
        <div style={{ flex: 1, minHeight: 0, position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", opacity: 1 - toEnd }}>
            {sentences.map((s, i) =>
              // The one before stays while it fades, under the one typing in
              (i === page || i === page - 1) && now < s.start + s.length + MEMO.turn ? (
                <div key={i} style={{ position: "absolute", left: 0, right: 0 }}>
                  <Sentence text={s.text} start={s.start} length={i === sentences.length - 1 ? Infinity : s.length} size={body} caret={p.cobalt} />
                </div>
              ) : null
            )}
          </div>
          {toEnd > 0 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 * u }}>
              {rest.length > 0 && <div style={{ fontFamily: typewriter, fontWeight: 700, fontSize: body * 0.8, color: INK, opacity: toEnd }}>{lead}</div>}
              <div
                style={{
                  fontFamily: display,
                  fontWeight: 700,
                  fontSize: body * 1.55,
                  letterSpacing: -2 * u,
                  lineHeight: 1.05,
                  color: p.cobalt,
                  opacity: nameIn,
                  transform: `translateY(${(1 - nameIn) * 24 * u}px)`,
                }}
              >
                {name}
              </div>
              <div style={{ fontFamily: typewriter, fontWeight: 700, fontSize: body * 0.75, color: INK, opacity: dateIn, transform: `translateY(${(1 - dateIn) * 14}px)` }}>{date}.</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 21 * u, color: p.muted }}>
        <span style={{ fontFamily: typewriter }}>{date}</span>
        <span style={{ fontFamily: display, fontWeight: 600, fontSize: 24 * u, color: brand.cobalt }}>htshero.com</span>
      </div>
    </div>
  )
}
