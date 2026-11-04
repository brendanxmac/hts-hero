import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { SOCIAL_IMAGE_SIZE } from "@/libs/blog/socialImage"
import { getLatestUpdates, type PublicUpdate } from "@/libs/tariff-updates/public"
import { toItems, varied } from "@/components/tariff-digest/parts"

// The share card for /tariff-digest, as dark and cinematic as the page: the promise in big Sora
// on the left, and on the right this week's real tariff actions as a stack of digest cards
// receding into the dark (the page's reel, frozen). Readable as a thumbnail: the headline carries
// it on its own. Refreshed hourly with the feed. ImageResponse can't read the theme's variables,
// so Duty Guard's dark palette (components/ui/theme/palette.js) is written out here.

export const size = SOCIAL_IMAGE_SIZE
export const contentType = "image/png"
export const alt = "The Weekly Tariff Digest by HTS Hero: every US tariff change, one email, every Monday"
export const revalidate = 3600

const GROUND = "#0b0d13"
const CARD = "#161a22"
const LINE = "#262b36"
const TEXT = "#f1f3f8"
const MUTED = "#7d8496"
const FAINT = "#5a6070"
const COBALT = "#8ea2ff"
const TONE: Record<string, string> = { up: "#f08a75", down: "#4fc995", "heads-up": "#f2b24c", brand: COBALT, neutral: MUTED }

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file))

const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s)

export default async function Image() {
  const [regular, bold, display, logo, latest] = await Promise.all([
    font("Figtree-Regular.ttf"),
    font("Figtree-Bold.ttf"),
    font("Sora-SemiBold.ttf"),
    readFile(join(process.cwd(), "app/logo.svg")),
    getLatestUpdates(40).catch((): PublicUpdate[] => []),
  ])
  // When the feed can't be read, the headline carries the card alone (never made-up updates)
  const cards = toItems(varied(latest.filter((u) => u.kind !== "hts_revision"), 3))
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: GROUND, fontFamily: "Figtree", overflow: "hidden" }}>
        {/* A low cobalt light from behind the cards */}
        <div
          style={{
            position: "absolute",
            right: -260,
            top: -200,
            width: 980,
            height: 980,
            display: "flex",
            backgroundImage: "radial-gradient(circle at center, rgba(142,162,255,0.20) 0%, rgba(142,162,255,0.06) 38%, rgba(11,13,19,0) 68%)",
          }}
        />

        {/* The digest cards, receding up and to the right */}
        <div style={{ position: "absolute", left: 700, top: 70, display: "flex", flexDirection: "column", transform: "rotate(-6deg)" }}>
          {cards.map((c, i) => (
            <div
              key={c.slug}
              style={{
                display: "flex",
                flexDirection: "column",
                width: 520,
                marginTop: i ? 22 : 0,
                marginLeft: i * 34,
                padding: "26px 30px",
                borderRadius: 28,
                background: CARD,
                border: `1.5px solid ${LINE}`,
                opacity: [1, 0.72, 0.42][i],
                boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", fontSize: 17, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                <div style={{ width: 10, height: 10, borderRadius: 999, background: TONE[c.tone], marginRight: 12 }} />
                <span style={{ color: TONE[c.tone] }}>{c.authorityLabel}</span>
                <span style={{ color: FAINT, margin: "0 10px" }}>·</span>
                <span style={{ color: MUTED }}>{c.stageLabel}</span>
              </div>
              <div style={{ display: "flex", marginTop: 14, fontFamily: "Sora", fontSize: 27, lineHeight: 1.25, color: TEXT }}>{clip(c.title, 74)}</div>
            </div>
          ))}
        </div>

        {/* Fade the cards into the ground on the left, so the headline sits on clear dark */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage: `linear-gradient(90deg, ${GROUND} 0%, ${GROUND} 52%, rgba(11,13,19,0.55) 66%, rgba(11,13,19,0) 82%)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 160,
            display: "flex",
            backgroundImage: `linear-gradient(0deg, ${GROUND} 0%, rgba(11,13,19,0) 100%)`,
          }}
        />

        {/* The promise */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", padding: "60px 72px 54px" }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 22, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase", color: COBALT }}>
            <div style={{ width: 12, height: 12, borderRadius: 999, background: COBALT, marginRight: 18 }} />
            The Weekly Tariff Digest
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontFamily: "Sora", fontSize: 86, lineHeight: 1.02, letterSpacing: -3.5 }}>
            <span style={{ color: TEXT }}>Every US</span>
            <span style={{ color: TEXT }}>tariff change.</span>
            <span style={{ color: MUTED, marginTop: 6 }}>Every Monday.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 26 }}>
            <img src={logoSrc} width={40} height={40} alt="" />
            <span style={{ marginLeft: 14, fontFamily: "Sora", color: TEXT }}>HTS Hero</span>
            <span style={{ marginLeft: 22, color: FAINT }}>Free weekly email · htshero.com/tariff-digest</span>
          </div>
        </div>
      </div>
    ),
    {
      ...SOCIAL_IMAGE_SIZE,
      fonts: [
        { name: "Figtree", data: regular, weight: 400, style: "normal" },
        { name: "Figtree", data: bold, weight: 700, style: "normal" },
        { name: "Sora", data: display, weight: 600, style: "normal" },
      ],
    }
  )
}
