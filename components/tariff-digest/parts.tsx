import type { PublicUpdate } from "@/libs/tariff-updates/public"
import { updateSummary } from "@/libs/email/tariff-news"
import type { UpdateSummary } from "@/emails/kit/parts"
import type { Tone } from "@/emails/kit/brand"

// What the /tariff-digest page draws an update with: the same labels the digest email uses
// (law, stage, effective date, countries, and a tone for whether duty goes up or down), so what
// the page shows is what lands in the inbox.

export type DigestItem = UpdateSummary

// The newest `n`, with AD/CVD notices held to a third and spread out (every third card): they're
// most of the feed by count (a notice per case), and a run of them would hide the tariff actions
// people come for
export const varied = (updates: PublicUpdate[], n: number) => {
  const others = updates.filter((u) => u.authority !== "ad_cvd")
  const adcvd = updates.filter((u) => u.authority === "ad_cvd").slice(0, Math.max(Math.floor(n / 3), n - others.length))
  const rest = others.slice(0, n - Math.min(adcvd.length, n))
  const out: PublicUpdate[] = []
  while (out.length < n && (rest.length || adcvd.length)) {
    const takeAdcvd = adcvd.length && (out.length % 3 === 2 || !rest.length)
    out.push((takeAdcvd ? adcvd : rest).shift()!)
  }
  return out
}

export const toItems =(updates: PublicUpdate[]): DigestItem[] => updates.map((u) => updateSummary({ ...u, id: u.slug }))

// The tone's color on the page (the email's red / green / amber / cobalt)
export const TONE_TEXT: Record<Tone, string> = {
  up: "text-error",
  down: "text-success",
  "heads-up": "text-warning",
  brand: "text-primary",
  neutral: "text-base-content/60",
}
export const TONE_DOT: Record<Tone, string> = {
  up: "bg-error",
  down: "bg-success",
  "heads-up": "bg-warning",
  brand: "bg-primary",
  neutral: "bg-base-content/40",
}

// "2026-11-14" → "Nov 14"
export const shortDay = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })

export const metaLine = (u: DigestItem) => [u.effectiveOn ? `Effective ${shortDay(u.effectiveOn)}` : null, u.countriesLabel].filter(Boolean).join(" · ")

// Sora, for headlines and big numbers
export const display = "[font-family:var(--font-tracker-display)]"
