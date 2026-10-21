// The HTS Hero social post brand: the Tariff Tracker's look (DESIGN_SYSTEM.md §15) at poster
// scale. Posts render outside the app (Remotion's own browser, or the studio's preview player),
// without the theme's CSS variables, so the palette's values are written out here.

export type Theme = "dark" | "light"

export interface Palette {
  ground: string
  surface: string
  soft: string
  border: string
  text: string
  muted: string
  cobalt: string
  green: string
  red: string
  amber: string
  sky: string
  slate: string
}

export const PALETTES: Record<Theme, Palette> = {
  light: {
    ground: "#EEF0F5",
    surface: "#FFFFFF",
    soft: "#F5F6FA",
    border: "#E3E6EE",
    text: "#0E1220",
    muted: "#5D6475",
    cobalt: "#2F49D1",
    green: "#138A5B",
    red: "#C2412D",
    amber: "#A86A0C",
    sky: "#7CC4F2",
    slate: "#CDD2E0",
  },
  dark: {
    ground: "#08090D",
    surface: "#111319",
    soft: "#181B23",
    border: "#232733",
    text: "#F1F3F8",
    muted: "#9298A6",
    cobalt: "#8EA2FF",
    green: "#34C98B",
    red: "#FF7D6E",
    amber: "#F2B24C",
    sky: "#5CC3F5",
    slate: "#3A4154",
  },
}

// Where a post goes decides its shape
export type Format = "portrait" | "landscape" | "story"

export const FORMATS: Record<Format, { width: number; height: number; label: string; use: string }> = {
  portrait: { width: 1080, height: 1350, label: "Portrait 4:5", use: "LinkedIn and X feed" },
  landscape: { width: 1200, height: 675, label: "Landscape 16:9", use: "X" },
  story: { width: 1080, height: 1920, label: "Vertical 9:16", use: "Reels and Shorts" },
}

export const FPS = 30

// The role each color plays, so templates speak in meanings: up = a tariff went up (red),
// down = it went down (green), brand = HTS Hero's own data (cobalt)
export type Tone = "up" | "down" | "brand" | "heads-up" | "neutral"

export const toneColor = (p: Palette, tone: Tone) =>
  ({ up: p.red, down: p.green, brand: p.cobalt, "heads-up": p.amber, neutral: p.muted })[tone]
