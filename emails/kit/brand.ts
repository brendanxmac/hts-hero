// The email brand: the Tariff Tracker's light palette and type (DESIGN_SYSTEM.md §15), the same
// values the social posts use (social/brand.ts). Emails can't read CSS variables or load the
// app's fonts everywhere, so colors are written out and fonts fall back to system faces.

export const C = {
  ground: "#EEF0F5",
  surface: "#FFFFFF",
  soft: "#F5F6FA",
  border: "#E3E6EE",
  text: "#0E1220",
  muted: "#5D6475",
  faint: "#8A90A0",
  cobalt: "#2F49D1",
  cobaltSoft: "#E9ECFB",
  green: "#138A5B",
  greenSoft: "#E3F3EC",
  red: "#C2412D",
  redSoft: "#F8E9E6",
  amber: "#A86A0C",
  amberSoft: "#F7EEDD",
  navy: "#0E1220",
} as const

export type Tone = "brand" | "up" | "down" | "heads-up" | "neutral"

export const TONES: Record<Tone, { fg: string; bg: string }> = {
  brand: { fg: C.cobalt, bg: C.cobaltSoft },
  up: { fg: C.red, bg: C.redSoft },
  down: { fg: C.green, bg: C.greenSoft },
  "heads-up": { fg: C.amber, bg: C.amberSoft },
  neutral: { fg: C.muted, bg: C.soft },
}

export const FONT_DISPLAY = "Sora, 'Segoe UI', Helvetica, Arial, sans-serif"
export const FONT_SANS = "Figtree, 'Segoe UI', Helvetica, Arial, sans-serif"

export const SITE = "https://htshero.com"

// The wordmark, as a PNG (most inboxes don't show SVG). Read when rendering, so scripts that load
// the environment after importing still get it.
export const logoUrl = () => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content/logo-text-black.png`

// "2026-10-14" → "Oct 14, 2026"
export const formatDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

// A link to the site, tagged so analytics can tell which email brought the visit
export const siteLink = (path: string, campaign: string) =>
  `${SITE}${path}${path.includes("?") ? "&" : "?"}utm_source=email&utm_medium=email&utm_campaign=${campaign}`
